import React from 'react';
import type { Vendor, VendorShop, ShopTransaction } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import { PrintPreviewModal } from './PrintPreviewModal';
import { Store } from 'lucide-react';
import type { StatementSnapshot } from '@/lib/statementSnapshot';
import { defaultStatementBrand } from '@/lib/statementSnapshot';

interface ShopPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor;
  shop: VendorShop;
  transactions: ShopTransaction[];
  fromDate?: string;
  toDate?: string;
  totalPurchase: number;
  totalReceived: number;
  totalBalance: number;
}

export const ShopPrintPreviewModal: React.FC<ShopPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  vendor,
  shop,
  transactions,
  fromDate,
  toDate,
  totalPurchase,
  totalReceived,
  totalBalance
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
  const dateLabel =
    fromDate && toDate
      ? `${formatToDDMMYYYY(fromDate)} to ${formatToDDMMYYYY(toDate)}`
      : fromDate
        ? `From ${formatToDDMMYYYY(fromDate)}`
        : toDate
          ? `Up to ${formatToDDMMYYYY(toDate)}`
          : formattedToday;

  const ledgerRows: string[][] =
    transactions.length === 0
      ? [['—', '—', '—', 'No transaction records found for this vendor shop.', '', '', '', '', '']]
      : transactions.map((tx, index) => {
          let itemDescription = tx.itemType.toUpperCase();
          if (tx.clientName) itemDescription += ` · Client/Site: ${tx.clientName}`;

          return [
            String(index + 1),
            formatToDDMMYYYY(tx.date),
            '-',
            itemDescription,
            tx.quantity ? String(tx.quantity) : '-',
            tx.rate ? `₹${tx.rate}` : '-',
            formatInvoiceINR(tx.totalAmount),
            formatInvoiceINR(tx.receivedAmount),
            formatInvoiceINR(tx.balanceAmount),
          ];
        });

  ledgerRows.push([
    '',
    '',
    '',
    'TOTAL',
    '',
    '',
    formatInvoiceINR(totalPurchase),
    formatInvoiceINR(totalReceived),
    formatInvoiceINR(totalBalance),
  ]);

  const sharePayload: StatementSnapshot = {
    ...defaultStatementBrand(),
    party: {
      name: shop.name.toUpperCase(),
      phone: shop.phone,
      extra: [vendor.type],
    },
    dateLabel,
    sections: [
      {
        title: `PURCHASES & SETTLEMENT TRANSACTIONS (${transactions.length})`,
        columns: ['S.NO', 'DATE', 'BILL NO', 'ITEM / DESCRIPTION', 'QTY', 'RATE', 'PURCHASE', 'PAID', 'BALANCE'],
        rows: ledgerRows,
      },
    ],
    summary: [
      { label: 'Total Purchases', value: formatInvoiceINR(totalPurchase) },
      { label: 'Amount Settled / Paid', value: formatInvoiceINR(totalReceived) },
      { label: 'Outstanding Balance', value: formatInvoiceINR(totalBalance) },
    ],
    capturedAt: new Date().toISOString(),
  };

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Vendor Supplier Statement"
      badgeLabel="Vendor Supplier Statement"
      badgeIcon={<Store size={16} color="var(--primary, #e2c399)" />}
      shareKind="shop"
      shareEntityId={shop.id}
      shareTitle={shop.name}
      sharePayload={sharePayload}
    >
      {/* VENDOR & DATE ROW */}
      <div className="statement-meta-row" style={{ fontSize: '18px' }}>
        <div className="meta-left">
          <span className="meta-label">VENDOR:</span>{' '}
          <span className="meta-name-value">{shop.name.toUpperCase()}</span>
          <span style={{ fontSize: '14px', marginLeft: '10px', opacity: 0.85 }}>
            ({vendor.type} Supplier · {shop.phone})
          </span>
        </div>
        <div className="meta-right">
          <span className="meta-label">DATE:</span>{' '}
          <span className="meta-date-value">{dateLabel}</span>
        </div>
      </div>

      {/* PENDING BALANCE ROW */}
      <div className="statement-pending-balance-row" style={{ fontSize: '18px' }}>
        <span className="pending-balance-label">
          {totalBalance > 0 ? 'PENDING BALANCE PAYABLE: ' : 'SETTLED BALANCE: '}
        </span>
        <span
          className="pending-balance-amount"
          style={{ color: totalBalance > 0 ? '#ef4444' : '#22c55e' }}
        >
          {formatInvoiceINR(totalBalance)}
        </span>
      </div>

      {/* TRANSACTIONS SECTION */}
      <div className="statement-table-block">
        <div className="statement-section-title-row" style={{ fontSize: '18px' }}>
          PURCHASES & SETTLEMENT TRANSACTIONS ({transactions.length})
        </div>

        <table className="statement-invoice-table" style={{ '--stmt-cell-padding': '9px 12px' } as React.CSSProperties}>
          <thead>
            <tr className="table-header-row">
              <th className="text-center" style={{ width: '6%' }}>S.NO</th>
              <th className="text-center" style={{ width: '11%' }}>DATE</th>
              <th className="text-center" style={{ width: '10%' }}>BILL NO</th>
              <th className="text-center" style={{ width: '24%' }}>ITEM / DESCRIPTION</th>
              <th className="text-center" style={{ width: '7%' }}>QTY</th>
              <th className="text-center" style={{ width: '8%' }}>RATE</th>
              <th className="text-center" style={{ width: '12%' }}>PURCHASE</th>
              <th className="text-center" style={{ width: '11%' }}>PAID</th>
              <th className="text-center" style={{ width: '11%' }}>BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: 'center', padding: '28px', color: '#888', fontStyle: 'italic' }}
                >
                  No transaction records found for this vendor shop.
                </td>
              </tr>
            ) : (
              transactions.map((tx, index) => (
                <tr key={tx.id} className="invoice-data-row">
                  <td className="statement-cell">{index + 1}</td>
                  <td className="statement-cell">{formatToDDMMYYYY(tx.date)}</td>
                  <td className="statement-cell" style={{ fontWeight: 600 }}>
                    -
                  </td>
                  <td
                    className="statement-cell"
                    style={{
                      textAlign: 'left',
                      paddingLeft: '8px',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}
                  >
                    <div>{tx.itemType}</div>
                    {tx.clientName && (
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary, #e2c399)' }}>
                        Client/Site: {tx.clientName}
                      </div>
                    )}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 600 }}>
                    {tx.quantity || '-'}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 600 }}>
                    {tx.rate ? `₹${tx.rate}` : '-'}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {formatInvoiceINR(tx.totalAmount)}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
                    {formatInvoiceINR(tx.receivedAmount)}
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
            <tr className="invoice-total-row">
              <td></td>
              <td></td>
              <td></td>
              <td className="total-label-cell">TOTAL</td>
              <td></td>
              <td></td>
              <td className="total-amount-cell">
                {formatInvoiceINR(totalPurchase)}
              </td>
              <td className="total-amount-cell" style={{ color: '#16a34a' }}>
                {formatInvoiceINR(totalReceived)}
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
          <span>Total Records:</span> <strong>{transactions.length} Transactions</strong>
        </div>
        <div className="reconciliation-item">
          <span>Total Purchases:</span> <strong>{formatInvoiceINR(totalPurchase)}</strong>
        </div>
        <div className="reconciliation-item">
          <span>Amount Settled / Paid:</span> <strong>{formatInvoiceINR(totalReceived)}</strong>
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
