import React, { useState, useRef } from 'react';
import type { Client, AdvancePayment, ExpenseItem } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import {
  Printer,
  X,
  FileText,
  CreditCard,
  Layers,
  Building2,
  Moon,
  SunMedium
} from 'lucide-react';

interface StatementPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  advancePayments: AdvancePayment[];
  expenses: ExpenseItem[];
  initialMode?: 'expenses' | 'advances' | 'statement';
  fromDate?: string;
  toDate?: string;
}

export const StatementPrintPreviewModal: React.FC<StatementPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  client,
  advancePayments,
  expenses,
  initialMode = 'expenses',
  fromDate,
  toDate
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'advances' | 'statement'>(initialMode);
  const [fontSizeScale] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [showSNo] = useState(false);
  const [isFullWidth] = useState(false);
  // Sheet view mode: 'theme' (matches dark/light mode) or 'paper' (shows exact white print sheet)
  const [sheetViewMode, setSheetViewMode] = useState<'theme' | 'paper'>('theme');

  // Business Header info matching construction theme
  const [companyName] = useState('AFRAH CONSTRUCTIONS');
  const [addressLine1] = useState('32/2 Sps Complex, Alaguseenivasan Mahal Opp,');
  const [addressLine2] = useState('Main road, Chinnamanur, Theni - 625 515.');

  // Toggle body class for print styling
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('statement-preview-active');
    } else {
      document.body.classList.remove('statement-preview-active');
    }
    return () => {
      document.body.classList.remove('statement-preview-active');
    };
  }, [isOpen]);

  // Select the tab that matches where the user opened the preview from
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
    }
  }, [isOpen, initialMode]);

  // Print sheet ref
  const printSheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Format currency matching the reference: ₹12,03,067.00/-
  const formatInvoiceINR = (val: number) => {
    const formatted = Math.abs(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `₹${formatted}/-`;
  };

  // Calculations
  const totalAdvance = advancePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
  // Pending Balance = Total Purchase - Total Advance
  const pendingBalance = totalExpenses - totalAdvance;

  const currentDate = new Date();
  const formattedToday = formatToDDMMYYYY(currentDate.toISOString().slice(0, 10));

  // Active font sizing classes or styles
  const fontSizes = {
    normal: {
      body: '13px',
      th: '13px',
      meta: '13px',
      title: '14px',
      total: '14.5px',
      padding: '7px 10px'
    },
    large: {
      body: '14.5px',
      th: '14.5px',
      meta: '14.5px',
      title: '15.5px',
      total: '16px',
      padding: '9px 12px'
    },
    xlarge: {
      body: '16px',
      th: '16px',
      meta: '15.5px',
      title: '17px',
      total: '17.5px',
      padding: '11px 14px'
    }
  }[fontSizeScale];

  // Print execution handler
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
              <Building2 size={16} color="var(--primary, #e2c399)" />
              <span>Statement PDF Preview</span>
            </div>

            {/* Document Mode Selector */}
            <div className="preview-tab-pills">
              <button
                type="button"
                className={`preview-pill-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                onClick={() => setActiveTab('expenses')}
                title="Purchase / Expense Details"
              >
                <FileText size={13} />
                <span>Purchases ({expenses.length})</span>
              </button>

              <button
                type="button"
                className={`preview-pill-btn ${activeTab === 'advances' ? 'active' : ''}`}
                onClick={() => setActiveTab('advances')}
                title="Advance Payments"
              >
                <CreditCard size={13} />
                <span>Advances ({advancePayments.length})</span>
              </button>

              <button
                type="button"
                className={`preview-pill-btn ${activeTab === 'statement' ? 'active' : ''}`}
                onClick={() => setActiveTab('statement')}
                title="Complete Client Statement"
              >
                <Layers size={13} />
                <span>Statement</span>
              </button>
            </div>
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
                <span>Theme</span>
              </button>
              <button
                type="button"
                className={`preview-mode-btn ${sheetViewMode === 'paper' ? 'active' : ''}`}
                onClick={() => setSheetViewMode('paper')}
                title="Preview exact white paper print layout"
              >
                <SunMedium size={12} />
                <span>Paper</span>
              </button>
            </div>

            {/* Print Button directly on the first row */}
            <button
              type="button"
              className="preview-print-primary-btn"
              onClick={handleTriggerPrint}
              title="Print directly or save as PDF"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>

            {/* Close Button on the first row */}
            <button
              type="button"
              className="preview-close-btn"
              onClick={onClose}
              title="Close Preview"
            >
              <X size={16} />
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
            {/* Top Outer Box Container */}
            <div className="statement-document-frame">
              {/* HEADER ROW: CONSTRUCTION LOGO (Left) & STORE ADDRESS (Right) */}
              <div className="statement-header-row">
                <div className="statement-logo-container">
                  {/* Construction Architectural Structure Vector Logo */}
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
                      {/* Structure base & roof frame */}
                      <path
                        className="statement-logo-base"
                        d="M 22 2 L 42 20 L 42 48 L 2 48 L 2 20 Z"
                        fill="#1E293B"
                        stroke="#C8A676"
                        strokeWidth="2"
                      />
                      {/* Geometric architectural trusses */}
                      <path
                        d="M 22 2 L 22 48 M 2 20 L 42 20 M 2 34 L 42 34 M 2 48 L 22 34 L 42 48 M 2 34 L 22 20 L 42 34 M 2 20 L 22 2 L 42 20"
                        stroke="#E2C399"
                        strokeWidth="1.5"
                      />
                      {/* Apex spire */}
                      <circle cx="22" cy="2" r="2.5" fill="#E2C399" />
                    </g>

                    {/* Brand Typography: AFRAH CONSTRUCTIONS */}
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
                        CIVIL CONSTRUCTION & ARCHITECTURAL WORKS
                      </text>
                      {/* Bottom Accent Bar */}
                      <rect x="0" y="20" width="280" height="2.5" fill="#C8A676" />
                    </g>
                  </svg>
                </div>

                <div className="statement-address-container">
                  <div className="address-text-line">{addressLine1}</div>
                  <div className="address-text-line">{addressLine2}</div>
                </div>
              </div>

              {/* CLIENT NAME & DATE ROW */}
              <div className="statement-meta-row" style={{ fontSize: fontSizes.meta }}>
                <div className="meta-left">
                  <span className="meta-label">NAME:</span>{' '}
                  <span className="meta-name-value">{client.name.toUpperCase()}</span>
                </div>
                <div className="meta-right">
                  <span className="meta-label">DATE:</span>{' '}
                  <span className="meta-date-value">
                    {fromDate && toDate
                      ? `${formatToDDMMYYYY(fromDate)} to ${formatToDDMMYYYY(toDate)}`
                      : formattedToday}
                  </span>
                </div>
              </div>

              {/* PENDING BALANCE ROW */}
              <div className="statement-pending-balance-row" style={{ fontSize: fontSizes.title }}>
                <span className="pending-balance-label">PENDING BALANCE: </span>
                <span className="pending-balance-amount">{formatInvoiceINR(pendingBalance)}</span>
              </div>

              {/* ============================================================= */}
              {/* SECTION: PURCHASE DETAILS (Site Expenses)                      */}
              {/* ============================================================= */}
              {(activeTab === 'expenses' || activeTab === 'statement') && (
                <div className="statement-table-block">
                  <div className="statement-section-title-row" style={{ fontSize: fontSizes.title }}>
                    PURCHASE DETAILS
                  </div>

                  <table className="statement-invoice-table">
                    <thead>
                      <tr className="table-header-row" style={{ fontSize: fontSizes.th }}>
                        {showSNo && <th style={{ width: '55px', textAlign: 'center' }}>S.NO</th>}
                        <th style={{ width: '125px', textAlign: 'center' }}>DATE</th>
                        <th style={{ textAlign: 'center' }}>ITEM</th>
                        <th style={{ width: '110px', textAlign: 'center' }}>QUANTITY</th>
                        <th style={{ width: '95px', textAlign: 'center' }}>RATE</th>
                        <th style={{ width: '160px', textAlign: 'center' }}>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.length === 0 ? (
                        <tr>
                          <td
                            colSpan={showSNo ? 6 : 5}
                            style={{ textAlign: 'center', padding: '24px', color: '#666', fontStyle: 'italic' }}
                          >
                            No purchase / expense records found for this client.
                          </td>
                        </tr>
                      ) : (
                        expenses.map((exp, index) => (
                          <tr key={exp.id} className="invoice-data-row" style={{ fontSize: fontSizes.body }}>
                            {showSNo && (
                              <td style={{ textAlign: 'center', padding: fontSizes.padding }}>
                                {index + 1}
                              </td>
                            )}
                            <td style={{ textAlign: 'center', padding: fontSizes.padding }}>
                              {formatToDDMMYYYY(exp.date)}
                            </td>
                            <td
                              style={{
                                textAlign: 'center',
                                padding: fontSizes.padding,
                                textTransform: 'uppercase',
                                fontWeight: 700
                              }}
                            >
                              {exp.expenseName}
                            </td>
                            <td
                              style={{
                                textAlign: 'center',
                                padding: fontSizes.padding,
                                fontWeight: 600
                              }}
                            >
                              {exp.quantity}
                            </td>
                            <td
                              style={{
                                textAlign: 'center',
                                padding: fontSizes.padding,
                                fontWeight: 600
                              }}
                            >
                              {exp.rate ? exp.rate : ''}
                            </td>
                            <td
                              style={{
                                textAlign: 'center',
                                padding: fontSizes.padding,
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {formatInvoiceINR(exp.totalAmount)}
                            </td>
                          </tr>
                        ))
                      )}

                      {/* BOTTOM TOTAL ROW MATCHING THE IMAGE */}
                      <tr className="invoice-total-row" style={{ fontSize: fontSizes.total }}>
                        {showSNo && <td></td>}
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className="total-label-cell">TOTAL</td>
                        <td className="total-amount-cell">
                          {formatInvoiceINR(totalExpenses)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* ============================================================= */}
              {/* SECTION: ADVANCE PAYMENTS                                      */}
              {/* ============================================================= */}
              {(activeTab === 'advances' || activeTab === 'statement') && (
                <div
                  className="statement-table-block"
                  style={{ marginTop: activeTab === 'statement' ? '20px' : 0 }}
                >
                  <div className="statement-section-title-row" style={{ fontSize: fontSizes.title }}>
                    ADVANCE PAYMENTS DETAILS
                  </div>

                  <table className="statement-invoice-table">
                    <thead>
                      <tr className="table-header-row" style={{ fontSize: fontSizes.th }}>
                        {showSNo && <th style={{ width: '55px', textAlign: 'center' }}>S.NO</th>}
                        <th style={{ width: '135px', textAlign: 'center' }}>DATE</th>
                        <th style={{ textAlign: 'center' }}>PAYMENT MODE</th>
                        <th style={{ width: '180px', textAlign: 'center' }}>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advancePayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={showSNo ? 4 : 3}
                            style={{ textAlign: 'center', padding: '24px', color: '#666', fontStyle: 'italic' }}
                          >
                            No advance payments recorded for this client.
                          </td>
                        </tr>
                      ) : (
                        advancePayments.map((adv, index) => (
                          <tr key={adv.id} className="invoice-data-row" style={{ fontSize: fontSizes.body }}>
                            {showSNo && (
                              <td style={{ textAlign: 'center', padding: fontSizes.padding }}>
                                {index + 1}
                              </td>
                            )}
                            <td style={{ textAlign: 'center', padding: fontSizes.padding }}>
                              {formatToDDMMYYYY(adv.date)}
                            </td>
                            <td
                              style={{
                                textAlign: 'center',
                                padding: fontSizes.padding,
                                textTransform: 'uppercase',
                                fontWeight: 700
                              }}
                            >
                              {adv.mode}
                            </td>
                            <td
                              style={{
                                textAlign: 'center',
                                padding: fontSizes.padding,
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {formatInvoiceINR(adv.amount)}
                            </td>
                          </tr>
                        ))
                      )}

                      {/* BOTTOM TOTAL ROW FOR ADVANCES */}
                      <tr className="invoice-total-row" style={{ fontSize: fontSizes.total }}>
                        {showSNo && <td></td>}
                        <td></td>
                        <td className="total-label-cell">TOTAL ADVANCE</td>
                        <td className="total-amount-cell">
                          {formatInvoiceINR(totalAdvance)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUMMARY ROW FOR FULL STATEMENT */}
              {activeTab === 'statement' && (
                <div className="statement-final-reconciliation-row" style={{ fontSize: fontSizes.meta }}>
                  <div className="reconciliation-item">
                    <span>Total Purchases:</span> <strong>{formatInvoiceINR(totalExpenses)}</strong>
                  </div>
                  <div className="reconciliation-item">
                    <span>Total Advance:</span> <strong>{formatInvoiceINR(totalAdvance)}</strong>
                  </div>
                  <div
                    className={`reconciliation-item reconciliation-pending ${pendingBalance > 0 ? 'is-due' : 'is-settled'}`}
                  >
                    <span>Net Pending Balance:</span>{' '}
                    <strong>{formatInvoiceINR(pendingBalance)}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
