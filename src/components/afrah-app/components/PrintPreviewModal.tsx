import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  X,
  Building2,
  Moon,
  SunMedium
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
  // Sheet view mode: 'theme' (matches dark/light mode) or 'paper' (shows exact white print sheet)
  const [sheetViewMode, setSheetViewMode] = useState<'theme' | 'paper'>('theme');
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
            {/* Theme View vs Paper View Mode Toggle */}
            <div className="preview-sheet-mode-toggle">
              <button
                type="button"
                className={`preview-mode-btn ${sheetViewMode === 'theme' ? 'active' : ''}`}
                onClick={() => setSheetViewMode('theme')}
                title="Preview with active app construction theme"
              >
                <Moon size={12} />
                <span>Theme View</span>
              </button>
              <button
                type="button"
                className={`preview-mode-btn ${sheetViewMode === 'paper' ? 'active' : ''}`}
                onClick={() => setSheetViewMode('paper')}
                title="Preview exact white paper print layout"
              >
                <SunMedium size={12} />
                <span>Paper View</span>
              </button>
            </div>

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
            className={`statement-pdf-sheet ${sheetViewMode === 'paper' ? 'sheet-paper-mode' : 'sheet-theme-mode'}`}
            ref={printSheetRef}
          >
            <div className="statement-document-frame">
              {/* BRAND HEADER ROW: CONSTRUCTION LOGO (Left) & STORE ADDRESS (Right) */}
              <div className="statement-header-row">
                <div className="statement-logo-container">
                  <svg
                    className="statement-construction-svg"
                    width="360"
                    height="54"
                    viewBox="0 0 380 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Architectural Structure Icon */}
                    <g transform="translate(4, 5)">
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
                    </g>

                    {/* Brand Typography */}
                    <g transform="translate(56, 26)">
                      <text
                        className="statement-brand-title"
                        x="0"
                        y="0"
                        fontFamily="'Plus Jakarta Sans', Arial, Helvetica, sans-serif"
                        fontSize="21"
                        fontWeight="900"
                        letterSpacing="1"
                        fill="currentColor"
                      >
                        {companyName}
                      </text>
                      <text
                        className="statement-brand-sub"
                        x="0"
                        y="15"
                        fontFamily="'Plus Jakarta Sans', Arial, Helvetica, sans-serif"
                        fontSize="9.5"
                        fontWeight="700"
                        letterSpacing="0.8"
                        fill="#C8A676"
                      >
                        {companySub}
                      </text>
                      <rect x="0" y="20" width="280" height="2.5" fill="#C8A676" />
                    </g>
                  </svg>
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
