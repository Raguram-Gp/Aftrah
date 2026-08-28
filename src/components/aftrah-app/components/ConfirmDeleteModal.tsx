import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  itemName,
  confirmText = 'Delete Record',
  cancelText = 'Cancel',
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="aftrah-app-modal-overlay" onClick={() => !isDeleting && onClose()}>
      <div
        className="aftrah-app-modal-container"
        style={{
          maxWidth: '420px',
          padding: '0',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.55)',
          border: '1px solid var(--border-stroke, #333842)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar with Close Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-stroke, #2c303a)',
            background: 'var(--surface-container, #1e2126)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171'
              }}
            >
              <Trash2 size={15} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </span>
          </div>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="aftrah-app-modal-close-btn"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Danger Pulse Icon Ring */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
              marginBottom: '16px'
            }}
          >
            <AlertTriangle size={28} strokeWidth={2.2} />
          </div>

          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}
          >
            {title}
          </h3>

          <p
            style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              maxWidth: '340px'
            }}
          >
            {message}
          </p>

          {itemName && (
            <div
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--surface-container, #1e2126)',
                border: '1px solid var(--border-stroke, #2c303a)',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--primary)',
                marginBottom: '8px',
                wordBreak: 'break-word'
              }}
            >
              {itemName}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            padding: '16px 20px',
            borderTop: '1px solid var(--border-stroke, #2c303a)',
            background: 'var(--surface-container, #1e2126)'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="aftrah-app-back-btn"
            style={{
              width: '100%',
              height: '40px',
              justifyContent: 'center',
              fontSize: '13px',
              margin: 0
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              height: '40px',
              padding: '0 16px',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.15s ease',
              opacity: isDeleting ? 0.7 : 1
            }}
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            <span>{isDeleting ? 'Deleting...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
