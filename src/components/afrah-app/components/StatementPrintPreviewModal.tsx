import React, { useState, useRef } from 'react';
import type { Client, AdvancePayment, ExpenseItem } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import {
  FileText,
  CreditCard,
  Layers,
} from 'lucide-react';
import type { PdfBrand, StatementSnapshot } from '@/lib/statementSnapshot';
import { defaultStatementBrand } from '@/lib/statementSnapshot';
import { PrintPreviewShell } from './PrintPreviewShell';
import { StatementBrandLockup } from '@/components/shared-statement/StatementBrandLockup';

interface StatementPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  advancePayments: AdvancePayment[];
  expenses: ExpenseItem[];
  initialMode?: 'expenses' | 'advances' | 'statement';
  fromDate?: string;
  toDate?: string;
  brand?: PdfBrand;
}

const formatInvoiceINR = (val: number) => {
  const formatted = Math.abs(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹${formatted}/-`;
};

function buildClientStatementPayload(args: {
  activeTab: 'expenses' | 'advances' | 'statement';
  client: Client;
  expenses: ExpenseItem[];
  advancePayments: AdvancePayment[];
  fromDate?: string;
  toDate?: string;
  totalExpenses: number;
  totalAdvance: number;
  pendingBalance: number;
  brand?: PdfBrand;
}): StatementSnapshot {
  const {
    activeTab,
    client,
    expenses,
    advancePayments,
    fromDate,
    toDate,
    totalExpenses,
    totalAdvance,
    pendingBalance,
    brand: brandId = 'afrah',
  } = args;

  const brand = defaultStatementBrand(brandId);
  const formattedToday = formatToDDMMYYYY(new Date().toISOString().slice(0, 10));
  const dateLabel =
    fromDate && toDate
      ? `${formatToDDMMYYYY(fromDate)} to ${formatToDDMMYYYY(toDate)}`
      : formattedToday;

  const sections: StatementSnapshot['sections'] = [];

  if (activeTab === 'expenses' || activeTab === 'statement') {
    const rows =
      expenses.length === 0
        ? [['—', 'No purchase / expense records found for this client.', '', '', '']]
        : expenses.map((exp) => [
            formatToDDMMYYYY(exp.date),
            exp.expenseName.toUpperCase(),
            String(exp.quantity),
            exp.rate ? String(exp.rate) : '',
            formatInvoiceINR(exp.totalAmount),
          ]);

    sections.push({
      title: 'PURCHASE DETAILS',
      columns: ['DATE', 'ITEM', 'QUANTITY', 'RATE', 'AMOUNT'],
      rows,
      totalLabel: 'TOTAL',
      totalValue: formatInvoiceINR(totalExpenses),
    });
  }

  if (activeTab === 'advances' || activeTab === 'statement') {
    const rows =
      advancePayments.length === 0
        ? [['—', 'No advance payments recorded for this client.', '']]
        : advancePayments.map((adv) => [
            formatToDDMMYYYY(adv.date),
            adv.mode.toUpperCase(),
            formatInvoiceINR(adv.amount),
          ]);

    sections.push({
      title: 'ADVANCE PAYMENTS DETAILS',
      columns: ['DATE', 'PAYMENT MODE', 'AMOUNT'],
      rows,
      totalLabel: 'TOTAL ADVANCE',
      totalValue: formatInvoiceINR(totalAdvance),
    });
  }

  const summary: StatementSnapshot['summary'] =
    activeTab === 'statement'
      ? [
          { label: 'Total Purchases', value: formatInvoiceINR(totalExpenses) },
          { label: 'Total Advance', value: formatInvoiceINR(totalAdvance) },
          { label: 'Net Pending Balance', value: formatInvoiceINR(pendingBalance) },
        ]
      : [{ label: 'Pending Balance', value: formatInvoiceINR(pendingBalance) }];

  return {
    ...brand,
    party: { name: client.name.toUpperCase() },
    dateLabel,
    sections,
    summary,
    capturedAt: new Date().toISOString(),
  };
}

export const StatementPrintPreviewModal: React.FC<StatementPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  client,
  advancePayments,
  expenses,
  initialMode = 'expenses',
  fromDate,
  toDate,
  brand: brandId = 'afrah',
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'advances' | 'statement'>(initialMode);
  const [fontSizeScale] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [showSNo] = useState(false);
  const [isFullWidth] = useState(false);

  const brand = defaultStatementBrand(brandId);
  const companyName = brand.company;
  const companySub = brand.subtitle;
  const addressLine1 = brand.address[0] ?? '';
  const addressLine2 = brand.address[1] ?? '';

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
    }
  }, [isOpen, initialMode]);

  const printSheetRef = useRef<HTMLDivElement>(null);

  const totalAdvance = advancePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
  const pendingBalance = totalExpenses - totalAdvance;

  const currentDate = new Date();
  const formattedToday = formatToDDMMYYYY(currentDate.toISOString().slice(0, 10));

  const fontSizes = {
    normal: {
      body: '18px',
      th: '18px',
      meta: '18px',
      title: '18px',
      total: '18px',
      padding: '7px 10px',
    },
    large: {
      body: '18px',
      th: '18px',
      meta: '18px',
      title: '18px',
      total: '18px',
      padding: '9px 12px',
    },
    xlarge: {
      body: '18px',
      th: '18px',
      meta: '18px',
      title: '18px',
      total: '18px',
      padding: '11px 14px',
    },
  }[fontSizeScale];

  const sharePayload = buildClientStatementPayload({
    activeTab,
    client,
    expenses,
    advancePayments,
    fromDate,
    toDate,
    totalExpenses,
    totalAdvance,
    pendingBalance,
    brand: brandId,
  });

  const tabPills = (
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
  );

  return (
    <PrintPreviewShell
      isOpen={isOpen}
      onClose={onClose}
      kind="client"
      entityId={client.id}
      title={client.name}
      payload={sharePayload}
      extraToolbarLeft={tabPills}
    >
      <div
        className={`statement-pdf-sheet sheet-paper-mode a4-sheet ${isFullWidth ? 'fullwidth' : ''}`}
        ref={printSheetRef}
      >
        <div className="statement-document-frame">
          <StatementBrandLockup
            brand={brandId}
            companyName={companyName}
            companySub={companySub}
            address={[addressLine1, addressLine2]}
          />

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

          <div className="statement-pending-balance-row" style={{ fontSize: fontSizes.title }}>
            <span className="pending-balance-label">PENDING BALANCE: </span>
            <span className="pending-balance-amount">{formatInvoiceINR(pendingBalance)}</span>
          </div>

          {(activeTab === 'expenses' || activeTab === 'statement') && (
            <div className="statement-table-block">
              <div className="statement-section-title-row" style={{ fontSize: fontSizes.title }}>
                PURCHASE DETAILS
              </div>

              <table
                className="statement-invoice-table"
                style={{ '--stmt-cell-padding': fontSizes.padding } as React.CSSProperties}
              >
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
                        {showSNo && <td className="statement-cell">{index + 1}</td>}
                        <td className="statement-cell">{formatToDDMMYYYY(exp.date)}</td>
                        <td
                          className="statement-cell"
                          style={{ textTransform: 'uppercase', fontWeight: 700 }}
                        >
                          {exp.expenseName}
                        </td>
                        <td className="statement-cell" style={{ fontWeight: 600 }}>
                          {exp.quantity}
                        </td>
                        <td className="statement-cell" style={{ fontWeight: 600 }}>
                          {exp.rate ? exp.rate : ''}
                        </td>
                        <td
                          className="statement-cell"
                          style={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          {formatInvoiceINR(exp.totalAmount)}
                        </td>
                      </tr>
                    ))
                  )}

                  <tr className="invoice-total-row" style={{ fontSize: fontSizes.total }}>
                    {showSNo && <td></td>}
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="total-label-cell">TOTAL</td>
                    <td className="total-amount-cell">{formatInvoiceINR(totalExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === 'advances' || activeTab === 'statement') && (
            <div
              className="statement-table-block"
              style={{ marginTop: activeTab === 'statement' ? '20px' : 0 }}
            >
              <div className="statement-section-title-row" style={{ fontSize: fontSizes.title }}>
                ADVANCE PAYMENTS DETAILS
              </div>

              <table
                className="statement-invoice-table"
                style={{ '--stmt-cell-padding': fontSizes.padding } as React.CSSProperties}
              >
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
                        {showSNo && <td className="statement-cell">{index + 1}</td>}
                        <td className="statement-cell">{formatToDDMMYYYY(adv.date)}</td>
                        <td
                          className="statement-cell"
                          style={{ textTransform: 'uppercase', fontWeight: 700 }}
                        >
                          {adv.mode}
                        </td>
                        <td
                          className="statement-cell"
                          style={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          {formatInvoiceINR(adv.amount)}
                        </td>
                      </tr>
                    ))
                  )}

                  <tr className="invoice-total-row" style={{ fontSize: fontSizes.total }}>
                    {showSNo && <td></td>}
                    <td></td>
                    <td className="total-label-cell">TOTAL ADVANCE</td>
                    <td className="total-amount-cell">{formatInvoiceINR(totalAdvance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

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
    </PrintPreviewShell>
  );
};
