import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { newId } from '@/lib/id';
import type { Client, AdvancePayment, ExpenseItem } from '../types';
import { compareByDateDesc } from '../utils/dateUtils';

const mapClient = (row: any): Client => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  address: row.address,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  advancePayments: (row.interior_ledger_advances || [])
    .map((p: any) => ({
      id: p.id,
      clientId: row.id,
      sNo: p.s_no,
      date: p.date,
      amount: Number(p.amount),
      mode: p.mode,
      createdAt: p.created_at,
    }))
    .sort((a: AdvancePayment, b: AdvancePayment) =>
      compareByDateDesc(a.date, b.date, a.sNo, b.sNo)
    ),
  expenses: (row.interior_ledger_expenses || [])
    .map((e: any) => ({
      id: e.id,
      clientId: row.id,
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

export const useInteriorLedgerClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setClients([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('interior_ledger_clients')
        .select(`
          id,
          name,
          phone,
          address,
          created_at,
          updated_at,
          interior_ledger_advances (
            id,
            s_no,
            date,
            amount,
            mode,
            created_at
          ),
          interior_ledger_expenses (
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

      if (fetchError) throw fetchError;
      setClients((data || []).map(mapClient));
    } catch (err: any) {
      console.error('Error fetching interior ledger clients from Supabase:', err);
      setError(err.message || 'Failed to fetch interior clients from database.');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(async (clientData: Omit<Client, 'id'>) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const tempId = newId();
    const newClient: Client = {
      ...clientData,
      id: tempId,
      createdAt: new Date().toISOString().slice(0, 10),
      advancePayments: [],
      expenses: [],
    };

    const previousClients = [...clients];
    setClients([newClient, ...clients]);

    try {
      const { data, error: insertError } = await supabase
        .from('interior_ledger_clients')
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
      setClients(previousClients);
      setError(err.message || 'Failed to save client.');
      throw err;
    }
  }, [clients]);

  const updateClient = useCallback(
    async (clientOrId: Client | string, updates?: Partial<Client>): Promise<Client | null> => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const existing =
        typeof clientOrId === 'string'
          ? clients.find((c) => c.id === clientOrId)
          : clients.find((c) => c.id === clientOrId.id);
      if (!existing) return null;

      const nextClient: Client =
        typeof clientOrId === 'string'
          ? { ...existing, ...(updates || {}), updatedAt: new Date().toISOString().slice(0, 10) }
          : { ...clientOrId, updatedAt: new Date().toISOString().slice(0, 10) };

      const previousClients = [...clients];
      setClients((prev) => prev.map((c) => (c.id === nextClient.id ? nextClient : c)));

      try {
        const { error: updateError } = await supabase
          .from('interior_ledger_clients')
          .update({
            name: nextClient.name,
            phone: nextClient.phone,
            address: nextClient.address,
          })
          .eq('id', nextClient.id);

        if (updateError) throw updateError;
        return nextClient;
      } catch (err: any) {
        console.error('Failed to update interior ledger client:', err);
        setClients(previousClients);
        setError(err.message || 'Failed to update client.');
        throw err;
      }
    },
    [clients]
  );

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const previousClients = [...clients];
    setClients((prev) => prev.filter((c) => c.id !== id));

    try {
      const { error: deleteError } = await supabase
        .from('interior_ledger_clients')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger client:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete client.');
      throw err;
    }
  }, [clients]);

  const deleteMultipleClients = useCallback(async (ids: string[]): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const idSet = new Set(ids);
    const previousClients = [...clients];
    setClients((prev) => prev.filter((c) => !idSet.has(c.id)));

    try {
      const { error: deleteError } = await supabase
        .from('interior_ledger_clients')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger clients:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete selected clients.');
      throw err;
    }
  }, [clients]);

  const addAdvancePayment = useCallback(
    async (
      clientId: string,
      paymentData: Omit<AdvancePayment, 'id' | 'sNo'>
    ): Promise<AdvancePayment | null> => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const targetClient = clients.find((c) => c.id === clientId);
      if (!targetClient) return null;

      const sNo = (targetClient.advancePayments?.length || 0) + 1;
      const tempId = newId();
      const newPayment: AdvancePayment = {
        ...paymentData,
        id: tempId,
        clientId,
        sNo,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      const previousClients = [...clients];
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

      try {
        const { data, error: insertError } = await supabase
          .from('interior_ledger_advances')
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
        setClients(previousClients);
        setError(err.message || 'Failed to record advance payment.');
        throw err;
      }
    },
    [clients]
  );

  const updateAdvancePayment = useCallback(
    async (id: string, updates: Partial<AdvancePayment>): Promise<AdvancePayment | null> => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const previousClients = [...clients];
      let updatedResult: AdvancePayment | null = null;

      setClients((prev) =>
        prev.map((c) => {
          const advIdx = (c.advancePayments || []).findIndex((a) => a.id === id);
          if (advIdx === -1) return c;
          const updatedAdvances = c.advancePayments!.map((a) => {
            if (a.id !== id) return a;
            updatedResult = { ...a, ...updates };
            return updatedResult;
          }).sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo));
          return { ...c, advancePayments: updatedAdvances };
        })
      );

      if (!updatedResult) return null;

      try {
        const { error: updateError } = await supabase
          .from('interior_ledger_advances')
          .update({
            date: updatedResult.date,
            amount: updatedResult.amount,
            mode: updatedResult.mode,
          })
          .eq('id', id);

        if (updateError) throw updateError;
        return updatedResult;
      } catch (err: any) {
        console.error('Failed to update interior ledger advance:', err);
        setClients(previousClients);
        setError(err.message || 'Failed to update advance payment.');
        throw err;
      }
    },
    [clients]
  );

  const deleteAdvancePayment = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) => {
        const hasAdv = (c.advancePayments || []).some((a) => a.id === id);
        if (!hasAdv) return c;
        return { ...c, advancePayments: c.advancePayments!.filter((a) => a.id !== id) };
      })
    );

    try {
      const { error: deleteError } = await supabase
        .from('interior_ledger_advances')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger advance:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete advance payment.');
      throw err;
    }
  }, [clients]);

  const deleteMultipleAdvancePayments = useCallback(async (ids: string[]): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const idSet = new Set(ids);
    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) => {
        const hasAny = (c.advancePayments || []).some((a) => idSet.has(a.id));
        if (!hasAny) return c;
        return { ...c, advancePayments: c.advancePayments!.filter((a) => !idSet.has(a.id)) };
      })
    );

    try {
      const { error: deleteError } = await supabase
        .from('interior_ledger_advances')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger advances:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete selected advance payments.');
      throw err;
    }
  }, [clients]);

  const addExpense = useCallback(
    async (
      clientId: string,
      expenseData: Omit<ExpenseItem, 'id' | 'sNo'>
    ): Promise<ExpenseItem | null> => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const targetClient = clients.find((c) => c.id === clientId);
      if (!targetClient) return null;

      const qty = Number(expenseData.quantity) || 1;
      const rate = Number(expenseData.rate) || 0;
      const totalAmount =
        expenseData.totalAmount !== undefined ? Number(expenseData.totalAmount) : qty * rate;
      const sNo = (targetClient.expenses?.length || 0) + 1;
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

      const previousClients = [...clients];
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

      try {
        const { data, error: insertError } = await supabase
          .from('interior_ledger_expenses')
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
        setClients(previousClients);
        setError(err.message || 'Failed to record expense.');
        throw err;
      }
    },
    [clients]
  );

  const updateExpense = useCallback(
    async (id: string, updates: Partial<ExpenseItem>): Promise<ExpenseItem | null> => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const previousClients = [...clients];
      let updatedResult: ExpenseItem | null = null;

      setClients((prev) =>
        prev.map((c) => {
          const expIdx = (c.expenses || []).findIndex((e) => e.id === id);
          if (expIdx === -1) return c;
          const updatedExpenses = c.expenses!.map((e) => {
            if (e.id !== id) return e;
            const qty = updates.quantity !== undefined ? Number(updates.quantity) : e.quantity;
            const rate = updates.rate !== undefined ? Number(updates.rate) : e.rate;
            const totalAmount =
              updates.totalAmount !== undefined ? Number(updates.totalAmount) : qty * rate;
            updatedResult = { ...e, ...updates, quantity: qty, rate, totalAmount };
            return updatedResult;
          }).sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo));
          return { ...c, expenses: updatedExpenses };
        })
      );

      if (!updatedResult) return null;

      try {
        const { error: updateError } = await supabase
          .from('interior_ledger_expenses')
          .update({
            date: updatedResult.date,
            expense_name: updatedResult.expenseName,
            quantity: updatedResult.quantity,
            rate: updatedResult.rate,
            total_amount: updatedResult.totalAmount,
          })
          .eq('id', id);

        if (updateError) throw updateError;
        return updatedResult;
      } catch (err: any) {
        console.error('Failed to update interior ledger expense:', err);
        setClients(previousClients);
        setError(err.message || 'Failed to update expense.');
        throw err;
      }
    },
    [clients]
  );

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) => {
        const hasExp = (c.expenses || []).some((e) => e.id === id);
        if (!hasExp) return c;
        return { ...c, expenses: c.expenses!.filter((e) => e.id !== id) };
      })
    );

    try {
      const { error: deleteError } = await supabase
        .from('interior_ledger_expenses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger expense:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete expense.');
      throw err;
    }
  }, [clients]);

  const deleteMultipleExpenses = useCallback(async (ids: string[]): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const idSet = new Set(ids);
    const previousClients = [...clients];
    setClients((prev) =>
      prev.map((c) => {
        const hasAny = (c.expenses || []).some((e) => idSet.has(e.id));
        if (!hasAny) return c;
        return { ...c, expenses: c.expenses!.filter((e) => !idSet.has(e.id)) };
      })
    );

    try {
      const { error: deleteError } = await supabase
        .from('interior_ledger_expenses')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Failed to delete interior ledger expenses:', err);
      setClients(previousClients);
      setError(err.message || 'Failed to delete selected expenses.');
      throw err;
    }
  }, [clients]);

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
