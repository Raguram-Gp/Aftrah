import React from 'react';
import { useSiteManager, formatINR } from '../context/SiteManagerContext';
import { Menu, Plus, Building2, ChevronRight } from 'lucide-react';

interface AppTopBarProps {
  onOpenAddSite: () => void;
  onToggleMobileMenu: () => void;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  onOpenAddSite,
  onToggleMobileMenu
}) => {
  const { activeSite, setActiveSiteId, sites, portfolioFinancials } = useSiteManager();

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="topbar-mobile-menu-btn"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Current Location Breadcrumbs */}
        <div className="topbar-breadcrumbs">
          <button
            onClick={() => setActiveSiteId(null)}
            className="topbar-breadcrumb-btn"
            style={{ fontWeight: !activeSite ? 700 : 500 }}
          >
            <Building2 size={15} color="var(--primary)" />
            <span>Client & Site Management</span>
          </button>

          {activeSite && (
            <>
              <ChevronRight size={13} style={{ opacity: 0.4 }} />
              <span className="topbar-breadcrumb-active">{activeSite.siteName}</span>
            </>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Portfolio Net Ticker */}
        <div className="topbar-portfolio-pill" title="Overall Portfolio Net Balance">
          <span className="pill-label">Portfolio Net:</span>
          <span
            className="font-mono-currency pill-value"
            style={{ color: portfolioFinancials.netBalance >= 0 ? '#34d399' : '#f87171' }}
          >
            {formatINR(portfolioFinancials.netBalance)}
          </span>
        </div>

        {/* Quick CTA */}
        <button
          onClick={onOpenAddSite}
          className="btn-gold topbar-add-btn"
          style={{ height: '34px', fontSize: '11.5px', padding: '0 14px' }}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Add Site</span>
        </button>
      </div>
    </header>
  );
};
