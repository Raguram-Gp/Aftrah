import React, { useEffect, useRef } from 'react';
import {
  Printer,
  X,
  Building2
} from 'lucide-react';

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
  children
}) => {
  const printSheetRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="statement-preview-backdrop" onClick={onClose}>
      <div
        className={`statement-preview-dialog ${isFullWidth ? 'fullwidth' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls Toolbar: Clean, Single-Row Layout with Print on First Row */}
        <div className="statement-preview-toolbar no-print">
          <div className="preview-toolbar-left">
            <div className="preview-doc-badge">
              {badgeIcon || <Building2 size={16} color="var(--primary, #e2c399)" />}
              <span>{badgeLabel || title}</span>
            </div>

            {/* Document Mode / Tabs Selector if provided */}
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
            {/* Print Button directly on first row */}
            <button
              type="button"
              className="preview-print-primary-btn"
              onClick={handleTriggerPrint}
              title="Print directly or save as PDF"
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>

            {/* Close Button on first row */}
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
    </div>
  );
};
