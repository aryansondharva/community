import { useQuery } from '@tanstack/react-query';
import { getSources, getJobs, getSchedules } from '../api/client';
import { Database, Zap, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export function Dashboard() {
  const { data: sources } = useQuery({ queryKey: ['sources'], queryFn: () => getSources().then(r => r.data) });
  const { data: jobs } = useQuery({ queryKey: ['jobs'], queryFn: () => getJobs().then(r => r.data) });
  const { data: schedules } = useQuery({ queryKey: ['schedules'], queryFn: () => getSchedules().then(r => r.data) });

  const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0;
  const failedJobs = jobs?.filter(j => j.status === 'failed').length || 0;
  const runningJobs = jobs?.filter(j => j.status === 'running').length || 0;

  return (
    <div className="page">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <Database size={32} />
          <div className="stat-info">
            <span className="stat-value">{sources?.length || 0}</span>
            <span className="stat-label">Data Sources</span>
          </div>
        </div>
        
        <div className="stat-card">
          <Zap size={32} />
          <div className="stat-info">
            <span className="stat-value">{jobs?.length || 0}</span>
            <span className="stat-label">Total Jobs</span>
          </div>
        </div>
        
        <div className="stat-card">
          <Calendar size={32} />
          <div className="stat-info">
            <span className="stat-value">{schedules?.length || 0}</span>
            <span className="stat-label">Schedules</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <CheckCircle size={32} />
          <div className="stat-info">
            <span className="stat-value">{completedJobs}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        
        <div className="stat-card warning">
          <Clock size={32} />
          <div className="stat-info">
            <span className="stat-value">{runningJobs}</span>
            <span className="stat-label">Running</span>
          </div>
        </div>
        
        <div className="stat-card danger">
          <XCircle size={32} />
          <div className="stat-info">
            <span className="stat-value">{failedJobs}</span>
            <span className="stat-label">Failed</span>
          </div>
        </div>
      </div>

      <h2>Recent Jobs</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Source</th>
              <th>Status</th>
              <th>Documents</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {jobs?.slice(0, 5).map(job => (
              <tr key={job.id}>
                <td><code>{job.id.slice(0, 8)}</code></td>
                <td>{job.source_id.slice(0, 8)}</td>
                <td><span className={`badge ${job.status}`}>{job.status}</span></td>
                <td>{job.documents_scraped}</td>
                <td>{job.started_at ? new Date(job.started_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {!jobs?.length && (
              <tr><td colSpan={5} className="empty">No jobs yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
