import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { InteriorClient, InteriorAdvancePayment, InteriorExpenseItem } from '../types';

export const useInteriorClients = () => {
  const [interiorClients, setInteriorClients] = useState<InteriorClient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // FETCH ALL INTERIOR CLIENTS WITH NESTED ADVANCES & EXPENSES
  const fetchClients = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('interior_clients')
        .select(`
          id,
          s_no,
          name,
          phone,
          address,
          site_location,
          project_scope,
          created_at,
          updated_at,
          interior_client_advances (
            id,
            s_no,
            date,
            amount,
            mode,
            note,
            created_at
          ),
          interior_client_expenses (
            id,
            s_no,
            date,
            category,
            expense_name,
            quantity,
            unit,
            rate,
            total_amount,
            created_at
          )
        `)
        .order('s_no', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        const mapped: InteriorClient[] = data.map((c: any, index: number) => ({
          id: c.id,
          sNo: c.s_no || index + 1,
          name: c.name,
          phone: c.phone,
          address: c.address,
          siteLocation: c.site_location || '',
          projectScope: c.project_scope || '',
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          advancePayments: (c.interior_client_advances || [])
            .map((a: any) => ({
              id: a.id,
              clientId: c.id,
              sNo: a.s_no,
              date: a.date,
              amount: Number(a.amount) || 0,
              mode: a.mode,
              note: a.note || '',
              createdAt: a.created_at,
            }))
            .sort((a: any, b: any) => a.sNo - b.sNo),
          expenses: (c.interior_client_expenses || [])
            .map((e: any) => ({
              id: e.id,
              clientId: c.id,
              sNo: e.s_no,
              date: e.date,
              category: e.category || 'OTHER WORK',
              expenseName: e.expense_name,
              quantity: Number(e.quantity) || 1,
              unit: e.unit || 'Sq.ft',
              rate: Number(e.rate) || 0,
              totalAmount: Number(e.total_amount) || 0,
              createdAt: e.created_at,
            }))
            .sort((a: any, b: any) => a.sNo - b.sNo),
        }));

        setInteriorClients(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching interior clients from Supabase:', err);
      setError(err?.message || 'Failed to load interior clients');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ADD INTERIOR CLIENT
  const addClient = async (clientData: Omit<InteriorClient, 'id' | 'sNo'>) => {
    try {
      setError(null);
      const nextSNo = interiorClients.length + 1;

      const { data, error: insertError } = await supabase
        .from('interior_clients')
        .insert({
          s_no: nextSNo,
          name: clientData.name,
          phone: clientData.phone,
          address: clientData.address,
          site_location: clientData.siteLocation || null,
          project_scope: clientData.projectScope || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newClient: InteriorClient = {
        ...clientData,
        id: data.id,
        sNo: data.s_no,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        advancePayments: [],
        expenses: [],
      };

      setInteriorClients((prev) => [...prev, newClient]);
      return newClient;
    } catch (err: any) {
      console.error('Error adding interior client:', err);
      setError(err?.message || 'Failed to add interior client');
      throw err;
    }
  };

  // UPDATE INTERIOR CLIENT
  const updateClient = async (updatedClient: InteriorClient) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('interior_clients')
        .update({
          name: updatedClient.name,
          phone: updatedClient.phone,
          address: updatedClient.address,
          site_location: updatedClient.siteLocation || null,
          project_scope: updatedClient.projectScope || null,
        })
        .eq('id', updatedClient.id);

      if (updateError) throw updateError;

      setInteriorClients((prev) =>
        prev.map((c) =>
          c.id === updatedClient.id
            ? { ...updatedClient, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      console.error('Error updating interior client:', err);
      setError(err?.message || 'Failed to update interior client');
      throw err;
    }
  };

  // DELETE SINGLE INTERIOR CLIENT
  const deleteClient = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('interior_clients')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setInteriorClients((prev) =>
        prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, sNo: i + 1 }))
      );
    } catch (err: any) {
      console.error('Error deleting interior client:', err);
      setError(err?.message || 'Failed to delete interior client');
      throw err;
    }
  };

  // DELETE MULTIPLE INTERIOR CLIENTS
  const deleteMultipleClients = async (ids: string[]) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('interior_clients')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      const idSet = new Set(ids);
      setInteriorClients((prev) =>
        prev.filter((c) => !idSet.has(c.id)).map((c, i) => ({ ...c, sNo: i + 1 }))
      );
    } catch (err: any) {
      console.error('Error deleting multiple interior clients:', err);
      setError(err?.message || 'Failed to delete interior clients');
      throw err;
    }
  };

  // ADD ADVANCE PAYMENT
  const addAdvancePayment = async (
    clientId: string,
    advData: Omit<InteriorAdvancePayment, 'id' | 'sNo'>
  ) => {
    try {
      setError(null);
      const client = interiorClients.find((c) => c.id === clientId);
      const nextSNo = (client?.advancePayments?.length || 0) + 1;

      const { data, error: insertError } = await supabase
        .from('interior_client_advances')
        .insert({
          client_id: clientId,
          s_no: nextSNo,
          date: advData.date,
          amount: advData.amount,
          mode: advData.mode,
          note: advData.note || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newAdv: InteriorAdvancePayment = {
        ...advData,
        id: data.id,
        clientId,
        sNo: data.s_no,
        createdAt: data.created_at,
      };

      setInteriorClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          const currentAdv = c.advancePayments || [];
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            advancePayments: [...currentAdv, newAdv].map((item, idx) => ({ ...item, sNo: idx + 1 })),
          };
        })
      );
    } catch (err: any) {
      console.error('Error adding interior advance payment:', err);
      setError(err?.message || 'Failed to add advance payment');
      throw err;
    }
  };

  // UPDATE ADVANCE PAYMENT
  const updateAdvancePayment = async (
    clientId: string,
    updatedAdv: InteriorAdvancePayment
  ) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('interior_client_advances')
        .update({
          date: updatedAdv.date,
          amount: updatedAdv.amount,
          mode: updatedAdv.mode,
          note: updatedAdv.note || null,
        })
        .eq('id', updatedAdv.id);

      if (updateError) throw updateError;

      setInteriorClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            advancePayments: (c.advancePayments || []).map((item) =>
              item.id === updatedAdv.id ? updatedAdv : item
            ),
          };
        })
      );
    } catch (err: any) {
      console.error('Error updating interior advance payment:', err);
      setError(err?.message || 'Failed to update advance payment');
      throw err;
    }
  };

  // DELETE ADVANCE PAYMENT
  const deleteAdvancePayment = async (clientId: string, advId: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('interior_client_advances')
        .delete()
        .eq('id', advId);

      if (deleteError) throw deleteError;

      setInteriorClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            advancePayments: (c.advancePayments || [])
              .filter((item) => item.id !== advId)
              .map((item, idx) => ({ ...item, sNo: idx + 1 })),
          };
        })
      );
    } catch (err: any) {
      console.error('Error deleting interior advance payment:', err);
      setError(err?.message || 'Failed to delete advance payment');
      throw err;
    }
  };

  // DELETE MULTIPLE ADVANCE PAYMENTS
  const deleteMultipleAdvancePayments = async (clientId: string, advIds: string[]) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('interior_client_advances')
        .delete()
        .in('id', advIds);

      if (deleteError) throw deleteError;

      const idSet = new Set(advIds);
      setInteriorClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            advancePayments: (c.advancePayments || [])
              .filter((item) => !idSet.has(item.id))
              .map((item, idx) => ({ ...item, sNo: idx + 1 })),
          };
        })
      );
    } catch (err: any) {
      console.error('Error deleting multiple advance payments:', err);
      setError(err?.message || 'Failed to delete advance payments');
      throw err;
    }
  };

  // ADD EXPENSE
  const addExpense = async (
    clientId: string,
    expData: Omit<InteriorExpenseItem, 'id' | 'sNo'>
  ) => {
    try {
      setError(null);
      const client = interiorClients.find((c) => c.id === clientId);
      const nextSNo = (client?.expenses?.length || 0) + 1;

      const { data, error: insertError } = await supabase
        .from('interior_client_expenses')
        .insert({
          client_id: clientId,
          s_no: nextSNo,
          date: expData.date,
          category: expData.category || null,
          expense_name: expData.expenseName,
          quantity: expData.quantity,
          unit: expData.unit || 'Sq.ft',
          rate: expData.rate,
          total_amount: expData.totalAmount,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newExp: InteriorExpenseItem = {
        ...expData,
        id: data.id,
        clientId,
        sNo: data.s_no,
        createdAt: data.created_at,
      };

      setInteriorClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          const currentExp = c.expenses || [];
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            expenses: [...currentExp, newExp].map((item, idx) => ({ ...item, sNo: idx + 1 })),
          };
        })
      );
    } catch (err: any) {
      console.error('Error adding interior expense:', err);
      setError(err?.message || 'Failed to add interior expense');
      throw err;
    }
  };

  // UPDATE EXPENSE
  const updateExpense = async (
    clientId: string,
    updatedExp: InteriorExpenseItem
  ) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('interior_client_expenses')
        .update({
          date: updatedExp.date,
          category: updatedExp.category || null,
          expense_name: updatedExp.expenseName,
          quantity: updatedExp.quantity,
          unit: updatedExp.unit || 'Sq.ft',
          rate: updatedExp.rate,
          total_amount: updatedExp.totalAmount,
        })
        .eq('id', updatedExp.id);

      if (updateError) throw updateError;

      setInteriorClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            expenses: (c.expenses || []).map((item) =>
              item.id === updatedExp.id ? updatedExp : item
            ),
          };
        })
      );
    } catch (err: any) {
      console.error('Error updating interior expense:', err);
      setError(err?.message || 'Failed to update interior expense');
      throw err;
    }
  };

  // DELETE EXPENSE
  const deleteExpense = async (clientId: string, expId: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('interior_client_expenses')
        .delete()
        .eq('id', expId);

      if (deleteError) throw deleteError;

      setInteriorClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            expenses: (c.expenses || [])
              .filter((item) => item.id !== expId)
              .map((item, idx) => ({ ...item, sNo: idx + 1 })),
          };
        })
      );
    } catch (err: any) {
      console.error('Error deleting interior expense:', err);
      setError(err?.message || 'Failed to delete interior expense');
      throw err;
    }
  };

  // DELETE MULTIPLE EXPENSES
  const deleteMultipleExpenses = async (clientId: string, expIds: string[]) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('interior_client_expenses')
        .delete()
        .in('id', expIds);

      if (deleteError) throw deleteError;

      const idSet = new Set(expIds);
      setInteriorClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            expenses: (c.expenses || [])
              .filter((item) => !idSet.has(item.id))
              .map((item, idx) => ({ ...item, sNo: idx + 1 })),
          };
        })
      );
    } catch (err: any) {
      console.error('Error deleting multiple interior expenses:', err);
      setError(err?.message || 'Failed to delete interior expenses');
      throw err;
    }
  };

  return {
    interiorClients,
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
    refreshClients: fetchClients,
  };
};
