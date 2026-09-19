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

export type PdfBrand = 'afrah' | 'kaab' | 'bricks';

export interface StatementSnapshot {
  company: string;
  subtitle: string;
  address: string[];
  logoSrc?: string;
  brand?: PdfBrand;
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

export const PDF_BRANDS: Record<
  PdfBrand,
  { logoSrc: string; logoAlt: string; company: string; subtitle: string }
> = {
  afrah: {
    logoSrc: '/logos/afrah-construction.jpg',
    logoAlt: 'Afrah Construction',
    company: 'AFRAH CONSTRUCTIONS',
    subtitle: 'CIVIL CONSTRUCTION & ARCHITECTURAL WORKS',
  },
  kaab: {
    logoSrc: '/logos/kaab-interior.jpg',
    logoAlt: 'KAAB Interior',
    company: 'KAAB INTERIOR',
    subtitle: 'DESIGNING SPACES. DEFINING LIFESTYLES.',
  },
  bricks: {
    logoSrc: '/logos/kabibullah-bricks.jpg',
    logoAlt: 'Kabibullah Bricks',
    company: 'KABIBULLAH BRICKS',
    subtitle: 'WIRE CUT',
  },
};

const DEFAULT_ADDRESS = [
  '32/2 Sps Complex, Alaguseenivasan Mahal Opp,',
  'Main road, Chinnamanur, Theni - 625 515.',
];

export function pdfBrandFromKind(kind?: StatementKind): PdfBrand {
  switch (kind) {
    case 'interior_client':
    case 'interior_labour_contract':
      return 'kaab';
    case 'brick_customer':
    case 'brick_expenses':
    case 'brick_stock_item':
    case 'brick_stock_register':
      return 'bricks';
    default:
      return 'afrah';
  }
}

export const defaultStatementBrand = (
  brand: PdfBrand = 'afrah',
): Pick<StatementSnapshot, 'company' | 'subtitle' | 'address' | 'logoSrc' | 'brand'> => {
  const meta = PDF_BRANDS[brand];
  return {
    company: meta.company,
    subtitle: meta.subtitle,
    address: [...DEFAULT_ADDRESS],
    logoSrc: meta.logoSrc,
    brand,
  };
};
