import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { BankAccount, BankTransaction } from '../types';
import { INITIAL_BANKS } from '../data/initialBanks';

export const useBanks = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bank accounts from Supabase
  const fetchBanks = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bank_accounts')
        .select(`
          id,
          bank_name,
          account_number,
          ifsc_code,
          branch,
          account_type,
          status,
          balance,
          created_at,
          updated_at,
          bank_transactions (
            id,
            date,
            amount,
            type,
            note,
            created_at
          )
        `)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const mappedBanks: BankAccount[] = data.map((b: any) => ({
          id: b.id,
          bankName: b.bank_name,
          accountNumber: b.account_number || undefined,
          ifscCode: b.ifsc_code || undefined,
          branch: b.branch || undefined,
          accountType: b.account_type || undefined,
          status: b.status || undefined,
          balance: Number(b.balance),
          createdAt: b.created_at,
          updatedAt: b.updated_at,
          transactions: (b.bank_transactions || [])
            .map((tx: any) => ({
              id: tx.id,
              bankId: b.id,
              date: tx.date,
              amount: Number(tx.amount),
              type: tx.type,
              note: tx.note || undefined,
              createdAt: tx.created_at,
            }))
            .sort((a: BankTransaction, b: BankTransaction) =>
              b.date.localeCompare(a.date)
            ),
        }));

        setBankAccounts(mappedBanks);
      }
    } catch (err: any) {
      console.error('Error fetching bank accounts from Supabase:', err);
      setError(err.message || 'Failed to fetch bank accounts from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  // ADD BANK ACCOUNT
  const addBankAccount = async (accountData: Omit<BankAccount, 'id'>) => {
    const tempId = `bank-${Date.now()}`;
    const newAccount: BankAccount = {
      ...accountData,
      id: tempId,
      transactions: accountData.transactions || [],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const previousBanks = [...bankAccounts];
    setBankAccounts([...bankAccounts, newAccount]);

    if (!isSupabaseConfigured) return newAccount;

    try {
      const { data, error: insertError } = await supabase
        .from('bank_accounts')
        .insert({
          bank_name: accountData.bankName,
          account_number: accountData.accountNumber,
          ifsc_code: accountData.ifscCode,
          branch: accountData.branch,
          account_type: accountData.accountType || 'Current Account',
          status: accountData.status || 'ACTIVE',
          balance: accountData.balance || 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setBankAccounts((prev) =>
          prev.map((b) => (b.id === tempId ? { ...b, id: data.id } : b))
        );
        return { ...newAccount, id: data.id };
      }
    } catch (err: any) {
      console.error('Failed to insert bank account:', err);
      setBankAccounts(previousBanks);
      setError(err.message || 'Failed to add bank account.');
      throw err;
    }
    return newAccount;
  };

  // UPDATE BANK ACCOUNT
  const updateBankAccount = async (updatedAccount: BankAccount) => {
    const previousBanks = [...bankAccounts];
    setBankAccounts((prev) =>
      prev.map((b) => (b.id === updatedAccount.id ? updatedAccount : b))
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: updateError } = await supabase
        .from('bank_accounts')
        .update({
          bank_name: updatedAccount.bankName,
          account_number: updatedAccount.accountNumber,
          ifsc_code: updatedAccount.ifscCode,
          branch: updatedAccount.branch,
          account_type: updatedAccount.accountType,
          status: updatedAccount.status,
          balance: updatedAccount.balance,
        })
        .eq('id', updatedAccount.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Failed to update bank account:', err);
      setBankAccounts(previousBanks);
      setError(err.message || 'Failed to update bank account.');
      throw err;
    }
  };

  // DELETE BANK ACCOUNT
  const deleteBankAccount = async (id: string) => {
    const previousBanks = [...bankAccounts];
    setBankAccounts((prev) => prev.filter((b) => b.id !== id));

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('Failed to delete bank account:', err);
      setBankAccounts(previousBanks);
      setError(err.message || 'Failed to delete bank account.');
      throw err;
    }
  };

  // ADD QUICK TRANSACTION (Credit or Debit)
  const addBankTransaction = async (
    bankId: string,
    txData: Omit<BankTransaction, 'id'>
  ) => {
    const targetBank = bankAccounts.find((b) => b.id === bankId);
    if (!targetBank) return;

    const isCredit =
      txData.type === 'credit' ||
      txData.type === 'deposit' ||
      txData.type === 'adjustment';

    const newBalance = isCredit
      ? (targetBank.balance || 0) + txData.amount
      : (targetBank.balance || 0) - txData.amount;

    const tempTxId = `btx-${Date.now()}`;
    const newTx: BankTransaction = {
      ...txData,
      id: tempTxId,
      bankId,
    };

    const previousBanks = [...bankAccounts];
    setBankAccounts((prev) =>
      prev.map((b) =>
        b.id === bankId
          ? {
              ...b,
              balance: newBalance,
              updatedAt: new Date().toISOString(),
              transactions: [newTx, ...(b.transactions || [])],
            }
          : b
      )
    );

    if (!isSupabaseConfigured) return newTx;

    try {
      // 1. Insert Transaction
      const { data: txResult, error: txError } = await supabase
        .from('bank_transactions')
        .insert({
          bank_id: bankId,
          date: txData.date,
          amount: txData.amount,
          type: txData.type,
          note: txData.note,
        })
        .select()
        .single();

      if (txError) throw txError;

      // 2. Update Balance on bank_accounts
      const { error: balError } = await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', bankId);

      if (balError) throw balError;

      if (txResult) {
        setBankAccounts((prev) =>
          prev.map((b) =>
            b.id === bankId
              ? {
                  ...b,
                  transactions: (b.transactions || []).map((t) =>
                    t.id === tempTxId ? { ...t, id: txResult.id } : t
                  ),
                }
              : b
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to commit bank transaction:', err);
      setBankAccounts(previousBanks);
      setError(err.message || 'Failed to record transaction.');
      throw err;
    }
  };

  // DELETE TRANSACTION (Reverts balance)
  const deleteBankTransaction = async (bankId: string, txId: string) => {
    const targetBank = bankAccounts.find((b) => b.id === bankId);
    const targetTx = targetBank?.transactions?.find((t) => t.id === txId);
    if (!targetBank || !targetTx) return;

    const isDebit =
      targetTx.type === 'debit' || targetTx.type === 'withdrawal';
    const adjustedBalance = isDebit
      ? (targetBank.balance || 0) + targetTx.amount
      : (targetBank.balance || 0) - targetTx.amount;

    const previousBanks = [...bankAccounts];
    setBankAccounts((prev) =>
      prev.map((b) =>
        b.id === bankId
          ? {
              ...b,
              balance: adjustedBalance,
              updatedAt: new Date().toISOString(),
              transactions: (b.transactions || []).filter((t) => t.id !== txId),
            }
          : b
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('bank_transactions')
        .delete()
        .eq('id', txId);

      if (deleteError) throw deleteError;

      const { error: balError } = await supabase
        .from('bank_accounts')
        .update({ balance: adjustedBalance })
        .eq('id', bankId);

      if (balError) throw balError;
    } catch (err: any) {
      console.error('Failed to delete transaction:', err);
      setBankAccounts(previousBanks);
      setError(err.message || 'Failed to revert transaction.');
      throw err;
    }
  };

  // DELETE MULTIPLE TRANSACTIONS IN BULK
  const deleteMultipleBankTransactions = async (bankId: string, txIds: string[]) => {
    const targetBank = bankAccounts.find((b) => b.id === bankId);
    if (!targetBank) return;

    const idSet = new Set(txIds);
    const targetTxs = (targetBank.transactions || []).filter((t) => idSet.has(t.id));
    if (targetTxs.length === 0) return;

    let balanceDelta = 0;
    targetTxs.forEach((tx) => {
      const isDebit = tx.type === 'debit' || tx.type === 'withdrawal';
      balanceDelta += isDebit ? tx.amount : -tx.amount;
    });

    const adjustedBalance = (targetBank.balance || 0) + balanceDelta;
    const previousBanks = [...bankAccounts];

    setBankAccounts((prev) =>
      prev.map((b) =>
        b.id === bankId
          ? {
              ...b,
              balance: adjustedBalance,
              updatedAt: new Date().toISOString(),
              transactions: (b.transactions || []).filter((t) => !idSet.has(t.id)),
            }
          : b
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error: deleteError } = await supabase
        .from('bank_transactions')
        .delete()
        .in('id', txIds);

      if (deleteError) throw deleteError;

      const { error: balError } = await supabase
        .from('bank_accounts')
        .update({ balance: adjustedBalance })
        .eq('id', bankId);

      if (balError) throw balError;
    } catch (err: any) {
      console.error('Failed to delete transactions in bulk:', err);
      setBankAccounts(previousBanks);
      setError(err.message || 'Failed to revert transactions.');
      throw err;
    }
  };

  return {
    bankAccounts,
    isLoading,
    error,
    isLiveDb: isSupabaseConfigured,
    fetchBanks,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addBankTransaction,
    deleteBankTransaction,
    deleteMultipleBankTransactions,
  };
};
