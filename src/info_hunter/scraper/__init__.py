"""Web scraping components."""

import logging
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, Iterator, List, Optional

from bs4 import BeautifulSoup
from lxml import etree
from selenium import webdriver
from selenium.common.exceptions import (
    NoSuchElementException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from info_hunter.models import (
    Document,
    ExtractionRule,
    JobStatus,
    PaginationConfig,
    SelectorType,
    SourceType,
)
from info_hunter.storage import DataSource


logger = logging.getLogger(__name__)


class Extractor:
    """Applies extraction rules to HTML content."""

    def extract_field(self, html: str, rule: ExtractionRule) -> Optional[str]:
        """Extract a single field using CSS selector or XPath.
        
        Args:
            html: The HTML content to extract from.
            rule: The extraction rule defining the selector and type.
            
        Returns:
            The extracted text content, or None if not found.
        """
        if not html or not html.strip():
            return None
            
        if rule.selector_type == SelectorType.CSS:
            return self._extract_css(html, rule.selector)
        elif rule.selector_type == SelectorType.XPATH:
            return self._extract_xpath(html, rule.selector)
        return None

    def _extract_css(self, html: str, selector: str) -> Optional[str]:
        """Extract content using CSS selector with BeautifulSoup."""
        try:
            soup = BeautifulSoup(html, "lxml")
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)
            return None
        except Exception:
            return None

    def _extract_xpath(self, html: str, xpath: str) -> Optional[str]:
        """Extract content using XPath with lxml."""
        try:
            tree = etree.HTML(html)
            if tree is None:
                return None
            results = tree.xpath(xpath)
            if results:
                if isinstance(results[0], etree._Element):
                    return results[0].text.strip() if results[0].text else None
                elif isinstance(results[0], str):
                    return results[0].strip() if results[0].strip() else None
            return None
        except Exception:
            return None

    def extract_all(self, html: str, rules: List[ExtractionRule]) -> Dict[str, Any]:
        """Extract all fields defined by rules.
        
        Args:
            html: The HTML content to extract from.
            rules: List of extraction rules to apply.
            
        Returns:
            Dictionary mapping field names to extracted values.
            Only includes fields where extraction was successful.
        """
        result: Dict[str, Any] = {}
        
        for rule in rules:
            value = self.extract_field(html, rule)
            if value is not None:
                result[rule.field_name] = value
                
        return result


    def normalize(
        self,
        raw_data: Dict[str, Any],
        source_type: SourceType,
        source_id: str,
        source_url: str,
        scraped_at: Optional[datetime] = None,
    ) -> Document:
        """Normalize extracted data into a Document.
        
        Args:
            raw_data: Dictionary of extracted field values.
            source_type: The type of data source.
            source_id: The ID of the data source configuration.
            source_url: The URL the data was scraped from.
            scraped_at: Timestamp of when the data was scraped (defaults to now).
            
        Returns:
            A normalized Document with all required fields populated.
        """
        if scraped_at is None:
            scraped_at = datetime.now()
            
        # Extract title from raw_data, use default if not present
        title = raw_data.get("title", "Untitled")
        if not isinstance(title, str):
            title = str(title)
            
        # Extract description if present
        description = raw_data.get("description")
        if description is not None and not isinstance(description, str):
            description = str(description)
            
        # Build content dict excluding title and description
        content = {
            k: v for k, v in raw_data.items() 
            if k not in ("title", "description")
        }
        
        # Generate content hash and document ID
        content_hash = Document.generate_content_hash(content, title)
        doc_id = Document.generate_id(source_url, content_hash)
        
        return Document(
            id=doc_id,
            source_id=source_id,
            source_type=source_type,
            source_url=source_url,
            title=title,
            description=description,
            content=content,
            scraped_at=scraped_at,
            content_hash=content_hash,
        )


@dataclass
class DriverOptions:
    """Configuration options for Selenium WebDriver."""
    headless: bool = True
    disable_gpu: bool = True
    no_sandbox: bool = True
    disable_dev_shm_usage: bool = True
    window_size: str = "1920,1080"
    page_load_timeout: int = 30
    implicit_wait: int = 10
    user_agent: Optional[str] = None
    chrome_binary_path: Optional[str] = None
    chromedriver_path: Optional[str] = None


@dataclass
class ScrapeResult:
    """Result of a scrape operation."""
    source_id: str
    status: JobStatus
    documents: List[Document] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    pages_scraped: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class WebScraperError(Exception):
    """Base exception for WebScraper errors."""
    pass


class NavigationError(WebScraperError):
    """Raised when navigation to a URL fails."""
    pass


class ExtractionError(WebScraperError):
    """Raised when data extraction fails."""
    pass


