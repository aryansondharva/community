import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSources, createSource, deleteSource, triggerJob } from '../api/client';
import { Plus, Trash2, Play, X } from 'lucide-react';

export function Sources() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url_pattern: '',
    source_type: 'scholarship' as 'scholarship' | 'internship' | 'price' | 'learning',
    extraction_rules: [{ field_name: 'title', selector: 'h1', selector_type: 'css' as const, required: true }],
    rate_limit_ms: 1000,
  });

  const { data: sources, isLoading } = useQuery({ 
    queryKey: ['sources'], 
    queryFn: () => getSources().then(r => r.data) 
  });

  const createMutation = useMutation({
    mutationFn: createSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      setShowForm(false);
      setFormData({
        name: '',
        url_pattern: '',
        source_type: 'scholarship',
        extraction_rules: [{ field_name: 'title', selector: 'h1', selector_type: 'css', required: true }],
        rate_limit_ms: 1000,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sources'] }),
  });

  const triggerMutation = useMutation({
    mutationFn: triggerJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addRule = () => {
    setFormData({
      ...formData,
      extraction_rules: [...formData.extraction_rules, { field_name: '', selector: '', selector_type: 'css', required: false }],
    });
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      extraction_rules: formData.extraction_rules.filter((_, i) => i !== index),
    });
  };

  const updateRule = (index: number, field: string, value: string | boolean) => {
    const rules = [...formData.extraction_rules];
    rules[index] = { ...rules[index], [field]: value };
    setFormData({ ...formData, extraction_rules: rules });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Data Sources</h1>
        <button className="btn primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add Source
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>New Data Source</h2>
              <button className="btn icon" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label>URL Pattern</label>
                <input 
                  type="url" 
                  value={formData.url_pattern} 
                  onChange={e => setFormData({ ...formData, url_pattern: e.target.value })}
                  placeholder="https://example.com/page"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Source Type</label>
                <select 
                  value={formData.source_type} 
                  onChange={e => setFormData({ ...formData, source_type: e.target.value as 'scholarship' | 'internship' | 'price' | 'learning' })}
                >
                  <option value="scholarship">Scholarship</option>
                  <option value="internship">Internship</option>
                  <option value="price">Price</option>
                  <option value="learning">Learning</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Extraction Rules</label>
                {formData.extraction_rules.map((rule, i) => (
                  <div key={i} className="rule-row">
                    <input 
                      placeholder="Field name" 
                      value={rule.field_name}
                      onChange={e => updateRule(i, 'field_name', e.target.value)}
                    />
                    <input 
                      placeholder="Selector" 
                      value={rule.selector}
                      onChange={e => updateRule(i, 'selector', e.target.value)}
                    />
                    <select 
                      value={rule.selector_type}
                      onChange={e => updateRule(i, 'selector_type', e.target.value)}
                    >
                      <option value="css">CSS</option>
                      <option value="xpath">XPath</option>
                    </select>
                    <button type="button" className="btn icon danger" onClick={() => removeRule(i)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn secondary" onClick={addRule}>
                  <Plus size={16} /> Add Rule
                </button>
              </div>

              <div className="form-actions">
                <button type="button" className="btn secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Source'}
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
                <th>Name</th>
                <th>Type</th>
                <th>URL</th>
                <th>Rules</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources?.map(source => (
                <tr key={source.id}>
                  <td><strong>{source.name}</strong></td>
                  <td><span className={`badge ${source.source_type}`}>{source.source_type}</span></td>
                  <td className="url-cell">{source.url_pattern}</td>
                  <td>{source.extraction_rules.length} rules</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn icon success" 
                        title="Run scrape"
                        onClick={() => triggerMutation.mutate(source.id)}
                      >
                        <Play size={16} />
                      </button>
                      <button 
                        className="btn icon danger" 
                        title="Delete"
                        onClick={() => deleteMutation.mutate(source.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!sources?.length && (
                <tr><td colSpan={5} className="empty">No data sources configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
