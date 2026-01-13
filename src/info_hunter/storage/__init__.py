"""Storage and indexing components."""

import json
import os
import uuid
from pathlib import Path
from typing import Dict, List, Optional

from info_hunter.models import DataSourceConfig


class DataSource(DataSourceConfig):
    """A DataSourceConfig with an assigned ID for storage."""
    id: str


class ConfigStore:
    """File-based JSON storage for DataSourceConfig objects.
    
    Stores each data source configuration as a separate JSON file
    in the configured storage directory.
    """
    
    def __init__(self, storage_dir: str = ".info_hunter/configs"):
        """Initialize the ConfigStore.
        
        Args:
            storage_dir: Directory path where config files will be stored.
                        Defaults to '.info_hunter/configs'.
        """
        self._storage_dir = Path(storage_dir)
        self._ensure_storage_dir()
    
    def _ensure_storage_dir(self) -> None:
        """Create the storage directory if it doesn't exist."""
        self._storage_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_file_path(self, source_id: str) -> Path:
        """Get the file path for a given source ID."""
        return self._storage_dir / f"{source_id}.json"
    
    def _generate_id(self) -> str:
        """Generate a unique ID for a new data source."""
        return str(uuid.uuid4())
    
    def save(self, config: DataSourceConfig, source_id: Optional[str] = None) -> DataSource:
        """Save a DataSourceConfig to the store.
        
        If source_id is provided, updates the existing config.
        If source_id is None, creates a new config with a generated ID.
        
        Args:
            config: The DataSourceConfig to save.
            source_id: Optional ID for updating an existing config.
            
        Returns:
            DataSource with the assigned ID.
        """
        if source_id is None:
            source_id = self._generate_id()
        
        # Create DataSource with ID
        data_source = DataSource(
            id=source_id,
            **config.model_dump()
        )
        
        file_path = self._get_file_path(source_id)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data_source.model_dump(mode='json'), f, indent=2)
        
        return data_source
    
    def get(self, source_id: str) -> Optional[DataSource]:
        """Retrieve a DataSource by ID.
        
        Args:
            source_id: The ID of the data source to retrieve.
            
        Returns:
            The DataSource if found, None otherwise.
        """
        file_path = self._get_file_path(source_id)
        
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return DataSource.model_validate(data)
    
    def list(self) -> List[DataSource]:
        """List all stored DataSources.
        
        Returns:
            List of all DataSource objects in the store.
        """
        sources: List[DataSource] = []
        
        if not self._storage_dir.exists():
            return sources
        
        for file_path in self._storage_dir.glob("*.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                sources.append(DataSource.model_validate(data))
            except (json.JSONDecodeError, ValueError):
                # Skip invalid files
                continue
        
        return sources
    
    def delete(self, source_id: str) -> bool:
        """Delete a DataSource by ID.
        
        Args:
            source_id: The ID of the data source to delete.
            
        Returns:
            True if the source was deleted, False if it didn't exist.
        """
        file_path = self._get_file_path(source_id)
        
        if not file_path.exists():
            return False
        
        file_path.unlink()
        return True


__all__ = [
    "ConfigStore",
    "DataSource",
]
