import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateDigest } from '../api/extended';
import type { Digest } from '../api/extended';
import { Brain, TrendingUp, Sparkles, BarChart3 } from 'lucide-react';

// Mock documents for demo - in production, fetch from search
const mockDocuments = [
  {
    id: '1',
    title: 'Google Summer Internship 2024',
    description: 'Join Google for an exciting summer internship opportunity in software engineering.',
    source_type: 'internship',
    source_url: 'https://careers.google.com',
    scraped_at: new Date().toISOString(),
    content: {},
    content_hash: 'abc123',
    source_id: 'src1',
  },
  {
    id: '2',
    title: 'Full Scholarship for Computer Science',
    description: 'Apply now for a fully funded scholarship covering tuition and living expenses.',
    source_type: 'scholarship',
    source_url: 'https://example.edu',
    scraped_at: new Date().toISOString(),
    content: {},
    content_hash: 'def456',
    source_id: 'src2',
  },
];

export function Insights() {
  const [digest, setDigest] = useState<Digest | null>(null);

  const digestMutation = useMutation({
    mutationFn: () => generateDigest(mockDocuments, 7),
    onSuccess: (res) => setDigest(res.data),
  });

  useEffect(() => {
    digestMutation.mutate();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1><Brain size={28} /> AI Insights</h1>
      </div>

      {digestMutation.isPending && <div className="loading">Analyzing data...</div>}

      {digest && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <BarChart3 size={32} />
              <div className="stat-info">
                <span className="stat-value">{digest.stats.total_documents}</span>
                <span className="stat-label">Documents ({digest.period})</span>
              </div>
            </div>
            <div className="stat-card">
              <TrendingUp size={32} />
              <div className="stat-info">
                <span className="stat-value">{digest.stats.growth_rate.toFixed(1)}%</span>
                <span className="stat-label">Growth Rate</span>
              </div>
            </div>
          </div>

          <div className="insights-section">
            <h2><Sparkles size={20} /> Key Insights</h2>
            <div className="insights-list">
              {digest.insights.map((insight, i) => (
                <div key={i} className="insight-card">
                  {insight}
                </div>
              ))}
            </div>
          </div>

          <div className="insights-section">
            <h2>🔥 Trending Keywords</h2>
            <div className="keywords-cloud">
              {digest.top_keywords.map((kw, i) => (
                <span 
                  key={i} 
                  className="keyword-tag"
                  style={{ fontSize: `${Math.min(1.5, 0.8 + kw.count * 0.1)}rem` }}
                >
                  {kw.keyword} <small>({kw.count})</small>
                </span>
              ))}
            </div>
          </div>

          <div className="insights-section">
            <h2>📊 By Source Type</h2>
            <div className="source-breakdown">
              {Object.entries(digest.stats.by_source_type).map(([type, count]) => (
                <div key={type} className="source-bar">
                  <span className={`badge ${type}`}>{type}</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${(count / digest.stats.total_documents) * 100}%` }}
                    />
                  </div>
                  <span className="bar-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {digest.highlights.length > 0 && (
            <div className="insights-section">
              <h2>✨ Highlights</h2>
              <div className="highlights-list">
                {digest.highlights.map((h, i) => (
                  <div key={i} className="highlight-card">
                    <h3>{h.title}</h3>
                    <p>{h.summary}</p>
                    <div className="highlight-meta">
                      <span className={`sentiment ${h.sentiment}`}>{h.sentiment}</span>
                      {h.categories.map(c => (
                        <span key={c} className="category-tag">{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
