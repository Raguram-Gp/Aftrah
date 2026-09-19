import React from 'react';
import type { BrickCustomer, BrickTransaction } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import { PrintPreviewModal } from './PrintPreviewModal';
import { BrickWall } from 'lucide-react';
import type { StatementSnapshot } from '@/lib/statementSnapshot';
import { defaultStatementBrand } from '@/lib/statementSnapshot';

const formatInvoiceINR = (val: number) => {
  const formatted = Math.abs(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹${formatted}/-`;
};

function formatBrickDescription(tx: BrickTransaction): string {
  const parts = [tx.brickType.toUpperCase()];
  if (tx.notes) parts.push(tx.notes);
  if (tx.siteLocation) parts.push(`Site: ${tx.siteLocation}`);
  return parts.join(' · ');
}

function buildBrickCustomerPayload(args: {
  customer: BrickCustomer;
  transactions: BrickTransaction[];
  fromDate?: string;
  toDate?: string;
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
  totalQuantity: number;
}): StatementSnapshot {
  const {
    customer,
    transactions,
    fromDate,
    toDate,
    totalAmount,
    totalPaid,
    totalBalance,
    totalQuantity,
  } = args;

  const brand = defaultStatementBrand('bricks');
  const formattedToday = formatToDDMMYYYY(new Date().toISOString().slice(0, 10));
  const dateLabel =
    fromDate && toDate
      ? `${formatToDDMMYYYY(fromDate)} to ${formatToDDMMYYYY(toDate)}`
      : fromDate
        ? `From ${formatToDDMMYYYY(fromDate)}`
        : toDate
          ? `Up to ${formatToDDMMYYYY(toDate)}`
          : formattedToday;

  const dataRows =
    transactions.length === 0
      ? [['—', 'No transaction records found for this customer.', '', '', '', '', '']]
      : transactions.map((tx) => [
          formatToDDMMYYYY(tx.date),
          formatBrickDescription(tx),
          tx.quantity ? tx.quantity.toLocaleString('en-IN') : '-',
          tx.rate ? `₹${tx.rate}` : '-',
          formatInvoiceINR(tx.totalAmount),
          formatInvoiceINR(tx.paidAmount),
          formatInvoiceINR(tx.balanceAmount),
        ]);

  const rows = [
    ...dataRows,
    [
      '',
      'TOTAL',
      totalQuantity.toLocaleString('en-IN'),
      '',
      formatInvoiceINR(totalAmount),
      formatInvoiceINR(totalPaid),
      formatInvoiceINR(totalBalance),
    ],
  ];

  return {
    ...brand,
    party: { name: customer.name.toUpperCase(), phone: customer.phone },
    dateLabel,
    sections: [
      {
        title: `DELIVERY ENTRIES & LEDGER TRANSACTIONS (${transactions.length})`,
        columns: ['DATE', 'BRICK TYPE / DESCRIPTION', 'QTY', 'RATE', 'TOTAL', 'PAID', 'BALANCE'],
        rows,
      },
    ],
    summary: [
      {
        label: 'Total Deliveries',
        value: `${transactions.length} Batches (${totalQuantity.toLocaleString('en-IN')} units)`,
      },
      { label: 'Total Billing', value: formatInvoiceINR(totalAmount) },
      { label: 'Total Paid', value: formatInvoiceINR(totalPaid) },
      { label: 'Outstanding Balance', value: formatInvoiceINR(totalBalance) },
    ],
    capturedAt: new Date().toISOString(),
  };
}

interface BricksCustomerPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: BrickCustomer;
  transactions: BrickTransaction[];
  fromDate?: string;
  toDate?: string;
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
  totalOrders: number;
  totalQuantity: number;
}

export const BricksCustomerPrintPreviewModal: React.FC<BricksCustomerPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  customer,
  transactions,
  fromDate,
  toDate,
  totalAmount,
  totalPaid,
  totalBalance,
  totalOrders: _totalOrders,
  totalQuantity
}) => {
  if (!isOpen) return null;

  const currentDate = new Date();
  const formattedToday = formatToDDMMYYYY(currentDate.toISOString().slice(0, 10));

  const sharePayload = buildBrickCustomerPayload({
    customer,
    transactions,
    fromDate,
    toDate,
    totalAmount,
    totalPaid,
    totalBalance,
    totalQuantity,
  });

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bricks Customer Statement"
      badgeLabel="Bricks Customer Statement"
      badgeIcon={<BrickWall size={16} color="var(--primary, #e2c399)" />}
      brand="bricks"
      shareKind="brick_customer"
      shareEntityId={customer.id}
      shareTitle={customer.name}
      sharePayload={sharePayload}
    >
      {/* CUSTOMER NAME & DATE ROW */}
      <div className="statement-meta-row" style={{ fontSize: '18px' }}>
        <div className="meta-left">
          <span className="meta-label">CUSTOMER:</span>{' '}
          <span className="meta-name-value">{customer.name.toUpperCase()}</span>
          {customer.phone && (
            <span style={{ fontSize: '14px', marginLeft: '12px', opacity: 0.85 }}>
              ({customer.phone})
            </span>
          )}
        </div>
        <div className="meta-right">
          <span className="meta-label">DATE:</span>{' '}
          <span className="meta-date-value">
            {fromDate && toDate
              ? `${formatToDDMMYYYY(fromDate)} to ${formatToDDMMYYYY(toDate)}`
              : fromDate
              ? `From ${formatToDDMMYYYY(fromDate)}`
              : toDate
              ? `Up to ${formatToDDMMYYYY(toDate)}`
              : formattedToday}
          </span>
        </div>
      </div>

      {/* OUTSTANDING BALANCE ROW */}
      <div className="statement-pending-balance-row" style={{ fontSize: '18px' }}>
        <span className="pending-balance-label">
          {totalBalance > 0 ? 'OUTSTANDING BALANCE: ' : 'ACCOUNT BALANCE: '}
        </span>
        <span
          className="pending-balance-amount"
          style={{ color: totalBalance > 0 ? '#ef4444' : '#22c55e' }}
        >
          {formatInvoiceINR(totalBalance)}
        </span>
      </div>

      {/* DELIVERIES & TRANSACTIONS SECTION */}
      <div className="statement-table-block">
        <div className="statement-section-title-row" style={{ fontSize: '18px' }}>
          DELIVERY ENTRIES & LEDGER TRANSACTIONS ({transactions.length})
        </div>

        <table className="statement-invoice-table" style={{ '--stmt-cell-padding': '9px 12px' } as React.CSSProperties}>
          <colgroup>
            <col style={{ width: '6%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} />
          </colgroup>
          <thead>
            <tr className="table-header-row" style={{ fontSize: '18px' }}>
              <th className="text-center">S.NO</th>
              <th className="text-center">DATE</th>
              <th className="text-center">BRICK TYPE / DESCRIPTION</th>
              <th className="text-center">QTY</th>
              <th className="text-center">RATE</th>
              <th className="text-center">TOTAL</th>
              <th className="text-center">PAID</th>
              <th className="text-center">BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ textAlign: 'center', padding: '28px', color: '#888', fontStyle: 'italic' }}
                >
                  No transaction records found for this customer.
                </td>
              </tr>
            ) : (
              transactions.map((tx, index) => (
                <tr key={tx.id} className="invoice-data-row" style={{ fontSize: '18px' }}>
                  <td className="statement-cell">{index + 1}</td>
                  <td className="statement-cell">{formatToDDMMYYYY(tx.date)}</td>
                  <td
                    className="statement-cell"
                    style={{
                      textAlign: 'left',
                      paddingLeft: '16px',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}
                  >
                    <div>{tx.brickType}</div>
                    {tx.notes && (
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)', marginTop: '2px' }}>
                        {tx.notes}
                      </div>
                    )}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 600 }}>
                    {tx.quantity ? tx.quantity.toLocaleString('en-IN') : '-'}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 600 }}>
                    {tx.rate ? `₹${tx.rate}` : '-'}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {formatInvoiceINR(tx.totalAmount)}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
                    {formatInvoiceINR(tx.paidAmount)}
                  </td>
                  <td
                    className="statement-cell"
                    style={{
                      fontWeight: 700,
                      color: tx.balanceAmount > 0 ? '#dc2626' : '#16a34a',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {formatInvoiceINR(tx.balanceAmount)}
                  </td>
                </tr>
              ))
            )}

            {/* BOTTOM TOTALS ROW */}
            <tr className="invoice-total-row" style={{ fontSize: '18px' }}>
              <td></td>
              <td></td>
              <td className="total-label-cell">TOTAL</td>
              <td style={{ textAlign: 'center', fontWeight: 800 }}>
                {totalQuantity.toLocaleString('en-IN')}
              </td>
              <td></td>
              <td className="total-amount-cell">
                {formatInvoiceINR(totalAmount)}
              </td>
              <td className="total-amount-cell" style={{ color: '#16a34a' }}>
                {formatInvoiceINR(totalPaid)}
              </td>
              <td
                className="total-amount-cell"
                style={{ color: totalBalance > 0 ? '#dc2626' : '#16a34a' }}
              >
                {formatInvoiceINR(totalBalance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FINAL RECONCILIATION BAR */}
      <div className="statement-final-reconciliation-row" style={{ fontSize: '18px' }}>
        <div className="reconciliation-item">
          <span>Total Deliveries:</span> <strong>{transactions.length} Batches ({totalQuantity.toLocaleString('en-IN')} units)</strong>
        </div>
        <div className="reconciliation-item">
          <span>Total Billing:</span> <strong>{formatInvoiceINR(totalAmount)}</strong>
        </div>
        <div className="reconciliation-item">
          <span>Total Paid:</span> <strong>{formatInvoiceINR(totalPaid)}</strong>
        </div>
        <div
          className={`reconciliation-item reconciliation-pending ${totalBalance > 0 ? 'is-due' : 'is-settled'}`}
        >
          <span>Outstanding Balance:</span>{' '}
          <strong>{formatInvoiceINR(totalBalance)}</strong>
        </div>
      </div>
    </PrintPreviewModal>
  );
};
