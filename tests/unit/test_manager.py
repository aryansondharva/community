"""Unit tests for DataSourceManager."""

import tempfile
import pytest

from info_hunter.manager import (
    DataSourceManager,
    ValidationError,
    DataSourceNotFoundError,
)
from info_hunter.storage import ConfigStore, DataSource
from info_hunter.models import (
    DataSourceConfig,
    SourceType,
    ExtractionRule,
    SelectorType,
)


@pytest.fixture
def temp_manager():
    """Create a DataSourceManager with a temporary storage directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        store = ConfigStore(storage_dir=tmpdir)
        yield DataSourceManager(config_store=store)


@pytest.fixture
def valid_config():
    """Create a valid DataSourceConfig for testing."""
    return DataSourceConfig(
        name="Test Scholarship Source",
        url_pattern="https://example.com/scholarships",
        source_type=SourceType.SCHOLARSHIP,
        extraction_rules=[
            ExtractionRule(
                field_name="title",
                selector="h1.title",
                selector_type=SelectorType.CSS,
                required=True,
            ),
        ],
        rate_limit_ms=1000,
    )


@pytest.fixture
def invalid_config():
    """Create an invalid DataSourceConfig for testing."""
    return DataSourceConfig(
        name="",  # Invalid: empty name
        url_pattern="not-a-valid-url",  # Invalid: no scheme
        source_type=SourceType.SCHOLARSHIP,
        extraction_rules=[],  # Invalid: no extraction rules
    )


class TestDataSourceManagerCreate:
    """Tests for DataSourceManager.create_source()."""

    def test_create_valid_source(self, temp_manager, valid_config):
        """Test creating a valid data source."""
        result = temp_manager.create_source(valid_config)
        
        assert isinstance(result, DataSource)
        assert result.id is not None
        assert result.name == valid_config.name
        assert result.url_pattern == valid_config.url_pattern
        assert result.source_type == valid_config.source_type

    def test_create_invalid_source_raises_validation_error(self, temp_manager, invalid_config):
        """Test that creating an invalid source raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            temp_manager.create_source(invalid_config)
        
        assert len(exc_info.value.errors) > 0

    def test_create_source_persists_to_store(self, temp_manager, valid_config):
        """Test that created source is persisted and retrievable."""
        created = temp_manager.create_source(valid_config)
        retrieved = temp_manager.get_source(created.id)
        
        assert retrieved is not None
        assert retrieved.id == created.id
        assert retrieved.name == created.name


class TestDataSourceManagerGet:
    """Tests for DataSourceManager.get_source()."""

    def test_get_existing_source(self, temp_manager, valid_config):
        """Test retrieving an existing source."""
        created = temp_manager.create_source(valid_config)
        retrieved = temp_manager.get_source(created.id)
        
        assert retrieved is not None
        assert retrieved.id == created.id

    def test_get_nonexistent_source_returns_none(self, temp_manager):
        """Test that getting a non-existent source returns None."""
        result = temp_manager.get_source("nonexistent-id")
        assert result is None


class TestDataSourceManagerList:
    """Tests for DataSourceManager.list_sources()."""

    def test_list_all_sources(self, temp_manager, valid_config):
        """Test listing all sources."""
        # Create multiple sources
        source1 = temp_manager.create_source(valid_config)
        
        config2 = DataSourceConfig(
            name="Internship Source",
            url_pattern="https://example.com/internships",
            source_type=SourceType.INTERNSHIP,
            extraction_rules=[
                ExtractionRule(field_name="title", selector=".title"),
            ],
        )
        source2 = temp_manager.create_source(config2)
        
        all_sources = temp_manager.list_sources()
        
        assert len(all_sources) == 2
        ids = {s.id for s in all_sources}
        assert source1.id in ids
        assert source2.id in ids

    def test_list_sources_filtered_by_type(self, temp_manager, valid_config):
        """Test listing sources filtered by type."""
        # Create sources of different types
        temp_manager.create_source(valid_config)  # SCHOLARSHIP
        
        config2 = DataSourceConfig(
            name="Internship Source",
            url_pattern="https://example.com/internships",
            source_type=SourceType.INTERNSHIP,
            extraction_rules=[
                ExtractionRule(field_name="title", selector=".title"),
            ],
        )
        temp_manager.create_source(config2)
        
        # Filter by SCHOLARSHIP
        scholarship_sources = temp_manager.list_sources(source_type=SourceType.SCHOLARSHIP)
        assert len(scholarship_sources) == 1
        assert scholarship_sources[0].source_type == SourceType.SCHOLARSHIP
        
        # Filter by INTERNSHIP
        internship_sources = temp_manager.list_sources(source_type=SourceType.INTERNSHIP)
        assert len(internship_sources) == 1
        assert internship_sources[0].source_type == SourceType.INTERNSHIP

    def test_list_empty_store(self, temp_manager):
        """Test listing sources from empty store."""
        result = temp_manager.list_sources()
        assert result == []


class TestDataSourceManagerUpdate:
    """Tests for DataSourceManager.update_source()."""

    def test_update_existing_source(self, temp_manager, valid_config):
        """Test updating an existing source."""
        created = temp_manager.create_source(valid_config)
        
        updated_config = DataSourceConfig(
            name="Updated Name",
            url_pattern="https://example.com/updated",
            source_type=SourceType.INTERNSHIP,
            extraction_rules=[
                ExtractionRule(field_name="title", selector=".new-title"),
            ],
        )
        
        updated = temp_manager.update_source(created.id, updated_config)
        
        assert updated.id == created.id
        assert updated.name == "Updated Name"
        assert updated.source_type == SourceType.INTERNSHIP

    def test_update_nonexistent_source_raises_error(self, temp_manager, valid_config):
        """Test that updating a non-existent source raises error."""
        with pytest.raises(DataSourceNotFoundError) as exc_info:
            temp_manager.update_source("nonexistent-id", valid_config)
        
        assert exc_info.value.source_id == "nonexistent-id"

    def test_update_with_invalid_config_raises_validation_error(self, temp_manager, valid_config, invalid_config):
        """Test that updating with invalid config raises ValidationError."""
        created = temp_manager.create_source(valid_config)
        
        with pytest.raises(ValidationError):
            temp_manager.update_source(created.id, invalid_config)


class TestDataSourceManagerDelete:
    """Tests for DataSourceManager.delete_source()."""

    def test_delete_existing_source(self, temp_manager, valid_config):
        """Test deleting an existing source."""
        created = temp_manager.create_source(valid_config)
        
        result = temp_manager.delete_source(created.id)
        
        assert result is True
        assert temp_manager.get_source(created.id) is None

    def test_delete_nonexistent_source_returns_false(self, temp_manager):
        """Test that deleting a non-existent source returns False."""
        result = temp_manager.delete_source("nonexistent-id")
        assert result is False


class TestDataSourceManagerValidation:
    """Tests for DataSourceManager.validate_config()."""

    def test_validate_valid_config(self, temp_manager, valid_config):
        """Test validating a valid configuration."""
        result = temp_manager.validate_config(valid_config)
        
        assert result.valid is True
        assert result.errors == []

    def test_validate_invalid_config(self, temp_manager, invalid_config):
        """Test validating an invalid configuration."""
        result = temp_manager.validate_config(invalid_config)
        
        assert result.valid is False
        assert len(result.errors) > 0
