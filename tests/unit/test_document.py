"""Unit tests for Document ID generation."""

import pytest
from datetime import datetime

from info_hunter.models import Document, SourceType
from info_hunter.document import DocumentIdGenerator


class TestDocumentContentHash:
    """Tests for content hash generation."""

    def test_generates_sha256_hash(self):
        """Content hash should be a 64-character hex string (SHA-256)."""
        content = {"field1": "value1", "field2": "value2"}
        title = "Test Document"
        
        hash_result = Document.generate_content_hash(content, title)
        
        assert len(hash_result) == 64
        assert all(c in "0123456789abcdef" for c in hash_result)

    def test_deterministic_for_identical_inputs(self):
        """Same content and title should produce same hash."""
        content = {"name": "Test", "value": 123}
        title = "My Title"
        
        hash1 = Document.generate_content_hash(content, title)
        hash2 = Document.generate_content_hash(content, title)
        
        assert hash1 == hash2

    def test_different_content_produces_different_hash(self):
        """Different content should produce different hashes."""
        title = "Same Title"
        content1 = {"field": "value1"}
        content2 = {"field": "value2"}
        
        hash1 = Document.generate_content_hash(content1, title)
        hash2 = Document.generate_content_hash(content2, title)
        
        assert hash1 != hash2

    def test_different_title_produces_different_hash(self):
        """Different titles should produce different hashes."""
        content = {"field": "value"}
        
        hash1 = Document.generate_content_hash(content, "Title 1")
        hash2 = Document.generate_content_hash(content, "Title 2")
        
        assert hash1 != hash2

    def test_dict_order_does_not_affect_hash(self):
        """Dictionary key order should not affect the hash."""
        title = "Test"
        content1 = {"a": 1, "b": 2, "c": 3}
        content2 = {"c": 3, "a": 1, "b": 2}
        
        hash1 = Document.generate_content_hash(content1, title)
        hash2 = Document.generate_content_hash(content2, title)
        
        assert hash1 == hash2

    def test_nested_dict_deterministic(self):
        """Nested dictionaries should produce deterministic hashes."""
        title = "Nested Test"
        content = {
            "outer": {
                "inner1": "value1",
                "inner2": {"deep": "value"}
            },
            "list": [1, 2, 3]
        }
        
        hash1 = Document.generate_content_hash(content, title)
        hash2 = Document.generate_content_hash(content, title)
        
        assert hash1 == hash2


class TestDocumentIdGeneration:
    """Tests for document ID generation."""

    def test_generates_16_char_id(self):
        """Document ID should be 16 characters."""
        source_url = "https://example.com/page"
        content_hash = "a" * 64
        
        doc_id = Document.generate_id(source_url, content_hash)
        
        assert len(doc_id) == 16
        assert all(c in "0123456789abcdef" for c in doc_id)

    def test_deterministic_for_identical_inputs(self):
        """Same URL and hash should produce same ID."""
        source_url = "https://example.com/page"
        content_hash = "abc123" * 10 + "abcd"
        
        id1 = Document.generate_id(source_url, content_hash)
        id2 = Document.generate_id(source_url, content_hash)
        
        assert id1 == id2

    def test_different_url_produces_different_id(self):
        """Different URLs should produce different IDs."""
        content_hash = "abc123" * 10 + "abcd"
        
        id1 = Document.generate_id("https://example.com/page1", content_hash)
        id2 = Document.generate_id("https://example.com/page2", content_hash)
        
        assert id1 != id2

    def test_different_hash_produces_different_id(self):
        """Different content hashes should produce different IDs."""
        source_url = "https://example.com/page"
        
        id1 = Document.generate_id(source_url, "a" * 64)
        id2 = Document.generate_id(source_url, "b" * 64)
        
        assert id1 != id2


class TestDocumentIdGeneratorClass:
    """Tests for the DocumentIdGenerator class."""

    def test_normalize_content_deterministic(self):
        """Content normalization should be deterministic."""
        content = {"z": 1, "a": 2, "m": 3}
        
        norm1 = DocumentIdGenerator.normalize_content(content)
        norm2 = DocumentIdGenerator.normalize_content(content)
        
        assert norm1 == norm2

    def test_normalize_content_sorted_keys(self):
        """Normalized content should have sorted keys."""
        content = {"z": 1, "a": 2, "m": 3}
        
        normalized = DocumentIdGenerator.normalize_content(content)
        
        # JSON with sorted keys should have "a" before "m" before "z"
        assert normalized.index('"a"') < normalized.index('"m"')
        assert normalized.index('"m"') < normalized.index('"z"')

    def test_generate_document_id_returns_tuple(self):
        """generate_document_id should return (doc_id, content_hash) tuple."""
        source_url = "https://example.com"
        content = {"field": "value"}
        title = "Test"
        
        result = DocumentIdGenerator.generate_document_id(source_url, content, title)
        
        assert isinstance(result, tuple)
        assert len(result) == 2
        doc_id, content_hash = result
        assert len(doc_id) == 16
        assert len(content_hash) == 64

    def test_generator_matches_document_methods(self):
        """DocumentIdGenerator should produce same results as Document methods."""
        source_url = "https://example.com/test"
        content = {"key": "value", "number": 42}
        title = "Test Document"
        
        # Using Document static methods
        doc_hash = Document.generate_content_hash(content, title)
        doc_id = Document.generate_id(source_url, doc_hash)
        
        # Using DocumentIdGenerator
        gen_hash = DocumentIdGenerator.generate_content_hash(content, title)
        gen_id = DocumentIdGenerator.generate_id(source_url, gen_hash)
        
        assert doc_hash == gen_hash
        assert doc_id == gen_id


class TestDocumentCreation:
    """Tests for creating Document instances with generated IDs."""

    def test_create_document_with_generated_id(self):
        """Should be able to create a Document using generated ID and hash."""
        source_url = "https://example.com/scholarship/123"
        content = {"amount": "$5000", "deadline": "2024-12-31"}
        title = "Test Scholarship"
        
        content_hash = Document.generate_content_hash(content, title)
        doc_id = Document.generate_id(source_url, content_hash)
        
        doc = Document(
            id=doc_id,
            source_id="source-1",
            source_type=SourceType.SCHOLARSHIP,
            source_url=source_url,
            title=title,
            content=content,
            scraped_at=datetime.now(),
            content_hash=content_hash,
        )
        
        assert doc.id == doc_id
        assert doc.content_hash == content_hash
        assert len(doc.id) == 16
        assert len(doc.content_hash) == 64
