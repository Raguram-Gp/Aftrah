import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      if (e?.detail) {
        const newToast: ToastMessage = {
          id: `toast-${Date.now()}-${Math.random()}`,
          type: e.detail.type || 'info',
          message: e.detail.message || '',
        };
        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 4000);
      }
    };

    window.addEventListener('afrah-toast', handleToast);
    return () => window.removeEventListener('afrah-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '8px',
            background:
              toast.type === 'error'
                ? '#7f1d1d'
                : toast.type === 'success'
                ? '#14532d'
                : 'var(--surface-container-high, #25282c)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            border: `1px solid ${
              toast.type === 'error'
                ? '#ef4444'
                : toast.type === 'success'
                ? '#22c55e'
                : 'var(--border-stroke, #3a3f4a)'
            }`,
            fontSize: '13px',
            fontWeight: 500,
            animation: 'app2FadeIn 0.2s ease-out',
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} color="#4ade80" />
          ) : (
            <AlertCircle size={16} color="#f87171" />
          )}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
