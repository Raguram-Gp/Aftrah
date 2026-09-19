import React from 'react';
import type { LabourContract, LabourContractEntry } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import { PrintPreviewModal } from './PrintPreviewModal';
import { HardHat } from 'lucide-react';

interface LabourContractPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: LabourContract;
  entries: LabourContractEntry[];
  labourCharge: number;
  paidAmount: number;
  balanceAmount: number;
  contractType?: 'construction' | 'interior';
}

export const LabourContractPrintPreviewModal: React.FC<LabourContractPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  contract,
  entries,
  labourCharge,
  paidAmount,
  balanceAmount,
  contractType = 'construction'
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
  const totalDays = entries.reduce((sum, e) => sum + (e.days || 0), 0);

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={contractType === 'construction' ? 'Labour Muster Roll Statement' : 'Interior Labour Statement'}
      badgeLabel={contractType === 'construction' ? 'Labour Muster Roll' : 'Interior Labour Statement'}
      badgeIcon={<HardHat size={16} color="var(--primary, #e2c399)" />}
    >
      {/* CONTRACTOR INFO ROW */}
      <div className="statement-meta-row" style={{ fontSize: '18px' }}>
        <div className="meta-left">
          <span className="meta-label">CONTRACTOR:</span>{' '}
          <span className="meta-name-value">{contract.labourName.toUpperCase()}</span>
          {contract.phone && (
            <span style={{ fontSize: '14px', marginLeft: '10px', opacity: 0.85 }}>
              ({contract.phone})
            </span>
          )}
          {contract.siteName && (
            <span style={{ fontSize: '13px', marginLeft: '12px', color: 'var(--primary, #e2c399)' }}>
              Site: {contract.siteName}
            </span>
          )}
        </div>
        <div className="meta-right">
          <span className="meta-label">DATE:</span>{' '}
          <span className="meta-date-value">{formattedToday}</span>
        </div>
      </div>

      {/* BALANCE PAYABLE ROW */}
      <div className="statement-pending-balance-row" style={{ fontSize: '18px' }}>
        <span className="pending-balance-label">
          {balanceAmount > 0 ? 'BALANCE PAYABLE: ' : 'CONTRACT SETTLED: '}
        </span>
        <span
          className="pending-balance-amount"
          style={{ color: balanceAmount > 0 ? '#ef4444' : '#22c55e' }}
        >
          {formatInvoiceINR(balanceAmount)}
        </span>
      </div>

      {/* MUSTER ROLL ENTRIES TABLE */}
      <div className="statement-table-block">
        <div className="statement-section-title-row" style={{ fontSize: '18px' }}>
          DAILY MUSTER ROLL & WORK ENTRIES ({entries.length})
        </div>

        <table className="statement-invoice-table" style={{ '--stmt-cell-padding': '9px 12px' } as React.CSSProperties}>
          <thead>
            <tr className="table-header-row" style={{ fontSize: '18px' }}>
              <th className="text-center" style={{ width: '72px' }}>S.NO</th>
              <th className="text-center" style={{ width: '110px' }}>DATE</th>
              <th className="text-center">WORK TYPE / SCOPE</th>
              <th className="text-center" style={{ width: '70px' }}>DAYS</th>
              <th className="text-center" style={{ width: '110px' }}>RATE / DAY</th>
              <th className="text-center" style={{ width: '130px' }}>AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: 'center', padding: '28px', color: '#888', fontStyle: 'italic' }}
                >
                  No daily muster work entries found for this contract.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr key={entry.id} className="invoice-data-row" style={{ fontSize: '18px' }}>
                  <td className="statement-cell">{index + 1}</td>
                  <td className="statement-cell">{formatToDDMMYYYY(entry.date)}</td>
                  <td
                    className="statement-cell"
                    style={{
                      textAlign: 'left',
                      paddingLeft: '16px',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}
                  >
                    <div>{entry.workType}</div>
                    {entry.note && (
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)', textTransform: 'none' }}>
                        {entry.note}
                      </div>
                    )}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 600 }}>
                    {entry.days}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 600 }}>
                    {entry.salaryPerDay ? `₹${entry.salaryPerDay}` : '-'}
                  </td>
                  <td className="statement-cell" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {formatInvoiceINR(entry.totalAmount)}
                  </td>
                </tr>
              ))
            )}

            {/* BOTTOM TOTAL ROW */}
            <tr className="invoice-total-row" style={{ fontSize: '18px' }}>
              <td></td>
              <td></td>
              <td className="total-label-cell">TOTAL</td>
              <td style={{ textAlign: 'center', fontWeight: 800 }}>{totalDays}</td>
              <td></td>
              <td className="total-amount-cell">
                {formatInvoiceINR(paidAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FINAL SUMMARY ROW */}
      <div className="statement-final-reconciliation-row" style={{ fontSize: '14px' }}>
        <div className="reconciliation-item">
          <span>Agreed Contract Charge:</span> <strong>{formatInvoiceINR(labourCharge)}</strong>
        </div>
        <div className="reconciliation-item">
          <span>Total Paid to Date:</span> <strong style={{ color: '#16a34a' }}>{formatInvoiceINR(paidAmount)}</strong>
        </div>
        <div
          className={`reconciliation-item reconciliation-pending ${balanceAmount > 0 ? 'is-due' : 'is-settled'}`}
        >
          <span>Balance Payable:</span>{' '}
          <strong>{formatInvoiceINR(balanceAmount)}</strong>
        </div>
      </div>
    </PrintPreviewModal>
  );
};
