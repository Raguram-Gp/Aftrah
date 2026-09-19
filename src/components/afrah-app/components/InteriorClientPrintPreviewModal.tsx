import React, { useMemo } from 'react';
import type { InteriorClient, InteriorExpenseItem } from '../types';
import { INTERIOR_CATEGORIES } from '../types';
import { formatToDDMMYYYY } from './DateInput';
import { PrintPreviewModal } from './PrintPreviewModal';
import { Paintbrush } from 'lucide-react';
import type { StatementSnapshot } from '@/lib/statementSnapshot';
import { defaultStatementBrand } from '@/lib/statementSnapshot';
import { resolveInteriorQuoteNo } from '../utils/quoteNo';

const INTERIOR_COMPANY_NAME = 'KAAB INTERIOR · AFRAH CONSTRUCTIONS';
const INTERIOR_COMPANY_SUB = 'LUXURY INTERIORS, MODULAR WOODWORK & TURNKEY EXECUTION';

const formatInvoiceINR = (val: number) => {
  const formatted = Math.abs(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹${formatted}/-`;
};

const toRomanNumeral = (num: number): string => {
  const romanMap: [number, string][] = [
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i'],
  ];
  let result = '';
  let n = num;
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result || String(num);
};

const resolveQuoteDate = (client: InteriorClient): string => {
  if (client.quoteDate) return client.quoteDate.slice(0, 10);
  if (client.createdAt) return client.createdAt.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
};

const siteLine = (client: InteriorClient): string =>
  [client.address, client.siteLocation]
    .filter(Boolean)
    .map((part) =>
      String(part)
        .replace(/Quote No:\s*Q\/[0-9./-]+\s*·?\s*/i, '')
        .replace(/^·\s*/, '')
        .trim(),
    )
    .filter(Boolean)
    .join(' · ');

type ExpenseGroup = {
  category: string;
  items: InteriorExpenseItem[];
  subtotal: number;
};

function groupInteriorExpenses(expenses: InteriorExpenseItem[]): ExpenseGroup[] {
  const groups: ExpenseGroup[] = [];
  const categoryMap = new Map<string, InteriorExpenseItem[]>();

  [...expenses]
    .sort((a, b) => (a.sNo || 0) - (b.sNo || 0))
    .forEach((exp) => {
      const cat = exp.category || 'OTHER WORK';
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(exp);
    });

  INTERIOR_CATEGORIES.forEach((cat) => {
    if (!categoryMap.has(cat)) return;
    const items = categoryMap.get(cat)!;
    groups.push({
      category: cat,
      items,
      subtotal: items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0),
    });
    categoryMap.delete(cat);
  });

  categoryMap.forEach((items, cat) => {
    groups.push({
      category: cat,
      items,
      subtotal: items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0),
    });
  });

  return groups;
}

function buildInteriorQuotePayload(args: {
  client: InteriorClient;
  expenses: InteriorExpenseItem[];
  quoteDate: string;
  totalExpenses: number;
}): StatementSnapshot {
  const { client, expenses, quoteDate, totalExpenses } = args;
  const brand = defaultStatementBrand('kaab');
  const grouped = groupInteriorExpenses(expenses);
  const extra = [siteLine(client), `Quote No: ${resolveInteriorQuoteNo(client)}`].filter(Boolean);

  const rows: string[][] =
    grouped.length === 0
      ? [['—', 'No quotation items found for this client.', '', '', '', '']]
      : grouped.flatMap((group, groupIdx) => [
          [`${groupIdx + 1}`, group.category.toUpperCase(), '', '', '', ''],
          ...group.items.map((exp, itemIdx) => [
            toRomanNumeral(itemIdx + 1),
            exp.expenseName.toUpperCase(),
            String(exp.quantity),
            exp.unit || 'Sq.ft',
            exp.rate ? String(exp.rate) : '-',
            formatInvoiceINR(exp.totalAmount),
          ]),
          ['', 'TOTAL', '', '', '', formatInvoiceINR(group.subtotal)],
        ]);

  return {
    ...brand,
    company: INTERIOR_COMPANY_NAME,
    subtitle: INTERIOR_COMPANY_SUB,
    party: { name: client.name.toUpperCase(), phone: client.phone, extra },
    dateLabel: formatToDDMMYYYY(quoteDate),
    sections: [
      {
        title: 'ESTIMATE FOR INTERIOR WORKS',
        columns: ['SI.NO', 'PARTICULARS', 'QTY', 'PER', 'RATE', 'AMOUNT'],
        rows,
        totalLabel: 'ESTIMATION AMOUNT',
        totalValue: formatInvoiceINR(totalExpenses),
      },
    ],
    summary: [{ label: 'Estimation Amount', value: formatInvoiceINR(totalExpenses) }],
    capturedAt: new Date().toISOString(),
  };
}

interface InteriorClientPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: InteriorClient;
  expenses: InteriorExpenseItem[];
}

export const InteriorClientPrintPreviewModal: React.FC<InteriorClientPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  client,
  expenses,
}) => {
  const groupedExpenses = useMemo(() => groupInteriorExpenses(expenses), [expenses]);
  const quoteDate = resolveQuoteDate(client);
  const quoteNo = resolveInteriorQuoteNo(client);
  const formattedQuoteDate = formatToDDMMYYYY(quoteDate);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
  const location = siteLine(client);

  if (!isOpen) return null;

  return (
    <PrintPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Estimate For Interior Works"
      badgeLabel="Interior Estimate & Quotation"
      badgeIcon={<Paintbrush size={16} color="var(--primary, #e2c399)" />}
      companyName={INTERIOR_COMPANY_NAME}
      companySub={INTERIOR_COMPANY_SUB}
      brand="kaab"
      shareKind="interior_client"
      shareEntityId={client.id}
      shareTitle={client.name}
      sharePayload={buildInteriorQuotePayload({
        client,
        expenses,
        quoteDate,
        totalExpenses,
      })}
    >
      <div className="statement-meta-row" style={{ fontSize: '18px' }}>
        <div className="meta-left">
          <span className="meta-label">TO:</span>{' '}
          <span className="meta-name-value">{client.name.toUpperCase()}</span>
          {client.phone && (
            <span style={{ fontSize: '14px', marginLeft: '12px', opacity: 0.85 }}>
              ({client.phone})
            </span>
          )}
          {location && <div className="quote-party-sub">{location}</div>}
        </div>
        <div className="meta-right quote-meta-right">
          <div>
            <span className="meta-label">QUOTE NO:</span>{' '}
            <span className="meta-date-value">{quoteNo}</span>
          </div>
          <div>
            <span className="meta-label">DATE:</span>{' '}
            <span className="meta-date-value">{formattedQuoteDate}</span>
          </div>
        </div>
      </div>

      <div className="statement-table-block">
        <div className="statement-section-title-row" style={{ fontSize: '18px' }}>
          ESTIMATE FOR INTERIOR WORKS
        </div>

        <table
          className="statement-invoice-table"
          style={{ '--stmt-cell-padding': '8px 10px' } as React.CSSProperties}
        >
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '40%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead>
            <tr className="table-header-row">
              <th className="text-center">SI.NO</th>
              <th className="text-center">PARTICULARS</th>
              <th className="text-center">QTY</th>
              <th className="text-center">PER</th>
              <th className="text-center">RATE</th>
              <th className="text-center">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {groupedExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: 'center', padding: '24px', color: '#666', fontStyle: 'italic' }}
                >
                  No quotation items found for this client.
                </td>
              </tr>
            ) : (
              groupedExpenses.map((group, groupIdx) => (
                <React.Fragment key={group.category}>
                  <tr className="quote-category-row">
                    <td className="text-center" style={{ fontWeight: 800 }}>
                      {groupIdx + 1}
                    </td>
                    <td colSpan={5}>{group.category}</td>
                  </tr>
                  {group.items.map((exp, itemIdx) => (
                    <tr key={exp.id} className="invoice-data-row" style={{ fontSize: '18px' }}>
                      <td className="statement-cell" style={{ textTransform: 'lowercase', fontWeight: 700 }}>
                        {toRomanNumeral(itemIdx + 1)}
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
                        {exp.expenseName}
                      </td>
                      <td className="statement-cell" style={{ fontWeight: 600 }}>
                        {exp.quantity}
                      </td>
                      <td className="statement-cell">{exp.unit || 'Sq.ft'}</td>
                      <td className="statement-cell" style={{ fontWeight: 600 }}>
                        {exp.rate ? Number(exp.rate).toLocaleString('en-IN') : '-'}
                      </td>
                      <td className="statement-cell" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {formatInvoiceINR(exp.totalAmount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="quote-subtotal-row">
                    <td></td>
                    <td className="total-label-cell" colSpan={4}>
                      TOTAL
                    </td>
                    <td className="total-amount-cell">{formatInvoiceINR(group.subtotal)}</td>
                  </tr>
                </React.Fragment>
              ))
            )}

            <tr className="invoice-total-row" style={{ fontSize: '18px' }}>
              <td></td>
              <td className="total-label-cell" colSpan={4}>
                ESTIMATION AMOUNT
              </td>
              <td className="total-amount-cell">{formatInvoiceINR(totalExpenses)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {client.projectScope ? (
        <div className="quote-terms-block">
          <div className="quote-terms-heading">Materials / Scope</div>
          <p>{client.projectScope}</p>
        </div>
      ) : null}
    </PrintPreviewModal>
  );
};
