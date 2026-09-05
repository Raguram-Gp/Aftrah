import { useState, useEffect, useCallback, useMemo } from 'react';
import type { BrickProductionExpense } from '../types';
import { INITIAL_BRICK_PRODUCTION_EXPENSES } from '../data/initialBrickProductionExpenses';

const LOCAL_STORAGE_KEY = 'aftrah_brick_production_expenses_v4';

export const useBrickProductionExpenses = () => {
  const [expenses, setExpenses] = useState<BrickProductionExpense[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Validate that cached items are not legacy long description mock data
            const isLegacy = parsed.some(
              (item: any) =>
                typeof item.expenseName === 'string' &&
                (item.expenseName.includes('Casuarina') ||
                  item.expenseName.includes('Firewood') ||
                  item.expenseName.includes('Pugmill') ||
                  item.expenseName.includes('அறுப்பு'))
            );
            if (!isLegacy) {
              return parsed;
            }
          }
        }
      } catch (e) {
        console.warn('Unable to read brick production expenses from localStorage', e);
      }
    }
    return INITIAL_BRICK_PRODUCTION_EXPENSES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
      } catch (e) {
        console.warn('Unable to persist brick production expenses', e);
      }
    }
  }, [expenses]);

  // Reset to default list matching the user options
  const resetToDefaultExpenses = useCallback(() => {
    setExpenses(INITIAL_BRICK_PRODUCTION_EXPENSES);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_BRICK_PRODUCTION_EXPENSES));
      } catch (e) {
        console.warn('Unable to reset brick production expenses in localStorage', e);
      }
    }
  }, []);

  // Add Expense
  const addExpense = useCallback(
    async (
      data: Omit<BrickProductionExpense, 'id' | 'sNo' | 'createdAt' | 'updatedAt'>
    ) => {
      try {
        setError(null);
        const newExpense: BrickProductionExpense = {
          id: `bpe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          sNo: 1,
          date: data.date,
          category: data.category,
          expenseName: data.expenseName,
          quantity: Number(data.quantity) || 1,
          unit: data.unit,
          rate: Number(data.rate) || 0,
          totalAmount: Number(data.totalAmount) || 0,
          paymentMode: data.paymentMode,
          paidTo: data.paidTo || '',
          vehicleNumber: data.vehicleNumber || '',
          notes: data.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setExpenses((prev) => {
          const next = [newExpense, ...prev];
          return next.map((item, idx) => ({ ...item, sNo: idx + 1 }));
        });

        return newExpense;
      } catch (err: any) {
        setError(err.message || 'Failed to add production expense');
        throw err;
      }
    },
    []
  );

  // Update Expense
  const updateExpense = useCallback(
    async (updated: BrickProductionExpense) => {
      try {
        setError(null);
        setExpenses((prev) =>
          prev.map((item) =>
            item.id === updated.id
              ? {
                  ...updated,
                  quantity: Number(updated.quantity) || 1,
                  rate: Number(updated.rate) || 0,
                  totalAmount: Number(updated.totalAmount) || 0,
                  updatedAt: new Date().toISOString()
                }
              : item
          )
        );
      } catch (err: any) {
        setError(err.message || 'Failed to update production expense');
        throw err;
      }
    },
    []
  );

  // Delete Expense
  const deleteExpense = useCallback(async (id: string) => {
    try {
      setError(null);
      setExpenses((prev) => {
        const filtered = prev.filter((item) => item.id !== id);
        return filtered.map((item, idx) => ({ ...item, sNo: idx + 1 }));
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete production expense');
      throw err;
    }
  }, []);

  // Delete Multiple Expenses
  const deleteMultipleExpenses = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      const idSet = new Set(ids);
      setExpenses((prev) => {
        const filtered = prev.filter((item) => !idSet.has(item.id));
        return filtered.map((item, idx) => ({ ...item, sNo: idx + 1 }));
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete selected expenses');
      throw err;
    }
  }, []);

  // Statistical Aggregations
  const stats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);

    const fuelMaterialExpenses = expenses.reduce((sum, item) => {
      const cat = (item.category || '').toLowerCase();
      if (
        cat.includes('wood') ||
        cat.includes('fuel') ||
        cat.includes('soil') ||
        cat.includes('msand') ||
        cat.includes('disel') ||
        cat.includes('oil')
      ) {
        return sum + (Number(item.totalAmount) || 0);
      }
      return sum;
    }, 0);

    const laborWagesExpenses = expenses.reduce((sum, item) => {
      const cat = (item.category || '').toLowerCase();
      if (
        cat.includes('jcb') ||
        cat.includes('tractor') ||
        cat.includes('rent') ||
        cat.includes('machine')
      ) {
        return sum + (Number(item.totalAmount) || 0);
      }
      return sum;
    }, 0);

    const currentYearMonth = new Date().toISOString().slice(0, 7);
    const thisMonthExpenses = expenses.reduce((sum, item) => {
      if ((item.date || '').startsWith(currentYearMonth)) {
        return sum + (Number(item.totalAmount) || 0);
      }
      return sum;
    }, 0);

    return {
      totalExpenses,
      fuelMaterialExpenses,
      laborWagesExpenses,
      thisMonthExpenses
    };
  }, [expenses]);

  return {
    expenses,
    isLoading,
    error,
    stats,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteMultipleExpenses,
    resetToDefaultExpenses
  };
};
