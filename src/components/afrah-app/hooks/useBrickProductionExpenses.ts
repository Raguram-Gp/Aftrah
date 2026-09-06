import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { BrickProductionExpense } from '../types';

export const useBrickProductionExpenses = () => {
  const [expenses, setExpenses] = useState<BrickProductionExpense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses from Supabase
  const fetchExpenses = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('brick_production_expenses')
        .select(`
          id,
          s_no,
          date,
          category,
          expense_name,
          quantity,
          unit,
          rate,
          total_amount,
          payment_mode,
          paid_to,
          vehicle_number,
          notes,
          created_at,
          updated_at
        `)
        .order('date', { ascending: false })
        .order('s_no', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        const mapped: BrickProductionExpense[] = data.map((item: any, idx: number) => ({
          id: item.id,
          sNo: item.s_no || idx + 1,
          date: item.date,
          category: item.category,
          expenseName: item.expense_name,
          quantity: Number(item.quantity) || 1,
          unit: item.unit || 'Units',
          rate: Number(item.rate) || 0,
          totalAmount: Number(item.total_amount) || 0,
          paymentMode: item.payment_mode || 'Cash',
          paidTo: item.paid_to || '',
          vehicleNumber: item.vehicle_number || '',
          notes: item.notes || '',
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

        setExpenses(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching brick production expenses from Supabase:', err);
      setError(err?.message || 'Failed to load production expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Add Expense
  const addExpense = useCallback(
    async (
      data: Omit<BrickProductionExpense, 'id' | 'sNo' | 'createdAt' | 'updatedAt'>
    ) => {
      try {
        setError(null);
        const sNo = expenses.length + 1;

        const { data: inserted, error: insertError } = await supabase
          .from('brick_production_expenses')
          .insert({
            s_no: sNo,
            date: data.date,
            category: data.category,
            expense_name: data.expenseName,
            quantity: Number(data.quantity) || 1,
            unit: data.unit || 'Units',
            rate: Number(data.rate) || 0,
            total_amount: Number(data.totalAmount) || 0,
            payment_mode: data.paymentMode || 'Cash',
            paid_to: data.paidTo || null,
            vehicle_number: data.vehicleNumber || null,
            notes: data.notes || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newExpense: BrickProductionExpense = {
          id: inserted.id,
          sNo: inserted.s_no,
          date: inserted.date,
          category: inserted.category,
          expenseName: inserted.expense_name,
          quantity: Number(inserted.quantity),
          unit: inserted.unit,
          rate: Number(inserted.rate),
          totalAmount: Number(inserted.total_amount),
          paymentMode: inserted.payment_mode,
          paidTo: inserted.paid_to || '',
          vehicleNumber: inserted.vehicle_number || '',
          notes: inserted.notes || '',
          createdAt: inserted.created_at,
          updatedAt: inserted.updated_at,
        };

        setExpenses((prev) => [newExpense, ...prev].map((item, idx) => ({ ...item, sNo: idx + 1 })));
        return newExpense;
      } catch (err: any) {
        console.error('Error adding production expense:', err);
        setError(err.message || 'Failed to add production expense');
        throw err;
      }
    },
    [expenses]
  );

  // Update Expense
  const updateExpense = useCallback(
    async (updated: BrickProductionExpense) => {
      try {
        setError(null);
        const { error: updateError } = await supabase
          .from('brick_production_expenses')
          .update({
            date: updated.date,
            category: updated.category,
            expense_name: updated.expenseName,
            quantity: Number(updated.quantity) || 1,
            unit: updated.unit || 'Units',
            rate: Number(updated.rate) || 0,
            total_amount: Number(updated.totalAmount) || 0,
            payment_mode: updated.paymentMode,
            paid_to: updated.paidTo || null,
            vehicle_number: updated.vehicleNumber || null,
            notes: updated.notes || null,
          })
          .eq('id', updated.id);

        if (updateError) throw updateError;

        setExpenses((prev) =>
          prev.map((item) =>
            item.id === updated.id
              ? {
                  ...updated,
                  quantity: Number(updated.quantity) || 1,
                  rate: Number(updated.rate) || 0,
                  totalAmount: Number(updated.totalAmount) || 0,
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
      } catch (err: any) {
        console.error('Error updating production expense:', err);
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
      const { error: deleteError } = await supabase
        .from('brick_production_expenses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setExpenses((prev) => {
        const filtered = prev.filter((item) => item.id !== id);
        return filtered.map((item, idx) => ({ ...item, sNo: idx + 1 }));
      });
    } catch (err: any) {
      console.error('Error deleting production expense:', err);
      setError(err.message || 'Failed to delete production expense');
      throw err;
    }
  }, []);

  // Delete Multiple Expenses
  const deleteMultipleExpenses = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('brick_production_expenses')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      const idSet = new Set(ids);
      setExpenses((prev) => {
        const filtered = prev.filter((item) => !idSet.has(item.id));
        return filtered.map((item, idx) => ({ ...item, sNo: idx + 1 }));
      });
    } catch (err: any) {
      console.error('Error deleting multiple production expenses:', err);
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
    refreshExpenses: fetchExpenses,
  };
};
