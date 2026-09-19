export type StatementKind =
  | 'client'
  | 'interior_client'
  | 'shop'
  | 'labour_contract'
  | 'interior_labour_contract'
  | 'brick_customer'
  | 'brick_expenses'
  | 'brick_stock_item'
  | 'brick_stock_register'
  | 'bank';

export interface StatementSnapshot {
  company: string;
  subtitle: string;
  address: string[];
  party: { name: string; phone?: string; extra?: string[] };
  dateLabel: string;
  sections: Array<{
    title: string;
    columns: string[];
    rows: string[][];
    totalLabel?: string;
    totalValue?: string;
  }>;
  summary: Array<{ label: string; value: string }>;
  capturedAt: string;
}

export const defaultStatementBrand = (): Pick<
  StatementSnapshot,
  'company' | 'subtitle' | 'address'
> => ({
  company: 'AFRAH CONSTRUCTIONS',
  subtitle: 'CIVIL CONSTRUCTION & ARCHITECTURAL WORKS',
  address: [
    '32/2 Sps Complex, Alaguseenivasan Mahal Opp,',
    'Main road, Chinnamanur, Theni - 625 515.',
  ],
});
