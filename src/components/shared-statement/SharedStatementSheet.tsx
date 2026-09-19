import type { CSSProperties } from 'react';
import type { StatementSnapshot } from '@/lib/statementSnapshot';
import { StatementBrandLockup } from './StatementBrandLockup';
import { QuoteClosing, QuoteGreeting } from './QuoteDocumentExtras';
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
  const { company, subtitle, address, party, dateLabel, sections, summary, quoteExtras } = payload;
  const pendingItem = quoteExtras ? null : findPendingSummaryItem(summary);

  return (
    <div className="statement-pdf-sheet sheet-paper-mode">
      <div className="statement-document-frame">
        <StatementBrandLockup
          brand={payload.brand ?? 'afrah'}
          companyName={company}
          companySub={subtitle}
          address={address}
        />

        <div className="statement-meta-row" style={{ fontSize: FONT_META }}>
          <div className="meta-left">
            <span className="meta-label">{quoteExtras ? 'TO:' : 'NAME:'}</span>{' '}
            <span className="meta-name-value">{party.name}</span>
            {quoteExtras && party.phone ? (
              <span style={{ fontSize: '14px', marginLeft: '12px', opacity: 0.85 }}>
                ({party.phone})
              </span>
            ) : null}
            {quoteExtras && party.extra?.length ? (
              <div className="quote-party-sub">{party.extra.join(' · ')}</div>
            ) : null}
          </div>
          <div className="meta-right">
            <span className="meta-label">DATE:</span>{' '}
            <span className="meta-date-value">{dateLabel}</span>
          </div>
        </div>

        {quoteExtras ? <QuoteGreeting extras={quoteExtras} /> : null}

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
            {sectionIndex === 0 && quoteExtras?.materials ? (
              <div className="quote-materials-line">{quoteExtras.materials}</div>
            ) : null}

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

        {quoteExtras ? <QuoteClosing extras={quoteExtras} /> : null}

        {!quoteExtras && summary.length > 0 ? (
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
