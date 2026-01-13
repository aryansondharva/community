"""Export capabilities for Info Hunter.

Provides CSV, JSON, and webhook export functionality.
"""

import csv
import io
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field, asdict
from enum import Enum
import httpx


class ExportFormat(str, Enum):
    """Supported export formats."""
    JSON = "json"
    CSV = "csv"
    JSONL = "jsonl"  # JSON Lines


@dataclass
class ExportConfig:
    """Configuration for an export job."""
    format: ExportFormat
    fields: Optional[List[str]] = None  # None means all fields
    include_metadata: bool = True
    flatten_content: bool = False  # Flatten nested content dict


@dataclass
class ExportResult:
    """Result of an export operation."""
    format: ExportFormat
    data: str  # The exported data as string
    record_count: int
    exported_at: datetime = field(default_factory=datetime.utcnow)
    filename: str = ""
    
    def __post_init__(self):
        if not self.filename:
            ext = self.format.value
            timestamp = self.exported_at.strftime("%Y%m%d_%H%M%S")
            self.filename = f"info_hunter_export_{timestamp}.{ext}"


class DataExporter:
    """Exports data in various formats."""
    
    DEFAULT_FIELDS = [
        "id", "title", "description", "source_type", 
        "source_url", "scraped_at"
    ]
    
    def export(
        self, 
        documents: List[Dict[str, Any]], 
        config: ExportConfig
    ) -> ExportResult:
        """Export documents in the specified format."""
        if config.format == ExportFormat.JSON:
            return self._export_json(documents, config)
        elif config.format == ExportFormat.CSV:
            return self._export_csv(documents, config)
        elif config.format == ExportFormat.JSONL:
            return self._export_jsonl(documents, config)
        else:
            raise ValueError(f"Unsupported format: {config.format}")
    
    def _prepare_document(
        self, 
        doc: Dict[str, Any], 
        config: ExportConfig
    ) -> Dict[str, Any]:
        """Prepare a document for export."""
        result = {}
        
        # Determine fields to include
        fields = config.fields or list(doc.keys())
        
        for field in fields:
            if field in doc:
                value = doc[field]
                
                # Handle datetime
                if isinstance(value, datetime):
                    value = value.isoformat()
                
                # Flatten content if requested
                if field == "content" and config.flatten_content and isinstance(value, dict):
                    for k, v in value.items():
                        result[f"content_{k}"] = v
                else:
                    result[field] = value
        
        # Add metadata if requested
        if config.include_metadata:
            result["_exported_at"] = datetime.utcnow().isoformat()
        
        return result
    
    def _export_json(
        self, 
        documents: List[Dict[str, Any]], 
        config: ExportConfig
    ) -> ExportResult:
        """Export as JSON."""
        prepared = [self._prepare_document(doc, config) for doc in documents]
        
        output = {
            "export_info": {
                "format": "json",
                "record_count": len(prepared),
                "exported_at": datetime.utcnow().isoformat(),
            },
            "data": prepared,
        }
        
        data = json.dumps(output, indent=2, default=str)
        
        return ExportResult(
            format=ExportFormat.JSON,
            data=data,
            record_count=len(prepared),
        )
    
    def _export_jsonl(
        self, 
        documents: List[Dict[str, Any]], 
        config: ExportConfig
    ) -> ExportResult:
        """Export as JSON Lines (one JSON object per line)."""
        lines = []
        for doc in documents:
            prepared = self._prepare_document(doc, config)
            lines.append(json.dumps(prepared, default=str))
        
        data = "\n".join(lines)
        
        return ExportResult(
            format=ExportFormat.JSONL,
            data=data,
            record_count=len(lines),
        )
    
    def _export_csv(
        self, 
        documents: List[Dict[str, Any]], 
        config: ExportConfig
    ) -> ExportResult:
        """Export as CSV."""
        if not documents:
            return ExportResult(
                format=ExportFormat.CSV,
                data="",
                record_count=0,
            )
        
        # Prepare all documents first to get all possible fields
        prepared = [self._prepare_document(doc, config) for doc in documents]
        
        # Collect all unique fields
        all_fields = set()
        for doc in prepared:
            all_fields.update(doc.keys())
        
        # Sort fields for consistent output
        fields = sorted(all_fields)
        
        # Write CSV
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fields, extrasaction='ignore')
        writer.writeheader()
        
        for doc in prepared:
            # Convert any remaining complex types to strings
            row = {}
            for k, v in doc.items():
                if isinstance(v, (dict, list)):
                    row[k] = json.dumps(v)
                else:
                    row[k] = v
            writer.writerow(row)
        
        data = output.getvalue()
        
        return ExportResult(
            format=ExportFormat.CSV,
            data=data,
            record_count=len(prepared),
        )


