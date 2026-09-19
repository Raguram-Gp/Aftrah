import React from 'react';
import { PrintPreviewModal } from './PrintPreviewModal';
import { FileSpreadsheet } from 'lucide-react';
import type { StatementKind, StatementSnapshot } from '@/lib/statementSnapshot';
import { defaultStatementBrand } from '@/lib/statementSnapshot';

export interface TablePrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badgeLabel?: string;
  badgeIcon?: React.ReactNode;
  companyName?: string;
  companySub?: string;
  metaTitle?: string;
  metaValue?: string;
  dateText?: string;
  highlightBanner?: {
    label: string;
    value: string;
    isNegative?: boolean;
    color?: string;
  };
  summaryItems?: {
    label: string;
    value: string | number;
    highlightColor?: string;
  }[];
  sectionTitle?: string;
  headers: string[];
  colWidths?: string[];
  colAlignments?: ('left' | 'center' | 'right')[];
  rows: (string | number | React.ReactNode)[][];
  totalRow?: {
    labelIndex?: number;
    label?: string;
    values: (string | number | React.ReactNode)[];
  };
  children?: React.ReactNode;
  shareKind?: StatementKind;
  shareEntityId?: string | null;
  shareTitle?: string;
}

function extractCellText(cell: string | number | React.ReactNode): string {
  if (cell === null || cell === undefined) return '';
  if (typeof cell === 'string' || typeof cell === 'number') return String(cell);

  if (Array.isArray(cell)) {
    return cell.map((child) => extractCellText(child)).filter(Boolean).join(' ');
  }

  if (React.isValidElement(cell)) {
    const props = cell.props as { children?: React.ReactNode };
    if (props.children !== undefined && props.children !== null) {
      return extractCellText(props.children);
    }
  }

  return String(cell);
}

function buildTableSharePayload(args: {
  title: string;
  companyName?: string;
  companySub?: string;
  metaValue?: string;
  dateText: string;
  sectionTitle?: string;
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  totalRow?: TablePrintPreviewModalProps['totalRow'];
  summaryItems?: TablePrintPreviewModalProps['summaryItems'];
  highlightBanner?: TablePrintPreviewModalProps['highlightBanner'];
}): StatementSnapshot {
  const brand = defaultStatementBrand();

  const summary: StatementSnapshot['summary'] = [
    ...(args.summaryItems?.map((item) => ({
      label: item.label,
      value: String(item.value),
    })) ?? []),
    ...(args.highlightBanner
      ? [{ label: args.highlightBanner.label, value: args.highlightBanner.value }]
      : []),
  ];

  const stringRows = args.rows.map((row) => row.map((cell) => extractCellText(cell)));

  let totalLabel: string | undefined;
  let totalValue: string | undefined;

  if (args.totalRow) {
    const labelIdx = args.totalRow.labelIndex ?? 1;
    const stringValues = args.totalRow.values.map((val) => extractCellText(val));
    totalLabel =
      args.totalRow.label ??
      stringValues[labelIdx] ??
      undefined;

    for (let i = stringValues.length - 1; i >= 0; i -= 1) {
      if (i === labelIdx) continue;
      const val = stringValues[i]?.trim();
      if (val) {
        totalValue = val;
        break;
      }
    }

    if (!totalValue && totalLabel) {
      summary.push({ label: totalLabel, value: stringValues.filter(Boolean).join(' · ') || '—' });
      totalLabel = undefined;
    }
  }

  return {
    ...brand,
    company: args.companyName ?? brand.company,
    subtitle: args.companySub ?? brand.subtitle,
    party: { name: args.metaValue || args.title },
    dateLabel: args.dateText,
    sections: [
      {
        title: args.sectionTitle || args.title,
        columns: args.headers,
        rows: stringRows,
        ...(totalLabel ? { totalLabel, totalValue } : {}),
      },
    ],
    summary,
    capturedAt: new Date().toISOString(),
  };
}

