import { api } from './client';
import type { Document } from './client';

// Notifications
export interface NotificationEvent {
  event_type: string;
  timestamp: string;
  data: Record<string, unknown>;
  source_id?: string;
  job_id?: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  source_id?: string;
  enabled: boolean;
  created_at: string;
}

export const getNotificationWebhooks = () => api.get<Webhook[]>('/notifications/webhooks');
export const createNotificationWebhook = (data: { url: string; events: string[]; source_id?: string; secret?: string }) =>
  api.post<Webhook>('/notifications/webhooks', data);
export const deleteNotificationWebhook = (id: string) => api.delete(`/notifications/webhooks/${id}`);

// Insights
export interface DocumentSummary {
  document_id: string;
  title: string;
  summary: string;
  key_points: string[];
  categories: string[];
  sentiment: string;
}

export interface TrendAnalysis {
  period_start: string;
  period_end: string;
  total_documents: number;
  by_source_type: Record<string, number>;
  top_keywords: { keyword: string; count: number }[];
  growth_rate: number;
  insights: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  relevance_score: number;
  source_type: string;
  source_url: string;
  reasons: string[];
}

export interface Digest {
  period: string;
  generated_at: string;
  stats: {
    total_documents: number;
    by_source_type: Record<string, number>;
    growth_rate: number;
  };
  insights: string[];
  top_keywords: { keyword: string; count: number }[];
  highlights: {
    title: string;
    summary: string;
    sentiment: string;
    categories: string[];
  }[];
}

export const summarizeDocument = (document: Document) =>
  api.post<DocumentSummary>('/insights/summarize', document);

export const analyzeTrends = (documents: Document[], periodDays = 7) =>
  api.post<TrendAnalysis>(`/insights/trends?period_days=${periodDays}`, documents);

export const getRecommendations = (documents: Document[], interests?: string[], limit = 10) =>
  api.post<Recommendation[]>(`/insights/recommendations?limit=${limit}${interests ? `&interests=${interests.join(',')}` : ''}`, documents);

export const generateDigest = (documents: Document[], periodDays = 1) =>
  api.post<Digest>(`/insights/digest?period_days=${periodDays}`, documents);

// Export
export interface ExportWebhook {
  id: string;
  url: string;
  format: string;
  batch_size: number;
  enabled: boolean;
}

export interface ScheduledExport {
  id: string;
  name: string;
  cron_expression: string;
  format: string;
  destination: string;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
}

export const exportDocuments = async (
  documents: Document[],
  format: 'json' | 'csv' | 'jsonl' = 'json',
  fields?: string[],
  flattenContent = false
) => {
  const response = await api.post('/export', documents, {
    params: { format, fields: fields?.join(','), flatten_content: flattenContent },
    responseType: 'blob',
  });
  return response;
};

export const getExportWebhooks = () => api.get<ExportWebhook[]>('/export/webhooks');
export const createExportWebhook = (data: { url: string; format?: string; headers?: Record<string, string>; batch_size?: number }) =>
  api.post<ExportWebhook>('/export/webhooks', data);
export const deleteExportWebhook = (id: string) => api.delete(`/export/webhooks/${id}`);
export const sendToExportWebhook = (webhookId: string, documents: Document[]) =>
  api.post(`/export/webhooks/${webhookId}/send`, documents);

export const getScheduledExports = () => api.get<ScheduledExport[]>('/export/scheduled');
export const createScheduledExport = (data: { name: string; cron_expression: string; format: string; destination: string; filters?: Record<string, unknown> }) =>
  api.post<ScheduledExport>('/export/scheduled', data);
export const deleteScheduledExport = (id: string) => api.delete(`/export/scheduled/${id}`);

// WebSocket connection for real-time notifications
export function connectNotifications(
  onMessage: (event: NotificationEvent) => void,
  sourceId?: string
): WebSocket {
  const wsUrl = `ws://127.0.0.1:8000/api/ws/notifications${sourceId ? `?source_id=${sourceId}` : ''}`;
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as NotificationEvent;
      onMessage(data);
    } catch (e) {
      console.error('Failed to parse notification:', e);
    }
  };
  
  // Ping to keep alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('ping');
    }
  }, 30000);
  
  ws.onclose = () => clearInterval(pingInterval);
  
  return ws;
}
