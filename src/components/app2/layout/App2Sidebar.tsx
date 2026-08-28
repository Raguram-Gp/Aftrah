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

interface App2SidebarProps {
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

export const App2Sidebar: React.FC<App2SidebarProps> = ({
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
          className="app2-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`app2-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header: Aftrah constructions */}
        <div className="app2-sidebar-brand">
          <a href="/" className="app2-brand-link" title="Return to AFRAH">
            <div className="app2-brand-icon">
              <Building2 size={18} color="var(--primary)" />
            </div>
            {!isCollapsed && (
              <div className="app2-brand-text">
                <span className="app2-brand-title">Aftrah constructions</span>
              </div>
            )}
          </a>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="app2-sidebar-collapse-btn"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="app2-sidebar-mobile-close"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Modules */}
        <div className="app2-sidebar-nav">
          <nav className="app2-nav-list">
            {/* 1st Element: Clients */}
            <button
              onClick={() => {
                onSelectTab('clients');
                onCloseMobile();
              }}
              className={`app2-nav-item ${activeTab === 'clients' ? 'active' : ''}`}
              title="Clients"
            >
              <div className="app2-nav-left">
                <Users size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Clients</span>}
              </div>
              {!isCollapsed ? (
                <span className="app2-badge-count">{clientsCount}</span>
              ) : (
                <span className="app2-badge-dot" />
              )}
            </button>

            {/* 2nd Element: Vendor */}
            <button
              onClick={() => {
                onSelectTab('vendor');
                onCloseMobile();
              }}
              className={`app2-nav-item ${activeTab === 'vendor' ? 'active' : ''}`}
              title="Vendor"
            >
              <div className="app2-nav-left">
                <Truck size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Vendor</span>}
              </div>
              {!isCollapsed ? (
                <span className="app2-badge-count">{vendorsCount}</span>
              ) : (
                <span className="app2-badge-dot" />
              )}
            </button>

            {/* 3rd Element: Bank Details */}
            <button
              onClick={() => {
                onSelectTab('banks');
                onCloseMobile();
              }}
              className={`app2-nav-item ${activeTab === 'banks' ? 'active' : ''}`}
              title="Bank Details"
            >
              <div className="app2-nav-left">
                <Landmark size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Bank Details</span>}
              </div>
              {!isCollapsed ? (
                <span className="app2-badge-count">{banksCount}</span>
              ) : (
                <span className="app2-badge-dot" />
              )}
            </button>
          </nav>
        </div>

        {/* Footer Utilities */}
        <div className="app2-sidebar-footer">
          <div className="app2-tools-row">
            <button
              onClick={toggleTheme}
              className="app2-tool-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              {!isCollapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
            </button>

            <a
              href="/"
              className="app2-tool-btn"
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
