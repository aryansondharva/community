"""Validation module for Info Hunter configurations."""

import re
from typing import List
from urllib.parse import urlparse

from lxml import etree
from croniter import croniter

from info_hunter.models import (
    DataSourceConfig,
    ExtractionRule,
    PaginationConfig,
    SelectorType,
    ValidationResult,
)


def validate_url_pattern(url: str) -> List[str]:
    """Validate URL pattern format.
    
    Args:
        url: URL string to validate
        
    Returns:
        List of error messages (empty if valid)
    """
    errors = []
    
    if not url or not url.strip():
        errors.append("URL pattern cannot be empty")
        return errors
    
    try:
        parsed = urlparse(url)
        if not parsed.scheme:
            errors.append(f"URL pattern '{url}' is missing a scheme (http/https)")
        elif parsed.scheme not in ("http", "https"):
            errors.append(f"URL pattern '{url}' has invalid scheme '{parsed.scheme}' (must be http or https)")
        
        if not parsed.netloc:
            errors.append(f"URL pattern '{url}' is missing a domain")
    except Exception as e:
        errors.append(f"URL pattern '{url}' is malformed: {str(e)}")
    
    return errors


def validate_css_selector(selector: str, field_name: str) -> List[str]:
    """Validate CSS selector syntax.
    
    Args:
        selector: CSS selector string to validate
        field_name: Name of the field using this selector (for error messages)
        
    Returns:
        List of error messages (empty if valid)
    """
    errors = []
    
    if not selector or not selector.strip():
        errors.append(f"CSS selector for field '{field_name}' cannot be empty")
        return errors
    
    # Basic CSS selector validation patterns
    # Check for obviously invalid patterns
    invalid_patterns = [
        (r'^\s*$', "selector is empty or whitespace only"),
        (r'\[\s*\]', "empty attribute selector"),
        (r'::\s*$', "incomplete pseudo-element"),
        (r':\s*$', "incomplete pseudo-class"),
    ]
    
    for pattern, message in invalid_patterns:
        if re.search(pattern, selector):
            errors.append(f"CSS selector for field '{field_name}' is invalid: {message}")
            return errors
    
    # Check for unbalanced brackets
    if selector.count('[') != selector.count(']'):
        errors.append(f"CSS selector for field '{field_name}' has unbalanced brackets")
    
    if selector.count('(') != selector.count(')'):
        errors.append(f"CSS selector for field '{field_name}' has unbalanced parentheses")
    
    return errors


def validate_xpath_expression(xpath: str, field_name: str) -> List[str]:
    """Validate XPath expression syntax.
    
    Args:
        xpath: XPath expression string to validate
        field_name: Name of the field using this expression (for error messages)
        
    Returns:
        List of error messages (empty if valid)
    """
    errors = []
    
    if not xpath or not xpath.strip():
        errors.append(f"XPath expression for field '{field_name}' cannot be empty")
        return errors
    
    try:
        etree.XPath(xpath)
    except etree.XPathSyntaxError as e:
        errors.append(f"XPath expression for field '{field_name}' is invalid: {str(e)}")
    except Exception as e:
        errors.append(f"XPath expression for field '{field_name}' validation failed: {str(e)}")
    
    return errors


def validate_extraction_rule(rule: ExtractionRule) -> List[str]:
    """Validate a single extraction rule.
    
    Args:
        rule: ExtractionRule to validate
        
    Returns:
        List of error messages (empty if valid)
    """
    errors = []
    
    if not rule.field_name or not rule.field_name.strip():
        errors.append("Extraction rule field_name cannot be empty")
        return errors
    
    if rule.selector_type == SelectorType.CSS:
        errors.extend(validate_css_selector(rule.selector, rule.field_name))
    elif rule.selector_type == SelectorType.XPATH:
        errors.extend(validate_xpath_expression(rule.selector, rule.field_name))
    
    return errors


def validate_pagination_config(pagination: PaginationConfig) -> List[str]:
    """Validate pagination configuration.
    
    Args:
        pagination: PaginationConfig to validate
        
    Returns:
        List of error messages (empty if valid)
    """
    errors = []
    
    if pagination.selector_type == SelectorType.CSS:
        errors.extend(validate_css_selector(pagination.next_page_selector, "pagination"))
    elif pagination.selector_type == SelectorType.XPATH:
        errors.extend(validate_xpath_expression(pagination.next_page_selector, "pagination"))
    
    if pagination.max_pages is not None and pagination.max_pages < 1:
        errors.append("Pagination max_pages must be at least 1")
    
    return errors


def validate_data_source_config(config: DataSourceConfig) -> ValidationResult:
    """Validate a complete DataSourceConfig.
    
    Args:
        config: DataSourceConfig to validate
        
    Returns:
        ValidationResult with valid flag and list of errors
    """
    errors = []
    
    # Validate name
    if not config.name or not config.name.strip():
        errors.append("Data source name cannot be empty")
    
    # Validate URL pattern
    errors.extend(validate_url_pattern(config.url_pattern))
    
    # Validate extraction rules
    if not config.extraction_rules:
        errors.append("Data source must have at least one extraction rule")
    else:
        for i, rule in enumerate(config.extraction_rules):
            rule_errors = validate_extraction_rule(rule)
            errors.extend(rule_errors)
    
    # Validate pagination if present
    if config.pagination:
        errors.extend(validate_pagination_config(config.pagination))
    
    return ValidationResult(valid=len(errors) == 0, errors=errors)


def validate_cron_expression(cron_expr: str) -> ValidationResult:
    """Validate a cron expression.
    
    Args:
        cron_expr: Cron expression string to validate
        
    Returns:
        ValidationResult with valid flag and list of errors
    """
    errors = []
    
    if not cron_expr or not cron_expr.strip():
        errors.append("Cron expression cannot be empty")
        return ValidationResult(valid=False, errors=errors)
    
    try:
        croniter(cron_expr)
    except (KeyError, ValueError) as e:
        errors.append(f"Invalid cron expression '{cron_expr}': {str(e)}")
    except Exception as e:
        errors.append(f"Cron expression validation failed: {str(e)}")
    
    return ValidationResult(valid=len(errors) == 0, errors=errors)


__all__ = [
    "validate_url_pattern",
    "validate_css_selector",
    "validate_xpath_expression",
    "validate_extraction_rule",
    "validate_pagination_config",
    "validate_data_source_config",
    "validate_cron_expression",
]
