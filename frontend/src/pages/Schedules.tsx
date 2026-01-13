import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSchedules, getSources, createSchedule, deleteSchedule } from '../api/client';
import { Plus, Trash2, X } from 'lucide-react';

export function Schedules() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [sourceId, setSourceId] = useState('');
  const [cron, setCron] = useState('0 * * * *');

  const { data: schedules, isLoading } = useQuery({ 
    queryKey: ['schedules'], 
    queryFn: () => getSchedules().then(r => r.data) 
  });

  const { data: sources } = useQuery({ 
    queryKey: ['sources'], 
    queryFn: () => getSources().then(r => r.data) 
  });

  const createMutation = useMutation({
    mutationFn: () => createSchedule(sourceId, cron),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setShowForm(false);
      setSourceId('');
      setCron('0 * * * *');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const cronPresets = [
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Weekly on Monday', value: '0 0 * * 1' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Schedules</h1>
        <button className="btn primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add Schedule
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>New Schedule</h2>
              <button className="btn icon" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Data Source</label>
                <select value={sourceId} onChange={e => setSourceId(e.target.value)} required>
                  <option value="">Select a source...</option>
                  {sources?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cron Expression</label>
                <input 
                  type="text" 
                  value={cron} 
                  onChange={e => setCron(e.target.value)}
                  placeholder="0 * * * *"
                  required 
                />
                <div className="presets">
                  {cronPresets.map(p => (
                    <button 
                      key={p.value} 
                      type="button" 
                      className="btn small" 
                      onClick={() => setCron(p.value)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Cron</th>
                <th>Status</th>
                <th>Last Run</th>
                <th>Next Run</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules?.map(schedule => (
                <tr key={schedule.id}>
                  <td><code>{schedule.source_id.slice(0, 8)}</code></td>
                  <td><code>{schedule.cron_expression}</code></td>
                  <td><span className={`badge ${schedule.enabled ? 'completed' : 'failed'}`}>
                    {schedule.enabled ? 'Active' : 'Disabled'}
                  </span></td>
                  <td>{schedule.last_run ? new Date(schedule.last_run).toLocaleString() : 'Never'}</td>
                  <td>{new Date(schedule.next_run).toLocaleString()}</td>
                  <td>
                    <button 
                      className="btn icon danger" 
                      title="Delete"
                      onClick={() => deleteMutation.mutate(schedule.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!schedules?.length && (
                <tr><td colSpan={6} className="empty">No schedules configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
