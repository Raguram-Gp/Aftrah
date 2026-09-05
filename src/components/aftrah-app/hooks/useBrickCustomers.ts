import { useState, useEffect, useCallback } from 'react';
import type { BrickCustomer, BrickTransaction } from '../types';
import { INITIAL_BRICK_CUSTOMERS } from '../data/initialBrickCustomers';

const LOCAL_STORAGE_KEY = 'aftrah_brick_customers_cache_v1';

export const useBrickCustomers = () => {
  const [brickCustomers, setBrickCustomers] = useState<BrickCustomer[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Unable to read brick customer cache from localStorage', e);
      }
    }
    return INITIAL_BRICK_CUSTOMERS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync to local fallback storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(brickCustomers));
      } catch (e) {
        console.warn('Unable to persist brick customer cache', e);
      }
    }
  }, [brickCustomers]);

  // Recalculate balance for customer based on their transactions
  const computeCustomerBalance = (transactions: BrickTransaction[] = []): number => {
    return transactions.reduce((sum, tx) => sum + (Number(tx.balanceAmount) || 0), 0);
  };

  // Add a new Brick Customer
  const addCustomer = useCallback(
    async (customerData: { name: string; phone: string; address: string }) => {
      try {
        setError(null);
        const newCustomer: BrickCustomer = {
          id: `bc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          sNo: brickCustomers.length + 1,
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          balance: 0,
          transactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setBrickCustomers((prev) => {
          const next = [newCustomer, ...prev];
          return next.map((c, i) => ({ ...c, sNo: i + 1 }));
        });

        return newCustomer;
      } catch (err: any) {
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
      setBrickCustomers((prev) =>
        prev.map((c) =>
          c.id === updated.id
            ? {
                ...c,
                name: updated.name,
                phone: updated.phone,
                address: updated.address,
                balance: computeCustomerBalance(c.transactions || []),
                updatedAt: new Date().toISOString()
              }
            : c
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update customer');
      throw err;
    }
  }, []);

  // Delete a customer
  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setError(null);
      setBrickCustomers((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        return filtered.map((c, idx) => ({ ...c, sNo: idx + 1 }));
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete customer');
      throw err;
    }
  }, []);

  // Delete multiple customers in bulk
  const deleteMultipleCustomers = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      const idSet = new Set(ids);
      setBrickCustomers((prev) => {
        const filtered = prev.filter((c) => !idSet.has(c.id));
        return filtered.map((c, idx) => ({ ...c, sNo: idx + 1 }));
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete selected customers');
      throw err;
    }
  }, []);

  // Add a Transaction for a Customer
  const addTransaction = useCallback(
    async (customerId: string, txData: Omit<BrickTransaction, 'id' | 'sNo'>) => {
      try {
        setError(null);
        const newTx: BrickTransaction = {
          id: `btx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          customerId,
          sNo: 1,
          date: txData.date,
          brickType: txData.brickType,
          quantity: Number(txData.quantity),
          rate: Number(txData.rate),
          totalAmount: Number(txData.totalAmount),
          paidAmount: Number(txData.paidAmount),
          balanceAmount: Number(txData.balanceAmount),
          siteLocation: txData.siteLocation,
          vehicleNumber: txData.vehicleNumber,
          driverPhone: txData.driverPhone,
          notes: txData.notes,
          createdAt: new Date().toISOString()
        };

        setBrickCustomers((prev) =>
          prev.map((cust) => {
            if (cust.id !== customerId) return cust;
            const updatedTxs = [newTx, ...(cust.transactions || [])].map((tx, idx) => ({
              ...tx,
              sNo: idx + 1
            }));
            return {
              ...cust,
              transactions: updatedTxs,
              balance: computeCustomerBalance(updatedTxs),
              updatedAt: new Date().toISOString()
            };
          })
        );

        return newTx;
      } catch (err: any) {
        setError(err.message || 'Failed to add transaction');
        throw err;
      }
    },
    []
  );

  // Update a Transaction for a Customer
  const updateTransaction = useCallback(
    async (customerId: string, txData: BrickTransaction) => {
      try {
        setError(null);
        setBrickCustomers((prev) =>
          prev.map((cust) => {
            if (cust.id !== customerId) return cust;
            const updatedTxs = (cust.transactions || []).map((t) =>
              t.id === txData.id ? { ...txData } : t
            );
            return {
              ...cust,
              transactions: updatedTxs,
              balance: computeCustomerBalance(updatedTxs),
              updatedAt: new Date().toISOString()
            };
          })
        );
      } catch (err: any) {
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
      setBrickCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id !== customerId) return cust;
          const updatedTxs = (cust.transactions || [])
            .filter((t) => t.id !== txId)
            .map((t, idx) => ({ ...t, sNo: idx + 1 }));
          return {
            ...cust,
            transactions: updatedTxs,
            balance: computeCustomerBalance(updatedTxs),
            updatedAt: new Date().toISOString()
          };
        })
      );
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    }
  }, []);

  // Delete multiple Transactions for a Customer in bulk
  const deleteMultipleTransactions = useCallback(
    async (customerId: string, txIds: string[]) => {
      try {
        setError(null);
        const txIdSet = new Set(txIds);
        setBrickCustomers((prev) =>
          prev.map((cust) => {
            if (cust.id !== customerId) return cust;
            const updatedTxs = (cust.transactions || [])
              .filter((t) => !txIdSet.has(t.id))
              .map((t, idx) => ({ ...t, sNo: idx + 1 }));
            return {
              ...cust,
              transactions: updatedTxs,
              balance: computeCustomerBalance(updatedTxs),
              updatedAt: new Date().toISOString()
            };
          })
        );
      } catch (err: any) {
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
    deleteMultipleTransactions
  };
};