@dataclass
class WebhookExportConfig:
    """Configuration for webhook export."""
    id: str
    url: str
    format: ExportFormat = ExportFormat.JSON
    headers: Dict[str, str] = field(default_factory=dict)
    batch_size: int = 100
    enabled: bool = True


class WebhookExporter:
    """Exports data to webhook endpoints."""
    
    def __init__(self):
        self._configs: Dict[str, WebhookExportConfig] = {}
        self._exporter = DataExporter()
    
    def register_webhook(self, config: WebhookExportConfig):
        """Register a webhook export destination."""
        self._configs[config.id] = config
    
    def unregister_webhook(self, webhook_id: str) -> bool:
        """Remove a webhook export destination."""
        if webhook_id in self._configs:
            del self._configs[webhook_id]
            return True
        return False
    
    def list_webhooks(self) -> List[WebhookExportConfig]:
        """List all registered webhook destinations."""
        return list(self._configs.values())
    
    async def export_to_webhook(
        self,
        webhook_id: str,
        documents: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Export documents to a specific webhook."""
        if webhook_id not in self._configs:
            raise ValueError(f"Webhook not found: {webhook_id}")
        
        config = self._configs[webhook_id]
        if not config.enabled:
            return {"success": False, "error": "Webhook is disabled"}
        
        # Export data
        export_config = ExportConfig(
            format=config.format,
            include_metadata=True,
        )
        result = self._exporter.export(documents, export_config)
        
        # Send to webhook
        headers = {
            "Content-Type": "application/json" if config.format == ExportFormat.JSON else "text/plain",
            **config.headers,
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    config.url,
                    content=result.data,
                    headers=headers,
                )
                response.raise_for_status()
                
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "records_sent": result.record_count,
                }
        except httpx.HTTPError as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    async def export_to_all_webhooks(
        self,
        documents: List[Dict[str, Any]],
    ) -> Dict[str, Dict[str, Any]]:
        """Export documents to all enabled webhooks."""
        results = {}
        for webhook_id, config in self._configs.items():
            if config.enabled:
                results[webhook_id] = await self.export_to_webhook(
                    webhook_id, documents
                )
        return results


@dataclass
class ScheduledExport:
    """Configuration for a scheduled export."""
    id: str
    name: str
    cron_expression: str
    format: ExportFormat
    destination: str  # "download" or webhook URL
    filters: Dict[str, Any] = field(default_factory=dict)
    enabled: bool = True
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None


class ExportService:
    """Central export service."""
    
    def __init__(self):
        self.exporter = DataExporter()
        self.webhook_exporter = WebhookExporter()
        self._scheduled_exports: Dict[str, ScheduledExport] = {}
    
    def export_documents(
        self,
        documents: List[Dict[str, Any]],
        format: ExportFormat = ExportFormat.JSON,
        fields: Optional[List[str]] = None,
        flatten_content: bool = False,
    ) -> ExportResult:
        """Export documents in the specified format."""
        config = ExportConfig(
            format=format,
            fields=fields,
            flatten_content=flatten_content,
        )
        return self.exporter.export(documents, config)
    
    def create_scheduled_export(self, config: ScheduledExport):
        """Create a scheduled export job."""
        self._scheduled_exports[config.id] = config
    
    def delete_scheduled_export(self, export_id: str) -> bool:
        """Delete a scheduled export job."""
        if export_id in self._scheduled_exports:
            del self._scheduled_exports[export_id]
            return True
        return False
    
    def list_scheduled_exports(self) -> List[ScheduledExport]:
        """List all scheduled exports."""
        return list(self._scheduled_exports.values())


# Global instance
export_service = ExportService()


__all__ = [
    "ExportFormat",
    "ExportConfig",
    "ExportResult",
    "DataExporter",
    "WebhookExportConfig",
    "WebhookExporter",
    "ScheduledExport",
    "ExportService",
    "export_service",
]
