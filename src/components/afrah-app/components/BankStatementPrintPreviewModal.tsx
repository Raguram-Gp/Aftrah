import React from 'react';
import type { BankAccount, BankTransaction } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import { PrintPreviewModal } from './PrintPreviewModal';
import { Landmark } from 'lucide-react';

interface BankStatementPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccount: BankAccount;
  transactions: BankTransaction[];
  fromDate?: string;
  toDate?: string;
  totalCredits: number;
  totalDebits: number;
  currentBalance: number;
}

export const BankStatementPrintPreviewModal: React.FC<BankStatementPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  bankAccount,
  transactions,
  fromDate,
  toDate,
  totalCredits,
  totalDebits,
  currentBalance
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
      title="Bank Passbook Statement"
      badgeLabel="Bank Passbook Statement"
      badgeIcon={<Landmark size={16} color="var(--primary, #e2c399)" />}
    >
      {/* BANK & DATE ROW */}
      <div className="statement-meta-row" style={{ fontSize: '18px' }}>
        <div className="meta-left">
          <span className="meta-label">BANK / A/C:</span>{' '}
          <span className="meta-name-value">{bankAccount.bankName.toUpperCase()}</span>
          <span style={{ fontSize: '14px', marginLeft: '10px', opacity: 0.85 }}>
            (A/C: {bankAccount.accountNumber || '—'} · {bankAccount.branch || '—'} · IFSC: {bankAccount.ifscCode || '—'})
          </span>
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

      {/* CURRENT CLOSING BALANCE ROW */}
      <div className="statement-pending-balance-row" style={{ fontSize: '18px' }}>
        <span className="pending-balance-label">CURRENT CLOSING BALANCE: </span>
        <span
          className="pending-balance-amount"
          style={{ color: currentBalance >= 0 ? '#22c55e' : '#ef4444' }}
        >
          {formatInvoiceINR(currentBalance)}
        </span>
      </div>

      {/* PASSBOOK LEDGER TRANSACTIONS SECTION */}
      <div className="statement-table-block">
        <div className="statement-section-title-row" style={{ fontSize: '18px' }}>
          PASSBOOK LEDGER TRANSACTIONS ({transactions.length})
        </div>

        <table className="statement-invoice-table" style={{ '--stmt-cell-padding': '9px 12px' } as React.CSSProperties}>
          <thead>
            <tr className="table-header-row" style={{ fontSize: '18px' }}>
              <th className="text-center" style={{ width: '55px' }}>S.NO</th>
              <th className="text-center" style={{ width: '120px' }}>DATE</th>
              <th className="text-center">PARTICULARS / DESCRIPTION</th>
              <th className="text-center" style={{ width: '130px' }}>REF / CHQ NO</th>
              <th className="text-center" style={{ width: '140px' }}>WITHDRAWAL (DR)</th>
              <th className="text-center" style={{ width: '140px' }}>DEPOSIT (CR)</th>
              <th className="text-center" style={{ width: '150px' }}>BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: 'center', padding: '28px', color: '#888', fontStyle: 'italic' }}
                >
                  No ledger transactions recorded for this account.
                </td>
              </tr>
            ) : (
              transactions.map((tx, index) => {
                const isDeposit = tx.type === 'credit' || tx.type === 'deposit';
                return (
                  <tr key={tx.id} className="invoice-data-row" style={{ fontSize: '18px' }}>
                    <td className="statement-cell">{index + 1}</td>
                    <td className="statement-cell">{formatToDDMMYYYY(tx.date)}</td>
                    <td
                      className="statement-cell"
                      style={{
                        textAlign: 'left',
                        paddingLeft: '16px',
                        fontWeight: 600
                      }}
                    >
                      {tx.note || '—'}
                    </td>
                    <td className="statement-cell" style={{ fontWeight: 500 }}>
                      {'-'}
                    </td>
                    <td
                      className="statement-cell"
                      style={{
                        fontWeight: 700,
                        color: !isDeposit ? '#dc2626' : undefined,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {!isDeposit ? formatInvoiceINR(tx.amount) : '-'}
                    </td>
                    <td
                      className="statement-cell"
                      style={{
                        fontWeight: 700,
                        color: isDeposit ? '#16a34a' : undefined,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isDeposit ? formatInvoiceINR(tx.amount) : '-'}
                    </td>
                    <td className="statement-cell" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {tx.balanceAfter !== undefined ? formatInvoiceINR(tx.balanceAfter) : '-'}
                    </td>
                  </tr>
                );
              })
            )}

            {/* BOTTOM TOTAL ROW */}
            <tr className="invoice-total-row" style={{ fontSize: '18px' }}>
              <td></td>
              <td></td>
              <td className="total-label-cell">TOTALS</td>
              <td></td>
              <td className="total-amount-cell" style={{ color: '#dc2626' }}>
                {formatInvoiceINR(totalDebits)}
              </td>
              <td className="total-amount-cell" style={{ color: '#16a34a' }}>
                {formatInvoiceINR(totalCredits)}
              </td>
              <td
                className="total-amount-cell"
                style={{ color: currentBalance >= 0 ? '#16a34a' : '#dc2626' }}
              >
                {formatInvoiceINR(currentBalance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FINAL SUMMARY ROW */}
      <div className="statement-final-reconciliation-row" style={{ fontSize: '18px' }}>
        <div className="reconciliation-item">
          <span>Total Entries:</span> <strong>{transactions.length} Records</strong>
        </div>
        <div className="reconciliation-item">
          <span>Total Withdrawals (Debit):</span> <strong style={{ color: '#dc2626' }}>{formatInvoiceINR(totalDebits)}</strong>
        </div>
        <div className="reconciliation-item">
          <span>Total Deposits (Credit):</span> <strong style={{ color: '#16a34a' }}>{formatInvoiceINR(totalCredits)}</strong>
        </div>
        <div
          className={`reconciliation-item reconciliation-pending ${currentBalance >= 0 ? 'is-settled' : 'is-due'}`}
        >
          <span>Closing Net Balance:</span>{' '}
          <strong>{formatInvoiceINR(currentBalance)}</strong>
        </div>
      </div>
    </PrintPreviewModal>
  );
};
