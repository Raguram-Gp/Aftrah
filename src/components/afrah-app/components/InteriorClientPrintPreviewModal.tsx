import React, { useState, useEffect } from 'react';
import type { InteriorClient, InteriorAdvancePayment, InteriorExpenseItem } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import { PrintPreviewModal } from './PrintPreviewModal';
import { Paintbrush, FileText, CreditCard, Layers } from 'lucide-react';
import type { StatementSnapshot } from '@/lib/statementSnapshot';
import { defaultStatementBrand } from '@/lib/statementSnapshot';

const INTERIOR_COMPANY_NAME = 'KAAB INTERIOR · AFRAH CONSTRUCTIONS';
const INTERIOR_COMPANY_SUB = 'LUXURY INTERIORS, MODULAR WOODWORK & TURNKEY EXECUTION';

const formatInvoiceINR = (val: number) => {
  const formatted = Math.abs(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹${formatted}/-`;
};

function buildInteriorClientStatementPayload(args: {
  activeTab: 'expenses' | 'advances' | 'statement';
  client: InteriorClient;
  expenses: InteriorExpenseItem[];
  advancePayments: InteriorAdvancePayment[];
  fromDate?: string;
  toDate?: string;
  totalExpenses: number;
  totalAdvance: number;
  pendingBalance: number;
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
  } = args;

  const brand = defaultStatementBrand();
  const formattedToday = formatToDDMMYYYY(new Date().toISOString().slice(0, 10));
  const dateLabel =
    fromDate && toDate
      ? `${formatToDDMMYYYY(fromDate)} to ${formatToDDMMYYYY(toDate)}`
      : formattedToday;

  const sections: StatementSnapshot['sections'] = [];

  if (activeTab === 'expenses' || activeTab === 'statement') {
    const rows =
      expenses.length === 0
        ? [['—', 'No interior work records found for this client.', '', '', '']]
        : expenses.map((exp) => [
            formatToDDMMYYYY(exp.date),
            exp.expenseName.toUpperCase(),
            String(exp.quantity),
            exp.rate ? String(exp.rate) : '-',
            formatInvoiceINR(exp.totalAmount),
          ]);

    sections.push({
      title: 'INTERIOR WORK ITEMS & SPECIFICATIONS',
      columns: ['DATE', 'ITEM / DESCRIPTION', 'QTY', 'RATE', 'AMOUNT'],
      rows,
      totalLabel: 'TOTAL WORK',
      totalValue: formatInvoiceINR(totalExpenses),
    });
  }

  if (activeTab === 'advances' || activeTab === 'statement') {
    const rows =
      advancePayments.length === 0
        ? [['—', 'No advance payments recorded for this client.', '']]
        : advancePayments.map((adv) => {
            const modeNotes = adv.note ? `${adv.mode.toUpperCase()} (${adv.note})` : adv.mode.toUpperCase();
            return [formatToDDMMYYYY(adv.date), modeNotes, formatInvoiceINR(adv.amount)];
          });

    sections.push({
      title: 'ADVANCE PAYMENTS RECEIVED',
      columns: ['DATE', 'PAYMENT MODE / NOTES', 'AMOUNT'],
      rows,
      totalLabel: 'TOTAL ADVANCE',
      totalValue: formatInvoiceINR(totalAdvance),
    });
  }

  const summary: StatementSnapshot['summary'] =
    activeTab === 'statement'
      ? [
          { label: 'Total Work / Expenses', value: formatInvoiceINR(totalExpenses) },
          { label: 'Total Advance', value: formatInvoiceINR(totalAdvance) },
          { label: 'Net Balance Due', value: formatInvoiceINR(pendingBalance) },
        ]
      : [
          {
            label: pendingBalance > 0 ? 'Net Due / Balance Payable' : 'Account Settled',
            value: formatInvoiceINR(pendingBalance),
          },
        ];

  return {
    ...brand,
    company: INTERIOR_COMPANY_NAME,
    subtitle: INTERIOR_COMPANY_SUB,
    party: { name: client.name.toUpperCase(), phone: client.phone },
    dateLabel,
    sections,
    summary,
    capturedAt: new Date().toISOString(),
  };
}

interface InteriorClientPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: InteriorClient;
  advancePayments: InteriorAdvancePayment[];
  expenses: InteriorExpenseItem[];
  initialMode?: 'expenses' | 'advances' | 'statement';
  fromDate?: string;
  toDate?: string;
}

export const InteriorClientPrintPreviewModal: React.FC<InteriorClientPrintPreviewModalProps> = ({
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

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const totalAdvance = advancePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
  const pendingBalance = totalExpenses - totalAdvance;

  const currentDate = new Date();
  const formattedToday = formatToDDMMYYYY(currentDate.toISOString().slice(0, 10));

  const tabs = [
    {
      id: 'expenses',
      label: 'Work Items / Purchases',
      count: expenses.length,
      icon: <FileText size={14} />
    },
    {
      id: 'advances',
      label: 'Advance Payments',
      count: advancePayments.length,
      icon: <CreditCard size={14} />
    },
    {
      id: 'statement',
      label: 'Complete Estimate Statement',
      icon: <Layers size={14} />
    }
  ];

  const sharePayload = buildInteriorClientStatementPayload({
    activeTab,
    client,
    expenses,
    advancePayments,
    fromDate,
    toDate,
    totalExpenses,
    totalAdvance,
    pendingBalance,
  });

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Estimate For Interior Works"
      badgeLabel="Interior Estimate & Statement"
      badgeIcon={<Paintbrush size={16} color="var(--primary, #e2c399)" />}
      companyName={INTERIOR_COMPANY_NAME}
      companySub={INTERIOR_COMPANY_SUB}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as 'expenses' | 'advances' | 'statement')}
      shareKind="interior_client"
      shareEntityId={client.id}
      shareTitle={client.name}
      sharePayload={sharePayload}
    >
      {/* CLIENT NAME & DATE ROW */}
      <div className="statement-meta-row" style={{ fontSize: '18px' }}>
        <div className="meta-left">
          <span className="meta-label">CLIENT:</span>{' '}
          <span className="meta-name-value">{client.name.toUpperCase()}</span>
          {client.phone && (
            <span style={{ fontSize: '14px', marginLeft: '12px', opacity: 0.85 }}>
              ({client.phone})
            </span>
          )}
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
      <div className="statement-pending-balance-row" style={{ fontSize: '18px' }}>
        <span className="pending-balance-label">
          {pendingBalance > 0 ? 'NET DUE / BALANCE PAYABLE: ' : 'ACCOUNT SETTLED: '}
        </span>
        <span
          className="pending-balance-amount"
          style={{ color: pendingBalance > 0 ? '#ef4444' : '#22c55e' }}
        >
          {formatInvoiceINR(pendingBalance)}
        </span>
      </div>

      {/* SECTION: WORK / EXPENSE DETAILS */}
      {(activeTab === 'expenses' || activeTab === 'statement') && (
        <div className="statement-table-block">
          <div className="statement-section-title-row" style={{ fontSize: '18px' }}>
            INTERIOR WORK ITEMS & SPECIFICATIONS
          </div>

          <table className="statement-invoice-table" style={{ '--stmt-cell-padding': '9px 12px' } as React.CSSProperties}>
            <thead>
              <tr className="table-header-row">
                <th className="text-center" style={{ width: '8%' }}>S.NO</th>
                <th className="text-center" style={{ width: '14%' }}>DATE</th>
                <th className="text-center" style={{ width: '38%' }}>ITEM / DESCRIPTION</th>
                <th className="text-center" style={{ width: '10%' }}>QTY</th>
                <th className="text-center" style={{ width: '12%' }}>RATE</th>
                <th className="text-center" style={{ width: '18%' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', padding: '24px', color: '#666', fontStyle: 'italic' }}
                  >
                    No interior work records found for this client.
                  </td>
                </tr>
              ) : (
                expenses.map((exp, index) => (
                  <tr key={exp.id} className="invoice-data-row" style={{ fontSize: '18px' }}>
                    <td className="statement-cell">{index + 1}</td>
                    <td className="statement-cell">{formatToDDMMYYYY(exp.date)}</td>
                    <td
                      className="statement-cell"
                      style={{
                        textAlign: 'left',
                        paddingLeft: '16px',
                        textTransform: 'uppercase',
                        fontWeight: 700
                      }}
                    >
                      {exp.expenseName}
                    </td>
                    <td className="statement-cell" style={{ fontWeight: 600 }}>
                      {exp.quantity}
                    </td>
                    <td className="statement-cell" style={{ fontWeight: 600 }}>
                      {exp.rate ? exp.rate : '-'}
                    </td>
                    <td className="statement-cell" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {formatInvoiceINR(exp.totalAmount)}
                    </td>
                  </tr>
                ))
              )}

              {/* BOTTOM TOTAL ROW */}
              <tr className="invoice-total-row" style={{ fontSize: '18px' }}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="total-label-cell">TOTAL WORK</td>
                <td className="total-amount-cell">
                  {formatInvoiceINR(totalExpenses)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION: ADVANCE PAYMENTS */}
      {(activeTab === 'advances' || activeTab === 'statement') && (
        <div
          className="statement-table-block"
          style={{ marginTop: activeTab === 'statement' ? '20px' : 0 }}
        >
          <div className="statement-section-title-row" style={{ fontSize: '18px' }}>
            ADVANCE PAYMENTS RECEIVED
          </div>

          <table className="statement-invoice-table" style={{ '--stmt-cell-padding': '9px 12px' } as React.CSSProperties}>
            <thead>
              <tr className="table-header-row" style={{ fontSize: '18px' }}>
                <th className="text-center" style={{ width: '55px' }}>S.NO</th>
                <th className="text-center" style={{ width: '135px' }}>DATE</th>
                <th className="text-center">PAYMENT MODE / NOTES</th>
                <th className="text-center" style={{ width: '180px' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {advancePayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: 'center', padding: '24px', color: '#666', fontStyle: 'italic' }}
                  >
                    No advance payments recorded for this client.
                  </td>
                </tr>
              ) : (
                advancePayments.map((adv, index) => (
                  <tr key={adv.id} className="invoice-data-row" style={{ fontSize: '18px' }}>
                    <td className="statement-cell">{index + 1}</td>
                    <td className="statement-cell">{formatToDDMMYYYY(adv.date)}</td>
                    <td
                      className="statement-cell"
                      style={{
                        textTransform: 'uppercase',
                        fontWeight: 700
                      }}
                    >
                      {adv.mode}
                      {adv.note && (
                        <span style={{ fontSize: '12px', opacity: 0.8, marginLeft: '8px', textTransform: 'none' }}>
                          ({adv.note})
                        </span>
                      )}
                    </td>
                    <td className="statement-cell" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {formatInvoiceINR(adv.amount)}
                    </td>
                  </tr>
                ))
              )}

              {/* BOTTOM TOTAL ROW FOR ADVANCES */}
              <tr className="invoice-total-row" style={{ fontSize: '18px' }}>
                <td></td>
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

      {/* RECONCILIATION BAR */}
      {activeTab === 'statement' && (
        <div className="statement-final-reconciliation-row" style={{ fontSize: '18px' }}>
          <div className="reconciliation-item">
            <span>Total Work / Expenses:</span> <strong>{formatInvoiceINR(totalExpenses)}</strong>
          </div>
          <div className="reconciliation-item">
            <span>Total Advance:</span> <strong>{formatInvoiceINR(totalAdvance)}</strong>
          </div>
          <div
            className={`reconciliation-item reconciliation-pending ${pendingBalance > 0 ? 'is-due' : 'is-settled'}`}
          >
            <span>Net Balance Due:</span>{' '}
            <strong>{formatInvoiceINR(pendingBalance)}</strong>
          </div>
        </div>
      )}
    </PrintPreviewModal>
  );
};
