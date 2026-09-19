import { useState, useEffect, useCallback } from 'react';
import { newId } from '@/lib/id';
import type { Client, AdvancePayment, ExpenseItem } from '../types';
import { INITIAL_INTERIOR_LEDGER_CLIENTS } from '../data/initialInteriorLedgerClients';
import { compareByDateDesc } from '../utils/dateUtils';

const STORAGE_KEY = 'afrah_interior_ledger_clients';

const loadFromStorage = (): Client[] => {
  if (typeof window === 'undefined') return INITIAL_INTERIOR_LEDGER_CLIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INTERIOR_LEDGER_CLIENTS));
      return INITIAL_INTERIOR_LEDGER_CLIENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_INTERIOR_LEDGER_CLIENTS;
  } catch (e) {
    console.error('Failed to load interior ledger clients from localStorage:', e);
    return INITIAL_INTERIOR_LEDGER_CLIENTS;
  }
};

const saveToStorage = (clients: Client[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save interior ledger clients to localStorage:', e);
  }
};

export const useInteriorLedgerClients = () => {
  const [clients, setClients] = useState<Client[]>(loadFromStorage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveToStorage(clients);
  }, [clients]);

  // ADD CLIENT
  const addClient = useCallback(async (clientData: Omit<Client, 'id'>) => {
    const tempId = newId();
    const newClient: Client = {
      ...clientData,
      id: tempId,
      createdAt: new Date().toISOString().slice(0, 10),
      advancePayments: [],
      expenses: [],
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  }, []);

  // UPDATE CLIENT (supports both updateClient(updatedObj) and updateClient(id, updates))
  const updateClient = useCallback(
    async (clientOrId: Client | string, updates?: Partial<Client>): Promise<Client | null> => {
      let result: Client | null = null;
      setClients((prev) =>
        prev.map((c) => {
          if (typeof clientOrId === 'string') {
            if (c.id === clientOrId) {
              result = { ...c, ...(updates || {}), updatedAt: new Date().toISOString().slice(0, 10) };
              return result;
            }
          } else {
            if (c.id === clientOrId.id) {
              result = { ...clientOrId, updatedAt: new Date().toISOString().slice(0, 10) };
              return result;
            }
          }
          return c;
        })
      );
      return result;
    },
    []
  );

  // DELETE CLIENT
  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    return true;
  }, []);

  // DELETE MULTIPLE CLIENTS
  const deleteMultipleClients = useCallback(async (ids: string[]): Promise<boolean> => {
    const idSet = new Set(ids);
    setClients((prev) => prev.filter((c) => !idSet.has(c.id)));
    return true;
  }, []);

  // ADD ADVANCE PAYMENT
  const addAdvancePayment = useCallback(
    async (
      clientId: string,
      paymentData: Omit<AdvancePayment, 'id' | 'sNo'>
    ): Promise<AdvancePayment | null> => {
      let createdPayment: AdvancePayment | null = null;
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          const nextSNo = (c.advancePayments?.length || 0) + 1;
          const newPayment: AdvancePayment = {
            ...paymentData,
            id: newId(),
            clientId,
            sNo: nextSNo,
            createdAt: new Date().toISOString().slice(0, 10),
          };
          createdPayment = newPayment;
          const updatedAdvances = [...(c.advancePayments || []), newPayment].sort((a, b) =>
            compareByDateDesc(a.date, b.date, a.sNo, b.sNo)
          );
          return {
            ...c,
            advancePayments: updatedAdvances,
          };
        })
      );
      return createdPayment;
    },
    []
  );

  // UPDATE ADVANCE PAYMENT
  const updateAdvancePayment = useCallback(
    async (id: string, updates: Partial<AdvancePayment>): Promise<AdvancePayment | null> => {
      let updatedResult: AdvancePayment | null = null;
      setClients((prev) =>
        prev.map((c) => {
          const advIdx = (c.advancePayments || []).findIndex((a) => a.id === id);
          if (advIdx === -1) return c;
          const updatedAdvances = c.advancePayments!.map((a) => {
            if (a.id === id) {
              updatedResult = { ...a, ...updates };
              return updatedResult;
            }
            return a;
          }).sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo));
          return {
            ...c,
            advancePayments: updatedAdvances,
          };
        })
      );
      return updatedResult;
    },
    []
  );

  // DELETE ADVANCE PAYMENT
  const deleteAdvancePayment = useCallback(async (id: string): Promise<boolean> => {
    setClients((prev) =>
      prev.map((c) => {
        const hasAdv = (c.advancePayments || []).some((a) => a.id === id);
        if (!hasAdv) return c;
        const filtered = c.advancePayments!.filter((a) => a.id !== id);
        return {
          ...c,
          advancePayments: filtered,
        };
      })
    );
    return true;
  }, []);

  // DELETE MULTIPLE ADVANCE PAYMENTS
  const deleteMultipleAdvancePayments = useCallback(async (ids: string[]): Promise<boolean> => {
    const idSet = new Set(ids);
    setClients((prev) =>
      prev.map((c) => {
        const hasAny = (c.advancePayments || []).some((a) => idSet.has(a.id));
        if (!hasAny) return c;
        return {
          ...c,
          advancePayments: c.advancePayments!.filter((a) => !idSet.has(a.id)),
        };
      })
    );
    return true;
  }, []);

  // ADD EXPENSE
  const addExpense = useCallback(
    async (
      clientId: string,
      expenseData: Omit<ExpenseItem, 'id' | 'sNo'>
    ): Promise<ExpenseItem | null> => {
      let createdExpense: ExpenseItem | null = null;
      const qty = Number(expenseData.quantity) || 1;
      const rate = Number(expenseData.rate) || 0;
      const totalAmount = expenseData.totalAmount !== undefined ? Number(expenseData.totalAmount) : qty * rate;

      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          const nextSNo = (c.expenses?.length || 0) + 1;
          const newExp: ExpenseItem = {
            ...expenseData,
            id: newId(),
            clientId,
            sNo: nextSNo,
            quantity: qty,
            rate: rate,
            totalAmount: totalAmount,
            createdAt: new Date().toISOString().slice(0, 10),
          };
          createdExpense = newExp;
          const updatedExpenses = [...(c.expenses || []), newExp].sort((a, b) =>
            compareByDateDesc(a.date, b.date, a.sNo, b.sNo)
          );
          return {
            ...c,
            expenses: updatedExpenses,
          };
        })
      );
      return createdExpense;
    },
    []
  );

  // UPDATE EXPENSE
  const updateExpense = useCallback(
    async (id: string, updates: Partial<ExpenseItem>): Promise<ExpenseItem | null> => {
      let updatedResult: ExpenseItem | null = null;
      setClients((prev) =>
        prev.map((c) => {
          const expIdx = (c.expenses || []).findIndex((e) => e.id === id);
          if (expIdx === -1) return c;
          const updatedExpenses = c.expenses!.map((e) => {
            if (e.id === id) {
              const qty = updates.quantity !== undefined ? Number(updates.quantity) : e.quantity;
              const rate = updates.rate !== undefined ? Number(updates.rate) : e.rate;
              const totalAmount =
                updates.totalAmount !== undefined
                  ? Number(updates.totalAmount)
                  : qty * rate;
              updatedResult = {
                ...e,
                ...updates,
                quantity: qty,
                rate: rate,
                totalAmount: totalAmount,
              };
              return updatedResult;
            }
            return e;
          }).sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo));
          return {
            ...c,
            expenses: updatedExpenses,
          };
        })
      );
      return updatedResult;
    },
    []
  );

  // DELETE EXPENSE
  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    setClients((prev) =>
      prev.map((c) => {
        const hasExp = (c.expenses || []).some((e) => e.id === id);
        if (!hasExp) return c;
        return {
          ...c,
          expenses: c.expenses!.filter((e) => e.id !== id),
        };
      })
    );
    return true;
  }, []);

  // DELETE MULTIPLE EXPENSES
  const deleteMultipleExpenses = useCallback(async (ids: string[]): Promise<boolean> => {
    const idSet = new Set(ids);
    setClients((prev) =>
      prev.map((c) => {
        const hasAny = (c.expenses || []).some((e) => idSet.has(e.id));
        if (!hasAny) return c;
        return {
          ...c,
          expenses: c.expenses!.filter((e) => !idSet.has(e.id)),
        };
      })
    );
    return true;
  }, []);

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
