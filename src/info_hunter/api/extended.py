"""Extended API endpoints for notifications, insights, and export.

This module adds WebSocket notifications, AI insights, and export capabilities.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from info_hunter.notifications import (
    notification_service,
    WebhookConfig,
    EventType,
)
from info_hunter.insights import (
    insights_engine,
    DocumentSummary,
    TrendAnalysis,
)
from info_hunter.export import (
    export_service,
    ExportFormat,
    ExportResult,
    WebhookExportConfig,
    ScheduledExport,
)


# ============================================================================
# Request/Response Models
# ============================================================================

class WebhookCreateRequest(BaseModel):
    """Request model for creating a notification webhook."""
    url: str
    events: List[str]
    source_id: Optional[str] = None
    secret: Optional[str] = None


class WebhookResponse(BaseModel):
    """Response model for a webhook."""
    id: str
    url: str
    events: List[str]
    source_id: Optional[str]
    enabled: bool
    created_at: datetime


class InsightsSummaryResponse(BaseModel):
    """Response model for document summary."""
    document_id: str
    title: str
    summary: str
    key_points: List[str]
    categories: List[str]
    sentiment: str


class TrendAnalysisResponse(BaseModel):
    """Response model for trend analysis."""
    period_start: datetime
    period_end: datetime
    total_documents: int
    by_source_type: Dict[str, int]
    top_keywords: List[Dict[str, Any]]
    growth_rate: float
    insights: List[str]


class RecommendationResponse(BaseModel):
    """Response model for a recommendation."""
    id: str
    title: str
    description: str
    relevance_score: float
    source_type: str
    source_url: str
    reasons: List[str]


class ExportRequest(BaseModel):
    """Request model for export."""
    format: str = "json"
    fields: Optional[List[str]] = None
    flatten_content: bool = False
    source_types: Optional[List[str]] = None


class ExportWebhookRequest(BaseModel):
    """Request model for creating an export webhook."""
    url: str
    format: str = "json"
    headers: Dict[str, str] = Field(default_factory=dict)
    batch_size: int = 100


class ScheduledExportRequest(BaseModel):
    """Request model for creating a scheduled export."""
    name: str
    cron_expression: str
    format: str = "json"
    destination: str
    filters: Dict[str, Any] = Field(default_factory=dict)


# ============================================================================
# Router
# ============================================================================

router = APIRouter()


# ============================================================================
# WebSocket Notifications
# ============================================================================

@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket, source_id: Optional[str] = None):
    """WebSocket endpoint for real-time notifications.
    
    Connect to receive real-time updates about scrape jobs and documents.
    Optionally filter by source_id.
    """
    await websocket.accept()
    await notification_service.websocket_manager.connect(websocket, source_id)
    
    try:
        while True:
            # Keep connection alive, handle any client messages
            data = await websocket.receive_text()
            # Echo back for ping/pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        notification_service.websocket_manager.disconnect(websocket)


@router.get(
    "/notifications/webhooks",
    response_model=List[WebhookResponse],
    tags=["Notifications"],
    summary="List notification webhooks",
)
async def list_notification_webhooks():
    """List all registered notification webhooks."""
    webhooks = notification_service.webhook_manager.list_webhooks()
    return [
        WebhookResponse(
            id=w.id,
            url=w.url,
            events=[e.value for e in w.events],
            source_id=w.source_id,
            enabled=w.enabled,
            created_at=w.created_at,
        )
        for w in webhooks
    ]


@router.post(
    "/notifications/webhooks",
    response_model=WebhookResponse,
    tags=["Notifications"],
    summary="Create notification webhook",
)
async def create_notification_webhook(request: WebhookCreateRequest):
    """Register a new webhook for notifications."""
    import uuid
    
    webhook_id = str(uuid.uuid4())[:8]
    events = [EventType(e) for e in request.events]
    
    config = WebhookConfig(
        id=webhook_id,
        url=request.url,
        events=events,
        source_id=request.source_id,
        secret=request.secret,
    )
    
    notification_service.webhook_manager.register_webhook(config)
    
    return WebhookResponse(
        id=config.id,
        url=config.url,
        events=[e.value for e in config.events],
        source_id=config.source_id,
        enabled=config.enabled,
        created_at=config.created_at,
    )


@router.delete(
    "/notifications/webhooks/{webhook_id}",
    tags=["Notifications"],
    summary="Delete notification webhook",
)
async def delete_notification_webhook(webhook_id: str):
    """Remove a notification webhook."""
    if not notification_service.webhook_manager.unregister_webhook(webhook_id):
        raise HTTPException(status_code=404, detail="Webhook not found")
    return {"message": "Webhook deleted"}


# ============================================================================
# AI Insights
# ============================================================================

@router.post(
    "/insights/summarize",
    response_model=InsightsSummaryResponse,
    tags=["Insights"],
    summary="Summarize a document",
)
async def summarize_document(document: Dict[str, Any]):
    """Generate an AI-powered summary of a document."""
    summary = insights_engine.summarize_document(document)
    return InsightsSummaryResponse(
        document_id=summary.document_id,
        title=summary.title,
        summary=summary.summary,
        key_points=summary.key_points,
        categories=summary.categories,
        sentiment=summary.sentiment,
    )


@router.post(
    "/insights/trends",
    response_model=TrendAnalysisResponse,
    tags=["Insights"],
    summary="Analyze trends",
)
async def analyze_trends(
    documents: List[Dict[str, Any]],
    period_days: int = Query(7, ge=1, le=90),
):
    """Analyze trends across a collection of documents."""
    analysis = insights_engine.analyze_trends(documents, period_days)
    return TrendAnalysisResponse(
        period_start=analysis.period_start,
        period_end=analysis.period_end,
        total_documents=analysis.total_documents,
        by_source_type=analysis.by_source_type,
        top_keywords=[{"keyword": k, "count": c} for k, c in analysis.top_keywords],
        growth_rate=analysis.growth_rate,
        insights=analysis.insights,
    )


@router.post(
    "/insights/recommendations",
    response_model=List[RecommendationResponse],
    tags=["Insights"],
    summary="Get recommendations",
)
async def get_recommendations(
    documents: List[Dict[str, Any]],
    interests: Optional[List[str]] = Query(None),
    limit: int = Query(10, ge=1, le=50),
):
    """Get personalized recommendations from documents."""
    recommendations = insights_engine.get_recommendations(
        documents, interests, limit
    )
    return [
        RecommendationResponse(
            id=r.id,
            title=r.title,
            description=r.description,
            relevance_score=r.relevance_score,
            source_type=r.source_type,
            source_url=r.source_url,
            reasons=r.reasons,
        )
        for r in recommendations
    ]


@router.post(
    "/insights/digest",
    tags=["Insights"],
    summary="Generate daily digest",
)
async def generate_digest(
    documents: List[Dict[str, Any]],
    period_days: int = Query(1, ge=1, le=7),
):
    """Generate a digest of recent activity."""
    return insights_engine.generate_digest(documents, period_days)


# ============================================================================
# Export
# ============================================================================

@router.post(
    "/export",
    tags=["Export"],
    summary="Export documents",
)
async def export_documents(
    documents: List[Dict[str, Any]],
    request: ExportRequest,
):
    """Export documents in the specified format."""
    try:
        format_enum = ExportFormat(request.format)
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid format. Supported: {[f.value for f in ExportFormat]}"
        )
    
    result = export_service.export_documents(
        documents,
        format=format_enum,
        fields=request.fields,
        flatten_content=request.flatten_content,
    )
    
    # Return as downloadable file
    media_type = {
        ExportFormat.JSON: "application/json",
        ExportFormat.CSV: "text/csv",
        ExportFormat.JSONL: "application/x-ndjson",
    }.get(format_enum, "text/plain")
    
    return Response(
        content=result.data,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={result.filename}",
            "X-Record-Count": str(result.record_count),
        },
    )


@router.get(
    "/export/webhooks",
    tags=["Export"],
    summary="List export webhooks",
)
async def list_export_webhooks():
    """List all registered export webhooks."""
    webhooks = export_service.webhook_exporter.list_webhooks()
    return [
        {
            "id": w.id,
            "url": w.url,
            "format": w.format.value,
            "batch_size": w.batch_size,
            "enabled": w.enabled,
        }
        for w in webhooks
    ]


@router.post(
    "/export/webhooks",
    tags=["Export"],
    summary="Create export webhook",
)
async def create_export_webhook(request: ExportWebhookRequest):
    """Register a webhook for data export."""
    import uuid
    
    webhook_id = str(uuid.uuid4())[:8]
    
    try:
        format_enum = ExportFormat(request.format)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid format")
    
    config = WebhookExportConfig(
        id=webhook_id,
        url=request.url,
        format=format_enum,
        headers=request.headers,
        batch_size=request.batch_size,
    )
    
    export_service.webhook_exporter.register_webhook(config)
    
    return {
        "id": config.id,
        "url": config.url,
        "format": config.format.value,
        "batch_size": config.batch_size,
        "enabled": config.enabled,
    }


@router.post(
    "/export/webhooks/{webhook_id}/send",
    tags=["Export"],
    summary="Send data to export webhook",
)
async def send_to_export_webhook(
    webhook_id: str,
    documents: List[Dict[str, Any]],
):
    """Send documents to a specific export webhook."""
    try:
        result = await export_service.webhook_exporter.export_to_webhook(
            webhook_id, documents
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete(
    "/export/webhooks/{webhook_id}",
    tags=["Export"],
    summary="Delete export webhook",
)
async def delete_export_webhook(webhook_id: str):
    """Remove an export webhook."""
    if not export_service.webhook_exporter.unregister_webhook(webhook_id):
        raise HTTPException(status_code=404, detail="Webhook not found")
    return {"message": "Webhook deleted"}


# ============================================================================
# Scheduled Exports
# ============================================================================

@router.get(
    "/export/scheduled",
    tags=["Export"],
    summary="List scheduled exports",
)
async def list_scheduled_exports():
    """List all scheduled export jobs."""
    exports = export_service.list_scheduled_exports()
    return [
        {
            "id": e.id,
            "name": e.name,
            "cron_expression": e.cron_expression,
            "format": e.format.value,
            "destination": e.destination,
            "enabled": e.enabled,
            "last_run": e.last_run.isoformat() if e.last_run else None,
            "next_run": e.next_run.isoformat() if e.next_run else None,
        }
        for e in exports
    ]


@router.post(
    "/export/scheduled",
    tags=["Export"],
    summary="Create scheduled export",
)
async def create_scheduled_export(request: ScheduledExportRequest):
    """Create a new scheduled export job."""
    import uuid
    
    export_id = str(uuid.uuid4())[:8]
    
    try:
        format_enum = ExportFormat(request.format)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid format")
    
    config = ScheduledExport(
        id=export_id,
        name=request.name,
        cron_expression=request.cron_expression,
        format=format_enum,
        destination=request.destination,
        filters=request.filters,
    )
    
    export_service.create_scheduled_export(config)
    
    return {
        "id": config.id,
        "name": config.name,
        "cron_expression": config.cron_expression,
        "format": config.format.value,
        "destination": config.destination,
        "enabled": config.enabled,
    }


@router.delete(
    "/export/scheduled/{export_id}",
    tags=["Export"],
    summary="Delete scheduled export",
)
async def delete_scheduled_export(export_id: str):
    """Delete a scheduled export job."""
    if not export_service.delete_scheduled_export(export_id):
        raise HTTPException(status_code=404, detail="Scheduled export not found")
    return {"message": "Scheduled export deleted"}
