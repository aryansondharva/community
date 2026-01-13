import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { searchDocuments } from '../api/client';
import type { SearchResult } from '../api/client';
import { Search as SearchIcon, ExternalLink } from 'lucide-react';

export function Search() {
  const [query, setQuery] = useState('');
  const [sourceTypes, setSourceTypes] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult | null>(null);

  const searchMutation = useMutation({
    mutationFn: () => searchDocuments(query, sourceTypes.length ? sourceTypes : undefined),
    onSuccess: (res) => setResults(res.data),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchMutation.mutate();
    }
  };

  const toggleType = (type: string) => {
    setSourceTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const types = ['scholarship', 'internship', 'price', 'learning'];

  return (
    <div className="page">
      <h1>Search Documents</h1>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <SearchIcon size={20} />
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            placeholder="Search aggregated data..."
            className="search-input"
          />
          <button type="submit" className="btn primary" disabled={searchMutation.isPending}>
            {searchMutation.isPending ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <div className="filter-chips">
          {types.map(type => (
            <button
              key={type}
              type="button"
              className={`chip ${sourceTypes.includes(type) ? 'active' : ''}`}
              onClick={() => toggleType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </form>

      {searchMutation.isError && (
        <div className="error-message">
          Search failed. Make sure ElasticSearch is running.
        </div>
      )}

      {results && (
        <div className="search-results">
          <div className="results-header">
            <span>{results.total} results found</span>
          </div>
          
          {results.documents.length > 0 ? (
            <div className="results-list">
              {results.documents.map(doc => (
                <div key={doc.id} className="result-card">
                  <div className="result-header">
                    <h3>{doc.title}</h3>
                    <span className={`badge ${doc.source_type}`}>{doc.source_type}</span>
                  </div>
                  {doc.description && <p className="result-description">{doc.description}</p>}
                  <div className="result-meta">
                    <a href={doc.source_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} /> View Source
                    </a>
                    <span>Scraped: {new Date(doc.scraped_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No documents match your search</div>
          )}
        </div>
      )}
    </div>
  );
}
