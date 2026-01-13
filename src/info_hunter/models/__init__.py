"""Data models for Info Hunter."""

import json
from datetime import datetime
from enum import Enum
from hashlib import sha256
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SourceType(str, Enum):
    """Types of data sources supported by Info Hunter."""
    SCHOLARSHIP = "scholarship"
    INTERNSHIP = "internship"
    PRICE = "price"
    LEARNING = "learning"


class SelectorType(str, Enum):
    """Types of selectors for data extraction."""
    CSS = "css"
    XPATH = "xpath"


class JobStatus(str, Enum):
    """Status of a scrape job."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ExtractionRule(BaseModel):
    """Configuration for extracting a single field from a web page."""
    field_name: str
    selector: str
    selector_type: SelectorType = SelectorType.CSS
    transform: Optional[str] = None
    required: bool = False


class PaginationConfig(BaseModel):
    """Configuration for handling paginated content."""
    next_page_selector: str
    selector_type: SelectorType = SelectorType.CSS
    max_pages: Optional[int] = None


class DataSourceConfig(BaseModel):
    """Configuration for a data source to be scraped."""
    name: str
    url_pattern: str
    source_type: SourceType
    extraction_rules: List[ExtractionRule]
    pagination: Optional[PaginationConfig] = None
    rate_limit_ms: int = Field(default=1000, ge=0)


class Document(BaseModel):
    """A normalized data record stored in ElasticSearch."""
    id: str
    source_id: str
    source_type: SourceType
    source_url: str
    title: str
    description: Optional[str] = None
    content: Dict[str, Any] = Field(default_factory=dict)
    scraped_at: datetime
    content_hash: str

    @staticmethod
    def _normalize_content(content: Dict[str, Any]) -> str:
        """Normalize content dictionary to a deterministic string representation.
        
        Uses JSON serialization with sorted keys to ensure consistent ordering
        regardless of how the dictionary was constructed.
        """
        return json.dumps(content, sort_keys=True, default=str, ensure_ascii=False)

    @staticmethod
    def generate_content_hash(content: Dict[str, Any], title: str) -> str:
        """Generate SHA-256 hash from normalized content and title.
        
        Args:
            content: Dictionary containing document content fields
            title: Document title
            
        Returns:
            Hexadecimal SHA-256 hash string (64 characters)
        """
        normalized = Document._normalize_content(content)
        hash_input = f"{title}:{normalized}"
        return sha256(hash_input.encode('utf-8')).hexdigest()

    @staticmethod
    def generate_id(source_url: str, content_hash: str) -> str:
        """Generate unique document ID from source URL and content hash.
        
        The ID is a truncated SHA-256 hash of the combined source URL and
        content hash, providing a shorter but still unique identifier.
        
        Args:
            source_url: URL where the document was scraped from
            content_hash: SHA-256 hash of the document content
            
        Returns:
            16-character hexadecimal document ID
        """
        id_input = f"{source_url}:{content_hash}"
        return sha256(id_input.encode('utf-8')).hexdigest()[:16]


class SearchQuery(BaseModel):
    """Query parameters for searching documents."""
    text: str
    source_types: Optional[List[SourceType]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class SearchResult(BaseModel):
    """Result of a search query."""
    total: int
    page: int
    page_size: int
    documents: List[Document]


class ScrapeJob(BaseModel):
    """A scheduled or on-demand task to scrape a specific data source."""
    id: str
    source_id: str
    status: JobStatus = JobStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    documents_scraped: int = 0
    errors: List[str] = Field(default_factory=list)


class Schedule(BaseModel):
    """A recurring schedule for scrape jobs."""
    id: str
    source_id: str
    cron_expression: str
    enabled: bool = True
    last_run: Optional[datetime] = None
    next_run: datetime


class ValidationResult(BaseModel):
    """Result of validating a configuration."""
    valid: bool
    errors: List[str] = Field(default_factory=list)


__all__ = [
    "SourceType",
    "SelectorType",
    "JobStatus",
    "ExtractionRule",
    "PaginationConfig",
    "DataSourceConfig",
    "Document",
    "SearchQuery",
    "SearchResult",
    "ScrapeJob",
    "Schedule",
    "ValidationResult",
]