export const TablePrintPreviewModal: React.FC<TablePrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  badgeLabel,
  badgeIcon,
  companyName = 'AFRAH CONSTRUCTIONS',
  companySub = 'CIVIL CONSTRUCTION, MATERIALS PROCUREMENT & FINANCIAL ERP',
  metaTitle,
  metaValue,
  dateText,
  highlightBanner,
  summaryItems,
  sectionTitle,
  headers,
  colWidths: _colWidths,
  colAlignments,
  rows,
  totalRow,
  children,
  shareKind,
  shareEntityId,
  shareTitle,
}) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const resolvedDateText = dateText || today;
  const sharePayload =
    shareKind != null
      ? buildTableSharePayload({
          title,
          companyName,
          companySub,
          metaValue,
          dateText: resolvedDateText,
          sectionTitle,
          headers,
          rows,
          totalRow,
          summaryItems,
          highlightBanner,
        })
      : undefined;

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      badgeLabel={badgeLabel || title}
      badgeIcon={badgeIcon || <FileSpreadsheet size={16} color="var(--primary, #e2c399)" />}
      companyName={companyName}
      companySub={companySub}
      shareKind={shareKind}
      shareEntityId={shareEntityId}
      shareTitle={shareTitle ?? title}
      sharePayload={sharePayload}
    >
      {/* META ROW */}
      <div className="statement-meta-row" style={{ fontSize: '18px' }}>
        <div className="meta-left">
          {metaTitle && <span className="meta-label">{metaTitle}:</span>}{' '}
          <span className="meta-name-value">{metaValue || title.toUpperCase()}</span>
        </div>
        <div className="meta-right">
          <span className="meta-label">DATE:</span>{' '}
          <span className="meta-date-value">{resolvedDateText}</span>
        </div>
      </div>

      {/* HIGHLIGHT BANNER ROW IF PROVIDED */}
      {highlightBanner && (
        <div className="statement-pending-balance-row" style={{ fontSize: '18px' }}>
          <span className="pending-balance-label">{highlightBanner.label}: </span>
          <span
            className="pending-balance-amount"
            style={{ color: highlightBanner.color || (highlightBanner.isNegative ? '#ef4444' : '#22c55e') }}
          >
            {highlightBanner.value}
          </span>
        </div>
      )}

      {/* TABLE SECTION */}
      {children || (
        <div className="statement-table-block">
          {sectionTitle && (
            <div className="statement-section-title-row" style={{ fontSize: '18px' }}>
              {sectionTitle}
            </div>
          )}

          <table className="statement-invoice-table" style={{ '--stmt-cell-padding': '9px 12px' } as React.CSSProperties}>
            <thead>
              <tr className="table-header-row" style={{ fontSize: '18px' }}>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className={colAlignments?.[i] ? `text-${colAlignments[i]}` : 'text-center'}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    style={{ textAlign: 'center', padding: '28px', color: '#888', fontStyle: 'italic' }}
                  >
                    No records found to display.
                  </td>
                </tr>
              ) : (
                rows.map((row, rIdx) => (
                  <tr key={rIdx} className="invoice-data-row" style={{ fontSize: '18px' }}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="statement-cell"
                        style={{
                          textAlign: colAlignments?.[cIdx] || 'center',
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {/* TOTAL ROW IF DEFINED */}
              {totalRow && (
                <tr className="invoice-total-row" style={{ fontSize: '18px' }}>
                  {totalRow.values.map((val, idx) => (
                    <td
                      key={idx}
                      className={
                        idx === (totalRow.labelIndex ?? 1)
                          ? 'total-label-cell'
                          : val !== '' && val !== null && val !== undefined
                          ? 'total-amount-cell'
                          : ''
                      }
                      style={{
                        textAlign: colAlignments?.[idx] || 'center',
                      }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUMMARY / RECONCILIATION BAR */}
      {summaryItems && summaryItems.length > 0 && (
        <div className="statement-final-reconciliation-row" style={{ fontSize: '18px' }}>
          {summaryItems.map((item, idx) => (
            <div key={idx} className="reconciliation-item">
              <span>{item.label}:</span>{' '}
              <strong style={{ color: item.highlightColor }}>{item.value}</strong>
            </div>
          ))}
        </div>
      )}
    </PrintPreviewModal>
  );
};
