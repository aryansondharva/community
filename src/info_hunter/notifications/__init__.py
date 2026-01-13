"""Real-time notifications for Info Hunter.

Provides WebSocket-based notifications and webhook delivery for scrape events.
"""

import asyncio
import json
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional, Set
from dataclasses import dataclass, field, asdict
from enum import Enum
import httpx


class EventType(str, Enum):
    """Types of notification events."""
    JOB_STARTED = "job_started"
    JOB_COMPLETED = "job_completed"
    JOB_FAILED = "job_failed"
    DOCUMENT_SCRAPED = "document_scraped"
    SCHEDULE_TRIGGERED = "schedule_triggered"


@dataclass
class NotificationEvent:
    """A notification event."""
    event_type: EventType
    timestamp: datetime
    data: Dict[str, Any]
    source_id: Optional[str] = None
    job_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_type": self.event_type.value,
            "timestamp": self.timestamp.isoformat(),
            "data": self.data,
            "source_id": self.source_id,
            "job_id": self.job_id,
        }
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict())


class WebSocketManager:
    """Manages WebSocket connections for real-time notifications."""
    
    def __init__(self):
        self._connections: Set[Any] = set()
        self._subscriptions: Dict[str, Set[Any]] = {}  # source_id -> connections
    
    async def connect(self, websocket: Any, source_id: Optional[str] = None):
        """Register a new WebSocket connection."""
        self._connections.add(websocket)
        if source_id:
            if source_id not in self._subscriptions:
                self._subscriptions[source_id] = set()
            self._subscriptions[source_id].add(websocket)
    
    def disconnect(self, websocket: Any):
        """Remove a WebSocket connection."""
        self._connections.discard(websocket)
        for source_subs in self._subscriptions.values():
            source_subs.discard(websocket)
    
    async def broadcast(self, event: NotificationEvent):
        """Broadcast event to all connected clients."""
        message = event.to_json()
        disconnected = set()
        
        for conn in self._connections:
            try:
                await conn.send_text(message)
            except Exception:
                disconnected.add(conn)
        
        for conn in disconnected:
            self.disconnect(conn)
    
    async def send_to_source_subscribers(self, source_id: str, event: NotificationEvent):
        """Send event to clients subscribed to a specific source."""
        if source_id not in self._subscriptions:
            return
        
        message = event.to_json()
        disconnected = set()
        
        for conn in self._subscriptions[source_id]:
            try:
                await conn.send_text(message)
            except Exception:
                disconnected.add(conn)
        
        for conn in disconnected:
            self.disconnect(conn)
    
    @property
    def connection_count(self) -> int:
        return len(self._connections)


@dataclass
class WebhookConfig:
    """Configuration for a webhook endpoint."""
    id: str
    url: str
    events: List[EventType]
    source_id: Optional[str] = None  # None means all sources
    secret: Optional[str] = None
    enabled: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)


