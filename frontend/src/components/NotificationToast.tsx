import { useEffect, useState } from 'react';
import { connectNotifications } from '../api/extended';
import type { NotificationEvent } from '../api/extended';
import { Bell, CheckCircle, XCircle, Zap, FileText } from 'lucide-react';

interface Toast {
  id: string;
  event: NotificationEvent;
  visible: boolean;
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    
    const connect = () => {
      try {
        ws = connectNotifications((event) => {
          const id = `${Date.now()}-${Math.random()}`;
          setToasts(prev => [...prev, { id, event, visible: true }]);
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setToasts(prev => prev.map(t => 
              t.id === id ? { ...t, visible: false } : t
            ));
          }, 5000);
          
          // Remove from DOM after animation
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
          }, 5500);
        });
        
        ws.onopen = () => setConnected(true);
        ws.onclose = () => {
          setConnected(false);
          // Reconnect after 3 seconds
          setTimeout(connect, 3000);
        };
      } catch (e) {
        console.error('WebSocket connection failed:', e);
      }
    };
    
    connect();
    
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const getIcon = (eventType: string) => {
    switch (eventType) {
      case 'job_started': return <Zap size={18} />;
      case 'job_completed': return <CheckCircle size={18} />;
      case 'job_failed': return <XCircle size={18} />;
      case 'document_scraped': return <FileText size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getClass = (eventType: string) => {
    switch (eventType) {
      case 'job_completed': return 'success';
      case 'job_failed': return 'error';
      default: return 'info';
    }
  };

  return (
    <>
      <div className={`connection-indicator ${connected ? 'connected' : ''}`}>
        <Bell size={14} />
        <span>{connected ? 'Live' : 'Connecting...'}</span>
      </div>
      
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast ${getClass(toast.event.event_type)} ${toast.visible ? 'visible' : ''}`}
          >
            {getIcon(toast.event.event_type)}
            <div className="toast-content">
              <strong>{toast.event.event_type.replace(/_/g, ' ')}</strong>
              <span>{toast.event.data.message as string}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
