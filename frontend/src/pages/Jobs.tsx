import { useQuery } from '@tanstack/react-query';
import { getJobs } from '../api/client';
import { RefreshCw } from 'lucide-react';

export function Jobs() {
  const { data: jobs, isLoading, refetch } = useQuery({ 
    queryKey: ['jobs'], 
    queryFn: () => getJobs().then(r => r.data),
    refetchInterval: 5000, // Auto-refresh every 5s
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Scrape Jobs</h1>
        <button className="btn secondary" onClick={() => refetch()}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Source ID</th>
                <th>Status</th>
                <th>Documents</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {jobs?.map(job => (
                <tr key={job.id}>
                  <td><code>{job.id.slice(0, 8)}</code></td>
                  <td><code>{job.source_id.slice(0, 8)}</code></td>
                  <td><span className={`badge ${job.status}`}>{job.status}</span></td>
                  <td>{job.documents_scraped}</td>
                  <td>{job.started_at ? new Date(job.started_at).toLocaleString() : '-'}</td>
                  <td>{job.completed_at ? new Date(job.completed_at).toLocaleString() : '-'}</td>
                  <td>{job.errors.length > 0 ? (
                    <span className="error-count">{job.errors.length} errors</span>
                  ) : '-'}</td>
                </tr>
              ))}
              {!jobs?.length && (
                <tr><td colSpan={7} className="empty">No jobs yet. Trigger a scrape from Data Sources.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
