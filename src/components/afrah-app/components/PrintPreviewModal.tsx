import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  X,
  Building2
} from 'lucide-react';
import type { StatementKind, StatementSnapshot } from '@/lib/statementSnapshot';
import { createStatementShare } from '@/lib/statementShare';
import {
  buildStatementShareMessage,
  openWhatsAppWebWithText,
} from '@/lib/whatsappShare';
import { showToast } from '../utils/toast';

export interface PrintPreviewTab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  badgeLabel?: string;
  badgeIcon?: React.ReactNode;
  companyName?: string;
  companySub?: string;
  addressLine1?: string;
  addressLine2?: string;
  tabs?: PrintPreviewTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  isFullWidth?: boolean;
  children: React.ReactNode;
  shareKind?: StatementKind;
  shareEntityId?: string | null;
  shareTitle?: string;
  sharePayload?: StatementSnapshot;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title = 'Statement PDF Preview',
  badgeLabel,
  badgeIcon,
  companyName = 'AFRAH CONSTRUCTIONS',
  companySub = 'CIVIL CONSTRUCTION & ARCHITECTURAL WORKS',
  addressLine1 = '32/2 Sps Complex, Alaguseenivasan Mahal Opp,',
  addressLine2 = 'Main road, Chinnamanur, Theni - 625 515.',
  tabs,
  activeTab,
  onTabChange,
  isFullWidth = false,
  children,
  shareKind,
  shareEntityId,
  shareTitle,
  sharePayload,
}) => {
  const printSheetRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  // Toggle body class for print isolation styling
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('statement-preview-active');
    } else {
      document.body.classList.remove('statement-preview-active');
    }
    return () => {
      document.body.classList.remove('statement-preview-active');
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  const handleShareWhatsApp = async () => {
    if (!shareKind || !sharePayload) return;
    setSharing(true);
    try {
      const url = await createStatementShare({
        kind: shareKind,
        entityId: shareEntityId,
        title: shareTitle || title,
        payload: sharePayload,
      });
      openWhatsAppWebWithText(buildStatementShareMessage(shareTitle || title, url));
      showToast('WhatsApp opened with statement link', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to share statement';
      showToast(message, 'error');
    } finally {
      setSharing(false);
    }
  };

  return createPortal(
    <div className="statement-preview-backdrop" onClick={onClose}>
      <div
        className={`statement-preview-dialog ${isFullWidth ? 'fullwidth' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="statement-preview-toolbar no-print">
          <div className="preview-toolbar-left">
            <div className="preview-doc-badge">
              {badgeIcon || <Building2 size={16} color="var(--primary, #e2c399)" />}
              <span>{badgeLabel || title}</span>
            </div>
          </div>

          <div className="preview-toolbar-center">
            {tabs && tabs.length > 1 && (
              <div className="preview-tab-pills">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`preview-pill-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange?.(tab.id)}
                    title={tab.label}
                  >
                    {tab.icon}
                    <span>
                      {tab.label}
                      {tab.count !== undefined ? ` (${tab.count})` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="preview-toolbar-right">
            {shareKind && sharePayload && (
              <button
                type="button"
                className="preview-print-primary-btn"
                onClick={handleShareWhatsApp}
                disabled={sharing}
                title="Share statement link via WhatsApp"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>{sharing ? 'Sharing…' : 'Share to WhatsApp'}</span>
              </button>
            )}

            <button
              type="button"
              className="preview-print-primary-btn"
              onClick={handleTriggerPrint}
              title="Print directly or save as PDF"
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              className="preview-close-btn"
              onClick={onClose}
              title="Close Preview (Esc)"
              aria-label="Close Preview"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* PHYSICAL PAPER SHEET PREVIEW & PRINTABLE TARGET                     */}
        {/* =================================================================== */}
        <div className="statement-preview-viewport">
          <div
            className="statement-pdf-sheet sheet-paper-mode a4-sheet"
            ref={printSheetRef}
          >
            <div className="statement-document-frame">
              {/* BRAND HEADER ROW: CONSTRUCTION LOGO (Left) & STORE ADDRESS (Right) */}
              <div className="statement-header-row">
                <div className="statement-logo-container">
                  <svg
                    className="statement-brand-mark"
                    width="42"
                    height="50"
                    viewBox="0 0 44 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      className="statement-logo-base"
                      d="M 22 2 L 42 20 L 42 48 L 2 48 L 2 20 Z"
                      fill="#1E293B"
                      stroke="#C8A676"
                      strokeWidth="2"
                    />
                    <path
                      d="M 22 2 L 22 48 M 2 20 L 42 20 M 2 34 L 42 34 M 2 48 L 22 34 L 42 48 M 2 34 L 22 20 L 42 34 M 2 20 L 22 2 L 42 20"
                      stroke="#E2C399"
                      strokeWidth="1.5"
                    />
                    <circle cx="22" cy="2" r="2.5" fill="#E2C399" />
                  </svg>
                  <div className="statement-brand-copy">
                    <div className="statement-brand-title-text">{companyName}</div>
                    <div className="statement-brand-sub-text">{companySub}</div>
                  </div>
                </div>

                <div className="statement-address-container">
                  <div className="address-text-line">{addressLine1}</div>
                  <div className="address-text-line">{addressLine2}</div>
                </div>
              </div>

              {/* SHEET CONTENT SLOT */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