class WebScraper:
    """Executes scraping jobs using Selenium.
    
    This class handles web scraping operations including:
    - Selenium WebDriver initialization with configurable options
    - Navigation to target URLs with retry logic
    - Data extraction using configured extraction rules
    - Pagination handling for multi-page content
    - Error handling with exponential backoff
    
    Attributes:
        driver_options: Configuration for the Selenium WebDriver.
        extractor: Extractor instance for applying extraction rules.
    """
    
    MAX_RETRIES = 3
    BASE_BACKOFF_SECONDS = 1.0
    
    def __init__(
        self,
        driver_options: Optional[DriverOptions] = None,
        extractor: Optional[Extractor] = None,
    ):
        """Initialize scraper with Selenium driver configuration.
        
        Args:
            driver_options: Optional DriverOptions for WebDriver configuration.
                           If not provided, default options will be used.
            extractor: Optional Extractor instance. If not provided,
                      a default Extractor will be created.
        """
        self._driver_options = driver_options or DriverOptions()
        self._extractor = extractor or Extractor()
        self._driver: Optional[webdriver.Chrome] = None
    
    def _create_driver(self) -> webdriver.Chrome:
        """Create and configure a Chrome WebDriver instance.
        
        Returns:
            Configured Chrome WebDriver.
        """
        chrome_options = ChromeOptions()
        
        if self._driver_options.headless:
            chrome_options.add_argument("--headless=new")
        if self._driver_options.disable_gpu:
            chrome_options.add_argument("--disable-gpu")
        if self._driver_options.no_sandbox:
            chrome_options.add_argument("--no-sandbox")
        if self._driver_options.disable_dev_shm_usage:
            chrome_options.add_argument("--disable-dev-shm-usage")
        if self._driver_options.window_size:
            chrome_options.add_argument(f"--window-size={self._driver_options.window_size}")
        if self._driver_options.user_agent:
            chrome_options.add_argument(f"--user-agent={self._driver_options.user_agent}")
        if self._driver_options.chrome_binary_path:
            chrome_options.binary_location = self._driver_options.chrome_binary_path
        
        # Create service with optional chromedriver path
        service = None
        if self._driver_options.chromedriver_path:
            service = ChromeService(executable_path=self._driver_options.chromedriver_path)
        
        if service:
            driver = webdriver.Chrome(service=service, options=chrome_options)
        else:
            driver = webdriver.Chrome(options=chrome_options)
        
        driver.set_page_load_timeout(self._driver_options.page_load_timeout)
        driver.implicitly_wait(self._driver_options.implicit_wait)
        
        return driver
    
    def _ensure_driver(self) -> webdriver.Chrome:
        """Ensure a WebDriver instance exists, creating one if needed.
        
        Returns:
            Active Chrome WebDriver instance.
        """
        if self._driver is None:
            self._driver = self._create_driver()
        return self._driver
    
    def close(self) -> None:
        """Close the WebDriver and release resources."""
        if self._driver is not None:
            try:
                self._driver.quit()
            except Exception as e:
                logger.warning(f"Error closing WebDriver: {e}")
            finally:
                self._driver = None
    
    def __enter__(self) -> "WebScraper":
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        """Context manager exit - ensures driver is closed."""
        self.close()
    
    def _navigate_with_retry(self, url: str) -> str:
        """Navigate to a URL with retry logic and exponential backoff.
        
        Args:
            url: The URL to navigate to.
            
        Returns:
            The page source HTML.
            
        Raises:
            NavigationError: If navigation fails after all retries.
        """
        driver = self._ensure_driver()
        last_error: Optional[Exception] = None
        
        for attempt in range(self.MAX_RETRIES):
            try:
                driver.get(url)
                # Wait for page to be ready
                WebDriverWait(driver, self._driver_options.page_load_timeout).until(
                    lambda d: d.execute_script("return document.readyState") == "complete"
                )
                return driver.page_source
            except (TimeoutException, WebDriverException) as e:
                last_error = e
                if attempt < self.MAX_RETRIES - 1:
                    backoff = self.BASE_BACKOFF_SECONDS * (2 ** attempt)
                    logger.warning(
                        f"Navigation to {url} failed (attempt {attempt + 1}/{self.MAX_RETRIES}), "
                        f"retrying in {backoff}s: {e}"
                    )
                    time.sleep(backoff)
                else:
                    logger.error(f"Navigation to {url} failed after {self.MAX_RETRIES} attempts: {e}")
        
        raise NavigationError(f"Failed to navigate to {url} after {self.MAX_RETRIES} attempts: {last_error}")
    
    def extract_data(
        self,
        page_source: str,
        rules: List[ExtractionRule],
    ) -> List[Dict[str, Any]]:
        """Extract data from page HTML using configured rules.
        
        This method extracts data from the page source. It attempts to find
        repeating items on the page and extract data from each.
        
        Args:
            page_source: The HTML content of the page.
            rules: List of extraction rules to apply.
            
        Returns:
            List of dictionaries containing extracted data.
        """
        if not page_source or not rules:
            return []
        
        # Extract data using all rules
        extracted = self._extractor.extract_all(page_source, rules)
        
        # If we got any data, return it as a single item
        if extracted:
            return [extracted]
        
        return []
    
    def handle_pagination(
        self,
        source: DataSource,
    ) -> Iterator[str]:
        """Yield page URLs following pagination links.
        
        Navigates through paginated content by following the configured
        pagination selector until no more pages exist or max_pages is reached.
        
        Args:
            source: The DataSource configuration with pagination settings.
            
        Yields:
            URLs of each page in the pagination sequence.
        """
        # Always yield the initial URL
        yield source.url_pattern
        
        if source.pagination is None:
            return
        
        driver = self._ensure_driver()
        pagination = source.pagination
        pages_visited = 1
        max_pages = pagination.max_pages
        
        while max_pages is None or pages_visited < max_pages:
            try:
                # Find the next page link
                next_link = self._find_next_page_link(driver, pagination)
                
                if next_link is None:
                    logger.debug("No more pagination links found")
                    break
                
                # Get the href attribute
                next_url = next_link.get_attribute("href")
                if not next_url:
                    logger.debug("Next page link has no href")
                    break
                
                pages_visited += 1
                yield next_url
                
            except NoSuchElementException:
                logger.debug("Pagination element not found")
                break
            except Exception as e:
                logger.warning(f"Error during pagination: {e}")
                break
    
    def _find_next_page_link(self, driver: webdriver.Chrome, pagination: PaginationConfig):
        """Find the next page link element using the pagination config.
        
        Args:
            driver: The WebDriver instance.
            pagination: The pagination configuration.
            
        Returns:
            The WebElement for the next page link, or None if not found.
        """
        try:
            if pagination.selector_type == SelectorType.CSS:
                return driver.find_element(By.CSS_SELECTOR, pagination.next_page_selector)
            elif pagination.selector_type == SelectorType.XPATH:
                return driver.find_element(By.XPATH, pagination.next_page_selector)
        except NoSuchElementException:
            return None
        return None
    
    def scrape(self, source: DataSource) -> ScrapeResult:
        """Execute a scrape job for the given data source.
        
        Navigates to the target URL(s), extracts data according to the
        configured extraction rules, handles pagination, and normalizes
        the results into Documents.
        
        Args:
            source: The DataSource configuration to scrape.
            
        Returns:
            ScrapeResult containing the scraped documents and any errors.
        """
        result = ScrapeResult(
            source_id=source.id,
            status=JobStatus.RUNNING,
            started_at=datetime.now(),
        )
        
        try:
            # Iterate through all pages
            for page_url in self.handle_pagination(source):
                try:
                    # Navigate to the page with retry logic
                    page_source = self._navigate_with_retry(page_url)
                    result.pages_scraped += 1
                    
                    # Extract data from the page
                    extracted_items = self.extract_data(page_source, source.extraction_rules)
                    
                    # Normalize each extracted item into a Document
                    scraped_at = datetime.now()
                    for raw_data in extracted_items:
                        try:
                            doc = self._extractor.normalize(
                                raw_data=raw_data,
                                source_type=source.source_type,
                                source_id=source.id,
                                source_url=page_url,
                                scraped_at=scraped_at,
                            )
                            result.documents.append(doc)
                        except Exception as e:
                            error_msg = f"Error normalizing data from {page_url}: {e}"
                            logger.warning(error_msg)
                            result.errors.append(error_msg)
                    
                    # Apply rate limiting between pages
                    if source.rate_limit_ms > 0:
                        time.sleep(source.rate_limit_ms / 1000.0)
                        
                except NavigationError as e:
                    error_msg = f"Navigation error for {page_url}: {e}"
                    logger.error(error_msg)
                    result.errors.append(error_msg)
                    # Continue with remaining pages (Requirement 2.5)
                    continue
                except Exception as e:
                    error_msg = f"Error scraping {page_url}: {e}"
                    logger.warning(error_msg)
                    result.errors.append(error_msg)
                    # Continue with remaining pages (Requirement 2.5)
                    continue
            
            # Determine final status
            if result.documents:
                result.status = JobStatus.COMPLETED
            elif result.errors:
                result.status = JobStatus.FAILED
            else:
                result.status = JobStatus.COMPLETED  # No errors, just no data found
                
        except Exception as e:
            error_msg = f"Fatal error during scrape: {e}"
            logger.error(error_msg)
            result.errors.append(error_msg)
            result.status = JobStatus.FAILED
        finally:
            result.completed_at = datetime.now()
        
        return result


__all__ = [
    "Extractor",
    "DriverOptions",
    "ScrapeResult",
    "WebScraper",
    "WebScraperError",
    "NavigationError",
    "ExtractionError",
]
