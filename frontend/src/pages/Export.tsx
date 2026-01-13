import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getExportWebhooks, 
  createExportWebhook, 
  deleteExportWebhook,
  getScheduledExports,
  createScheduledExport,
  deleteScheduledExport,
} from '../api/extended';
import { Download, Webhook, Clock, Plus, Trash2, X, FileJson, FileSpreadsheet } from 'lucide-react';

export function Export() {
  const queryClient = useQueryClient();
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookFormat, setWebhookFormat] = useState('json');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleCron, setScheduleCron] = useState('0 0 * * *');
  const [scheduleFormat, setScheduleFormat] = useState('json');
  const [scheduleDestination, setScheduleDestination] = useState('download');

  const { data: webhooks } = useQuery({
    queryKey: ['exportWebhooks'],
    queryFn: () => getExportWebhooks().then(r => r.data),
  });

  const { data: scheduledExports } = useQuery({
    queryKey: ['scheduledExports'],
    queryFn: () => getScheduledExports().then(r => r.data),
  });

  const createWebhookMutation = useMutation({
    mutationFn: () => createExportWebhook({ url: webhookUrl, format: webhookFormat }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportWebhooks'] });
      setShowWebhookForm(false);
      setWebhookUrl('');
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: deleteExportWebhook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exportWebhooks'] }),
  });

  const createScheduleMutation = useMutation({
    mutationFn: () => createScheduledExport({
      name: scheduleName,
      cron_expression: scheduleCron,
      format: scheduleFormat,
      destination: scheduleDestination,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledExports'] });
      setShowScheduleForm(false);
      setScheduleName('');
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: deleteScheduledExport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduledExports'] }),
  });

  const handleQuickExport = (format: 'json' | 'csv') => {
    // In production, this would fetch documents and trigger download
    const mockData = format === 'json' 
      ? JSON.stringify({ data: [], exported_at: new Date().toISOString() }, null, 2)
      : 'id,title,source_type\n';
    
    const blob = new Blob([mockData], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <h1><Download size={28} /> Export Data</h1>

      <div className="export-section">
        <h2>Quick Export</h2>
        <p className="section-desc">Download all your aggregated data instantly</p>
        <div className="export-buttons">
          <button className="export-btn" onClick={() => handleQuickExport('json')}>
            <FileJson size={24} />
            <span>Export JSON</span>
          </button>
          <button className="export-btn" onClick={() => handleQuickExport('csv')}>
            <FileSpreadsheet size={24} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="export-section">
        <div className="section-header">
          <h2><Webhook size={20} /> Export Webhooks</h2>
          <button className="btn primary" onClick={() => setShowWebhookForm(true)}>
            <Plus size={18} /> Add Webhook
          </button>
        </div>
        <p className="section-desc">Automatically send data to external services</p>

        {showWebhookForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>New Export Webhook</h2>
                <button className="btn icon" onClick={() => setShowWebhookForm(false)}><X size={20} /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); createWebhookMutation.mutate(); }}>
                <div className="form-group">
                  <label>Webhook URL</label>
                  <input 
                    type="url" 
                    value={webhookUrl} 
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://your-service.com/webhook"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Format</label>
                  <select value={webhookFormat} onChange={e => setWebhookFormat(e.target.value)}>
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="jsonl">JSON Lines</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={() => setShowWebhookForm(false)}>Cancel</button>
                  <button type="submit" className="btn primary">Create Webhook</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Format</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks?.map(webhook => (
                <tr key={webhook.id}>
                  <td className="url-cell">{webhook.url}</td>
                  <td><code>{webhook.format}</code></td>
                  <td><span className={`badge ${webhook.enabled ? 'completed' : 'failed'}`}>
                    {webhook.enabled ? 'Active' : 'Disabled'}
                  </span></td>
                  <td>
                    <button 
                      className="btn icon danger"
                      onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!webhooks?.length && (
                <tr><td colSpan={4} className="empty">No export webhooks configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="export-section">
        <div className="section-header">
          <h2><Clock size={20} /> Scheduled Exports</h2>
          <button className="btn primary" onClick={() => setShowScheduleForm(true)}>
            <Plus size={18} /> Add Schedule
          </button>
        </div>
        <p className="section-desc">Automatically export data on a schedule</p>

        {showScheduleForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>New Scheduled Export</h2>
                <button className="btn icon" onClick={() => setShowScheduleForm(false)}><X size={20} /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); createScheduleMutation.mutate(); }}>
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    value={scheduleName} 
                    onChange={e => setScheduleName(e.target.value)}
                    placeholder="Daily Export"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Cron Expression</label>
                  <input 
                    type="text" 
                    value={scheduleCron} 
                    onChange={e => setScheduleCron(e.target.value)}
                    placeholder="0 0 * * *"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Format</label>
                  <select value={scheduleFormat} onChange={e => setScheduleFormat(e.target.value)}>
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Destination</label>
                  <input 
                    type="text" 
                    value={scheduleDestination} 
                    onChange={e => setScheduleDestination(e.target.value)}
                    placeholder="download or webhook URL"
                    required 
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={() => setShowScheduleForm(false)}>Cancel</button>
                  <button type="submit" className="btn primary">Create Schedule</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Schedule</th>
                <th>Format</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduledExports?.map(exp => (
                <tr key={exp.id}>
                  <td><strong>{exp.name}</strong></td>
                  <td><code>{exp.cron_expression}</code></td>
                  <td><code>{exp.format}</code></td>
                  <td><span className={`badge ${exp.enabled ? 'completed' : 'failed'}`}>
                    {exp.enabled ? 'Active' : 'Disabled'}
                  </span></td>
                  <td>
                    <button 
                      className="btn icon danger"
                      onClick={() => deleteScheduleMutation.mutate(exp.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!scheduledExports?.length && (
                <tr><td colSpan={5} className="empty">No scheduled exports configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
