import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Client, AdvancePayment, ExpenseItem } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import {
  Printer,
  X,
  FileText,
  CreditCard,
  Layers,
  Building2
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

  // Business Header info matching construction theme
  const [companyName] = useState('AFRAH CONSTRUCTIONS');
  const [companySub] = useState('CIVIL CONSTRUCTION & ARCHITECTURAL WORKS');
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
      body: '18px',
      th: '18px',
      meta: '18px',
      title: '18px',
      total: '18px',
      padding: '7px 10px'
    },
    large: {
      body: '18px',
      th: '18px',
      meta: '18px',
      title: '18px',
      total: '18px',
      padding: '9px 12px'
    },
    xlarge: {
      body: '18px',
      th: '18px',
      meta: '18px',
      title: '18px',
      total: '18px',
      padding: '11px 14px'
    }
  }[fontSizeScale];

  // Print execution handler
  const handleTriggerPrint = () => {
    window.print();
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
              <Building2 size={16} color="var(--primary, #e2c399)" />
              <span>Statement PDF Preview</span>
            </div>
          </div>

          <div className="preview-toolbar-center">
            <div className="preview-tab-pills">
              <button
                type="button"
                className={`preview-pill-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                onClick={() => setActiveTab('expenses')}
                title="Purchase / Expense Details"
              >
                <FileText size={14} />
                <span>Purchase Details ({expenses.length})</span>
              </button>
              <button
                type="button"
                className={`preview-pill-btn ${activeTab === 'advances' ? 'active' : ''}`}
                onClick={() => setActiveTab('advances')}
                title="Advance Payments"
              >
                <CreditCard size={14} />
                <span>Advance Payments ({advancePayments.length})</span>
              </button>
              <button
                type="button"
                className={`preview-pill-btn ${activeTab === 'statement' ? 'active' : ''}`}
                onClick={() => setActiveTab('statement')}
                title="Complete Client Statement"
              >
                <Layers size={14} />
                <span>Complete Statement</span>
              </button>
            </div>
          </div>

          <div className="preview-toolbar-right">
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
              title="Close Preview"
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
            {/* Top Outer Box Container */}
            <div className="statement-document-frame">
              {/* HEADER ROW: CONSTRUCTION LOGO (Left) & STORE ADDRESS (Right) */}
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

                  <table className="statement-invoice-table" style={{ '--stmt-cell-padding': fontSizes.padding }}>
                    <thead>
                      <tr className="table-header-row" style={{ fontSize: fontSizes.th }}>
                        {showSNo && <th className="text-center" style={{ width: '55px' }}>S.NO</th>}
                        <th className="text-center" style={{ width: '125px' }}>DATE</th>
                        <th className="text-center">ITEM</th>
                        <th className="text-center" style={{ width: '110px' }}>QUANTITY</th>
                        <th className="text-center" style={{ width: '95px' }}>RATE</th>
                        <th className="text-center" style={{ width: '160px' }}>AMOUNT</th>
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
                              <td className="statement-cell">
                                {index + 1}
                              </td>
                            )}
                            <td className="statement-cell">
                              {formatToDDMMYYYY(exp.date)}
                            </td>
                            <td
                              className="statement-cell"
                              style={{
                                textTransform: 'uppercase',
                                fontWeight: 700
                              }}
                            >
                              {exp.expenseName}
                            </td>
                            <td
                              className="statement-cell"
                              style={{ fontWeight: 600 }}
                            >
                              {exp.quantity}
                            </td>
                            <td
                              className="statement-cell"
                              style={{ fontWeight: 600 }}
                            >
                              {exp.rate ? exp.rate : ''}
                            </td>
                            <td
                              className="statement-cell"
                              style={{
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

                  <table className="statement-invoice-table" style={{ '--stmt-cell-padding': fontSizes.padding }}>
                    <thead>
                      <tr className="table-header-row" style={{ fontSize: fontSizes.th }}>
                        {showSNo && <th className="text-center" style={{ width: '55px' }}>S.NO</th>}
                        <th className="text-center" style={{ width: '135px' }}>DATE</th>
                        <th className="text-center">PAYMENT MODE</th>
                        <th className="text-center" style={{ width: '180px' }}>AMOUNT</th>
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
                              <td className="statement-cell">
                                {index + 1}
                              </td>
                            )}
                            <td className="statement-cell">
                              {formatToDDMMYYYY(adv.date)}
                            </td>
                            <td
                              className="statement-cell"
                              style={{
                                textTransform: 'uppercase',
                                fontWeight: 700
                              }}
                            >
                              {adv.mode}
                            </td>
                            <td
                              className="statement-cell"
                              style={{
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
    </div>,
    document.body
  );
};
