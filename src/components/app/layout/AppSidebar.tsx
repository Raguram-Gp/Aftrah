import React, { useState, useEffect } from 'react';
import { useSiteManager } from '../context/SiteManagerContext';
import { 
  Building2, 
  RotateCcw, 
  Sun, 
  Moon, 
  ArrowLeft, 
  Truck, 
  HardHat, 
  Boxes, 
  BarChart3, 
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface AppSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const { 
    activeSite, 
    setActiveSiteId, 
    resetToDemoData,
    sites
  } = useSiteManager();

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
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand & Collapse Header */}
        <div className="sidebar-brand-section">
          <a href="/" className="sidebar-brand-link" title="Return to AFRAH Website">
            <div className="sidebar-logo-icon">
              <Building2 size={18} color="var(--primary)" />
            </div>
            {!isCollapsed && (
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-title">AFRAH</span>
                <span className="sidebar-brand-sub">CONSTRUCTION ERP</span>
              </div>
            )}
          </a>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="sidebar-collapse-toggle-btn"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Close on mobile */}
          <button 
            onClick={onCloseMobile} 
            className="sidebar-mobile-close"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Modules */}
        <div className="sidebar-nav-container">
          {!isCollapsed && <div className="sidebar-section-label">Management Modules</div>}

          <nav className="sidebar-nav-list">
            {/* Active Module: Client & Site Management */}
            <button
              onClick={() => {
                setActiveSiteId(null);
                onCloseMobile();
              }}
              className={`sidebar-nav-item active`}
              title="Client & Site Ledger"
            >
              <div className="nav-item-left">
                <Building2 size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Client & Site Ledger</span>}
              </div>
              {!isCollapsed ? (
                <span className="nav-badge-count">{sites.length}</span>
              ) : (
                <span className="nav-badge-dot" title={`${sites.length} Active Sites`} />
              )}
            </button>

            {/* Future Modules: Ready for scaling */}
            {!isCollapsed && (
              <div className="sidebar-section-label" style={{ marginTop: '16px' }}>Upcoming Modules</div>
            )}

            <div className="sidebar-nav-item disabled" title="Vendors & Procurement (Coming Soon)">
              <div className="nav-item-left">
                <Truck size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Vendors & Procurement</span>}
              </div>
              {!isCollapsed && <span className="nav-badge-soon">Next</span>}
            </div>

            <div className="sidebar-nav-item disabled" title="Subcontractors & Labor (Coming Soon)">
              <div className="nav-item-left">
                <HardHat size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Subcontractors & Labor</span>}
              </div>
              {!isCollapsed && <span className="nav-badge-soon">Next</span>}
            </div>

            <div className="sidebar-nav-item disabled" title="Material Inventory (Coming Soon)">
              <div className="nav-item-left">
                <Boxes size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Material Inventory</span>}
              </div>
              {!isCollapsed && <span className="nav-badge-soon">Next</span>}
            </div>

            <div className="sidebar-nav-item disabled" title="Financial P&L Reports (Coming Soon)">
              <div className="nav-item-left">
                <BarChart3 size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">Financial P&L Reports</span>}
              </div>
              {!isCollapsed && <span className="nav-badge-soon">Next</span>}
            </div>
          </nav>
        </div>

        {/* Bottom Section: Utility Tools Row */}
        <div className="sidebar-bottom-section">
          <div className="sidebar-tools-row">
            <button
              onClick={toggleTheme}
              className="sidebar-tool-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {!isCollapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all site ledger data back to the default sample dataset?')) {
                  resetToDemoData();
                }
              }}
              className="sidebar-tool-btn"
              title="Reset to Demo Data"
            >
              <RotateCcw size={16} />
              {!isCollapsed && <span>Reset</span>}
            </button>

            <a 
              href="/" 
              className="sidebar-tool-btn"
              title="Back to Landing Page"
            >
              <ArrowLeft size={16} />
              {!isCollapsed && <span>Website</span>}
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
