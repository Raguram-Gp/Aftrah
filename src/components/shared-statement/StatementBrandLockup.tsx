import { PDF_BRANDS, type PdfBrand } from '@/lib/statementSnapshot';

interface StatementBrandLockupProps {
  brand?: PdfBrand;
  companyName?: string;
  companySub?: string;
  address?: string[];
}

export function StatementBrandLockup({
  brand = 'afrah',
  companyName,
  companySub,
  address = [
    '32/2 Sps Complex, Alaguseenivasan Mahal Opp,',
    'Main road, Chinnamanur, Theni - 625 515.',
  ],
}: StatementBrandLockupProps) {
  const meta = PDF_BRANDS[brand];

  return (
    <div className="statement-header-row">
      <div className="statement-logo-container">
        <img
          className="statement-brand-logo"
          src={meta.logoSrc}
          alt={meta.logoAlt}
        />
        <div className="statement-brand-copy">
          <div className="statement-brand-title-text">{companyName ?? meta.company}</div>
          <div className="statement-brand-sub-text">{companySub ?? meta.subtitle}</div>
        </div>
      </div>

      <div className="statement-address-container">
        {address.filter(Boolean).map((line) => (
          <div key={line} className="address-text-line">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
