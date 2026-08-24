import React from 'react';
import { useSiteManager } from '../context/SiteManagerContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useSiteManager();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((toast) => {
        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <div style={{ marginTop: '2px' }}>
              {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
              {toast.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
              {toast.type === 'warning' && <AlertTriangle size={18} color="#f59e0b" />}
              {toast.type === 'info' && <Info size={18} color="var(--primary)" />}
            </div>

            <div style={{ flex: 1 }}>
              <div className="toast-title">{toast.title}</div>
              {toast.description && <div className="toast-desc">{toast.description}</div>}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
