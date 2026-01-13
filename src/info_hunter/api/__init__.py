"""REST API components for Info Hunter.

This module provides a FastAPI-based REST API for managing data sources,
triggering scrape jobs, searching documents, and managing schedules.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from info_hunter.models import (
    DataSourceConfig,
    Document,
    ExtractionRule,
    JobStatus,
    PaginationConfig,
    Schedule,
    ScrapeJob,
    SearchQuery,
    SearchResult,
    SelectorType,
    SourceType,
    ValidationResult,
)
from info_hunter.manager import (
    DataSourceManager,
    DataSourceNotFoundError,
    ValidationError,
)
from info_hunter.scheduler import (
    Scheduler,
    ScheduleNotFoundError,
    SourceNotFoundError,
    InvalidCronExpressionError,
)
from info_hunter.search import SearchEngine
from info_hunter.storage import ConfigStore, DataSource


# ============================================================================
# Request/Response Models
# ============================================================================

class ExtractionRuleRequest(BaseModel):
    """Request model for extraction rule configuration."""
    field_name: str
    selector: str
    selector_type: SelectorType = SelectorType.CSS
    transform: Optional[str] = None
    required: bool = False


class PaginationConfigRequest(BaseModel):
    """Request model for pagination configuration."""
    next_page_selector: str
    selector_type: SelectorType = SelectorType.CSS
    max_pages: Optional[int] = None


class DataSourceCreateRequest(BaseModel):
    """Request model for creating a data source."""
    name: str
    url_pattern: str
    source_type: SourceType
    extraction_rules: List[ExtractionRuleRequest]
    pagination: Optional[PaginationConfigRequest] = None
    rate_limit_ms: int = Field(default=1000, ge=0)


class DataSourceUpdateRequest(BaseModel):
    """Request model for updating a data source."""
    name: str
    url_pattern: str
    source_type: SourceType
    extraction_rules: List[ExtractionRuleRequest]
    pagination: Optional[PaginationConfigRequest] = None
    rate_limit_ms: int = Field(default=1000, ge=0)


class DataSourceResponse(BaseModel):
    """Response model for a data source."""
    id: str
    name: str
    url_pattern: str
    source_type: SourceType
    extraction_rules: List[ExtractionRuleRequest]
    pagination: Optional[PaginationConfigRequest] = None
    rate_limit_ms: int


class ScheduleCreateRequest(BaseModel):
    """Request model for creating a schedule."""
    source_id: str
    cron_expression: str


class ScheduleResponse(BaseModel):
    """Response model for a schedule."""
    id: str
    source_id: str
    cron_expression: str
    enabled: bool
    last_run: Optional[datetime] = None
    next_run: datetime


class JobResponse(BaseModel):
    """Response model for a scrape job."""
    id: str
    source_id: str
    status: JobStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    documents_scraped: int
    errors: List[str]


class SearchRequest(BaseModel):
    """Request model for searching documents."""
    text: str
    source_types: Optional[List[SourceType]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class SearchResponse(BaseModel):
    """Response model for search results."""
    total: int
    page: int
    page_size: int
    documents: List[Document]


class ErrorResponse(BaseModel):
    """Response model for error messages."""
    detail: str
    errors: Optional[List[str]] = None


class ValidationErrorResponse(BaseModel):
    """Response model for validation errors."""
    detail: str
    errors: List[str]


# ============================================================================
# Application Factory
# ============================================================================

def create_app(
    manager: Optional[DataSourceManager] = None,
    scheduler: Optional[Scheduler] = None,
    search_engine: Optional[SearchEngine] = None,
) -> FastAPI:
    """Create and configure the FastAPI application.
    
    Args:
        manager: Optional DataSourceManager instance for dependency injection.
        scheduler: Optional Scheduler instance for dependency injection.
        search_engine: Optional SearchEngine instance for dependency injection.
        
    Returns:
        Configured FastAPI application.
    """
    app = FastAPI(
        title="Info Hunter API",
        description="Data aggregation platform REST API",
        version="0.1.0",
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Initialize dependencies
    _manager = manager or DataSourceManager()
    _scheduler = scheduler or Scheduler()
    _search_engine = search_engine or SearchEngine()
    
    # Store dependencies in app state for access in routes
    app.state.manager = _manager
    app.state.scheduler = _scheduler
    app.state.search_engine = _search_engine
    
    # ========================================================================
    # Error Handlers
    # ========================================================================
    
    @app.exception_handler(ValidationError)
    async def validation_error_handler(request, exc: ValidationError):
        """Handle validation errors with 422 status code."""
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Validation failed", "errors": exc.errors},
        )
    
    @app.exception_handler(DataSourceNotFoundError)
    async def data_source_not_found_handler(request, exc: DataSourceNotFoundError):
        """Handle data source not found errors with 404 status code."""
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": f"Data source not found: {exc.source_id}"},
        )
    
    @app.exception_handler(ScheduleNotFoundError)
    async def schedule_not_found_handler(request, exc: ScheduleNotFoundError):
        """Handle schedule not found errors with 404 status code."""
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": f"Schedule not found: {exc.schedule_id}"},
        )
    
    @app.exception_handler(SourceNotFoundError)
    async def source_not_found_handler(request, exc: SourceNotFoundError):
        """Handle source not found errors with 404 status code."""
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": f"Data source not found: {exc.source_id}"},
        )
    
    @app.exception_handler(InvalidCronExpressionError)
    async def invalid_cron_handler(request, exc: InvalidCronExpressionError):
        """Handle invalid cron expression errors with 422 status code."""
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Invalid cron expression", "errors": exc.errors},
        )
    
    # ========================================================================
    # Data Source Endpoints (Requirement 6.1)
    # ========================================================================
    
    @app.post(
        "/api/sources",
        response_model=DataSourceResponse,
        status_code=status.HTTP_201_CREATED,
        tags=["Data Sources"],
        summary="Create a new data source",
    )
    async def create_data_source(request: DataSourceCreateRequest):
        """Create a new data source configuration.
        
        Validates the configuration and persists it to the store.
        """
        # Convert request to DataSourceConfig
        extraction_rules = [
            ExtractionRule(**rule.model_dump())
            for rule in request.extraction_rules
        ]
        pagination = None
        if request.pagination:
            pagination = PaginationConfig(**request.pagination.model_dump())
        
        config = DataSourceConfig(
            name=request.name,
            url_pattern=request.url_pattern,
            source_type=request.source_type,
            extraction_rules=extraction_rules,
            pagination=pagination,
            rate_limit_ms=request.rate_limit_ms,
        )
        
        # Create the data source
        data_source = app.state.manager.create_source(config)
        
        return _data_source_to_response(data_source)
    
    @app.get(
        "/api/sources",
        response_model=List[DataSourceResponse],
        tags=["Data Sources"],
        summary="List all data sources",
    )
    async def list_data_sources(
        source_type: Optional[SourceType] = Query(None, description="Filter by source type"),
    ):
        """List all data sources, optionally filtered by type."""
        sources = app.state.manager.list_sources(source_type=source_type)
        return [_data_source_to_response(s) for s in sources]
    
    @app.get(
        "/api/sources/{source_id}",
        response_model=DataSourceResponse,
        tags=["Data Sources"],
        summary="Get a data source by ID",
    )
    async def get_data_source(source_id: str):
        """Retrieve a data source by its ID."""
        data_source = app.state.manager.get_source(source_id)
        if data_source is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source not found: {source_id}",
            )
        return _data_source_to_response(data_source)
    
    @app.put(
        "/api/sources/{source_id}",
        response_model=DataSourceResponse,
        tags=["Data Sources"],
        summary="Update a data source",
    )
    async def update_data_source(source_id: str, request: DataSourceUpdateRequest):
        """Update an existing data source configuration."""
        # Convert request to DataSourceConfig
        extraction_rules = [
            ExtractionRule(**rule.model_dump())
            for rule in request.extraction_rules
        ]
        pagination = None
        if request.pagination:
            pagination = PaginationConfig(**request.pagination.model_dump())
        
        config = DataSourceConfig(
            name=request.name,
            url_pattern=request.url_pattern,
            source_type=request.source_type,
            extraction_rules=extraction_rules,
            pagination=pagination,
            rate_limit_ms=request.rate_limit_ms,
        )
        
        # Update the data source
        data_source = app.state.manager.update_source(source_id, config)
        
        return _data_source_to_response(data_source)
    
    @app.delete(
        "/api/sources/{source_id}",
        status_code=status.HTTP_204_NO_CONTENT,
        tags=["Data Sources"],
        summary="Delete a data source",
    )
    async def delete_data_source(source_id: str):
        """Delete a data source configuration."""
        deleted = app.state.manager.delete_source(source_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source not found: {source_id}",
            )
        return None
    
    # ========================================================================
    # Job Endpoints (Requirement 6.2)
    # ========================================================================
    
    @app.post(
        "/api/jobs/trigger/{source_id}",
        response_model=JobResponse,
        status_code=status.HTTP_201_CREATED,
        tags=["Jobs"],
        summary="Trigger a scrape job",
    )
    async def trigger_job(source_id: str):
        """Manually trigger a scrape job for a data source."""
        job = app.state.scheduler.trigger_job(source_id)
        return _job_to_response(job)
    
    @app.get(
        "/api/jobs",
        response_model=List[JobResponse],
        tags=["Jobs"],
        summary="List all jobs",
    )
    async def list_jobs(
        source_id: Optional[str] = Query(None, description="Filter by source ID"),
    ):
        """List all scrape jobs, optionally filtered by source."""
        jobs = app.state.scheduler.list_jobs(source_id=source_id)
        return [_job_to_response(j) for j in jobs]
    
    @app.get(
        "/api/jobs/{job_id}",
        response_model=JobResponse,
        tags=["Jobs"],
        summary="Get a job by ID",
    )
    async def get_job(job_id: str):
        """Retrieve a scrape job by its ID."""
        job = app.state.scheduler.get_job(job_id)
        if job is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job not found: {job_id}",
            )
        return _job_to_response(job)
    
    # ========================================================================
    # Search Endpoints (Requirement 6.3)
    # ========================================================================
    
    @app.post(
        "/api/search",
        response_model=SearchResponse,
        tags=["Search"],
        summary="Search documents",
    )
    async def search_documents_post(request: SearchRequest):
        """Search indexed documents using POST with JSON body."""
        query = SearchQuery(
            text=request.text,
            source_types=request.source_types,
            date_from=request.date_from,
            date_to=request.date_to,
            page=request.page,
            page_size=request.page_size,
        )
        
        try:
            result = app.state.search_engine.search(query)
            return SearchResponse(
                total=result.total,
                page=result.page,
                page_size=result.page_size,
                documents=result.documents,
            )
        except RuntimeError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(e),
            )
    
    @app.get(
        "/api/search",
        response_model=SearchResponse,
        tags=["Search"],
        summary="Search documents with query params",
    )
    async def search_documents_get(
        text: str = Query(..., description="Search text"),
        source_types: Optional[List[SourceType]] = Query(None, description="Filter by source types"),
        date_from: Optional[datetime] = Query(None, description="Filter by start date"),
        date_to: Optional[datetime] = Query(None, description="Filter by end date"),
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(20, ge=1, le=100, description="Results per page"),
    ):
        """Search indexed documents using GET with query parameters."""
        query = SearchQuery(
            text=text,
            source_types=source_types,
            date_from=date_from,
            date_to=date_to,
            page=page,
            page_size=page_size,
        )
        
        try:
            result = app.state.search_engine.search(query)
            return SearchResponse(
                total=result.total,
                page=result.page,
                page_size=result.page_size,
                documents=result.documents,
            )
        except RuntimeError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(e),
            )
    
    # ========================================================================
    # Schedule Endpoints (Requirement 6.1)
    # ========================================================================
    
    @app.post(
        "/api/schedules",
        response_model=ScheduleResponse,
        status_code=status.HTTP_201_CREATED,
        tags=["Schedules"],
        summary="Create a new schedule",
    )
    async def create_schedule(request: ScheduleCreateRequest):
        """Create a new scrape schedule with a cron expression."""
        schedule = app.state.scheduler.create_schedule(
            source_id=request.source_id,
            cron_expression=request.cron_expression,
        )
        return _schedule_to_response(schedule)
    
    @app.get(
        "/api/schedules",
        response_model=List[ScheduleResponse],
        tags=["Schedules"],
        summary="List all schedules",
    )
    async def list_schedules():
        """List all scrape schedules."""
        schedules = app.state.scheduler.list_schedules()
        return [_schedule_to_response(s) for s in schedules]
    
    @app.delete(
        "/api/schedules/{schedule_id}",
        status_code=status.HTTP_204_NO_CONTENT,
        tags=["Schedules"],
        summary="Delete a schedule",
    )
    async def delete_schedule(schedule_id: str):
        """Delete a scrape schedule."""
        deleted = app.state.scheduler.delete_schedule(schedule_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Schedule not found: {schedule_id}",
            )
        return None
    
    return app


# ============================================================================
# Helper Functions
# ============================================================================

def _data_source_to_response(data_source: DataSource) -> DataSourceResponse:
    """Convert a DataSource to a DataSourceResponse."""
    extraction_rules = [
        ExtractionRuleRequest(
            field_name=rule.field_name,
            selector=rule.selector,
            selector_type=rule.selector_type,
            transform=rule.transform,
            required=rule.required,
        )
        for rule in data_source.extraction_rules
    ]
    
    pagination = None
    if data_source.pagination:
        pagination = PaginationConfigRequest(
            next_page_selector=data_source.pagination.next_page_selector,
            selector_type=data_source.pagination.selector_type,
            max_pages=data_source.pagination.max_pages,
        )
    
    return DataSourceResponse(
        id=data_source.id,
        name=data_source.name,
        url_pattern=data_source.url_pattern,
        source_type=data_source.source_type,
        extraction_rules=extraction_rules,
        pagination=pagination,
        rate_limit_ms=data_source.rate_limit_ms,
    )


def _job_to_response(job: ScrapeJob) -> JobResponse:
    """Convert a ScrapeJob to a JobResponse."""
    return JobResponse(
        id=job.id,
        source_id=job.source_id,
        status=job.status,
        started_at=job.started_at,
        completed_at=job.completed_at,
        documents_scraped=job.documents_scraped,
        errors=job.errors,
    )


def _schedule_to_response(schedule: Schedule) -> ScheduleResponse:
    """Convert a Schedule to a ScheduleResponse."""
    return ScheduleResponse(
        id=schedule.id,
        source_id=schedule.source_id,
        cron_expression=schedule.cron_expression,
        enabled=schedule.enabled,
        last_run=schedule.last_run,
        next_run=schedule.next_run,
    )


# Create default app instance
app = create_app()


__all__ = [
    "app",
    "create_app",
    "DataSourceCreateRequest",
    "DataSourceUpdateRequest",
    "DataSourceResponse",
    "ScheduleCreateRequest",
    "ScheduleResponse",
    "JobResponse",
    "SearchRequest",
    "SearchResponse",
    "ErrorResponse",
    "ValidationErrorResponse",
    "ExtractionRuleRequest",
    "PaginationConfigRequest",
]
