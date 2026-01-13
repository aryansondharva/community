"""Search engine components for Info Hunter."""

from typing import Any, Dict, List, Optional

from info_hunter.models import SearchQuery, SearchResult, Document, SourceType


class SearchEngine:
    """Provides search and filtering capabilities using ElasticSearch.
    
    This class handles building ElasticSearch query DSL from SearchQuery objects
    and executing searches against the ElasticSearch index.
    """
    
    def __init__(self, es_client: Optional[Any] = None, index_name: str = "documents"):
        """Initialize with ElasticSearch client.
        
        Args:
            es_client: ElasticSearch client instance (optional for query building)
            index_name: Name of the ElasticSearch index to search
        """
        self.es_client = es_client
        self.index_name = index_name
    
    def build_query(self, query: SearchQuery) -> Dict[str, Any]:
        """Build ElasticSearch query DSL from SearchQuery.
        
        Converts a SearchQuery object into an ElasticSearch query dictionary
        that supports:
        - Full-text search across title, description, and content fields
        - Filtering by source_type (scholarship, internship, price, learning)
        - Filtering by date range on scraped_at field
        - Pagination with from/size parameters
        
        Args:
            query: SearchQuery object containing search parameters
            
        Returns:
            Dictionary representing ElasticSearch query DSL
        """
        es_query: Dict[str, Any] = {
            "from": (query.page - 1) * query.page_size,
            "size": query.page_size,
            "query": {
                "bool": {
                    "must": [],
                    "filter": []
                }
            }
        }
        
        # Add full-text search on text fields
        if query.text:
            es_query["query"]["bool"]["must"].append({
                "multi_match": {
                    "query": query.text,
                    "fields": ["title^2", "description", "content.*"],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            })
        else:
            # If no text query, match all documents
            es_query["query"]["bool"]["must"].append({
                "match_all": {}
            })
        
        # Add source_type filter
        if query.source_types:
            source_type_values = [st.value for st in query.source_types]
            es_query["query"]["bool"]["filter"].append({
                "terms": {
                    "source_type": source_type_values
                }
            })
        
        # Add date range filter
        date_range = self._build_date_range_filter(query.date_from, query.date_to)
        if date_range:
            es_query["query"]["bool"]["filter"].append(date_range)
        
        # Add sorting by relevance and date
        es_query["sort"] = [
            "_score",
            {"scraped_at": {"order": "desc"}}
        ]
        
        return es_query
    
    def _build_date_range_filter(
        self, 
        date_from: Optional[Any], 
        date_to: Optional[Any]
    ) -> Optional[Dict[str, Any]]:
        """Build date range filter for scraped_at field.
        
        Args:
            date_from: Start date for filtering (inclusive)
            date_to: End date for filtering (inclusive)
            
        Returns:
            Dictionary representing date range filter, or None if no dates provided
        """
        if not date_from and not date_to:
            return None
        
        range_filter: Dict[str, Any] = {
            "range": {
                "scraped_at": {}
            }
        }
        
        if date_from:
            range_filter["range"]["scraped_at"]["gte"] = date_from.isoformat()
        
        if date_to:
            range_filter["range"]["scraped_at"]["lte"] = date_to.isoformat()
        
        return range_filter
    
    def search(self, query: SearchQuery) -> SearchResult:
        """Execute a search query with filters.
        
        Args:
            query: SearchQuery object containing search parameters
            
        Returns:
            SearchResult containing matching documents and metadata
            
        Raises:
            RuntimeError: If ElasticSearch client is not configured
        """
        if not self.es_client:
            raise RuntimeError("ElasticSearch client not configured")
        
        es_query = self.build_query(query)
        
        response = self.es_client.search(
            index=self.index_name,
            body=es_query
        )
        
        documents = self._parse_search_response(response)
        total = response.get("hits", {}).get("total", {})
        
        # Handle both ES 7.x and 8.x response formats
        if isinstance(total, dict):
            total_count = total.get("value", 0)
        else:
            total_count = total
        
        return SearchResult(
            total=total_count,
            page=query.page,
            page_size=query.page_size,
            documents=documents
        )
    
    def _parse_search_response(self, response: Dict[str, Any]) -> List[Document]:
        """Parse ElasticSearch response into Document objects.
        
        Args:
            response: Raw ElasticSearch search response
            
        Returns:
            List of Document objects from search hits
        """
        documents = []
        hits = response.get("hits", {}).get("hits", [])
        
        for hit in hits:
            source = hit.get("_source", {})
            try:
                doc = Document(**source)
                documents.append(doc)
            except Exception:
                # Skip documents that can't be parsed
                continue
        
        return documents


__all__ = ["SearchEngine"]
