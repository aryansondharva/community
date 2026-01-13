# Implementation Plan: Info Hunter

## Overview

This implementation plan builds the Info Hunter data aggregation platform incrementally, starting with core data models and validation, then adding scraping capabilities, storage/search with ElasticSearch, and finally the REST API. Property-based tests are integrated alongside implementation to catch issues early.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create Python package structure with `src/info_hunter/` directory
  - Set up `pyproject.toml` with dependencies: fastapi, uvicorn, selenium, elasticsearch, pydantic, hypothesis, pytest
  - Create `tests/` directory structure (unit, property, integration)
  - Set up pytest configuration
  - _Requirements: All_

- [x] 2. Implement core data models
  - [x] 2.1 Create data model classes with Pydantic
    - Implement SourceType enum (scholarship, internship, price, learning)
    - Implement SelectorType enum (css, xpath)
    - Implement JobStatus enum (pending, running, completed, failed)
    - Implement ExtractionRule dataclass
    - Implement PaginationConfig dataclass
    - Implement DataSourceConfig dataclass
    - Implement Document dataclass with content_hash generation
    - Implement SearchQuery and SearchResult dataclasses
    - Implement ScrapeJob and Schedule dataclasses
    - _Requirements: 1.3, 2.3, 3.2, 4.4_

  - [ ]* 2.2 Write property test for Document serialization round-trip
    - **Property 12: Document Serialization Round-Trip**
    - **Validates: Requirements 7.3**

- [x] 3. Implement validation logic
  - [x] 3.1 Create DataSourceConfig validator
    - Implement URL pattern validation (valid URL format)
    - Implement CSS selector validation
    - Implement XPath expression validation
    - Return descriptive ValidationResult with errors
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 3.2 Write property test for data source validation
    - **Property 1: Data Source Validation Correctness**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 3.3 Create cron expression validator
    - Implement cron syntax validation
    - Return descriptive errors for invalid expressions
    - _Requirements: 5.1_

  - [ ]* 3.4 Write property test for cron validation
    - **Property 10: Cron Expression Validation**
    - **Validates: Requirements 5.1**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Implement Extractor component
  - [x] 5.1 Create Extractor class
    - Implement `extract_field()` for CSS selectors using BeautifulSoup
    - Implement `extract_field()` for XPath using lxml
    - Implement `extract_all()` to apply multiple rules
    - Implement `normalize()` to create Document from raw data
    - _Requirements: 1.3, 2.2, 2.3_

  - [ ]* 5.2 Write property test for selector support
    - **Property 2: Selector Type Support**
    - **Validates: Requirements 1.3**

  - [ ]* 5.3 Write property test for data extraction consistency
    - **Property 4: Data Extraction Consistency**
    - **Validates: Requirements 2.2**

  - [ ]* 5.4 Write property test for document normalization
    - **Property 5: Document Normalization Completeness**
    - **Validates: Requirements 2.3**

- [x] 6. Implement Document ID generation
  - [x] 6.1 Create document ID generator
    - Implement content hash calculation (SHA-256 of normalized content)
    - Implement ID generation from source URL + content hash
    - Ensure deterministic output for identical inputs
    - _Requirements: 3.2, 3.3_

  - [ ]* 6.2 Write property test for document ID determinism
    - **Property 6: Document ID Determinism**
    - **Validates: Requirements 3.2, 3.3**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement configuration store
  - [x] 8.1 Create ConfigStore class
    - Implement file-based JSON storage for DataSourceConfig
    - Implement `save()`, `get()`, `list()`, `delete()` methods
    - _Requirements: 1.4_

  - [ ]* 8.2 Write property test for data source persistence round-trip
    - **Property 3: Data Source Persistence Round-Trip**
    - **Validates: Requirements 1.4**

- [x] 9. Implement DataSourceManager
  - [x] 9.1 Create DataSourceManager class
    - Implement `create_source()` with validation
    - Implement `get_source()`, `list_sources()`, `update_source()`, `delete_source()`
    - Wire up ConfigStore and validators
    - _Requirements: 1.1, 1.2, 1.4_

- [-] 10. Implement SearchEngine query builder
  - [x] 10.1 Create SearchEngine class
    - Implement `build_query()` to convert SearchQuery to ES query DSL
    - Support text search with full-text matching
    - Support source_type filtering
    - Support date range filtering
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 10.2 Write property test for search query filter building
    - **Property 8: Search Query Filter Building**
    - **Validates: Requirements 4.2, 4.3**

  - [ ]* 10.3 Write property test for search result completeness
    - **Property 9: Search Result Completeness**
    - **Validates: Requirements 4.4**

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement Aggregator
  - [x] 12.1 Create Aggregator class
    - Implement ElasticSearch client initialization
    - Implement `index_document()` with deduplication
    - Implement `bulk_index()` for batch operations
    - Implement document field preservation
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ]* 12.2 Write property test for document field preservation
    - **Property 7: Document Field Preservation**
    - **Validates: Requirements 3.5**

- [x] 13. Implement WebScraper
  - [x] 13.1 Create WebScraper class
    - Implement Selenium WebDriver initialization with options
    - Implement `scrape()` method to navigate and extract
    - Implement `handle_pagination()` for multi-page scraping
    - Implement retry logic with exponential backoff
    - Wire up Extractor for data extraction
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

- [x] 14. Implement Scheduler
  - [x] 14.1 Create Scheduler class
    - Implement schedule storage and management
    - Implement `create_schedule()` with cron validation
    - Implement `trigger_job()` for manual execution
    - Implement background job runner
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement REST API
  - [x] 16.1 Create FastAPI application structure
    - Set up FastAPI app with CORS and error handlers
    - Create Pydantic request/response models
    - _Requirements: 6.5_

  - [x] 16.2 Implement data source endpoints
    - POST /api/sources - Create data source
    - GET /api/sources - List data sources
    - GET /api/sources/{id} - Get data source
    - PUT /api/sources/{id} - Update data source
    - DELETE /api/sources/{id} - Delete data source
    - _Requirements: 6.1_

  - [x] 16.3 Implement job endpoints
    - POST /api/jobs/trigger/{source_id} - Trigger scrape job
    - GET /api/jobs - List jobs
    - GET /api/jobs/{id} - Get job status
    - _Requirements: 6.2_

  - [x] 16.4 Implement search endpoints
    - POST /api/search - Search documents
    - GET /api/search - Search with query params
    - _Requirements: 6.3_

  - [x] 16.5 Implement schedule endpoints
    - POST /api/schedules - Create schedule
    - GET /api/schedules - List schedules
    - DELETE /api/schedules/{id} - Delete schedule
    - _Requirements: 6.1_

  - [ ]* 16.6 Write property test for API validation error responses
    - **Property 11: API Validation Error Responses**
    - **Validates: Requirements 6.4**

- [x] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using Hypothesis
- Unit tests validate specific examples and edge cases
- Integration tests (not listed) should be added for Selenium and ElasticSearch interactions
