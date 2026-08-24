import React from 'react';
import type { Site } from '../types';
import { useSiteManager, formatINR } from '../context/SiteManagerContext';
import { MapPin, Phone, ArrowUpRight, Wallet, ReceiptText, ChevronRight } from 'lucide-react';

interface SiteCardProps {
  site: Site;
  onClick: () => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({ site, onClick }) => {
  const { calculateFinancials } = useSiteManager();
  const fin = calculateFinancials(site);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Active Construction':
        return 'status-active';
      case 'Planning':
        return 'status-planning';
      case 'Finishing & Interior':
        return 'status-finishing';
      case 'Handover / Completed':
        return 'status-completed';
      default:
        return 'status-active';
    }
  };

  return (
    <div className="site-card" onClick={onClick}>
      <div>
        {/* Header: Title & Status Badge */}
        <div className="site-card-header">
          <div>
            <h3 className="site-title">{site.siteName}</h3>
            <div className="site-client">{site.clientName}</div>
          </div>
          <span className={`status-pill ${getStatusClass(site.status)}`}>
            <span className="status-dot" />
            <span>{site.status}</span>
          </span>
        </div>

        {/* Site Details: Address & Phone */}
        <div className="site-meta-list">
          <div className="site-meta-item">
            <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span className="truncate" title={site.siteAddress}>
              {site.siteAddress}
            </span>
          </div>
          <div className="site-meta-item">
            <Phone size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
            <a 
              href={`tel:${site.contactNumber.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
            >
              {site.contactNumber}
            </a>
          </div>
        </div>

        {/* Financial Summary Box */}
        <div className="site-card-fin-box">
          <div className="site-fin-row">
            <span className="site-fin-row-label">Total Advance Received:</span>
            <span className="font-mono-currency" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatINR(fin.totalAdvance)}
            </span>
          </div>

          <div className="site-fin-row">
            <span className="site-fin-row-label">Total Expenses Incurred:</span>
            <span className="font-mono-currency" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              {formatINR(fin.totalExpenses)}
            </span>
          </div>

          {/* Budget Consumption Meter */}
          <div className="site-fin-progress-bar">
            <div 
              className="site-fin-progress-fill"
              style={{ 
                width: `${Math.min(fin.consumedPercentage, 100)}%`,
                backgroundColor: fin.isDeficit ? '#ef4444' : undefined 
              }} 
            />
          </div>

          <div className="site-fin-row" style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-stroke)' }}>
            <span style={{ fontWeight: 600, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Balance:
            </span>
            <span 
              className={`balance-badge ${fin.isDeficit ? 'balance-deficit' : 'balance-surplus'}`}
            >
              {fin.isDeficit ? (
                <>Deficit: {formatINR(fin.netBalance)}</>
              ) : (
                <>Surplus: {formatINR(fin.netBalance)}</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="site-card-footer">
        <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wallet size={13} color="var(--primary)" />
            <span>{fin.advanceCount} Advance{fin.advanceCount === 1 ? '' : 's'}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ReceiptText size={13} color="var(--text-secondary)" />
            <span>{fin.expenseCount} Expense{fin.expenseCount === 1 ? '' : 's'}</span>
          </span>
        </div>

        <span 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--primary)',
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}
        >
          <span>Open Ledger</span>
          <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
};
