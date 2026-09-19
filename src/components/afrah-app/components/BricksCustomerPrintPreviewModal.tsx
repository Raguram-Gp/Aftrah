import React from 'react';
import type { BrickCustomer, BrickTransaction } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import { PrintPreviewModal } from './PrintPreviewModal';
import { BrickWall } from 'lucide-react';

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

  const formatInvoiceINR = (val: number) => {
    const formatted = Math.abs(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `₹${formatted}/-`;
  };

  const currentDate = new Date();
  const formattedToday = formatToDDMMYYYY(currentDate.toISOString().slice(0, 10));

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bricks Customer Statement"
      badgeLabel="Bricks Customer Statement"
      badgeIcon={<BrickWall size={16} color="var(--primary, #e2c399)" />}
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
          <thead>
            <tr className="table-header-row" style={{ fontSize: '18px' }}>
              <th className="text-center" style={{ width: '55px' }}>S.NO</th>
              <th className="text-center" style={{ width: '125px' }}>DATE</th>
              <th className="text-center">BRICK TYPE / DESCRIPTION</th>
              <th className="text-center" style={{ width: '95px' }}>QTY</th>
              <th className="text-center" style={{ width: '95px' }}>RATE</th>
              <th className="text-center" style={{ width: '140px' }}>TOTAL</th>
              <th className="text-center" style={{ width: '130px' }}>PAID</th>
              <th className="text-center" style={{ width: '140px' }}>BALANCE</th>
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
                    {tx.siteLocation && (
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)' }}>
                        Site: {tx.siteLocation}
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
