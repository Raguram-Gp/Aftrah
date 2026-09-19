import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { newId } from '@/lib/id';
import type { Client, AdvancePayment, ExpenseItem } from '../types';
import { compareByDateDesc } from '../utils/dateUtils';

const STORAGE_KEY = 'afrah_interior_ledger_clients';

const normalizePhone = (phone: string) => phone.replace(/\s+/g, '').trim();

const mapRow = (c: any): Client => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  address: c.address,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  advancePayments: (c.interior_client_advances || [])
    .map((p: any) => ({
      id: p.id,
      clientId: c.id,
      sNo: p.s_no,
      date: p.date,
      amount: Number(p.amount),
      mode: p.mode,
      createdAt: p.created_at,
    }))
    .sort((a: AdvancePayment, b: AdvancePayment) =>
      compareByDateDesc(a.date, b.date, a.sNo, b.sNo)
    ),
  expenses: (c.interior_client_ledger_expenses || [])
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
    .sort((a: ExpenseItem, b: ExpenseItem) =>
      compareByDateDesc(a.date, b.date, a.sNo, b.sNo)
    ),
});

const LEDGER_SELECT = `
  id,
  name,
  phone,
  address,
  created_at,
  updated_at,
  interior_client_advances (
    id,
    s_no,
    date,
    amount,
    mode,
    created_at
  ),
  interior_client_ledger_expenses (
    id,
    s_no,
    date,
    expense_name,
    quantity,
    rate,
    total_amount,
    created_at
  )
`;

