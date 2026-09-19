import type { CSSProperties } from 'react';
import type { StatementSnapshot } from '@/lib/statementSnapshot';
import '../afrah-app/styles/_print.css';

const FONT_META = '18px';
const FONT_TITLE = '18px';
const FONT_BODY = '18px';
const FONT_TH = '18px';
const FONT_TOTAL = '18px';
const CELL_PADDING = '9px 12px';

export interface SharedStatementSheetProps {
  payload: StatementSnapshot;
}

function findPendingSummaryItem(summary: StatementSnapshot['summary']) {
  return summary.find((item) => /pending/i.test(item.label));
}

export function SharedStatementSheet({ payload }: SharedStatementSheetProps) {
  const { company, subtitle, address, party, dateLabel, sections, summary } = payload;
  const pendingItem = findPendingSummaryItem(summary);

  return (
    <div className="statement-pdf-sheet sheet-paper-mode">
      <div className="statement-document-frame">
        <div className="statement-header-row">
          <div className="statement-logo-container">
            <svg
              className="statement-construction-svg"
              width="360"
              height="54"
              viewBox="0 0 380 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <g transform="translate(4, 5)">
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
              </g>

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
                  {company}
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
                  {subtitle}
                </text>
                <rect x="0" y="20" width="280" height="2.5" fill="#C8A676" />
              </g>
            </svg>
          </div>

          <div className="statement-address-container">
            {address.map((line, index) => (
              <div key={index} className="address-text-line">
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="statement-meta-row" style={{ fontSize: FONT_META }}>
          <div className="meta-left">
            <span className="meta-label">NAME:</span>{' '}
            <span className="meta-name-value">{party.name}</span>
          </div>
          <div className="meta-right">
            <span className="meta-label">DATE:</span>{' '}
            <span className="meta-date-value">{dateLabel}</span>
          </div>
        </div>

        {pendingItem ? (
          <div className="statement-pending-balance-row" style={{ fontSize: FONT_TITLE }}>
            <span className="pending-balance-label">PENDING BALANCE: </span>
            <span className="pending-balance-amount">{pendingItem.value}</span>
          </div>
        ) : null}

        {sections.map((section, sectionIndex) => (
          <div
            key={`${section.title}-${sectionIndex}`}
            className="statement-table-block"
            style={sectionIndex > 0 ? { marginTop: '20px' } : undefined}
          >
            <div className="statement-section-title-row" style={{ fontSize: FONT_TITLE }}>
              {section.title}
            </div>

            <table
              className="statement-invoice-table"
              style={{ '--stmt-cell-padding': CELL_PADDING } as CSSProperties}
            >
              <thead>
                <tr className="table-header-row" style={{ fontSize: FONT_TH }}>
                  {section.columns.map((column, columnIndex) => (
                    <th key={`${column}-${columnIndex}`} className="text-center">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="invoice-data-row" style={{ fontSize: FONT_BODY }}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="statement-cell">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}

                {section.totalLabel && section.totalValue ? (
                  <tr className="invoice-total-row" style={{ fontSize: FONT_TOTAL }}>
                    {Array.from({ length: Math.max(0, section.columns.length - 2) }).map((_, index) => (
                      <td key={`spacer-${index}`} />
                    ))}
                    <td className="total-label-cell">{section.totalLabel}</td>
                    <td className="total-amount-cell">{section.totalValue}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ))}

        {summary.length > 0 ? (
          <div className="statement-final-reconciliation-row" style={{ fontSize: FONT_META }}>
            {summary.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={`reconciliation-item${/pending/i.test(item.label) ? ' reconciliation-pending' : ''}`}
              >
                <span>{item.label}:</span> <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
