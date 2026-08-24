import React, { useState, useEffect } from 'react';
import { useSiteManager, formatINR } from '../context/SiteManagerContext';
import { 
  Building2, 
  Plus, 
  RotateCcw, 
  Sun, 
  Moon, 
  ArrowLeft, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';

interface AppHeaderProps {
  onOpenAddSite: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenAddSite }) => {
  const { 
    portfolioFinancials, 
    activeSite, 
    setActiveSiteId, 
    resetToDemoData 
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
    <header className="app-header">
      {/* Left: Branding & Module Title */}
      <div className="app-header-left">
        <a 
          href="/" 
          className="app-brand-link" 
          title="Return to AFRAH Website"
        >
          <span className="app-brand-title">AFRAH</span>
          <span className="app-badge-pill">SITE LEDGER</span>
        </a>

        <div className="app-header-divider" />

        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveSiteId(null)}
            className={`app-nav-item ${!activeSite ? 'active' : ''}`}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <Building2 size={15} />
            <span>Client & Site Management</span>
          </button>
        </nav>
      </div>

      {/* Right: Actions, Theme Switcher & Portfolio Ticker */}
      <div className="app-header-right">
        {/* Overall Net Balance Ticker */}
        <div 
          className="kpi-ticker"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'var(--surface-container, #1e2023)',
            border: '1px solid var(--border-stroke, #232730)',
            fontSize: '11px'
          }}
          title="Overall Portfolio Net Balance across all sites"
        >
          <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Portfolio Net:
          </span>
          <span 
            className="font-mono-currency"
            style={{ 
              fontWeight: 700, 
              color: portfolioFinancials.netBalance >= 0 ? '#34d399' : '#f87171' 
            }}
          >
            {formatINR(portfolioFinancials.netBalance)}
          </span>
        </div>

        {/* Quick CTA: Add Client / Site */}
        <button 
          onClick={onOpenAddSite}
          className="btn-gold"
          title="Create a new client & site ledger"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>+ Add Client / Site</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all site ledger data back to the default sample dataset?')) {
              resetToDemoData();
            }
          }}
          className="btn-ghost-icon"
          title="Reset to Sample Demo Data"
        >
          <RotateCcw size={16} />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn-ghost-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Back to Website */}
        <a 
          href="/" 
          className="app-back-site-btn"
          title="Back to Landing Page"
        >
          <ArrowLeft size={13} />
          <span>Website</span>
        </a>
      </div>
    </header>
  );
};
