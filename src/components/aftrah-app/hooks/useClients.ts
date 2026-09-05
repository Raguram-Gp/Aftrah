import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { Client, AdvancePayment, ExpenseItem } from '../types';
import { INITIAL_CLIENTS } from '../data/initialClients';

const LOCAL_STORAGE_KEY = 'aftrah_clients_cache_v1';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Unable to read client cache from localStorage', e);
      }
    }
    return INITIAL_CLIENTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync to local fallback storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clients));
      } catch (e) {
        console.warn('Unable to persist client cache', e);
      }
    }
  }, [clients]);

  // Fetch clients from Supabase
  const fetchClients = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone,
          address,
          created_at,
          updated_at,
          client_advance_payments (
            id,
            s_no,
            date,
            amount,
            mode,
            created_at
          ),
          client_expenses (
            id,
            s_no,
            date,
            expense_name,
            quantity,
            rate,
            total_amount,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        const mappedClients: Client[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          address: c.address,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          advancePayments: (c.client_advance_payments || [])
            .map((p: any) => ({
              id: p.id,
              clientId: c.id,
              sNo: p.s_no,
              date: p.date,
              amount: Number(p.amount),
              mode: p.mode,
              createdAt: p.created_at,
            }))
            .sort((a: AdvancePayment, b: AdvancePayment) => a.sNo - b.sNo),
          expenses: (c.client_expenses || [])
            .map((e: any) => ({
              id: e.id,
              clientId: c.id,
              sNo: e.s_no,
              date: e.date,
              expenseName: e.expense_name,
              quantity: Number(e.quantity),
              rate: Number(e.rate),
              totalAmount: Number(e.total_amount),
              createdAt: e.created_at,
            }))
            .sort((a: ExpenseItem, b: ExpenseItem) => a.sNo - b.sNo),
        }));

        setClients(mappedClients);
      }
    } catch (err: any) {
      console.error('Error fetching clients from Supabase:', err);
      setError(err.message || 'Failed to fetch clients from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ADD CLIENT
  const addClient = async (clientData: Omit<Client, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id: tempId,
      createdAt: new Date().toISOString().slice(0, 10),
      advancePayments: [],
      expenses: [],
    };

    const previousClients = [...clients];
    setClients([newClient, ...clients]);

    if (!isSupabaseConfigured) return newClient;

    try {
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          phone: clientData.phone,
          address: clientData.address,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setClients((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: data.id } : c))
        );
        return { ...newClient, id: data.id };
      }
    } catch (err: any) {
      console.error('Failed to insert client into Supabase:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to save client.');
      throw err;
    }
    return newClient;
  };

  // UPDATE CLIENT
  const updateClient = async (updatedClient: Client) => {
    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          name: updatedClient.name,
          phone: updatedClient.phone,
          address: updatedClient.address,
        })
        .eq('id', updatedClient.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Failed to update client in Supabase:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to update client.');
      throw err;
    }
  };

  // DELETE CLIENT
  const deleteClient = async (id: string) => {
    const previousClients = [...clients];
    setClients((prev) => prev.filter((c) => c.id !== id));

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete client in Supabase:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete client.');
      throw err;
    }
  };

  // ADVANCE PAYMENTS CRUD
  const addAdvancePayment = async (
    clientId: string,
    paymentData: Omit<AdvancePayment, 'id' | 'sNo'>
  ) => {
    const targetClient = clients.find((c) => c.id === clientId);
    if (!targetClient) return;

    const sNo = (targetClient.advancePayments?.length || 0) + 1;
    const tempId = `adv-${Date.now()}`;
    const newPayment: AdvancePayment = {
      ...paymentData,
      id: tempId,
      clientId,
      sNo,
    };

    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, advancePayments: [...(c.advancePayments || []), newPayment] }
          : c
      )
    );

    if (!isSupabaseConfigured) return newPayment;

    try {
      const { data, error: insertError } = await supabase
        .from('client_advance_payments')
        .insert({
          client_id: clientId,
          s_no: sNo,
          date: paymentData.date,
          amount: paymentData.amount,
          mode: paymentData.mode,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  advancePayments: (c.advancePayments || []).map((p) =>
                    p.id === tempId ? { ...p, id: data.id } : p
                  ),
                }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to insert advance payment:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to record advance payment.');
      throw err;
    }
  };

  const updateAdvancePayment = async (clientId: string, updated: AdvancePayment) => {
    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              advancePayments: (c.advancePayments || []).map((p) =>
                p.id === updated.id ? updated : p
              ),
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: updateError } = await supabase
        .from('client_advance_payments')
        .update({
          date: updated.date,
          amount: updated.amount,
          mode: updated.mode,
        })
        .eq('id', updated.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Failed to update advance payment:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to update advance payment.');
      throw err;
    }
  };

  const deleteAdvancePayment = async (clientId: string, paymentId: string) => {
    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              advancePayments: (c.advancePayments || [])
                .filter((p) => p.id !== paymentId)
                .map((p, idx) => ({ ...p, sNo: idx + 1 })),
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('client_advance_payments')
        .delete()
        .eq('id', paymentId);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete advance payment:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete advance payment.');
      throw err;
    }
  };

  // EXPENSES CRUD
  const addExpense = async (
    clientId: string,
    expenseData: Omit<ExpenseItem, 'id' | 'sNo'>
  ) => {
    const targetClient = clients.find((c) => c.id === clientId);
    if (!targetClient) return;

    const sNo = (targetClient.expenses?.length || 0) + 1;
    const tempId = `exp-${Date.now()}`;
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: tempId,
      clientId,
      sNo,
    };

    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, expenses: [...(c.expenses || []), newExpense] }
          : c
      )
    );

    if (!isSupabaseConfigured) return newExpense;

    try {
      const { data, error: insertError } = await supabase
        .from('client_expenses')
        .insert({
          client_id: clientId,
          s_no: sNo,
          date: expenseData.date,
          expense_name: expenseData.expenseName,
          quantity: expenseData.quantity,
          rate: expenseData.rate,
          total_amount: expenseData.totalAmount,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === clientId
              ? {
                  ...c,
                  expenses: (c.expenses || []).map((e) =>
                    e.id === tempId ? { ...e, id: data.id } : e
                  ),
                }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to insert expense:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to record expense.');
      throw err;
    }
  };

  const updateExpense = async (clientId: string, updated: ExpenseItem) => {
    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              expenses: (c.expenses || []).map((e) =>
                e.id === updated.id ? updated : e
              ),
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: updateError } = await supabase
        .from('client_expenses')
        .update({
          date: updated.date,
          expense_name: updated.expenseName,
          quantity: updated.quantity,
          rate: updated.rate,
          total_amount: updated.totalAmount,
        })
        .eq('id', updated.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Failed to update expense:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to update expense.');
      throw err;
    }
  };

  const deleteExpense = async (clientId: string, expenseId: string) => {
    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              expenses: (c.expenses || [])
                .filter((e) => e.id !== expenseId)
                .map((e, idx) => ({ ...e, sNo: idx + 1 })),
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('client_expenses')
        .delete()
        .eq('id', expenseId);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete expense:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete expense.');
      throw err;
    }
  };

  const deleteMultipleAdvancePayments = async (clientId: string, paymentIds: string[]) => {
    const previousClients = [...clients];
    const idSet = new Set(paymentIds);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              advancePayments: (c.advancePayments || [])
                .filter((p) => !idSet.has(p.id))
                .map((p, idx) => ({ ...p, sNo: idx + 1 })),
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('client_advance_payments')
        .delete()
        .in('id', paymentIds);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete advance payments:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete selected advance payments.');
      throw err;
    }
  };

  const deleteMultipleExpenses = async (clientId: string, expenseIds: string[]) => {
    const previousClients = [...clients];
    const idSet = new Set(expenseIds);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              expenses: (c.expenses || [])
                .filter((e) => !idSet.has(e.id))
                .map((e, idx) => ({ ...e, sNo: idx + 1 })),
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('client_expenses')
        .delete()
        .in('id', expenseIds);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete expenses:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete selected expenses.');
      throw err;
    }
  };

  const deleteMultipleClients = async (ids: string[]) => {
    const previousClients = [...clients];
    const idSet = new Set(ids);
    setClients((prev) => prev.filter((c) => !idSet.has(c.id)));

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete clients:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete selected clients.');
      throw err;
    }
  };

  return {
    clients,
    isLoading,
    error,
    isLiveDb: isSupabaseConfigured,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    deleteMultipleClients,
    addAdvancePayment,
    updateAdvancePayment,
    deleteAdvancePayment,
    deleteMultipleAdvancePayments,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteMultipleExpenses,
  };
};