class WebhookManager:
    """Manages webhook deliveries."""
    
    def __init__(self):
        self._webhooks: Dict[str, WebhookConfig] = {}
        self._delivery_queue: asyncio.Queue = asyncio.Queue()
        self._running = False
    
    def register_webhook(self, config: WebhookConfig):
        """Register a new webhook."""
        self._webhooks[config.id] = config
    
    def unregister_webhook(self, webhook_id: str) -> bool:
        """Remove a webhook."""
        if webhook_id in self._webhooks:
            del self._webhooks[webhook_id]
            return True
        return False
    
    def list_webhooks(self) -> List[WebhookConfig]:
        """List all registered webhooks."""
        return list(self._webhooks.values())
    
    async def deliver(self, event: NotificationEvent):
        """Queue event for webhook delivery."""
        await self._delivery_queue.put(event)
    
    async def _process_deliveries(self):
        """Process webhook delivery queue."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            while self._running:
                try:
                    event = await asyncio.wait_for(
                        self._delivery_queue.get(), 
                        timeout=1.0
                    )
                    await self._deliver_to_webhooks(client, event)
                except asyncio.TimeoutError:
                    continue
                except Exception:
                    pass
    
    async def _deliver_to_webhooks(self, client: httpx.AsyncClient, event: NotificationEvent):
        """Deliver event to matching webhooks."""
        for webhook in self._webhooks.values():
            if not webhook.enabled:
                continue
            if event.event_type not in webhook.events:
                continue
            if webhook.source_id and event.source_id != webhook.source_id:
                continue
            
            try:
                headers = {"Content-Type": "application/json"}
                if webhook.secret:
                    headers["X-Webhook-Secret"] = webhook.secret
                
                await client.post(
                    webhook.url,
                    json=event.to_dict(),
                    headers=headers,
                )
            except Exception:
                pass  # Log in production
    
    async def start(self):
        """Start the webhook delivery processor."""
        self._running = True
        asyncio.create_task(self._process_deliveries())
    
    async def stop(self):
        """Stop the webhook delivery processor."""
        self._running = False


class NotificationService:
    """Central notification service combining WebSocket and webhooks."""
    
    def __init__(self):
        self.websocket_manager = WebSocketManager()
        self.webhook_manager = WebhookManager()
        self._listeners: List[Callable[[NotificationEvent], None]] = []
    
    def add_listener(self, callback: Callable[[NotificationEvent], None]):
        """Add a synchronous event listener."""
        self._listeners.append(callback)
    
    async def notify(self, event: NotificationEvent):
        """Send notification through all channels."""
        # WebSocket broadcast
        await self.websocket_manager.broadcast(event)
        
        # Source-specific WebSocket
        if event.source_id:
            await self.websocket_manager.send_to_source_subscribers(
                event.source_id, event
            )
        
        # Webhook delivery
        await self.webhook_manager.deliver(event)
        
        # Sync listeners
        for listener in self._listeners:
            try:
                listener(event)
            except Exception:
                pass
    
    async def notify_job_started(self, job_id: str, source_id: str):
        """Notify that a scrape job has started."""
        event = NotificationEvent(
            event_type=EventType.JOB_STARTED,
            timestamp=datetime.utcnow(),
            data={"message": "Scrape job started"},
            source_id=source_id,
            job_id=job_id,
        )
        await self.notify(event)
    
    async def notify_job_completed(
        self, 
        job_id: str, 
        source_id: str, 
        documents_scraped: int
    ):
        """Notify that a scrape job has completed."""
        event = NotificationEvent(
            event_type=EventType.JOB_COMPLETED,
            timestamp=datetime.utcnow(),
            data={
                "message": "Scrape job completed",
                "documents_scraped": documents_scraped,
            },
            source_id=source_id,
            job_id=job_id,
        )
        await self.notify(event)
    
    async def notify_job_failed(
        self, 
        job_id: str, 
        source_id: str, 
        errors: List[str]
    ):
        """Notify that a scrape job has failed."""
        event = NotificationEvent(
            event_type=EventType.JOB_FAILED,
            timestamp=datetime.utcnow(),
            data={
                "message": "Scrape job failed",
                "errors": errors,
            },
            source_id=source_id,
            job_id=job_id,
        )
        await self.notify(event)
    
    async def notify_document_scraped(
        self, 
        job_id: str, 
        source_id: str, 
        document_id: str,
        title: str
    ):
        """Notify that a document has been scraped."""
        event = NotificationEvent(
            event_type=EventType.DOCUMENT_SCRAPED,
            timestamp=datetime.utcnow(),
            data={
                "message": "New document scraped",
                "document_id": document_id,
                "title": title,
            },
            source_id=source_id,
            job_id=job_id,
        )
        await self.notify(event)
    
    async def start(self):
        """Start notification services."""
        await self.webhook_manager.start()
    
    async def stop(self):
        """Stop notification services."""
        await self.webhook_manager.stop()


# Global instance
notification_service = NotificationService()


__all__ = [
    "EventType",
    "NotificationEvent",
    "WebSocketManager",
    "WebhookConfig",
    "WebhookManager",
    "NotificationService",
    "notification_service",
]
