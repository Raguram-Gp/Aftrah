import { useState, useEffect, useCallback } from 'react';
import type { InteriorClient, InteriorAdvancePayment, InteriorExpenseItem } from '../types';
import { INITIAL_INTERIOR_CLIENTS } from '../data/initialInteriorClients';

const LOCAL_STORAGE_KEY = 'kaab_interior_clients_cache_v1';

export const useInteriorClients = () => {
  const [interiorClients, setInteriorClients] = useState<InteriorClient[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Unable to read KAAB interior clients cache from localStorage', e);
      }
    }
    return INITIAL_INTERIOR_CLIENTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync to local fallback storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(interiorClients));
      } catch (e) {
        console.warn('Unable to persist interior clients cache', e);
      }
    }
  }, [interiorClients]);

  // ADD INTERIOR CLIENT
  const addClient = async (clientData: Omit<InteriorClient, 'id' | 'sNo'>) => {
    const tempId = `int-client-${Date.now()}`;
    const newClient: InteriorClient = {
      ...clientData,
      id: tempId,
      sNo: interiorClients.length + 1,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      advancePayments: [],
      expenses: []
    };

    setInteriorClients((prev) => [newClient, ...prev].map((c, i) => ({ ...c, sNo: i + 1 })));
    return newClient;
  };

  // UPDATE INTERIOR CLIENT
  const updateClient = async (updatedClient: InteriorClient) => {
    setInteriorClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? { ...updatedClient, updatedAt: new Date().toISOString().slice(0, 10) } : c))
    );
  };

  // DELETE SINGLE INTERIOR CLIENT
  const deleteClient = async (id: string) => {
    setInteriorClients((prev) => prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, sNo: i + 1 })));
  };

  // DELETE MULTIPLE INTERIOR CLIENTS
  const deleteMultipleClients = async (ids: string[]) => {
    const idSet = new Set(ids);
    setInteriorClients((prev) => prev.filter((c) => !idSet.has(c.id)).map((c, i) => ({ ...c, sNo: i + 1 })));
  };

  // ADD ADVANCE PAYMENT
  const addAdvancePayment = async (
    clientId: string,
    advData: Omit<InteriorAdvancePayment, 'id' | 'sNo'>
  ) => {
    const newId = `adv-int-${Date.now()}`;
    setInteriorClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const currentAdv = c.advancePayments || [];
        const newAdv: InteriorAdvancePayment = {
          ...advData,
          id: newId,
          clientId,
          sNo: currentAdv.length + 1,
          createdAt: new Date().toISOString().slice(0, 10)
        };
        return {
          ...c,
          updatedAt: new Date().toISOString().slice(0, 10),
          advancePayments: [...currentAdv, newAdv].map((item, idx) => ({ ...item, sNo: idx + 1 }))
        };
      })
    );
  };

  // UPDATE ADVANCE PAYMENT
  const updateAdvancePayment = async (
    clientId: string,
    updatedAdv: InteriorAdvancePayment
  ) => {
    setInteriorClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          updatedAt: new Date().toISOString().slice(0, 10),
          advancePayments: (c.advancePayments || []).map((item) =>
            item.id === updatedAdv.id ? updatedAdv : item
          )
        };
      })
    );
  };

  // DELETE ADVANCE PAYMENT
  const deleteAdvancePayment = async (clientId: string, advId: string) => {
    setInteriorClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          updatedAt: new Date().toISOString().slice(0, 10),
          advancePayments: (c.advancePayments || [])
            .filter((item) => item.id !== advId)
            .map((item, idx) => ({ ...item, sNo: idx + 1 }))
        };
      })
    );
  };

  // DELETE MULTIPLE ADVANCE PAYMENTS
  const deleteMultipleAdvancePayments = async (clientId: string, advIds: string[]) => {
    const idSet = new Set(advIds);
    setInteriorClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          updatedAt: new Date().toISOString().slice(0, 10),
          advancePayments: (c.advancePayments || [])
            .filter((item) => !idSet.has(item.id))
            .map((item, idx) => ({ ...item, sNo: idx + 1 }))
        };
      })
    );
  };

  // ADD EXPENSE
  const addExpense = async (
    clientId: string,
    expData: Omit<InteriorExpenseItem, 'id' | 'sNo'>
  ) => {
    const newId = `exp-int-${Date.now()}`;
    setInteriorClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const currentExp = c.expenses || [];
        const newExp: InteriorExpenseItem = {
          ...expData,
          id: newId,
          clientId,
          sNo: currentExp.length + 1,
          createdAt: new Date().toISOString().slice(0, 10)
        };
        return {
          ...c,
          updatedAt: new Date().toISOString().slice(0, 10),
          expenses: [...currentExp, newExp].map((item, idx) => ({ ...item, sNo: idx + 1 }))
        };
      })
    );
  };

  // UPDATE EXPENSE
  const updateExpense = async (
    clientId: string,
    updatedExp: InteriorExpenseItem
  ) => {
    setInteriorClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          updatedAt: new Date().toISOString().slice(0, 10),
          expenses: (c.expenses || []).map((item) =>
            item.id === updatedExp.id ? updatedExp : item
          )
        };
      })
    );
  };

  // DELETE EXPENSE
  const deleteExpense = async (clientId: string, expId: string) => {
    setInteriorClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          updatedAt: new Date().toISOString().slice(0, 10),
          expenses: (c.expenses || [])
            .filter((item) => item.id !== expId)
            .map((item, idx) => ({ ...item, sNo: idx + 1 }))
        };
      })
    );
  };

  // DELETE MULTIPLE EXPENSES
  const deleteMultipleExpenses = async (clientId: string, expIds: string[]) => {
    const idSet = new Set(expIds);
    setInteriorClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          updatedAt: new Date().toISOString().slice(0, 10),
          expenses: (c.expenses || [])
            .filter((item) => !idSet.has(item.id))
            .map((item, idx) => ({ ...item, sNo: idx + 1 }))
        };
      })
    );
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
    deleteMultipleExpenses
  };
};
