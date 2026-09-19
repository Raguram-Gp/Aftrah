import type { InteriorClient } from '../types';
import type { StatementSnapshot } from '@/lib/statementSnapshot';

const formatQuoteINR = (val: number) => {
  const formatted = Math.abs(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹${formatted}/-`;
};

export const DEFAULT_QUOTE_MATERIALS =
  'Materials of 16mm MDF with Mica lamination and 6mm Back-panel ply with PVC edgeband along with Handles and Hardwares etc. (Rate may vary according to the design)';

export const QUOTE_GREETING_TITLE = 'Dear Sir / Madam';

export const QUOTE_GREETING_BODY =
  'Thank you for considering KAAB Interior for your interior design need. We are looking forward to working with you and creating a stunning home that you and your family will love for years to come.';

export const QUOTE_DELIVERY_TERMS = '4–6 weeks from the date of Confirmation';

export const QUOTE_CLOSING = 'Thanks & Regards.';

export const QUOTE_NOTES = [
  'Any further deviation from the approved design and quote will attract additional charge accordingly',
  'Electricity should be provided by the client',
  'Hood & Hob not included',
  'Validity of this quote is 30 days',
];

export const QUOTE_PAYMENT_SPLITS = [
  { pct: 50, label: '50% Advance on confirmation & PO' },
  { pct: 30, label: '30% On delivery of Carcass Material' },
  { pct: 15, label: '15% On delivery of doors' },
  { pct: 5, label: '5% On Completion of Works' },
] as const;

function roundMoney(val: number) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function quoteMaterialsFor(client: InteriorClient): string {
  const scope = (client.projectScope || '').trim();
  return scope || DEFAULT_QUOTE_MATERIALS;
}

export function quotePaymentSchedule(total: number): Array<{ label: string; amount: number }> {
  const amounts = QUOTE_PAYMENT_SPLITS.map((split, index) => {
    if (index === QUOTE_PAYMENT_SPLITS.length - 1) return 0;
    return roundMoney((total * split.pct) / 100);
  });
  const allocated = amounts.reduce((sum, amount) => sum + amount, 0);
  amounts[amounts.length - 1] = roundMoney(total - allocated);

  return QUOTE_PAYMENT_SPLITS.map((split, index) => ({
    label: split.label,
    amount: amounts[index],
  }));
}

export function buildInteriorQuoteExtras(
  client: InteriorClient,
  total: number,
): NonNullable<StatementSnapshot['quoteExtras']> {
  return {
    greetingTitle: QUOTE_GREETING_TITLE,
    greetingBody: QUOTE_GREETING_BODY,
    materials: quoteMaterialsFor(client),
    deliveryTerms: QUOTE_DELIVERY_TERMS,
    paymentTerms: quotePaymentSchedule(total).map((row) => ({
      label: row.label,
      amount: formatQuoteINR(row.amount),
    })),
    notes: [...QUOTE_NOTES],
    closing: QUOTE_CLOSING,
  };
}
