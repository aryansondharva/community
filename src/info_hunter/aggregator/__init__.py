"""Aggregator component for indexing and deduplication.

This module provides the Aggregator class that manages data indexing
and deduplication in ElasticSearch.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional

from elasticsearch import Elasticsearch, NotFoundError
from elasticsearch.helpers import bulk

from info_hunter.models import Document


@dataclass
class IndexResult:
    """Result of indexing a single document."""
    success: bool
    doc_id: str
    created: bool  # True if new document, False if updated
    error: Optional[str] = None


@dataclass
class BulkIndexResult:
    """Result of bulk indexing operation."""
    success_count: int
    error_count: int
    errors: List[str]


class Aggregator:
    """Manages data indexing and deduplication in ElasticSearch.
    
    The Aggregator handles:
    - ElasticSearch client initialization
    - Document indexing with deduplication based on document ID
    - Bulk indexing for batch operations
    - Field preservation (source_url, scraped_at)
    """
    
    DEFAULT_INDEX = "info_hunter_documents"
    
    def __init__(
        self,
        es_client: Optional[Elasticsearch] = None,
        hosts: Optional[List[str]] = None,
        index_name: str = DEFAULT_INDEX,
        **es_kwargs: Any
    ):
        """Initialize the Aggregator with ElasticSearch client.
        
        Args:
            es_client: Optional pre-configured ElasticSearch client.
                      If not provided, a new client will be created.
            hosts: List of ElasticSearch host URLs. Defaults to ['http://localhost:9200'].
            index_name: Name of the ElasticSearch index. Defaults to 'info_hunter_documents'.
            **es_kwargs: Additional keyword arguments passed to Elasticsearch client.
        """
        if es_client is not None:
            self._client = es_client
        else:
            hosts = hosts or ["http://localhost:9200"]
            self._client = Elasticsearch(hosts=hosts, **es_kwargs)
        
        self._index_name = index_name
        self._ensure_index()
    
    def _ensure_index(self) -> None:
        """Create the index with proper mappings if it doesn't exist."""
        if not self._client.indices.exists(index=self._index_name):
            mappings = {
                "properties": {
                    "id": {"type": "keyword"},
                    "source_id": {"type": "keyword"},
                    "source_type": {"type": "keyword"},
                    "source_url": {"type": "keyword"},
                    "title": {"type": "text", "analyzer": "standard"},
                    "description": {"type": "text", "analyzer": "standard"},
                    "content": {"type": "object", "enabled": True},
                    "scraped_at": {"type": "date"},
                    "content_hash": {"type": "keyword"},
                }
            }
            self._client.indices.create(index=self._index_name, mappings=mappings)
    
    def _document_to_dict(self, doc: Document) -> Dict[str, Any]:
        """Convert a Document to a dictionary for ElasticSearch.
        
        Preserves all fields including source_url and scraped_at.
        
        Args:
            doc: The Document to convert.
            
        Returns:
            Dictionary representation suitable for ElasticSearch.
        """
        return {
            "id": doc.id,
            "source_id": doc.source_id,
            "source_type": doc.source_type.value,
            "source_url": doc.source_url,
            "title": doc.title,
            "description": doc.description,
            "content": doc.content,
            "scraped_at": doc.scraped_at.isoformat(),
            "content_hash": doc.content_hash,
        }
    
    def _dict_to_document(self, data: Dict[str, Any]) -> Document:
        """Convert an ElasticSearch document back to a Document object.
        
        Args:
            data: Dictionary from ElasticSearch.
            
        Returns:
            Document object with all fields preserved.
        """
        from info_hunter.models import SourceType
        
        scraped_at = data["scraped_at"]
        if isinstance(scraped_at, str):
            scraped_at = datetime.fromisoformat(scraped_at.replace("Z", "+00:00"))
        
        return Document(
            id=data["id"],
            source_id=data["source_id"],
            source_type=SourceType(data["source_type"]),
            source_url=data["source_url"],
            title=data["title"],
            description=data.get("description"),
            content=data.get("content", {}),
            scraped_at=scraped_at,
            content_hash=data["content_hash"],
        )
    
    def index_document(self, doc: Document) -> IndexResult:
        """Index a document with deduplication.
        
        If a document with the same ID already exists, it will be updated
        with the new data while preserving the original source_url and
        updating the scraped_at timestamp.
        
        Deduplication is based on the document ID, which is derived from
        the source URL and content hash. This means:
        - Same content from same source = same ID = update existing
        - Different content from same source = different ID = new document
        
        Args:
            doc: The Document to index.
            
        Returns:
            IndexResult indicating success/failure and whether document was created or updated.
        """
        try:
            doc_dict = self._document_to_dict(doc)
            
            # Check if document exists for deduplication
            existing = self._get_existing_document(doc.id)
            
            if existing is not None:
                # Update existing document - preserve original source_url,
                # update scraped_at to latest
                doc_dict["source_url"] = existing["source_url"]
                
                self._client.index(
                    index=self._index_name,
                    id=doc.id,
                    document=doc_dict,
                )
                return IndexResult(success=True, doc_id=doc.id, created=False)
            else:
                # Create new document
                self._client.index(
                    index=self._index_name,
                    id=doc.id,
                    document=doc_dict,
                )
                return IndexResult(success=True, doc_id=doc.id, created=True)
                
        except Exception as e:
            return IndexResult(
                success=False,
                doc_id=doc.id,
                created=False,
                error=str(e)
            )
    
    def _get_existing_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve an existing document by ID.
        
        Args:
            doc_id: The document ID to look up.
            
        Returns:
            Document data if found, None otherwise.
        """
        try:
            result = self._client.get(index=self._index_name, id=doc_id)
            return result["_source"]
        except NotFoundError:
            return None
    
    def bulk_index(self, docs: List[Document]) -> BulkIndexResult:
        """Index multiple documents efficiently using bulk operations.
        
        Uses ElasticSearch bulk API for efficient batch indexing.
        Each document is processed with the same deduplication logic
        as index_document().
        
        Args:
            docs: List of Documents to index.
            
        Returns:
            BulkIndexResult with counts of successes and failures.
        """
        if not docs:
            return BulkIndexResult(success_count=0, error_count=0, errors=[])
        
        # Prepare bulk actions
        actions = []
        for doc in docs:
            doc_dict = self._document_to_dict(doc)
            action = {
                "_index": self._index_name,
                "_id": doc.id,
                "_source": doc_dict,
            }
            actions.append(action)
        
        # Execute bulk operation
        try:
            success_count, errors = bulk(
                self._client,
                actions,
                raise_on_error=False,
                raise_on_exception=False,
            )
            
            error_messages = []
            error_count = 0
            
            if errors:
                for error in errors:
                    error_count += 1
                    if isinstance(error, dict) and "index" in error:
                        error_info = error["index"].get("error", {})
                        error_messages.append(
                            f"Doc {error['index'].get('_id', 'unknown')}: "
                            f"{error_info.get('reason', 'Unknown error')}"
                        )
                    else:
                        error_messages.append(str(error))
            
            return BulkIndexResult(
                success_count=success_count,
                error_count=error_count,
                errors=error_messages,
            )
            
        except Exception as e:
            return BulkIndexResult(
                success_count=0,
                error_count=len(docs),
                errors=[f"Bulk operation failed: {str(e)}"],
            )
    
    def get_document(self, doc_id: str) -> Optional[Document]:
        """Retrieve a document by ID.
        
        Args:
            doc_id: The document ID to retrieve.
            
        Returns:
            Document if found, None otherwise.
        """
        data = self._get_existing_document(doc_id)
        if data is None:
            return None
        return self._dict_to_document(data)
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document by ID.
        
        Args:
            doc_id: The document ID to delete.
            
        Returns:
            True if deleted, False if not found.
        """
        try:
            self._client.delete(index=self._index_name, id=doc_id)
            return True
        except NotFoundError:
            return False
    
    def generate_doc_id(self, doc: Document) -> str:
        """Generate unique ID from source URL and content hash.
        
        This is a convenience method that delegates to Document.generate_id().
        
        Args:
            doc: The Document to generate an ID for.
            
        Returns:
            The document's ID (same as doc.id).
        """
        return Document.generate_id(doc.source_url, doc.content_hash)


__all__ = [
    "Aggregator",
    "IndexResult",
    "BulkIndexResult",
]
