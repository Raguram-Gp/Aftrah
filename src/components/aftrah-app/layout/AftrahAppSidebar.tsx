import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Truck,
  Landmark,
  Sun,
  Moon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface AftrahAppSidebarProps {
  clientsCount: number;
  vendorsCount: number;
  banksCount: number;
  activeTab: 'clients' | 'vendor' | 'banks';
  onSelectTab: (tab: 'clients' | 'vendor' | 'banks') => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AftrahAppSidebar: React.FC<AftrahAppSidebarProps> = ({
  clientsCount,
  vendorsCount,
  banksCount,
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(current === 'light' ? 'light' : 'dark');

    const handleThemeChange = (e: any) => {
      if (e?.detail?.theme) {
        setTheme(e.detail.theme);
      }
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(nextTheme);

    try {
      localStorage.setItem('afrah-theme', nextTheme);
    } catch (e) {
      console.warn('Unable to persist theme', e);
    }

    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: nextTheme } }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="aftrah-app-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`aftrah-app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header: Aftrah constructions */}
        <div className="aftrah-app-sidebar-brand">
          <a href="/" className="aftrah-app-brand-link" title="Return to AFRAH">
            <div className="aftrah-app-brand-icon">
              <Building2 size={18} color="var(--primary)" />
            </div>
            {!isCollapsed && (
              <div className="aftrah-app-brand-text">
                <span className="aftrah-app-brand-title">Aftrah constructions</span>
              </div>
            )}
          </a>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="aftrah-app-sidebar-collapse-btn"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="aftrah-app-sidebar-mobile-close"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Modules */}
        <div className="aftrah-app-sidebar-nav">
          <nav className="aftrah-app-nav-list">
            {/* 1st Element: Clients */}
            <button
              onClick={() => {
                onSelectTab('clients');
                onCloseMobile();
              }}
              className={`aftrah-app-nav-item ${activeTab === 'clients' ? 'active' : ''}`}
              title="Clients"
            >
              <div className="aftrah-app-nav-left">
                <Users size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Clients</span>}
              </div>
              {!isCollapsed ? (
                <span className="aftrah-app-badge-count">{clientsCount}</span>
              ) : (
                <span className="aftrah-app-badge-dot" />
              )}
            </button>

            {/* 2nd Element: Vendor */}
            <button
              onClick={() => {
                onSelectTab('vendor');
                onCloseMobile();
              }}
              className={`aftrah-app-nav-item ${activeTab === 'vendor' ? 'active' : ''}`}
              title="Vendor"
            >
              <div className="aftrah-app-nav-left">
                <Truck size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Vendor</span>}
              </div>
              {!isCollapsed ? (
                <span className="aftrah-app-badge-count">{vendorsCount}</span>
              ) : (
                <span className="aftrah-app-badge-dot" />
              )}
            </button>

            {/* 3rd Element: Bank Details */}
            <button
              onClick={() => {
                onSelectTab('banks');
                onCloseMobile();
              }}
              className={`aftrah-app-nav-item ${activeTab === 'banks' ? 'active' : ''}`}
              title="Bank Details"
            >
              <div className="aftrah-app-nav-left">
                <Landmark size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Bank Details</span>}
              </div>
              {!isCollapsed ? (
                <span className="aftrah-app-badge-count">{banksCount}</span>
              ) : (
                <span className="aftrah-app-badge-dot" />
              )}
            </button>
          </nav>
        </div>

        {/* Footer Utilities */}
        <div className="aftrah-app-sidebar-footer">
          <div className="aftrah-app-tools-row">
            <button
              onClick={toggleTheme}
              className="aftrah-app-tool-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              {!isCollapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
            </button>

            <a
              href="/"
              className="aftrah-app-tool-btn"
              title="Back to Landing Page"
            >
              <ArrowLeft size={15} />
              {!isCollapsed && <span>Website</span>}
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
