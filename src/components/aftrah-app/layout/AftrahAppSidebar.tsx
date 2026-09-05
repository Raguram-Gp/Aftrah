import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Paintbrush,
  Truck,
  Landmark,
  BrickWall,
  Flame,
  Boxes,
  Sun,
  Moon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  HardHat
} from 'lucide-react';
import type { BricksSubTab, InteriorSubTab } from '../types';

export type TabType =
  | 'clients'
  | 'vendor'
  | 'banks'
  | 'construction_labour'
  | 'kabibullah_bricks'
  | 'kaab_interior';

interface AftrahAppSidebarProps {
  clientsCount: number;
  constructionLabourContractsCount?: number;
  vendorsCount: number;
  banksCount: number;
  brickCustomersCount?: number;
  brickExpensesCount?: number;
  brickStockCount?: number;
  interiorClientsCount?: number;
  interiorVendorsCount?: number;
  interiorLabourContractsCount?: number;
  activeTab: TabType;
  activeInteriorSubTab?: InteriorSubTab;
  activeBricksSubTab?: BricksSubTab;
  onSelectTab: (tab: TabType, subTab?: BricksSubTab | InteriorSubTab) => void;
  onSelectInteriorSubTab?: (subTab: InteriorSubTab) => void;
  onSelectBricksSubTab?: (subTab: BricksSubTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AftrahAppSidebar: React.FC<AftrahAppSidebarProps> = ({
  clientsCount,
  constructionLabourContractsCount = 0,
  vendorsCount,
  banksCount,
  brickCustomersCount = 0,
  brickExpensesCount = 0,
  brickStockCount = 0,
  interiorClientsCount = 0,
  interiorVendorsCount = 0,
  interiorLabourContractsCount = 0,
  activeTab,
  activeInteriorSubTab = 'directory',
  activeBricksSubTab = 'directory',
  onSelectTab,
  onSelectInteriorSubTab,
  onSelectBricksSubTab,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isConstructionExpanded, setIsConstructionExpanded] = useState<boolean>(true);
  const [isBricksExpanded, setIsBricksExpanded] = useState<boolean>(true);
  const [isInteriorExpanded, setIsInteriorExpanded] = useState<boolean>(true);

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

  const isConstructionActive =
    activeTab === 'clients' ||
    activeTab === 'vendor' ||
    activeTab === 'banks' ||
    activeTab === 'construction_labour';

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

        {/* Navigation Modules strictly following user handwritten sketch */}
        <div className="aftrah-app-sidebar-nav">
          <nav className="aftrah-app-nav-list">

            {/* 1. AFRAH CONSTRUCTION (Boxed Division with Sub-items) */}
            <div className="aftrah-app-nav-group">
              <button
                onClick={() => {
                  if (isCollapsed) {
                    onSelectTab('clients');
                    onCloseMobile();
                  } else {
                    setIsConstructionExpanded(!isConstructionExpanded);
                  }
                }}
                className={`aftrah-app-nav-item aftrah-app-division-header ${isConstructionActive ? 'division-active' : ''}`}
                title="AFRAH CONSTRUCTION"
              >
                <div className="aftrah-app-nav-left">
                  <Building2 size={17} className="nav-icon" />
                  {!isCollapsed && (
                    <span className="nav-label" style={{ fontWeight: 600, letterSpacing: '0.04em' }}>
                      CONSTRUCTION
                    </span>
                  )}
                </div>
                {!isCollapsed ? (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    {isConstructionExpanded ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </div>
                ) : (
                  <span className="aftrah-app-badge-dot" />
                )}
              </button>

              {/* Sub-items below AFRAH CONSTRUCTION: Clients, Vendor, Bank details, Construction Labour Contract */}
              {(!isCollapsed ? isConstructionExpanded : false) && (
                <div className="aftrah-app-nav-sublist">
                  {/* Option A: Clients */}
                  <button
                    onClick={() => {
                      onSelectTab('clients');
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'clients' ? 'active' : ''}`}
                    title="Clients"
                  >
                    <div className="aftrah-app-nav-left">
                      <Users size={14} className="nav-icon" />
                      <span className="nav-label">Clients</span>
                    </div>
                    <span className="aftrah-app-subbadge-count">{clientsCount}</span>
                  </button>

                  {/* Option B: Vendor */}
                  <button
                    onClick={() => {
                      onSelectTab('vendor');
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'vendor' ? 'active' : ''}`}
                    title="Vendor"
                  >
                    <div className="aftrah-app-nav-left">
                      <Truck size={14} className="nav-icon" />
                      <span className="nav-label">Vendor</span>
                    </div>
                    {vendorsCount > 0 && (
                      <span className="aftrah-app-subbadge-count">{vendorsCount}</span>
                    )}
                  </button>

                  {/* Option C: Bank details */}
                  <button
                    onClick={() => {
                      onSelectTab('banks');
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'banks' ? 'active' : ''}`}
                    title="Bank details"
                  >
                    <div className="aftrah-app-nav-left">
                      <Landmark size={14} className="nav-icon" />
                      <span className="nav-label">Bank details</span>
                    </div>
                    {banksCount > 0 && (
                      <span className="aftrah-app-subbadge-count">{banksCount}</span>
                    )}
                  </button>

                  {/* Option D: Construction Labour Contract */}
                  <button
                    onClick={() => {
                      onSelectTab('construction_labour');
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'construction_labour' ? 'active' : ''}`}
                    title="Construction Labour Contract"
                  >
                    <div className="aftrah-app-nav-left">
                      <HardHat size={14} className="nav-icon" />
                      <span className="nav-label">Construction Labour Contract</span>
                    </div>
                    {constructionLabourContractsCount > 0 && (
                      <span className="aftrah-app-subbadge-count" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                        {constructionLabourContractsCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 3. KABIBULLAH BRICKS (Boxed Division with Sub-items) */}
            <div className="aftrah-app-nav-group" style={{ marginTop: '6px' }}>
              <button
                onClick={() => {
                  if (isCollapsed) {
                    onSelectTab('kabibullah_bricks', activeBricksSubTab || 'directory');
                    onCloseMobile();
                  } else {
                    setIsBricksExpanded(!isBricksExpanded);
                  }
                }}
                className={`aftrah-app-nav-item aftrah-app-division-header ${activeTab === 'kabibullah_bricks' ? 'division-active' : ''}`}
                title="KABIBULLAH BRICKS"
              >
                <div className="aftrah-app-nav-left">
                  <BrickWall size={17} className="nav-icon" />
                  {!isCollapsed && (
                    <span className="nav-label" style={{ fontWeight: 600, letterSpacing: '0.04em' }}>
                      KABIBULLAH BRICKS
                    </span>
                  )}
                </div>
                {!isCollapsed ? (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    {isBricksExpanded ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </div>
                ) : (
                  <span className="aftrah-app-badge-dot" />
                )}
              </button>

              {/* Sub-items below KABIBULLAH BRICKS: Customer Directory, Production Expenses, Stock Register */}
              {(!isCollapsed ? isBricksExpanded : false) && (
                <div className="aftrah-app-nav-sublist">
                  {/* Option A: Customer Directory */}
                  <button
                    onClick={() => {
                      if (onSelectBricksSubTab) {
                        onSelectBricksSubTab('directory');
                      } else {
                        onSelectTab('kabibullah_bricks', 'directory');
                      }
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'kabibullah_bricks' && activeBricksSubTab === 'directory' ? 'active' : ''}`}
                    title="Customer Directory"
                  >
                    <div className="aftrah-app-nav-left">
                      <Users size={14} className="nav-icon" />
                      <span className="nav-label">Customer Directory</span>
                    </div>
                    <span className="aftrah-app-subbadge-count">{brickCustomersCount}</span>
                  </button>

                  {/* Option B: Production Expenses */}
                  <button
                    onClick={() => {
                      if (onSelectBricksSubTab) {
                        onSelectBricksSubTab('expenses');
                      } else {
                        onSelectTab('kabibullah_bricks', 'expenses');
                      }
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'kabibullah_bricks' && activeBricksSubTab === 'expenses' ? 'active' : ''}`}
                    title="Production Expenses"
                  >
                    <div className="aftrah-app-nav-left">
                      <Flame size={14} className="nav-icon" />
                      <span className="nav-label">Production Expenses</span>
                    </div>
                    {brickExpensesCount > 0 && (
                      <span className="aftrah-app-subbadge-count">{brickExpensesCount}</span>
                    )}
                  </button>

                  {/* Option C: Stock Register */}
                  <button
                    onClick={() => {
                      if (onSelectBricksSubTab) {
                        onSelectBricksSubTab('stock');
                      } else {
                        onSelectTab('kabibullah_bricks', 'stock');
                      }
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'kabibullah_bricks' && activeBricksSubTab === 'stock' ? 'active' : ''}`}
                    title="Stock Register"
                  >
                    <div className="aftrah-app-nav-left">
                      <Boxes size={14} className="nav-icon" />
                      <span className="nav-label">Stock Register</span>
                    </div>
                    {brickStockCount > 0 && (
                      <span className="aftrah-app-subbadge-count">{brickStockCount}</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 4. KAAB INTERIOR (Boxed Division with Sub-items) */}
            <div className="aftrah-app-nav-group" style={{ marginTop: '6px' }}>
              <button
                onClick={() => {
                  if (isCollapsed) {
                    onSelectTab('kaab_interior', activeInteriorSubTab || 'directory');
                    onCloseMobile();
                  } else {
                    setIsInteriorExpanded(!isInteriorExpanded);
                  }
                }}
                className={`aftrah-app-nav-item aftrah-app-division-header ${activeTab === 'kaab_interior' ? 'division-active' : ''}`}
                title="KAAB INTERIOR"
              >
                <div className="aftrah-app-nav-left">
                  <Paintbrush size={17} className="nav-icon" />
                  {!isCollapsed && (
                    <span className="nav-label" style={{ fontWeight: 600, letterSpacing: '0.04em' }}>
                      KAAB INTERIOR
                    </span>
                  )}
                </div>
                {!isCollapsed ? (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    {isInteriorExpanded ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </div>
                ) : (
                  <span className="aftrah-app-badge-dot" />
                )}
              </button>

              {/* Sub-items below KAAB INTERIOR: Client directory, Vendor, Interior Labour Contract */}
              {(!isCollapsed ? isInteriorExpanded : false) && (
                <div className="aftrah-app-nav-sublist">
                  {/* Option A: Client directory */}
                  <button
                    onClick={() => {
                      if (onSelectInteriorSubTab) {
                        onSelectInteriorSubTab('directory');
                      } else {
                        onSelectTab('kaab_interior', 'directory');
                      }
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'kaab_interior' && activeInteriorSubTab === 'directory' ? 'active' : ''}`}
                    title="Client directory"
                  >
                    <div className="aftrah-app-nav-left">
                      <Users size={14} className="nav-icon" />
                      <span className="nav-label">Client directory</span>
                    </div>
                    <span className="aftrah-app-subbadge-count">{interiorClientsCount}</span>
                  </button>

                  {/* Option B: Vendor */}
                  <button
                    onClick={() => {
                      if (onSelectInteriorSubTab) {
                        onSelectInteriorSubTab('vendor');
                      } else {
                        onSelectTab('kaab_interior', 'vendor');
                      }
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'kaab_interior' && activeInteriorSubTab === 'vendor' ? 'active' : ''}`}
                    title="Vendor"
                  >
                    <div className="aftrah-app-nav-left">
                      <Truck size={14} className="nav-icon" />
                      <span className="nav-label">Vendor</span>
                    </div>
                    {interiorVendorsCount > 0 && (
                      <span className="aftrah-app-subbadge-count">{interiorVendorsCount}</span>
                    )}
                  </button>

                  {/* Option C: Interior Labour Contract */}
                  <button
                    onClick={() => {
                      if (onSelectInteriorSubTab) {
                        onSelectInteriorSubTab('labour_contract');
                      } else {
                        onSelectTab('kaab_interior', 'labour_contract');
                      }
                      onCloseMobile();
                    }}
                    className={`aftrah-app-nav-subitem ${activeTab === 'kaab_interior' && activeInteriorSubTab === 'labour_contract' ? 'active' : ''}`}
                    title="Interior Labour Contract"
                  >
                    <div className="aftrah-app-nav-left">
                      <HardHat size={14} className="nav-icon" />
                      <span className="nav-label">Interior Labour Contract</span>
                    </div>
                    {interiorLabourContractsCount > 0 && (
                      <span className="aftrah-app-subbadge-count">{interiorLabourContractsCount}</span>
                    )}
                  </button>
                </div>
              )}
            </div>

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
