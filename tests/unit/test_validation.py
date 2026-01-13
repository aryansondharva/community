"""Unit tests for validation module."""

import pytest

from info_hunter.models import (
    DataSourceConfig,
    ExtractionRule,
    PaginationConfig,
    SelectorType,
    SourceType,
)
from info_hunter.validation import (
    validate_url_pattern,
    validate_css_selector,
    validate_xpath_expression,
    validate_extraction_rule,
    validate_data_source_config,
    validate_cron_expression,
)


class TestUrlPatternValidation:
    """Tests for URL pattern validation."""

    def test_valid_http_url(self):
        errors = validate_url_pattern("http://example.com/path")
        assert errors == []

    def test_valid_https_url(self):
        errors = validate_url_pattern("https://example.com/path?query=1")
        assert errors == []

    def test_empty_url(self):
        errors = validate_url_pattern("")
        assert len(errors) == 1
        assert "cannot be empty" in errors[0]

    def test_missing_scheme(self):
        errors = validate_url_pattern("example.com/path")
        assert len(errors) >= 1
        assert any("missing a scheme" in e for e in errors)

    def test_invalid_scheme(self):
        errors = validate_url_pattern("ftp://example.com/path")
        assert len(errors) >= 1
        assert any("invalid scheme" in e for e in errors)


class TestCssSelectorValidation:
    """Tests for CSS selector validation."""

    def test_valid_class_selector(self):
        errors = validate_css_selector(".my-class", "test_field")
        assert errors == []

    def test_valid_id_selector(self):
        errors = validate_css_selector("#my-id", "test_field")
        assert errors == []

    def test_valid_attribute_selector(self):
        errors = validate_css_selector("div[data-id='123']", "test_field")
        assert errors == []

    def test_empty_selector(self):
        errors = validate_css_selector("", "test_field")
        assert len(errors) == 1
        assert "cannot be empty" in errors[0]

    def test_unbalanced_brackets(self):
        errors = validate_css_selector("div[data-id='123'", "test_field")
        assert len(errors) >= 1
        assert any("unbalanced" in e for e in errors)


class TestXpathValidation:
    """Tests for XPath expression validation."""

    def test_valid_xpath(self):
        errors = validate_xpath_expression("//div[@class='content']", "test_field")
        assert errors == []

    def test_valid_xpath_with_text(self):
        errors = validate_xpath_expression("//span[text()='Hello']", "test_field")
        assert errors == []

    def test_empty_xpath(self):
        errors = validate_xpath_expression("", "test_field")
        assert len(errors) == 1
        assert "cannot be empty" in errors[0]

    def test_invalid_xpath_syntax(self):
        errors = validate_xpath_expression("//div[@class='content'", "test_field")
        assert len(errors) >= 1
        assert any("invalid" in e.lower() for e in errors)


class TestExtractionRuleValidation:
    """Tests for extraction rule validation."""

    def test_valid_css_rule(self):
        rule = ExtractionRule(
            field_name="title",
            selector=".title-class",
            selector_type=SelectorType.CSS,
        )
        errors = validate_extraction_rule(rule)
        assert errors == []

    def test_valid_xpath_rule(self):
        rule = ExtractionRule(
            field_name="title",
            selector="//h1[@class='title']",
            selector_type=SelectorType.XPATH,
        )
        errors = validate_extraction_rule(rule)
        assert errors == []

    def test_empty_field_name(self):
        rule = ExtractionRule(
            field_name="",
            selector=".title",
            selector_type=SelectorType.CSS,
        )
        errors = validate_extraction_rule(rule)
        assert len(errors) >= 1
        assert any("field_name" in e for e in errors)


class TestDataSourceConfigValidation:
    """Tests for DataSourceConfig validation."""

    def test_valid_config(self):
        config = DataSourceConfig(
            name="Test Source",
            url_pattern="https://example.com/scholarships",
            source_type=SourceType.SCHOLARSHIP,
            extraction_rules=[
                ExtractionRule(
                    field_name="title",
                    selector=".scholarship-title",
                    selector_type=SelectorType.CSS,
                )
            ],
        )
        result = validate_data_source_config(config)
        assert result.valid is True
        assert result.errors == []

    def test_empty_name(self):
        config = DataSourceConfig(
            name="",
            url_pattern="https://example.com",
            source_type=SourceType.SCHOLARSHIP,
            extraction_rules=[
                ExtractionRule(field_name="title", selector=".title")
            ],
        )
        result = validate_data_source_config(config)
        assert result.valid is False
        assert any("name" in e.lower() for e in result.errors)

    def test_invalid_url(self):
        config = DataSourceConfig(
            name="Test",
            url_pattern="not-a-url",
            source_type=SourceType.SCHOLARSHIP,
            extraction_rules=[
                ExtractionRule(field_name="title", selector=".title")
            ],
        )
        result = validate_data_source_config(config)
        assert result.valid is False
        assert any("url" in e.lower() for e in result.errors)

    def test_no_extraction_rules(self):
        config = DataSourceConfig(
            name="Test",
            url_pattern="https://example.com",
            source_type=SourceType.SCHOLARSHIP,
            extraction_rules=[],
        )
        result = validate_data_source_config(config)
        assert result.valid is False
        assert any("extraction rule" in e.lower() for e in result.errors)

    def test_invalid_extraction_rule(self):
        config = DataSourceConfig(
            name="Test",
            url_pattern="https://example.com",
            source_type=SourceType.SCHOLARSHIP,
            extraction_rules=[
                ExtractionRule(
                    field_name="title",
                    selector="//div[@class='test'",  # Invalid XPath
                    selector_type=SelectorType.XPATH,
                )
            ],
        )
        result = validate_data_source_config(config)
        assert result.valid is False
        assert any("invalid" in e.lower() for e in result.errors)


class TestCronExpressionValidation:
    """Tests for cron expression validation."""

    def test_valid_cron_every_minute(self):
        result = validate_cron_expression("* * * * *")
        assert result.valid is True
        assert result.errors == []

    def test_valid_cron_daily(self):
        result = validate_cron_expression("0 0 * * *")
        assert result.valid is True
        assert result.errors == []

    def test_valid_cron_weekly(self):
        result = validate_cron_expression("0 0 * * 0")
        assert result.valid is True
        assert result.errors == []

    def test_valid_cron_with_ranges(self):
        result = validate_cron_expression("0 9-17 * * 1-5")
        assert result.valid is True
        assert result.errors == []

    def test_empty_cron(self):
        result = validate_cron_expression("")
        assert result.valid is False
        assert any("cannot be empty" in e for e in result.errors)

    def test_invalid_cron_too_few_fields(self):
        result = validate_cron_expression("* * *")
        assert result.valid is False
        assert len(result.errors) >= 1

    def test_invalid_cron_bad_value(self):
        result = validate_cron_expression("99 * * * *")
        assert result.valid is False
        assert len(result.errors) >= 1
