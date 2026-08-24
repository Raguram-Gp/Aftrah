import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Site, AdvancePayment, ExpenseItem, SiteFinancials, ToastMessage, SiteStatus } from '../types';
import { INITIAL_SITES } from '../data/initialData';

interface SiteManagerContextType {
  sites: Site[];
  activeSiteId: string | null;
  activeSite: Site | null;
  searchQuery: string;
  statusFilter: string;
  activeTab: 'expenses' | 'advances' | 'analytics';
  toasts: ToastMessage[];
  
  // Actions
  setActiveSiteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  setActiveTab: (tab: 'expenses' | 'advances' | 'analytics') => void;
  
  addSite: (site: Omit<Site, 'id' | 'createdAt' | 'advances' | 'expenses'> & { initialAdvance?: { amount: number; paymentMode: any; referenceNotes: string } }) => string;
  updateSite: (id: string, updates: Partial<Site>) => void;
  deleteSite: (id: string) => void;
  
  addAdvance: (siteId: string, advance: Omit<AdvancePayment, 'id' | 'createdAt'>) => void;
  updateAdvance: (siteId: string, advanceId: string, updates: Partial<AdvancePayment>) => void;
  deleteAdvance: (siteId: string, advanceId: string) => void;
  
  addExpense: (siteId: string, expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  updateExpense: (siteId: string, expenseId: string, updates: Partial<ExpenseItem>) => void;
  deleteExpense: (siteId: string, expenseId: string) => void;
  
  showToast: (title: string, type?: 'success' | 'info' | 'warning' | 'error', description?: string) => void;
  dismissToast: (id: string) => void;
  resetToDemoData: () => void;
  
  // Calculations
  calculateFinancials: (site: Site) => SiteFinancials;
  portfolioFinancials: {
    totalSites: number;
    totalAdvance: number;
    totalExpenses: number;
    netBalance: number;
    surplusSitesCount: number;
    deficitSitesCount: number;
  };
  filteredSites: Site[];
}

const STORAGE_KEY = 'afrah_construction_sites_v1';

const SiteManagerContext = createContext<SiteManagerContextType | undefined>(undefined);

export const SiteManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial sites from localStorage or fallback to default dataset
  const [sites, setSites] = useState<Site[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to load sites from localStorage', e);
      }
    }
    return INITIAL_SITES;
  });

  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'expenses' | 'advances' | 'analytics'>('expenses');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to localStorage on modification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
      } catch (e) {
        console.warn('Failed to persist sites to localStorage', e);
      }
    }
  }, [sites]);

  // Toast System
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, type, description };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  }, [dismissToast]);

  // Financial calculation utility
  const calculateFinancials = useCallback((site: Site): SiteFinancials => {
    const totalAdvance = (site.advances || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalExpenses = (site.expenses || []).reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
    const netBalance = totalAdvance - totalExpenses;
    const consumedPercentage = totalAdvance > 0 ? Math.min(Math.round((totalExpenses / totalAdvance) * 100), 999) : (totalExpenses > 0 ? 100 : 0);

    return {
      totalAdvance,
      totalExpenses,
      netBalance,
      advanceCount: (site.advances || []).length,
      expenseCount: (site.expenses || []).length,
      consumedPercentage,
      isDeficit: netBalance < 0
    };
  }, []);

  // Portfolio aggregates
  const portfolioFinancials = useMemo(() => {
    let totalAdvance = 0;
    let totalExpenses = 0;
    let surplusSitesCount = 0;
    let deficitSitesCount = 0;

    sites.forEach((site) => {
      const fin = calculateFinancials(site);
      totalAdvance += fin.totalAdvance;
      totalExpenses += fin.totalExpenses;
      if (fin.netBalance >= 0) {
        surplusSitesCount++;
      } else {
        deficitSitesCount++;
      }
    });

    return {
      totalSites: sites.length,
      totalAdvance,
      totalExpenses,
      netBalance: totalAdvance - totalExpenses,
      surplusSitesCount,
      deficitSitesCount
    };
  }, [sites, calculateFinancials]);

  // Active Site
  const activeSite = useMemo(() => {
    if (!activeSiteId) return null;
    return sites.find((s) => s.id === activeSiteId) || null;
  }, [sites, activeSiteId]);

  // Filtered Sites for List View
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchesSearch =
        searchQuery === '' ||
        site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.siteAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.contactNumber.includes(searchQuery);

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'deficit') {
        const fin = calculateFinancials(site);
        return fin.isDeficit;
      }
      if (statusFilter === 'surplus') {
        const fin = calculateFinancials(site);
        return !fin.isDeficit;
      }
      return site.status === statusFilter;
    });
  }, [sites, searchQuery, statusFilter, calculateFinancials]);

  // Actions
  const addSite = useCallback((siteInput: Omit<Site, 'id' | 'createdAt' | 'advances' | 'expenses'> & { initialAdvance?: { amount: number; paymentMode: any; referenceNotes: string } }) => {
    const id = `site-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const advances: AdvancePayment[] = [];

    if (siteInput.initialAdvance && siteInput.initialAdvance.amount > 0) {
      advances.push({
        id: `adv-${Date.now()}`,
        date: siteInput.startDate || new Date().toISOString().split('T')[0],
        paymentMode: siteInput.initialAdvance.paymentMode || 'Bank Transfer',
        amount: Number(siteInput.initialAdvance.amount),
        referenceNotes: siteInput.initialAdvance.referenceNotes || 'Initial Site Advance',
        createdAt: new Date().toISOString()
      });
    }

    const newSite: Site = {
      id,
      siteName: siteInput.siteName,
      clientName: siteInput.clientName,
      siteAddress: siteInput.siteAddress,
      contactNumber: siteInput.contactNumber,
      email: siteInput.email,
      projectType: siteInput.projectType,
      status: siteInput.status,
      startDate: siteInput.startDate,
      estimatedCompletion: siteInput.estimatedCompletion,
      notes: siteInput.notes,
      advances,
      expenses: [],
      createdAt: new Date().toISOString()
    };

    setSites((prev) => [newSite, ...prev]);
    showToast(`Site Created: ${newSite.siteName}`, 'success', `Client: ${newSite.clientName}`);
    return id;
  }, [showToast]);

  const updateSite = useCallback((id: string, updates: Partial<Site>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Site Information Updated', 'info');
  }, [showToast]);

  const deleteSite = useCallback((id: string) => {
    const target = sites.find((s) => s.id === id);
    setSites((prev) => prev.filter((s) => s.id !== id));
    if (activeSiteId === id) {
      setActiveSiteId(null);
    }
    showToast(`Site Removed`, 'warning', target?.siteName);
  }, [sites, activeSiteId, showToast]);

  const addAdvance = useCallback((siteId: string, advanceInput: Omit<AdvancePayment, 'id' | 'createdAt'>) => {
    const newAdvance: AdvancePayment = {
      ...advanceInput,
      amount: Number(advanceInput.amount),
      id: `adv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString()
    };

    setSites((prev) =>
      prev.map((s) => {
        if (s.id === siteId) {
          return {
            ...s,
            advances: [newAdvance, ...(s.advances || [])]
          };
        }
        return s;
      })
    );

    showToast(`Advance Payment Recorded: ₹${newAdvance.amount.toLocaleString('en-IN')}`, 'success', `Mode: ${newAdvance.paymentMode}`);
  }, [showToast]);

  const updateAdvance = useCallback((siteId: string, advanceId: string, updates: Partial<AdvancePayment>) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id === siteId) {
          return {
            ...s,
            advances: (s.advances || []).map((a) => {
              if (a.id === advanceId) {
                const amt = updates.amount !== undefined ? Number(updates.amount) : a.amount;
                return {
                  ...a,
                  ...updates,
                  amount: amt
                };
              }
              return a;
            })
          };
        }
        return s;
      })
    );

    showToast(`Advance Payment Updated`, 'success');
  }, [showToast]);

  const deleteAdvance = useCallback((siteId: string, advanceId: string) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id === siteId) {
          return {
            ...s,
            advances: (s.advances || []).filter((a) => a.id !== advanceId)
          };
        }
        return s;
      })
    );
    showToast('Advance Entry Deleted', 'info');
  }, [showToast]);

  const addExpense = useCallback((siteId: string, expenseInput: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const newExpense: ExpenseItem = {
      ...expenseInput,
      quantity: Number(expenseInput.quantity),
      unitRate: Number(expenseInput.unitRate),
      totalAmount: Number(expenseInput.totalAmount) || (Number(expenseInput.quantity) * Number(expenseInput.unitRate)),
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString()
    };

    setSites((prev) =>
      prev.map((s) => {
        if (s.id === siteId) {
          return {
            ...s,
            expenses: [newExpense, ...(s.expenses || [])]
          };
        }
        return s;
      })
    );

    showToast(`Expense Logged: ₹${newExpense.totalAmount.toLocaleString('en-IN')}`, 'success', `${newExpense.category}${newExpense.vendorPayee ? ` - ${newExpense.vendorPayee}` : ''}`);
  }, [showToast]);

  const updateExpense = useCallback((siteId: string, expenseId: string, updates: Partial<ExpenseItem>) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id === siteId) {
          return {
            ...s,
            expenses: (s.expenses || []).map((e) => {
              if (e.id === expenseId) {
                const qty = updates.quantity !== undefined ? Number(updates.quantity) : e.quantity;
                const rate = updates.unitRate !== undefined ? Number(updates.unitRate) : e.unitRate;
                const total = updates.totalAmount !== undefined ? Number(updates.totalAmount) : (qty * rate);
                return {
                  ...e,
                  ...updates,
                  quantity: qty,
                  unitRate: rate,
                  totalAmount: total
                };
              }
              return e;
            })
          };
        }
        return s;
      })
    );
    showToast('Expense Entry Updated', 'success');
  }, [showToast]);

  const deleteExpense = useCallback((siteId: string, expenseId: string) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id === siteId) {
          return {
            ...s,
            expenses: (s.expenses || []).filter((e) => e.id !== expenseId)
          };
        }
        return s;
      })
    );
    showToast('Expense Entry Removed', 'info');
  }, [showToast]);

  const resetToDemoData = useCallback(() => {
    setSites(INITIAL_SITES);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SITES));
    }
    showToast('Demo Data Restored', 'info', 'All 4 sample construction sites have been reset.');
  }, [showToast]);

  return (
    <SiteManagerContext.Provider
      value={{
        sites,
        activeSiteId,
        activeSite,
        searchQuery,
        statusFilter,
        activeTab,
        toasts,
        setActiveSiteId,
        setSearchQuery,
        setStatusFilter,
        setActiveTab,
        addSite,
        updateSite,
        deleteSite,
        addAdvance,
        updateAdvance,
        deleteAdvance,
        addExpense,
        updateExpense,
        deleteExpense,
        showToast,
        dismissToast,
        resetToDemoData,
        calculateFinancials,
        portfolioFinancials,
        filteredSites
      }}
    >
      {children}
    </SiteManagerContext.Provider>
  );
};

export const useSiteManager = () => {
  const context = useContext(SiteManagerContext);
  if (!context) {
    throw new Error('useSiteManager must be used within a SiteManagerProvider');
  }
  return context;
};

// Utility function to format Indian Rupee currency
export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN');
  return `${isNegative ? '- ' : ''}₹${formatted}`;
}
