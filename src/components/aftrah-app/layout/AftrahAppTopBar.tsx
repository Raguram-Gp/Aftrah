import React from 'react';
import { Menu, Users, Truck, Landmark, ChevronRight } from 'lucide-react';
import type { Client, Vendor, VendorShop } from '../types';

interface AftrahAppTopBarProps {
  activeTab: 'clients' | 'vendor' | 'banks';
  clientsCount: number;
  vendorsCount: number;
  banksCount: number;
  selectedClient: Client | null;
  selectedVendor: Vendor | null;
  selectedShop: VendorShop | null;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onNavigateHome: () => void;
  onNavigateVendorRoot: () => void;
  isLiveDb: boolean;
}

export const AftrahAppTopBar: React.FC<AftrahAppTopBarProps> = ({
  activeTab,
  clientsCount,
  vendorsCount,
  banksCount,
  selectedClient,
  selectedVendor,
  selectedShop,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onNavigateHome,
  onNavigateVendorRoot,
  isLiveDb
}) => {
  return (
    <header className="aftrah-app-topbar">
      <div className="aftrah-app-topbar-left">
        <button
          onClick={onToggleMobileMenu}
          className="aftrah-app-topbar-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <div className="aftrah-app-breadcrumbs">
          {activeTab === 'clients' ? (
            <>
              <button
                onClick={onNavigateHome}
                className="aftrah-app-breadcrumb-link"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Users size={16} color="var(--primary)" />
                <span>Clients</span>
              </button>

              {selectedClient && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="aftrah-app-breadcrumb-active">
                    {selectedClient.name}
                  </span>
                </>
              )}
            </>
          ) : activeTab === 'vendor' ? (
            <>
              <button
                onClick={onNavigateVendorRoot}
                className="aftrah-app-breadcrumb-link"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Truck size={16} color="var(--primary)" />
                <span>Vendor</span>
              </button>

              {selectedVendor && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <button
                    onClick={onNavigateVendorRoot}
                    className="aftrah-app-breadcrumb-link"
                  >
                    {selectedVendor.type}
                  </button>
                </>
              )}

              {selectedShop && (
                <>
                  <ChevronRight size={14} color="var(--text-secondary)" />
                  <span className="aftrah-app-breadcrumb-active">
                    {selectedShop.name}
                  </span>
                </>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={16} color="var(--primary)" />
              <span className="aftrah-app-breadcrumb-active">Bank Details</span>
            </div>
          )}
        </div>
      </div>

      <div className="aftrah-app-topbar-right">
        {/* Database Status Indicator */}
        <div className={`db-status-badge ${isLiveDb ? 'live' : 'local'}`}>
          <span className={`db-dot ${isLiveDb ? 'live' : 'local'}`} />
          <span>{isLiveDb ? 'Supabase Connected' : 'Local / Cache Mode'}</span>
        </div>

        {activeTab === 'clients' ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Clients: <strong style={{ color: 'var(--primary)' }}>{clientsCount}</strong>
          </span>
        ) : activeTab === 'vendor' ? (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Categories: <strong style={{ color: 'var(--primary)' }}>{vendorsCount}</strong>
          </span>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Total Banks: <strong style={{ color: 'var(--primary)' }}>{banksCount}</strong>
          </span>
        )}
      </div>
    </header>
  );
};
