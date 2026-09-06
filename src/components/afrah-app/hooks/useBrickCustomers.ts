import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { BrickCustomer, BrickTransaction } from '../types';

export const useBrickCustomers = () => {
  const [brickCustomers, setBrickCustomers] = useState<BrickCustomer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Recalculate balance for customer based on their transactions
  const computeCustomerBalance = (transactions: BrickTransaction[] = []): number => {
    return transactions.reduce((sum, tx) => sum + (Number(tx.balanceAmount) || 0), 0);
  };

  // Fetch all Brick Customers with their nested transactions from Supabase
  const fetchCustomers = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('brick_customers')
        .select(`
          id,
          s_no,
          name,
          phone,
          address,
          balance,
          created_at,
          updated_at,
          brick_transactions (
            id,
            customer_id,
            s_no,
            date,
            brick_type,
            quantity,
            rate,
            total_amount,
            paid_amount,
            balance_amount,
            site_location,
            vehicle_number,
            driver_phone,
            notes,
            created_at
          )
        `)
        .order('s_no', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        const mapped: BrickCustomer[] = data.map((cust: any, idx: number) => {
          const rawTxs = (cust.brick_transactions || []).map((t: any) => ({
            id: t.id,
            customerId: t.customer_id,
            sNo: t.s_no,
            date: t.date,
            brickType: t.brick_type,
            quantity: Number(t.quantity) || 0,
            rate: Number(t.rate) || 0,
            totalAmount: Number(t.total_amount) || 0,
            paidAmount: Number(t.paid_amount) || 0,
            balanceAmount: Number(t.balance_amount) || 0,
            siteLocation: t.site_location || '',
            vehicleNumber: t.vehicle_number || '',
            driverPhone: t.driver_phone || '',
            notes: t.notes || '',
            createdAt: t.created_at,
          })).sort((a: any, b: any) => a.sNo - b.sNo);

          return {
            id: cust.id,
            sNo: cust.s_no || idx + 1,
            name: cust.name,
            phone: cust.phone,
            address: cust.address,
            balance: computeCustomerBalance(rawTxs),
            createdAt: cust.created_at,
            updatedAt: cust.updated_at,
            transactions: rawTxs,
          };
        });

        setBrickCustomers(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching brick customers from Supabase:', err);
      setError(err?.message || 'Failed to load brick customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Add a new Brick Customer
  const addCustomer = useCallback(
    async (customerData: { name: string; phone: string; address: string }) => {
      try {
        setError(null);
        const sNo = brickCustomers.length + 1;

        const { data, error: insertError } = await supabase
          .from('brick_customers')
          .insert({
            s_no: sNo,
            name: customerData.name,
            phone: customerData.phone,
            address: customerData.address,
            balance: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newCustomer: BrickCustomer = {
          id: data.id,
          sNo: data.s_no,
          name: data.name,
          phone: data.phone,
          address: data.address,
          balance: 0,
          transactions: [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setBrickCustomers((prev) => [...prev, newCustomer]);
        return newCustomer;
      } catch (err: any) {
        console.error('Error adding brick customer:', err);
        setError(err.message || 'Failed to add customer');
        throw err;
      }
    },
    [brickCustomers]
  );

  // Update an existing customer
  const updateCustomer = useCallback(async (updated: BrickCustomer) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('brick_customers')
        .update({
          name: updated.name,
          phone: updated.phone,
          address: updated.address,
        })
        .eq('id', updated.id);

      if (updateError) throw updateError;

      setBrickCustomers((prev) =>
        prev.map((c) =>
          c.id === updated.id
            ? {
                ...c,
                name: updated.name,
                phone: updated.phone,
                address: updated.address,
                balance: computeCustomerBalance(c.transactions || []),
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (err: any) {
      console.error('Error updating brick customer:', err);
      setError(err.message || 'Failed to update customer');
      throw err;
    }
  }, []);

  // Delete a customer
  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('brick_customers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setBrickCustomers((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        return filtered.map((c, idx) => ({ ...c, sNo: idx + 1 }));
      });
    } catch (err: any) {
      console.error('Error deleting brick customer:', err);
      setError(err.message || 'Failed to delete customer');
      throw err;
    }
  }, []);

  // Delete multiple customers in bulk
  const deleteMultipleCustomers = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('brick_customers')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      const idSet = new Set(ids);
      setBrickCustomers((prev) => {
        const filtered = prev.filter((c) => !idSet.has(c.id));
        return filtered.map((c, idx) => ({ ...c, sNo: idx + 1 }));
      });
    } catch (err: any) {
      console.error('Error deleting multiple brick customers:', err);
      setError(err.message || 'Failed to delete selected customers');
      throw err;
    }
  }, []);

  // Add a Transaction for a Customer
  const addTransaction = useCallback(
    async (customerId: string, txData: Omit<BrickTransaction, 'id' | 'sNo'>) => {
      try {
        setError(null);
        const target = brickCustomers.find((c) => c.id === customerId);
        const sNo = (target?.transactions?.length || 0) + 1;

        const { data, error: insertError } = await supabase
          .from('brick_transactions')
          .insert({
            customer_id: customerId,
            s_no: sNo,
            date: txData.date,
            brick_type: txData.brickType,
            quantity: Number(txData.quantity),
            rate: Number(txData.rate),
            total_amount: Number(txData.totalAmount),
            paid_amount: Number(txData.paidAmount),
            balance_amount: Number(txData.balanceAmount),
            site_location: txData.siteLocation || null,
            vehicle_number: txData.vehicleNumber || null,
            driver_phone: txData.driverPhone || null,
            notes: txData.notes || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newTx: BrickTransaction = {
          ...txData,
          id: data.id,
          customerId,
          sNo: data.s_no,
          quantity: Number(data.quantity),
          rate: Number(data.rate),
          totalAmount: Number(data.total_amount),
          paidAmount: Number(data.paid_amount),
          balanceAmount: Number(data.balance_amount),
          createdAt: data.created_at,
        };

        setBrickCustomers((prev) =>
          prev.map((cust) => {
            if (cust.id !== customerId) return cust;
            const updatedTxs = [...(cust.transactions || []), newTx].map((tx, idx) => ({
              ...tx,
              sNo: idx + 1,
            }));
            const newBal = computeCustomerBalance(updatedTxs);
            // update balance on customer table asynchronously
            supabase.from('brick_customers').update({ balance: newBal }).eq('id', customerId).then();

            return {
              ...cust,
              transactions: updatedTxs,
              balance: newBal,
              updatedAt: new Date().toISOString(),
            };
          })
        );

        return newTx;
      } catch (err: any) {
        console.error('Error adding brick transaction:', err);
        setError(err.message || 'Failed to add transaction');
        throw err;
      }
    },
    [brickCustomers]
  );

  // Update a Transaction for a Customer
  const updateTransaction = useCallback(
    async (customerId: string, txData: BrickTransaction) => {
      try {
        setError(null);
        const { error: updateError } = await supabase
          .from('brick_transactions')
          .update({
            date: txData.date,
            brick_type: txData.brickType,
            quantity: Number(txData.quantity),
            rate: Number(txData.rate),
            total_amount: Number(txData.totalAmount),
            paid_amount: Number(txData.paidAmount),
            balance_amount: Number(txData.balanceAmount),
            site_location: txData.siteLocation || null,
            vehicle_number: txData.vehicleNumber || null,
            driver_phone: txData.driverPhone || null,
            notes: txData.notes || null,
          })
          .eq('id', txData.id);

        if (updateError) throw updateError;

        setBrickCustomers((prev) =>
          prev.map((cust) => {
            if (cust.id !== customerId) return cust;
            const updatedTxs = (cust.transactions || []).map((t) =>
              t.id === txData.id ? { ...txData } : t
            );
            const newBal = computeCustomerBalance(updatedTxs);
            supabase.from('brick_customers').update({ balance: newBal }).eq('id', customerId).then();

            return {
              ...cust,
              transactions: updatedTxs,
              balance: newBal,
              updatedAt: new Date().toISOString(),
            };
          })
        );
      } catch (err: any) {
        console.error('Error updating brick transaction:', err);
        setError(err.message || 'Failed to update transaction');
        throw err;
      }
    },
    []
  );

  // Delete a Transaction for a Customer
  const deleteTransaction = useCallback(async (customerId: string, txId: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('brick_transactions')
        .delete()
        .eq('id', txId);

      if (deleteError) throw deleteError;

      setBrickCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id !== customerId) return cust;
          const updatedTxs = (cust.transactions || [])
            .filter((t) => t.id !== txId)
            .map((t, idx) => ({ ...t, sNo: idx + 1 }));
          const newBal = computeCustomerBalance(updatedTxs);
          supabase.from('brick_customers').update({ balance: newBal }).eq('id', customerId).then();

          return {
            ...cust,
            transactions: updatedTxs,
            balance: newBal,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    } catch (err: any) {
      console.error('Error deleting brick transaction:', err);
      setError(err.message || 'Failed to delete transaction');
      throw err;
    }
  }, []);

  // Delete multiple Transactions for a Customer in bulk
  const deleteMultipleTransactions = useCallback(
    async (customerId: string, txIds: string[]) => {
      try {
        setError(null);
        const { error: deleteError } = await supabase
          .from('brick_transactions')
          .delete()
          .in('id', txIds);

        if (deleteError) throw deleteError;

        const txIdSet = new Set(txIds);
        setBrickCustomers((prev) =>
          prev.map((cust) => {
            if (cust.id !== customerId) return cust;
            const updatedTxs = (cust.transactions || [])
              .filter((t) => !txIdSet.has(t.id))
              .map((t, idx) => ({ ...t, sNo: idx + 1 }));
            const newBal = computeCustomerBalance(updatedTxs);
            supabase.from('brick_customers').update({ balance: newBal }).eq('id', customerId).then();

            return {
              ...cust,
              transactions: updatedTxs,
              balance: newBal,
              updatedAt: new Date().toISOString(),
            };
          })
        );
      } catch (err: any) {
        console.error('Error deleting multiple brick transactions:', err);
        setError(err.message || 'Failed to delete selected transactions');
        throw err;
      }
    },
    []
  );

  return {
    brickCustomers,
    isLoading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    deleteMultipleCustomers,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteMultipleTransactions,
    refreshCustomers: fetchCustomers,
  };
};
