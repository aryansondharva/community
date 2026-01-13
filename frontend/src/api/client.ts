import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export interface ExtractionRule {
  field_name: string;
  selector: string;
  selector_type: 'css' | 'xpath';
  transform?: string;
  required: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  url_pattern: string;
  source_type: 'scholarship' | 'internship' | 'price' | 'learning';
  extraction_rules: ExtractionRule[];
  rate_limit_ms: number;
}

export interface ScrapeJob {
  id: string;
  source_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  documents_scraped: number;
  errors: string[];
}

export interface Schedule {
  id: string;
  source_id: string;
  cron_expression: string;
  enabled: boolean;
  last_run?: string;
  next_run: string;
}

export interface Document {
  id: string;
  source_id: string;
  source_type: string;
  source_url: string;
  title: string;
  description?: string;
  content: Record<string, unknown>;
  scraped_at: string;
  content_hash: string;
}

export interface SearchResult {
  total: number;
  page: number;
  page_size: number;
  documents: Document[];
}

// Data Sources
export const getSources = () => api.get<DataSource[]>('/sources');
export const getSource = (id: string) => api.get<DataSource>(`/sources/${id}`);
export const createSource = (data: Omit<DataSource, 'id'>) => api.post<DataSource>('/sources', data);
export const deleteSource = (id: string) => api.delete(`/sources/${id}`);

// Jobs
export const getJobs = (sourceId?: string) => 
  api.get<ScrapeJob[]>('/jobs', { params: sourceId ? { source_id: sourceId } : {} });
export const getJob = (id: string) => api.get<ScrapeJob>(`/jobs/${id}`);
export const triggerJob = (sourceId: string) => api.post<ScrapeJob>(`/jobs/trigger/${sourceId}`);

// Schedules
export const getSchedules = () => api.get<Schedule[]>('/schedules');
export const createSchedule = (sourceId: string, cron: string) => 
  api.post<Schedule>('/schedules', { source_id: sourceId, cron_expression: cron });
export const deleteSchedule = (id: string) => api.delete(`/schedules/${id}`);

// Search
export const searchDocuments = (text: string, sourceTypes?: string[], page = 1) =>
  api.post<SearchResult>('/search', { text, source_types: sourceTypes, page, page_size: 20 });
