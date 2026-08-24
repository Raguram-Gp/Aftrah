import React, { useMemo } from 'react';
import type { Site } from '../types';
import { useSiteManager, formatINR } from '../context/SiteManagerContext';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Percent 
} from 'lucide-react';

interface ProfitLossSummaryProps {
  site: Site;
}

export const ProfitLossSummary: React.FC<ProfitLossSummaryProps> = ({ site }) => {
  const { calculateFinancials } = useSiteManager();
  const fin = calculateFinancials(site);

  const expenses = site.expenses || [];

  // Group by category
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();

    expenses.forEach((item) => {
      const existing = map.get(item.category) || { total: 0, count: 0 };
      map.set(item.category, {
        total: existing.total + Number(item.totalAmount || 0),
        count: existing.count + 1
      });
    });

    const list = Array.from(map.entries()).map(([category, data]) => {
      const percentOfTotal = fin.totalExpenses > 0 ? (data.total / fin.totalExpenses) * 100 : 0;
      const percentOfAdvance = fin.totalAdvance > 0 ? (data.total / fin.totalAdvance) * 100 : 0;
      return {
        category,
        total: data.total,
        count: data.count,
        percentOfTotal,
        percentOfAdvance
      };
    });

    return list.sort((a, b) => b.total - a.total);
  }, [expenses, fin.totalExpenses, fin.totalAdvance]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Analytics Box */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        <div className="pnl-cat-card">
          <div className="pnl-cat-header">
            <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '11px' }}>
              Capital Utilization Ratio
            </span>
            <Percent size={14} color="var(--primary)" />
          </div>
          <div className="font-mono-currency" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {fin.consumedPercentage}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {fin.consumedPercentage <= 100 
              ? `${100 - fin.consumedPercentage}% of advance capital remains liquid.`
              : `Site has exceeded client advance by ${fin.consumedPercentage - 100}%.`}
          </div>
        </div>

        <div className="pnl-cat-card">
          <div className="pnl-cat-header">
            <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '11px' }}>
              Entity Health Assessment
            </span>
            {fin.isDeficit ? <TrendingDown size={16} color="#ef4444" /> : <TrendingUp size={16} color="#10b981" />}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: fin.isDeficit ? '#f87171' : '#34d399', marginBottom: '8px' }}>
            {fin.isDeficit ? 'Deficit Recovery Needed' : 'Solvent / Surplus Buffer'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {fin.isDeficit 
              ? 'Raise next progress bill or advance tranche from client immediately.'
              : 'Positive cashflow runway available for ongoing structural execution.'}
          </div>
        </div>

        <div className="pnl-cat-card">
          <div className="pnl-cat-header">
            <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '11px' }}>
              Average Cost per Entry
            </span>
            <Layers size={14} color="var(--primary)" />
          </div>
          <div className="font-mono-currency" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {fin.expenseCount > 0 ? formatINR(Math.round(fin.totalExpenses / fin.expenseCount)) : '₹0'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Across {fin.expenseCount} separate procurement line items.
          </div>
        </div>
      </div>

      {/* Category-wise Expense Breakdown Grid */}
      <div className="ledger-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <PieChart size={20} color="var(--primary)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Expense Breakdown by Category
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Proportional distribution of site expenditure
            </span>
          </div>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            No expense categories recorded yet.
          </div>
        ) : (
          <div className="pnl-cat-grid">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="pnl-cat-card" style={{ background: 'var(--surface-container, #1e2023)' }}>
                <div className="pnl-cat-header">
                  <span style={{ color: 'var(--text-primary)' }}>{cat.category}</span>
                  <span className="font-mono-currency" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {formatINR(cat.total)}
                  </span>
                </div>

                <div className="pnl-cat-meter">
                  <div 
                    className="pnl-cat-meter-fill"
                    style={{ width: `${Math.min(cat.percentOfTotal, 100)}%` }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>{cat.count} line item{cat.count === 1 ? '' : 's'}</span>
                  <span className="font-mono-currency">{cat.percentOfTotal.toFixed(1)}% of total expenses</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