const loadLocalLedger = (): Client[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const clearLocalLedger = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

export const useInteriorLedgerClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const importAttempted = useRef(false);

  const fetchClients = useCallback(async (): Promise<Client[]> => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return [];
    }

    const { data, error: fetchError } = await supabase
      .from('interior_client')
      .select(LEDGER_SELECT)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    const mapped: Client[] = (data || []).map(mapRow);
    setClients(mapped);
    return mapped;
  }, []);

  const importLocalIfNeeded = useCallback(async (existing: Client[]) => {
    if (importAttempted.current || typeof window === 'undefined') return;
    importAttempted.current = true;

    const local = loadLocalLedger();
    if (local.length === 0) {
      clearLocalLedger();
      return;
    }

    const existingPhones = new Set(existing.map((c) => normalizePhone(c.phone)));
    const toImport = local.filter((c) => c.phone && !existingPhones.has(normalizePhone(c.phone)));

    try {
      for (const localClient of toImport) {
        const { data: inserted, error: insertError } = await supabase
          .from('interior_client')
          .insert({
            name: localClient.name,
            phone: localClient.phone,
            address: localClient.address || '',
            created_at: localClient.createdAt || new Date().toISOString(),
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (!inserted?.id) continue;

        const advances = localClient.advancePayments || [];
        if (advances.length > 0) {
          const { error: advError } = await supabase.from('interior_client_advances').insert(
            advances.map((p, idx) => ({
              client_id: inserted.id,
              s_no: p.sNo || idx + 1,
              date: p.date,
              amount: p.amount,
              mode: p.mode || 'HDFC Bank',
            }))
          );
          if (advError) throw advError;
        }

        const expenses = localClient.expenses || [];
        if (expenses.length > 0) {
          const { error: expError } = await supabase.from('interior_client_ledger_expenses').insert(
            expenses.map((e, idx) => ({
              client_id: inserted.id,
              s_no: e.sNo || idx + 1,
              date: e.date,
              expense_name: e.expenseName,
              quantity: e.quantity,
              rate: e.rate,
              total_amount: e.totalAmount,
            }))
          );
          if (expError) throw expError;
        }
      }
    } catch (err: any) {
      console.error('Failed to import local interior ledger clients:', err);
      setError(err?.message || 'Failed to import local interior clients.');
    } finally {
      clearLocalLedger();
    }

    if (toImport.length > 0) {
      await fetchClients();
    }
  }, [fetchClients]);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const mapped = await fetchClients();
        if (!cancelled) await importLocalIfNeeded(mapped);
      } catch (err: any) {
        if (!cancelled) {
          console.error('Error fetching interior ledger clients:', err);
          setError(err.message || 'Failed to fetch interior ledger clients.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    boot();
    return () => {
      cancelled = true;
    };
  }, [fetchClients, importLocalIfNeeded]);

  const addClient = async (clientData: Omit<Client, 'id'>): Promise<Client | null> => {
    const tempId = newId();
    const newClient: Client = {
      ...clientData,
      id: tempId,
      createdAt: new Date().toISOString().slice(0, 10),
      advancePayments: [],
      expenses: [],
    };

    const previous = [...clients];
    setClients([newClient, ...clients]);

    if (!isSupabaseConfigured) return newClient;

    try {
      const { data, error: insertError } = await supabase
        .from('interior_client')
        .insert({
          name: clientData.name,
          phone: clientData.phone,
          address: clientData.address,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const saved = { ...newClient, id: data.id, createdAt: data.created_at, updatedAt: data.updated_at };
      setClients((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
      return saved;
    } catch (err: any) {
      console.error('Failed to insert interior ledger client:', err);
      setClients(previous);
      setError(err.message || 'Failed to save client.');
      throw err;
    }
  };

  const updateClient = async (
    clientOrId: Client | string,
    updates?: Partial<Client>
  ): Promise<Client | null> => {
    const previous = [...clients];
    const id = typeof clientOrId === 'string' ? clientOrId : clientOrId.id;
    const next: Client | null =
      typeof clientOrId === 'string'
        ? (() => {
            const current = clients.find((c) => c.id === id);
            if (!current) return null;
            return { ...current, ...(updates || {}), updatedAt: new Date().toISOString().slice(0, 10) };
          })()
        : { ...clientOrId, updatedAt: new Date().toISOString().slice(0, 10) };

    if (!next) return null;

    setClients((prev) => prev.map((c) => (c.id === id ? next : c)));

    if (!isSupabaseConfigured) return next;

    try {
      const { error: updateError } = await supabase
        .from('interior_client')
        .update({
          name: next.name,
          phone: next.phone,
          address: next.address,
        })
        .eq('id', id);

      if (updateError) throw updateError;
      return next;
    } catch (err: any) {
      console.error('Failed to update interior ledger client:', err);
      setClients(previous);
      setError(err.message || 'Failed to update client.');
      throw err;
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    const previous = [...clients];
    setClients((prev) => prev.filter((c) => c.id !== id));

    if (!isSupabaseConfigured) return true;

    try {
      const { error: deleteError } = await supabase.from('interior_client').delete().eq('id', id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger client:', err);
      setClients(previous);
      setError(err.message || 'Failed to delete client.');
      throw err;
    }
  };

  const deleteMultipleClients = async (ids: string[]): Promise<boolean> => {
    const previous = [...clients];
    const idSet = new Set(ids);
    setClients((prev) => prev.filter((c) => !idSet.has(c.id)));

    if (!isSupabaseConfigured) return true;

    try {
      const { error: deleteError } = await supabase.from('interior_client').delete().in('id', ids);
      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger clients:', err);
      setClients(previous);
      setError(err.message || 'Failed to delete selected clients.');
      throw err;
    }
  };

  const addAdvancePayment = async (
    clientId: string,
    paymentData: Omit<AdvancePayment, 'id' | 'sNo'>
  ): Promise<AdvancePayment | null> => {
    const target = clients.find((c) => c.id === clientId);
    if (!target) return null;

    const sNo = (target.advancePayments?.length || 0) + 1;
    const tempId = newId();
    const newPayment: AdvancePayment = {
      ...paymentData,
      id: tempId,
      clientId,
      sNo,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const previous = [...clients];
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              advancePayments: [...(c.advancePayments || []), newPayment].sort((a, b) =>
                compareByDateDesc(a.date, b.date, a.sNo, b.sNo)
              ),
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return newPayment;

    try {
      const { data, error: insertError } = await supabase
        .from('interior_client_advances')
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

      const saved = { ...newPayment, id: data.id, createdAt: data.created_at };
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? {
                ...c,
                advancePayments: (c.advancePayments || [])
                  .map((p) => (p.id === tempId ? saved : p))
                  .sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo)),
              }
            : c
        )
      );
      return saved;
    } catch (err: any) {
      console.error('Failed to insert interior ledger advance:', err);
      setClients(previous);
      setError(err.message || 'Failed to record advance payment.');
      throw err;
    }
  };

  const updateAdvancePayment = async (
    id: string,
    updates: Partial<AdvancePayment>
  ): Promise<AdvancePayment | null> => {
    const previous = [...clients];
    let saved: AdvancePayment | null = null;

    setClients((prev) =>
      prev.map((c) => {
        const idx = (c.advancePayments || []).findIndex((a) => a.id === id);
        if (idx === -1) return c;
        const nextAdvances = c.advancePayments!.map((a) => {
          if (a.id !== id) return a;
          saved = { ...a, ...updates };
          return saved;
        }).sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo));
        return { ...c, advancePayments: nextAdvances };
      })
    );

    if (!saved) return null;
    if (!isSupabaseConfigured) return saved;

    try {
      const { error: updateError } = await supabase
        .from('interior_client_advances')
        .update({
          date: saved.date,
          amount: saved.amount,
          mode: saved.mode,
        })
        .eq('id', id);

      if (updateError) throw updateError;
      return saved;
    } catch (err: any) {
      console.error('Failed to update interior ledger advance:', err);
      setClients(previous);
      setError(err.message || 'Failed to update advance payment.');
      throw err;
    }
  };

  const deleteAdvancePayment = async (id: string): Promise<boolean> => {
    const previous = [...clients];
    setClients((prev) =>
      prev.map((c) => {
        if (!(c.advancePayments || []).some((a) => a.id === id)) return c;
        return {
          ...c,
          advancePayments: (c.advancePayments || []).filter((a) => a.id !== id),
        };
      })
    );

    if (!isSupabaseConfigured) return true;

    try {
      const { error: deleteError } = await supabase.from('interior_client_advances').delete().eq('id', id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger advance:', err);
      setClients(previous);
      setError(err.message || 'Failed to delete advance payment.');
      throw err;
    }
  };

  const deleteMultipleAdvancePayments = async (ids: string[]): Promise<boolean> => {
    const previous = [...clients];
    const idSet = new Set(ids);
    setClients((prev) =>
      prev.map((c) => {
        if (!(c.advancePayments || []).some((a) => idSet.has(a.id))) return c;
        return {
          ...c,
          advancePayments: (c.advancePayments || []).filter((a) => !idSet.has(a.id)),
        };
      })
    );

    if (!isSupabaseConfigured) return true;

    try {
      const { error: deleteError } = await supabase.from('interior_client_advances').delete().in('id', ids);
      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger advances:', err);
      setClients(previous);
      setError(err.message || 'Failed to delete selected advance payments.');
      throw err;
    }
  };

  const addExpense = async (
    clientId: string,
    expenseData: Omit<ExpenseItem, 'id' | 'sNo'>
  ): Promise<ExpenseItem | null> => {
    const target = clients.find((c) => c.id === clientId);
    if (!target) return null;

    const qty = Number(expenseData.quantity) || 1;
    const rate = Number(expenseData.rate) || 0;
    const totalAmount =
      expenseData.totalAmount !== undefined ? Number(expenseData.totalAmount) : qty * rate;
    const sNo = (target.expenses?.length || 0) + 1;
    const tempId = newId();
    const newExp: ExpenseItem = {
      ...expenseData,
      id: tempId,
      clientId,
      sNo,
      quantity: qty,
      rate,
      totalAmount,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const previous = [...clients];
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              expenses: [...(c.expenses || []), newExp].sort((a, b) =>
                compareByDateDesc(a.date, b.date, a.sNo, b.sNo)
              ),
            }
          : c
      )
    );

    if (!isSupabaseConfigured) return newExp;

    try {
      const { data, error: insertError } = await supabase
        .from('interior_client_ledger_expenses')
        .insert({
          client_id: clientId,
          s_no: sNo,
          date: expenseData.date,
          expense_name: expenseData.expenseName,
          quantity: qty,
          rate,
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const saved = { ...newExp, id: data.id, createdAt: data.created_at };
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? {
                ...c,
                expenses: (c.expenses || [])
                  .map((e) => (e.id === tempId ? saved : e))
                  .sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo)),
              }
            : c
        )
      );
      return saved;
    } catch (err: any) {
      console.error('Failed to insert interior ledger expense:', err);
      setClients(previous);
      setError(err.message || 'Failed to record expense.');
      throw err;
    }
  };

  const updateExpense = async (
    id: string,
    updates: Partial<ExpenseItem>
  ): Promise<ExpenseItem | null> => {
    const previous = [...clients];
    let saved: ExpenseItem | null = null;

    setClients((prev) =>
      prev.map((c) => {
        const idx = (c.expenses || []).findIndex((e) => e.id === id);
        if (idx === -1) return c;
        const nextExpenses = c.expenses!.map((e) => {
          if (e.id !== id) return e;
          const qty = updates.quantity !== undefined ? Number(updates.quantity) : e.quantity;
          const rate = updates.rate !== undefined ? Number(updates.rate) : e.rate;
          const totalAmount =
            updates.totalAmount !== undefined ? Number(updates.totalAmount) : qty * rate;
          saved = { ...e, ...updates, quantity: qty, rate, totalAmount };
          return saved;
        }).sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo));
        return { ...c, expenses: nextExpenses };
      })
    );

    if (!saved) return null;
    if (!isSupabaseConfigured) return saved;

    try {
      const { error: updateError } = await supabase
        .from('interior_client_ledger_expenses')
        .update({
          date: saved.date,
          expense_name: saved.expenseName,
          quantity: saved.quantity,
          rate: saved.rate,
          total_amount: saved.totalAmount,
        })
        .eq('id', id);

      if (updateError) throw updateError;
      return saved;
    } catch (err: any) {
      console.error('Failed to update interior ledger expense:', err);
      setClients(previous);
      setError(err.message || 'Failed to update expense.');
      throw err;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    const previous = [...clients];
    setClients((prev) =>
      prev.map((c) => {
        if (!(c.expenses || []).some((e) => e.id === id)) return c;
        return { ...c, expenses: (c.expenses || []).filter((e) => e.id !== id) };
      })
    );

    if (!isSupabaseConfigured) return true;

    try {
      const { error: deleteError } = await supabase
        .from('interior_client_ledger_expenses')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger expense:', err);
      setClients(previous);
      setError(err.message || 'Failed to delete expense.');
      throw err;
    }
  };

  const deleteMultipleExpenses = async (ids: string[]): Promise<boolean> => {
    const previous = [...clients];
    const idSet = new Set(ids);
    setClients((prev) =>
      prev.map((c) => {
        if (!(c.expenses || []).some((e) => idSet.has(e.id))) return c;
        return { ...c, expenses: (c.expenses || []).filter((e) => !idSet.has(e.id)) };
      })
    );

    if (!isSupabaseConfigured) return true;

    try {
      const { error: deleteError } = await supabase
        .from('interior_client_ledger_expenses')
        .delete()
        .in('id', ids);
      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger expenses:', err);
      setClients(previous);
      setError(err.message || 'Failed to delete selected expenses.');
      throw err;
    }
  };

  return {
    clients,
    isLoading,
    error,
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
