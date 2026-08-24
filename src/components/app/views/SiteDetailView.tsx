import React, { useState } from 'react';
import type { Site } from '../types';
import { useSiteManager, formatINR } from '../context/SiteManagerContext';
import { ExpenseLedgerTable } from '../components/ExpenseLedgerTable';
import { AdvanceCashflowList } from '../components/AdvanceCashflowList';
import { ProfitLossSummary } from '../components/ProfitLossSummary';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Plus, 
  Wallet, 
  ReceiptText, 
  Scale, 
  PieChart, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Building2, 
  FileText 
} from 'lucide-react';

interface SiteDetailViewProps {
  site: Site;
  onOpenAddAdvance: () => void;
  onOpenAddExpense: () => void;
}

export const SiteDetailView: React.FC<SiteDetailViewProps> = ({ 
  site, 
  onOpenAddAdvance, 
  onOpenAddExpense 
}) => {
  const { 
    setActiveSiteId, 
    calculateFinancials, 
    activeTab, 
    setActiveTab, 
    deleteSite 
  } = useSiteManager();

  const [showDetails, setShowDetails] = useState(false);
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="site-detail-container">
      {/* Unified Single Header Section */}
      <div className="site-detail-header-card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', flexWrap: 'wrap', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
          {/* Left: Title + Status + Client & Info Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 className="site-header-title" style={{ fontSize: '16.5px', margin: 0 }}>{site.siteName}</h1>
                <span className={`status-pill ${getStatusClass(site.status)}`} style={{ padding: '2px 7px', fontSize: '10px' }}>
                  <span className="status-dot" />
                  <span>{site.status}</span>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                <span>Client: <strong style={{ color: 'var(--primary)', fontWeight: 600 }}>{site.clientName}</strong></span>
                <span>·</span>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                  title="Toggle site specifications and location details"
                >
                  <Info size={12} color="var(--primary)" />
                  <span>{showDetails ? 'Hide Info' : 'Site Info'}</span>
                  {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Record Advance, Log Expense, Print & Delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={onOpenAddAdvance} className="btn-outline btn-outline-gold" style={{ height: '34px', fontSize: '11.5px', padding: '0 12px' }}>
              <Wallet size={14} />
              <span>Record Advance</span>
            </button>
            <button onClick={onOpenAddExpense} className="btn-gold" style={{ height: '34px', fontSize: '11.5px', padding: '0 14px' }}>
              <Plus size={14} strokeWidth={2.5} />
              <span>Log Expense</span>
            </button>

            <div style={{ width: '1px', height: '22px', background: 'var(--border-stroke)', margin: '0 2px' }} />

            <button onClick={handlePrint} className="btn-outline" style={{ height: '34px', padding: '0 10px', fontSize: '11.5px' }} title="Print Ledger">
              <Printer size={13} />
              <span>Print</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete site "${site.siteName}" and all associated ledgers?`)) {
                  deleteSite(site.id);
                }
              }}
              className="btn-danger"
              style={{ height: '34px', padding: '0 10px', fontSize: '11.5px' }}
              title="Delete Site"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* On-Demand Expandable Details Drawer */}
        {showDetails && (
          <div className="site-expandable-drawer">
            <div className="drawer-grid">
              {/* Card 1: Project Type */}
              <div className="drawer-info-card">
                <div className="drawer-icon-box">
                  <Building2 size={14} />
                </div>
                <div className="drawer-content">
                  <span className="drawer-info-label">Project Type</span>
                  <span className="drawer-info-val" style={{ color: 'var(--primary)' }}>
                    {site.projectType}
                  </span>
                </div>
              </div>

              {/* Card 2: Site Address */}
              <div className="drawer-info-card">
                <div className="drawer-icon-box">
                  <MapPin size={14} />
                </div>
                <div className="drawer-content">
                  <span className="drawer-info-label">Site Address</span>
                  <span className="drawer-info-val">
                    {site.siteAddress}
                  </span>
                </div>
              </div>

              {/* Card 3: Client Contact */}
              <div className="drawer-info-card">
                <div className="drawer-icon-box">
                  <Phone size={14} />
                </div>
                <div className="drawer-content">
                  <span className="drawer-info-label">Client Contact</span>
                  <span className="drawer-info-val">
                    <a href={`tel:${site.contactNumber.replace(/\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {site.contactNumber}
                    </a>
                    {site.email && (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                        {site.email}
                      </div>
                    )}
                  </span>
                </div>
              </div>

              {/* Card 4: Timeline */}
              <div className="drawer-info-card">
                <div className="drawer-icon-box">
                  <Calendar size={14} />
                </div>
                <div className="drawer-content">
                  <span className="drawer-info-label">Timeline & Milestones</span>
                  <span className="drawer-info-val">
                    {site.startDate ? `Commenced: ${site.startDate}` : 'Commencing Soon'}
                    {site.estimatedCompletion && (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                        Target: {site.estimatedCompletion}
                      </div>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Scope / Notes Bar */}
            {site.notes && (
              <div className="drawer-specs-bar">
                <FileText size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.08em', display: 'block', marginBottom: '2px', color: 'var(--text-secondary)' }}>
                    Architectural Scope & Specifications
                  </span>
                  <span style={{ lineHeight: 1.4 }}>{site.notes}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3 Core Financial Summary Cards (Profit & Loss Entity KPIs) */}
      <div className="kpi-grid">
        {/* Card 1: Total Advance Received */}
        <div className="kpi-card gold">
          <div className="kpi-label">
            <span>Total Advance Received</span>
            <Wallet size={16} color="var(--primary)" />
          </div>
          <div className="kpi-value font-mono-currency" style={{ color: 'var(--primary)' }}>
            {formatINR(fin.totalAdvance)}
          </div>
          <div className="kpi-subtext">
            <span>{fin.advanceCount} advance credit deposit{fin.advanceCount === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Card 2: Total Expenses Incurred */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Total Expenses Incurred</span>
            <ReceiptText size={16} color="var(--text-secondary)" />
          </div>
          <div className="kpi-value font-mono-currency">
            {formatINR(fin.totalExpenses)}
          </div>
          <div className="kpi-subtext">
            <span>{fin.expenseCount} itemized expense line{fin.expenseCount === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Card 3: Net Balance Amount (Advance - Expenses) */}
        <div className={`kpi-card ${fin.isDeficit ? 'deficit' : 'surplus'}`}>
          <div className="kpi-label">
            <span>Net Balance Amount</span>
            <Scale size={16} color={fin.isDeficit ? '#ef4444' : '#10b981'} />
          </div>
          <div 
            className="kpi-value font-mono-currency"
            style={{ color: fin.isDeficit ? '#f87171' : '#34d399' }}
          >
            {formatINR(fin.netBalance)}
          </div>
          <div className="kpi-subtext">
            {fin.isDeficit ? (
              <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} />
                <span>Deficit: Expenses exceed advance received</span>
              </span>
            ) : (
              <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} />
                <span>Surplus: {100 - fin.consumedPercentage}% Advance runway remaining</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div>
        <div className="app-tabs-header">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`app-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          >
            <ReceiptText size={15} />
            <span>Site Expense Log</span>
            <span className="tab-badge-count">{fin.expenseCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('advances')}
            className={`app-tab-btn ${activeTab === 'advances' ? 'active' : ''}`}
          >
            <Wallet size={15} />
            <span>Advance Cashflows</span>
            <span className="tab-badge-count">{fin.advanceCount}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`app-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <PieChart size={15} />
            <span>P&L & Category Breakdown</span>
          </button>
        </div>

        {/* Tab Sub-views */}
        {activeTab === 'expenses' && (
          <ExpenseLedgerTable
            site={site}
            onOpenAddExpense={onOpenAddExpense}
          />
        )}

        {activeTab === 'advances' && (
          <AdvanceCashflowList
            site={site}
            onOpenAddAdvance={onOpenAddAdvance}
          />
        )}

        {activeTab === 'analytics' && (
          <ProfitLossSummary site={site} />
        )}
      </div>
    </div>
  );
};
