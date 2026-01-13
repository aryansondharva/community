"""Data source management module for Info Hunter."""

from typing import List, Optional

from info_hunter.models import (
    DataSourceConfig,
    SourceType,
    ValidationResult,
)
from info_hunter.storage import ConfigStore, DataSource
from info_hunter.validation import validate_data_source_config


class DataSourceManagerError(Exception):
    """Base exception for DataSourceManager errors."""
    pass


class ValidationError(DataSourceManagerError):
    """Raised when data source configuration validation fails."""
    
    def __init__(self, errors: List[str]):
        self.errors = errors
        super().__init__(f"Validation failed: {'; '.join(errors)}")


class DataSourceNotFoundError(DataSourceManagerError):
    """Raised when a data source is not found."""
    
    def __init__(self, source_id: str):
        self.source_id = source_id
        super().__init__(f"Data source not found: {source_id}")


class DataSourceManager:
    """Manages CRUD operations for data source configurations.
    
    This class provides a high-level interface for creating, reading,
    updating, and deleting data source configurations. It handles
    validation and persistence through the ConfigStore.
    
    Attributes:
        config_store: The underlying storage for data source configurations.
    """
    
    def __init__(self, config_store: Optional[ConfigStore] = None):
        """Initialize the DataSourceManager.
        
        Args:
            config_store: Optional ConfigStore instance. If not provided,
                         a default ConfigStore will be created.
        """
        self._config_store = config_store or ConfigStore()
    
    def validate_config(self, config: DataSourceConfig) -> ValidationResult:
        """Validate a data source configuration.
        
        Args:
            config: The DataSourceConfig to validate.
            
        Returns:
            ValidationResult with valid flag and list of errors.
        """
        return validate_data_source_config(config)
    
    def create_source(self, config: DataSourceConfig) -> DataSource:
        """Create and validate a new data source configuration.
        
        Validates the configuration and persists it to the configuration store.
        
        Args:
            config: The DataSourceConfig to create.
            
        Returns:
            DataSource with the assigned ID.
            
        Raises:
            ValidationError: If the configuration is invalid.
        """
        # Validate the configuration
        validation_result = self.validate_config(config)
        if not validation_result.valid:
            raise ValidationError(validation_result.errors)
        
        # Save to the config store
        return self._config_store.save(config)
    
    def get_source(self, source_id: str) -> Optional[DataSource]:
        """Retrieve a data source by ID.
        
        Args:
            source_id: The ID of the data source to retrieve.
            
        Returns:
            The DataSource if found, None otherwise.
        """
        return self._config_store.get(source_id)
    
    def list_sources(self, source_type: Optional[SourceType] = None) -> List[DataSource]:
        """List all data sources, optionally filtered by type.
        
        Args:
            source_type: Optional SourceType to filter by.
            
        Returns:
            List of DataSource objects matching the filter criteria.
        """
        sources = self._config_store.list()
        
        if source_type is not None:
            sources = [s for s in sources if s.source_type == source_type]
        
        return sources
    
    def update_source(self, source_id: str, config: DataSourceConfig) -> DataSource:
        """Update an existing data source configuration.
        
        Validates the new configuration and updates the stored configuration.
        
        Args:
            source_id: The ID of the data source to update.
            config: The new DataSourceConfig.
            
        Returns:
            Updated DataSource.
            
        Raises:
            DataSourceNotFoundError: If the data source doesn't exist.
            ValidationError: If the new configuration is invalid.
        """
        # Check if the source exists
        existing = self._config_store.get(source_id)
        if existing is None:
            raise DataSourceNotFoundError(source_id)
        
        # Validate the new configuration
        validation_result = self.validate_config(config)
        if not validation_result.valid:
            raise ValidationError(validation_result.errors)
        
        # Save with the existing ID
        return self._config_store.save(config, source_id)
    
    def delete_source(self, source_id: str) -> bool:
        """Delete a data source configuration.
        
        Args:
            source_id: The ID of the data source to delete.
            
        Returns:
            True if the source was deleted, False if it didn't exist.
        """
        return self._config_store.delete(source_id)


__all__ = [
    "DataSourceManager",
    "DataSourceManagerError",
    "ValidationError",
    "DataSourceNotFoundError",
]
