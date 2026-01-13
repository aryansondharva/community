"""Unit tests for ConfigStore."""

import tempfile
import pytest

from info_hunter.storage import ConfigStore, DataSource
from info_hunter.models import (
    DataSourceConfig,
    SourceType,
    ExtractionRule,
    SelectorType,
    PaginationConfig,
)


@pytest.fixture
def temp_store():
    """Create a ConfigStore with a temporary directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield ConfigStore(storage_dir=tmpdir)


@pytest.fixture
def sample_config():
    """Create a sample DataSourceConfig for testing."""
    return DataSourceConfig(
        name="Test Scholarship Source",
        url_pattern="https://example.com/scholarships/{page}",
        source_type=SourceType.SCHOLARSHIP,
        extraction_rules=[
            ExtractionRule(
                field_name="title",
                selector="h1.title",
                selector_type=SelectorType.CSS,
                required=True,
            ),
            ExtractionRule(
                field_name="description",
                selector="//div[@class='desc']",
                selector_type=SelectorType.XPATH,
            ),
        ],
        rate_limit_ms=2000,
    )


class TestConfigStore:
    """Tests for ConfigStore class."""

    def test_save_creates_new_source(self, temp_store, sample_config):
        """Test that save creates a new DataSource with generated ID."""
        result = temp_store.save(sample_config)
        
        assert isinstance(result, DataSource)
        assert result.id is not None
        assert len(result.id) > 0
        assert result.name == sample_config.name
        assert result.url_pattern == sample_config.url_pattern
        assert result.source_type == sample_config.source_type

    def test_save_with_id_updates_existing(self, temp_store, sample_config):
        """Test that save with source_id updates existing config."""
        # First save
        original = temp_store.save(sample_config)
        
        # Modify and save with same ID
        modified_config = DataSourceConfig(
            name="Updated Name",
            url_pattern=sample_config.url_pattern,
            source_type=SourceType.INTERNSHIP,
            extraction_rules=sample_config.extraction_rules,
        )
        updated = temp_store.save(modified_config, source_id=original.id)
        
        assert updated.id == original.id
        assert updated.name == "Updated Name"
        assert updated.source_type == SourceType.INTERNSHIP

    def test_get_returns_saved_source(self, temp_store, sample_config):
        """Test that get retrieves a saved DataSource."""
        saved = temp_store.save(sample_config)
        retrieved = temp_store.get(saved.id)
        
        assert retrieved is not None
        assert retrieved.id == saved.id
        assert retrieved.name == saved.name
        assert retrieved.url_pattern == saved.url_pattern
        assert len(retrieved.extraction_rules) == len(saved.extraction_rules)

    def test_get_returns_none_for_nonexistent(self, temp_store):
        """Test that get returns None for non-existent ID."""
        result = temp_store.get("nonexistent-id")
        assert result is None

    def test_list_returns_all_sources(self, temp_store, sample_config):
        """Test that list returns all saved sources."""
        # Save multiple configs
        saved1 = temp_store.save(sample_config)
        
        config2 = DataSourceConfig(
            name="Second Source",
            url_pattern="https://other.com",
            source_type=SourceType.PRICE,
            extraction_rules=[],
        )
        saved2 = temp_store.save(config2)
        
        all_sources = temp_store.list()
        
        assert len(all_sources) == 2
        ids = {s.id for s in all_sources}
        assert saved1.id in ids
        assert saved2.id in ids

    def test_list_returns_empty_for_empty_store(self, temp_store):
        """Test that list returns empty list when no sources exist."""
        result = temp_store.list()
        assert result == []

    def test_delete_removes_source(self, temp_store, sample_config):
        """Test that delete removes a source."""
        saved = temp_store.save(sample_config)
        
        result = temp_store.delete(saved.id)
        
        assert result is True
        assert temp_store.get(saved.id) is None

    def test_delete_returns_false_for_nonexistent(self, temp_store):
        """Test that delete returns False for non-existent ID."""
        result = temp_store.delete("nonexistent-id")
        assert result is False

    def test_preserves_pagination_config(self, temp_store):
        """Test that pagination config is preserved through save/get."""
        config = DataSourceConfig(
            name="Paginated Source",
            url_pattern="https://example.com",
            source_type=SourceType.LEARNING,
            extraction_rules=[],
            pagination=PaginationConfig(
                next_page_selector="a.next",
                selector_type=SelectorType.CSS,
                max_pages=10,
            ),
        )
        
        saved = temp_store.save(config)
        retrieved = temp_store.get(saved.id)
        
        assert retrieved.pagination is not None
        assert retrieved.pagination.next_page_selector == "a.next"
        assert retrieved.pagination.max_pages == 10

    def test_preserves_extraction_rules(self, temp_store, sample_config):
        """Test that extraction rules are preserved through save/get."""
        saved = temp_store.save(sample_config)
        retrieved = temp_store.get(saved.id)
        
        assert len(retrieved.extraction_rules) == 2
        
        title_rule = retrieved.extraction_rules[0]
        assert title_rule.field_name == "title"
        assert title_rule.selector == "h1.title"
        assert title_rule.selector_type == SelectorType.CSS
        assert title_rule.required is True
        
        desc_rule = retrieved.extraction_rules[1]
        assert desc_rule.field_name == "description"
        assert desc_rule.selector_type == SelectorType.XPATH
