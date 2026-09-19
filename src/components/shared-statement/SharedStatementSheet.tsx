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
const QUOTE_CELL_PADDING = '8px 10px';
const QUOTE_COL_WIDTHS = ['8%', '40%', '10%', '10%', '14%', '18%'];

export interface SharedStatementSheetProps {
  payload: StatementSnapshot;
}

function findPendingSummaryItem(summary: StatementSnapshot['summary']) {
  return summary.find((item) => /pending/i.test(item.label));
}

function splitQuotePartyExtra(extra?: string[]) {
  const lines = extra?.filter(Boolean) ?? [];
  const quoteLine = lines.find((line) => /quote no:/i.test(line));
  const siteLines = lines.filter((line) => !/quote no:/i.test(line));
  const quoteNo = quoteLine?.replace(/quote no:\s*/i, '').trim() || undefined;
  return { siteLine: siteLines.join(' · '), quoteNo };
}

function classifyQuoteRow(row: string[]): 'category' | 'subtotal' | 'item' {
  const particulars = (row[1] || '').trim();
  const restEmpty = row.slice(2, 5).every((cell) => !String(cell || '').trim());
  if (particulars.toUpperCase() === 'TOTAL' && restEmpty) return 'subtotal';
  if (restEmpty && !(row[5] || '').trim() && particulars) return 'category';
  return 'item';
}

export function SharedStatementSheet({ payload }: SharedStatementSheetProps) {
  const { company, subtitle, address, party, dateLabel, sections, summary, quoteExtras } = payload;
  const pendingItem = quoteExtras ? null : findPendingSummaryItem(summary);
  const quoteParty = quoteExtras ? splitQuotePartyExtra(party.extra) : null;
  const quoteNo = quoteExtras?.quoteNo || quoteParty?.quoteNo;
  const siteLine = quoteParty?.siteLine;

  return (
    <div className="statement-pdf-sheet sheet-paper-mode a4-sheet">
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
            {quoteExtras && siteLine ? <div className="quote-party-sub">{siteLine}</div> : null}
          </div>
          {quoteExtras ? (
            <div className="meta-right quote-meta-right">
              {quoteNo ? (
                <div>
                  <span className="meta-label">QUOTE NO:</span>{' '}
                  <span className="meta-date-value">{quoteNo}</span>
                </div>
              ) : null}
              <div>
                <span className="meta-label">DATE:</span>{' '}
                <span className="meta-date-value">{dateLabel}</span>
              </div>
            </div>
          ) : (
            <div className="meta-right">
              <span className="meta-label">DATE:</span>{' '}
              <span className="meta-date-value">{dateLabel}</span>
            </div>
          )}
        </div>

        {quoteExtras ? <QuoteGreeting extras={quoteExtras} /> : null}

        {pendingItem ? (
          <div className="statement-pending-balance-row" style={{ fontSize: FONT_TITLE }}>
            <span className="pending-balance-label">PENDING BALANCE: </span>
            <span className="pending-balance-amount">{pendingItem.value}</span>
          </div>
        ) : null}

        {sections.map((section, sectionIndex) => {
          const isQuoteTable = Boolean(quoteExtras) && section.columns.length === 6;

          return (
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
                style={
                  {
                    '--stmt-cell-padding': isQuoteTable ? QUOTE_CELL_PADDING : CELL_PADDING,
                  } as CSSProperties
                }
              >
                {isQuoteTable ? (
                  <colgroup>
                    {QUOTE_COL_WIDTHS.map((width) => (
                      <col key={width} style={{ width }} />
                    ))}
                  </colgroup>
                ) : null}
                <thead>
                  <tr className="table-header-row" style={{ fontSize: FONT_TH }}>
                    {section.columns.map((column, columnIndex) => (
                      <th
                        key={`${column}-${columnIndex}`}
                        className="text-center"
                        style={isQuoteTable ? { whiteSpace: 'nowrap' } : undefined}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, rowIndex) => {
                    if (isQuoteTable) {
                      const kind = classifyQuoteRow(row);
                      if (kind === 'category') {
                        return (
                          <tr key={rowIndex} className="quote-category-row">
                            <td className="text-center" style={{ fontWeight: 800 }}>
                              {row[0]}
                            </td>
                            <td colSpan={5}>{row[1]}</td>
                          </tr>
                        );
                      }
                      if (kind === 'subtotal') {
                        return (
                          <tr key={rowIndex} className="quote-subtotal-row">
                            <td></td>
                            <td className="total-label-cell" colSpan={4}>
                              {row[1]}
                            </td>
                            <td className="total-amount-cell">{row[5]}</td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={rowIndex} className="invoice-data-row">
                          <td className="statement-cell" style={{ textTransform: 'lowercase', fontWeight: 700 }}>
                            {row[0]}
                          </td>
                          <td
                            className="statement-cell"
                            style={{
                              textAlign: 'left',
                              paddingLeft: '16px',
                              textTransform: 'uppercase',
                              fontWeight: 700,
                            }}
                          >
                            {row[1]}
                          </td>
                          <td className="statement-cell" style={{ fontWeight: 600 }}>
                            {row[2]}
                          </td>
                          <td className="statement-cell">{row[3]}</td>
                          <td className="statement-cell" style={{ fontWeight: 600 }}>
                            {row[4]}
                          </td>
                          <td className="statement-cell" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {row[5]}
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={rowIndex} className="invoice-data-row" style={{ fontSize: FONT_BODY }}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="statement-cell">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {section.totalLabel && section.totalValue ? (
                    isQuoteTable ? (
                      <tr className="invoice-total-row">
                        <td></td>
                        <td className="total-label-cell" colSpan={4}>
                          {section.totalLabel}
                        </td>
                        <td className="total-amount-cell">{section.totalValue}</td>
                      </tr>
                    ) : (
                      <tr className="invoice-total-row" style={{ fontSize: FONT_TOTAL }}>
                        {Array.from({ length: Math.max(0, section.columns.length - 2) }).map((_, index) => (
                          <td key={`spacer-${index}`} />
                        ))}
                        <td className="total-label-cell">{section.totalLabel}</td>
                        <td className="total-amount-cell">{section.totalValue}</td>
                      </tr>
                    )
                  ) : null}
                </tbody>
              </table>
            </div>
          );
        })}

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
