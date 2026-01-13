"""Document ID generation for Info Hunter.

This module provides deterministic document ID generation based on
content hashing (SHA-256) and source URL combination.
"""

import json
from hashlib import sha256
from typing import Any, Dict


class DocumentIdGenerator:
    """Generates unique, deterministic document IDs.
    
    Document IDs are generated from a combination of:
    - Source URL: The URL where the document was scraped from
    - Content hash: SHA-256 hash of the normalized document content
    
    This ensures:
    - Identical content from the same source produces identical IDs
    - Different content produces different IDs
    - IDs are deterministic and reproducible
    """
    
    @staticmethod
    def normalize_content(content: Dict[str, Any]) -> str:
        """Normalize content dictionary to a deterministic string representation.
        
        Uses JSON serialization with sorted keys to ensure consistent ordering
        regardless of how the dictionary was constructed.
        
        Args:
            content: Dictionary containing document content fields
            
        Returns:
            Deterministic string representation of the content
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
        normalized = DocumentIdGenerator.normalize_content(content)
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
    
    @classmethod
    def generate_document_id(cls, source_url: str, content: Dict[str, Any], title: str) -> tuple[str, str]:
        """Generate both content hash and document ID in one call.
        
        Convenience method that generates both the content hash and the
        final document ID.
        
        Args:
            source_url: URL where the document was scraped from
            content: Dictionary containing document content fields
            title: Document title
            
        Returns:
            Tuple of (document_id, content_hash)
        """
        content_hash = cls.generate_content_hash(content, title)
        doc_id = cls.generate_id(source_url, content_hash)
        return doc_id, content_hash


__all__ = ["DocumentIdGenerator"]
