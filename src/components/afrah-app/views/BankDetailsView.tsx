import React, { useState, useMemo } from 'react';
import type { BankAccount, BankTransaction } from '../types';
import { BankLogo } from '../components/BankLogo';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { DateFilterBar } from '../components/DateFilterBar';
import {
  Landmark,
  Plus,
  Minus,
  Check,
  Wallet,
  Trash2,
  Calendar,
  History,
  X,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Printer
} from 'lucide-react';

interface BankDetailsViewProps {
  bankAccounts: BankAccount[];
  onAddAccount: (accountData: Omit<BankAccount, 'id'>) => Promise<any> | void;
  onUpdateAccount: (updatedAccount: BankAccount) => Promise<any> | void;
  onDeleteAccount: (id: string) => Promise<any> | void;
  onAddTransaction?: (bankId: string, txData: Omit<BankTransaction, 'id'>) => Promise<any>;
  onDeleteTransaction?: (bankId: string, txId: string) => Promise<any>;
  onDeleteMultipleTransactions?: (bankId: string, txIds: string[]) => Promise<any>;
}

export const BankDetailsView: React.FC<BankDetailsViewProps> = ({
  bankAccounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onAddTransaction,
  onDeleteTransaction,
  onDeleteMultipleTransactions
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Per-bank input states for quick balance update
  const [inputAmounts, setInputAmounts] = useState<Record<string, string>>({});
  const [inputTypes, setInputTypes] = useState<Record<string, 'credit' | 'debit'>>({});

  // History / Ledger Modal State
  const [activeLedgerBankId, setActiveLedgerBankId] = useState<string | null>(null);
  const [ledgerFromDate, setLedgerFromDate] = useState('');
  const [ledgerToDate, setLedgerToDate] = useState('');
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteTxOpen, setIsBulkDeleteTxOpen] = useState(false);
  const [isBulkDeletingTx, setIsBulkDeletingTx] = useState(false);

  // New Bank Account Modal State (Clean: only Bank Name & Opening Balance)
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState('');

  // Delete Confirmation States
  const [deleteBankTarget, setDeleteBankTarget] = useState<BankAccount | null>(null);
  const [isDeletingBank, setIsDeletingBank] = useState(false);
  const [deleteBankTxTarget, setDeleteBankTxTarget] = useState<{ bank: BankAccount; tx: BankTransaction } | null>(null);
  const [isDeletingBankTx, setIsDeletingBankTx] = useState(false);

  // Currency Formatter
  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Format Updated timestamp nicely
  const formatUpdatedAt = (val?: string) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) {
        return `Updated ${val}`;
      }

      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const timeStr = d.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      if (isToday) {
        return `Updated today, ${timeStr}`;
      }

      const dateStr = d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return `Updated ${dateStr}, ${timeStr}`;
    } catch {
      return `Updated ${val.slice(0, 10)}`;
    }
  };

  // Total balance across all banks
  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + (b.balance || 0), 0);

  // Filter bank accounts
  const filteredBanks = bankAccounts.filter((b) =>
    b.bankName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Handle Quick Balance Change (Credit / Debit)
  const handleQuickTransaction = async (bank: BankAccount) => {
    const rawAmount = inputAmounts[bank.id];
    const amountNum = parseFloat(rawAmount);
    if (!amountNum || amountNum <= 0) return;

    const txType = inputTypes[bank.id] || 'credit';

    if (onAddTransaction) {
      await onAddTransaction(bank.id, {
        date: new Date().toISOString().slice(0, 10),
        type: txType,
        amount: amountNum,
        note: `Quick ${txType} entry`
      });
    } else {
      const newTx: BankTransaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: txType,
        amount: amountNum,
        note: `Quick ${txType} entry`
      };

      const newBalance = txType === 'credit'
        ? (bank.balance || 0) + amountNum
        : (bank.balance || 0) - amountNum;

      const updatedAccount: BankAccount = {
        ...bank,
        balance: newBalance,
        updatedAt: new Date().toISOString().slice(0, 10),
        transactions: [newTx, ...(bank.transactions || [])]
      };

      onUpdateAccount(updatedAccount);
    }

    setInputAmounts((prev) => ({ ...prev, [bank.id]: '' }));
  };

  // Handle Confirm Delete Bank Account
  const handleConfirmDeleteBank = async () => {
    if (!deleteBankTarget) return;
    setIsDeletingBank(true);
    try {
      await onDeleteAccount(deleteBankTarget.id);
      if (activeLedgerBankId === deleteBankTarget.id) {
        setActiveLedgerBankId(null);
      }
    } finally {
      setIsDeletingBank(false);
      setDeleteBankTarget(null);
    }
  };

  // Handle Confirm Delete Transaction from History
  const handleConfirmDeleteTx = async () => {
    if (!deleteBankTxTarget) return;
    const { bank, tx } = deleteBankTxTarget;
    setIsDeletingBankTx(true);
    try {
      if (onDeleteTransaction) {
        await onDeleteTransaction(bank.id, tx.id);
      } else {
        const isDebit = tx.type === 'debit' || tx.type === 'withdrawal';
        const adjustedBalance = isDebit
          ? (bank.balance || 0) + tx.amount
          : (bank.balance || 0) - tx.amount;

        const updatedAccount: BankAccount = {
          ...bank,
          balance: adjustedBalance,
          transactions: (bank.transactions || []).filter((t) => t.id !== tx.id)
        };

        onUpdateAccount(updatedAccount);
      }
    } finally {
      setIsDeletingBankTx(false);
      setDeleteBankTxTarget(null);
    }
  };

  // Handle Create New Bank Account (Only Name + Balance)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) return;

    const initBal = parseFloat(newInitialBalance) || 0;
    const initialTx: BankTransaction[] =
      initBal > 0
        ? [
            {
              id: `btx-${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              amount: initBal,
              type: 'deposit',
              note: 'Opening Balance'
            }
          ]
        : [];

    await onAddAccount({
      bankName: newBankName.trim().toUpperCase(),
      balance: initBal,
      status: 'ACTIVE',
      transactions: initialTx,
      updatedAt: new Date().toISOString().slice(0, 10)
    });

    setNewBankName('');
    setNewInitialBalance('');
    setIsAddAccountModalOpen(false);
  };

  // Active bank for ledger modal
  const activeLedgerBank = bankAccounts.find((b) => b.id === activeLedgerBankId);

  // Filter active ledger transactions by date
  const filteredLedgerTransactions = useMemo(() => {
    if (!activeLedgerBank) return [];
    let list = activeLedgerBank.transactions || [];
    if (ledgerFromDate) {
      list = list.filter((t) => t.date >= ledgerFromDate);
    }
    if (ledgerToDate) {
      list = list.filter((t) => t.date <= ledgerToDate);
    }
    return list;
  }, [activeLedgerBank, ledgerFromDate, ledgerToDate]);

  // Ledger Multi-select Checkbox Handlers
  const isAllTxSelected =
    filteredLedgerTransactions.length > 0 &&
    filteredLedgerTransactions.every((tx) => selectedTxIds.has(tx.id));

  const isSomeTxSelected = selectedTxIds.size > 0 && !isAllTxSelected;

  const handleToggleSelectAllTx = () => {
    if (isAllTxSelected) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(filteredLedgerTransactions.map((tx) => tx.id)));
    }
  };

  const handleToggleSelectTxRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTxIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk Delete Transactions Handler
  const handleConfirmBulkDeleteTx = async () => {
    if (!activeLedgerBank || selectedTxIds.size === 0) return;
    setIsBulkDeletingTx(true);
    try {
      if (onDeleteMultipleTransactions) {
        await onDeleteMultipleTransactions(activeLedgerBank.id, Array.from(selectedTxIds));
      } else if (onDeleteTransaction) {
        for (const id of selectedTxIds) {
          await onDeleteTransaction(activeLedgerBank.id, id);
        }
      }
      setSelectedTxIds(new Set());
      setIsBulkDeleteTxOpen(false);
    } finally {
      setIsBulkDeletingTx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Row with Aggregate Liquidity */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-stroke, #252830)'
        }}
      >
        <div>
          <h1 className="client-details-main-title" style={{ margin: '0 0 4px 0' }}>
            Bank Details <span>· Corporate Accounts & Balance</span>
          </h1>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Real-time balance monitoring and ledger audits across all accounts
          </span>
        </div>

        {/* Global Total Balance KPI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="summary-metric-card" style={{ padding: '12px 20px', minWidth: 'auto' }}>
            <div className="metric-icon-wrap gold" style={{ width: '42px', height: '42px' }}>
              <Wallet size={20} />
            </div>
            <div>
              <span className="metric-label" style={{ fontSize: '11px' }}>TOTAL LIQUIDITY</span>
              <span className="metric-value gold" style={{ fontSize: '18px' }}>
                {formatINR(totalBankBalance)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAddAccountModalOpen(true)}
            className="btn-theme-primary"
            style={{ height: '42px', padding: '0 16px', fontSize: '13px' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div className="afrah-app-search-wrapper" style={{ minWidth: '280px' }}>
          <Search size={14} className="afrah-app-search-icon" />
          <input
            type="text"
            placeholder="Search bank name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="afrah-app-search-input"
          />
        </div>

        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredBanks.length}</strong> of <strong>{bankAccounts.length}</strong> accounts
        </span>
      </div>

      {/* Grid of Bank Account Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {filteredBanks.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--surface-container-low, #181b1f)',
              border: '1px solid var(--border-stroke, #252830)',
              borderRadius: '12px',
              color: 'var(--text-secondary)'
            }}
          >
            <Landmark size={36} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {searchQuery ? 'No bank accounts match your search.' : 'No bank accounts registered.'}
            </div>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Click "Add Bank Account" above to add your primary or corporate account.
            </p>
          </div>
        ) : (
          filteredBanks.map((bank) => {
            const currentInput = inputAmounts[bank.id] || '';
            const currentType = inputTypes[bank.id] || 'credit';

            return (
              <div
                key={bank.id}
                style={{
                  background: 'var(--surface-container-low, #181b1f)',
                  border: '1px solid var(--border-stroke, #252830)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Card Top: Bank Logo + Name + Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <BankLogo bankName={bank.bankName} size={46} />
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          color: 'var(--text-primary)',
                          fontFamily: 'Cinzel, serif'
                        }}
                      >
                        {bank.bankName}
                      </h3>
                      {bank.branch && (
                        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                          {bank.branch}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setActiveLedgerBankId(bank.id)}
                      className="afrah-app-action-btn"
                      title="View Audit Ledger / Transaction History"
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(226, 195, 153, 0.1)',
                        border: '1px solid rgba(226, 195, 153, 0.25)',
                        color: 'var(--primary)',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        gap: '5px'
                      }}
                    >
                      <History size={13} />
                      <span>Ledger</span>
                    </button>

                    <button
                      onClick={() => setDeleteBankTarget(bank)}
                      className="afrah-app-action-btn afrah-app-delete-btn"
                      title="Delete Bank Account"
                      aria-label="Delete Bank Account"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Balance Display */}
                <div
                  style={{
                    background: 'var(--surface-container, #1e2126)',
                    border: '1px solid var(--border-stroke, #2c303a)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                      CURRENT BALANCE
                    </span>
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--primary)',
                        marginTop: '2px'
                      }}
                    >
                      {formatINR(bank.balance)}
                    </div>
                  </div>

                  {bank.updatedAt && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {formatUpdatedAt(bank.updatedAt)}
                    </span>
                  )}
                </div>

                {/* Inline Transaction / Quick Update Controls */}
                <div className="bank-card-quick-form no-print">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Mode Toggle Buttons (+ / -) */}
                    <div
                      style={{
                        display: 'flex',
                        border: '1px solid var(--border-stroke, #282c35)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'var(--surface-container-lowest, #101214)'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setInputTypes((prev) => ({ ...prev, [bank.id]: 'credit' }))
                        }
                        title="Add Money (Credit)"
                        style={{
                          padding: '8px 10px',
                          background: currentType === 'credit' ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
                          color: currentType === 'credit' ? '#4ade80' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700
                        }}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setInputTypes((prev) => ({ ...prev, [bank.id]: 'debit' }))
                        }
                        title="Deduct Money (Debit)"
                        style={{
                          padding: '8px 10px',
                          background: currentType === 'debit' ? 'rgba(248, 113, 113, 0.15)' : 'transparent',
                          color: currentType === 'debit' ? '#f87171' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700
                        }}
                      >
                        <Minus size={14} />
                      </button>
                    </div>

                    {/* Amount Input */}
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="Amount..."
                      value={currentInput}
                      onChange={(e) =>
                        setInputAmounts((prev) => ({ ...prev, [bank.id]: e.target.value }))
                      }
                      className="afrah-app-input"
                      style={{ height: '36px', flex: 1, fontSize: '13px' }}
                    />

                    {/* Submit Button */}
                    <button
                      type="button"
                      disabled={!parseFloat(currentInput)}
                      onClick={() => handleQuickTransaction(bank)}
                      className="btn-theme-primary"
                      style={{
                        height: '36px',
                        padding: '0 14px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: NEW BANK ACCOUNT */}
      {isAddAccountModalOpen && (
        <div className="afrah-app-modal-overlay" onClick={() => setIsAddAccountModalOpen(false)}>
          <div className="afrah-app-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="afrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={18} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Add Bank Account</h3>
              </div>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="afrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Canara Bank, HDFC, SBI..."
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Initial Opening Balance (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 1500000 (optional)"
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>
              </div>

              <div className="afrah-app-modal-footer">
                <button type="button" onClick={() => setIsAddAccountModalOpen(false)} className="afrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!newBankName.trim()} className="btn-theme-primary">
                  <Plus size={16} />
                  <span>Add Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AUDIT LEDGER / PASSBOOK MODAL WITH DATE FILTER & BULK ACTIONS */}
      {activeLedgerBank && (
        <div className="afrah-app-modal-overlay" onClick={() => setActiveLedgerBankId(null)}>
          <div className="afrah-app-modal-container" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="afrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BankLogo bankName={activeLedgerBank.bankName} size={36} />
                <div>
                  <h3 className="afrah-app-modal-title">{activeLedgerBank.bankName}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Passbook Ledger & Audit History · Current Balance: <strong style={{ color: 'var(--primary)' }}>{formatINR(activeLedgerBank.balance)}</strong>
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveLedgerBankId(null)} className="afrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="afrah-app-modal-body" style={{ padding: '16px 20px' }}>
              {/* Date Filter Bar inside Passbook Ledger */}
              <DateFilterBar
                fromDate={ledgerFromDate}
                toDate={ledgerToDate}
                onFromDateChange={setLedgerFromDate}
                onToDateChange={setLedgerToDate}
                onClearDates={() => {
                  setLedgerFromDate('');
                  setLedgerToDate('');
                }}
                selectedCount={selectedTxIds.size}
                onBulkDelete={() => setIsBulkDeleteTxOpen(true)}
                onPrint={handlePrint}
                printLabel="Print Passbook"
              />

              <div className="afrah-app-table-container" style={{ marginTop: '12px' }}>
                <table className="afrah-app-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                      <th>DATE</th>
                      <th>TYPE</th>
                      <th>DESCRIPTION / NOTE</th>
                      <th style={{ textAlign: 'right' }}>AMOUNT</th>
                      <th className="no-print" style={{ width: '50px', textAlign: 'center' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLedgerTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                          {ledgerFromDate || ledgerToDate
                            ? 'No transactions found for the selected date range.'
                            : 'No transactions recorded for this bank account yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredLedgerTransactions.map((tx, idx) => {
                        const isCredit = tx.type === 'credit' || tx.type === 'deposit' || tx.type === 'adjustment';
                        return (
                          <tr
                            key={tx.id}
                            style={{ cursor: 'default' }}
                          >
                            <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', textAlign: 'center' }}>
                              #{idx + 1}
                            </td>
                            <td>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={12} color="var(--primary)" />
                                <span>{tx.date}</span>
                              </div>
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  background: isCredit ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                                  color: isCredit ? '#4ade80' : '#f87171'
                                }}
                              >
                                {isCredit ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                                {tx.type}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-primary)', fontSize: '12.5px' }}>
                              {tx.note || '—'}
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 700,
                                fontFamily: 'JetBrains Mono, monospace',
                                color: isCredit ? '#4ade80' : '#f87171'
                              }}
                            >
                              {isCredit ? '+' : '-'}{formatINR(tx.amount)}
                            </td>
                            <td className="no-print" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setDeleteBankTxTarget({ bank: activeLedgerBank, tx })}
                                className="afrah-app-action-btn afrah-app-delete-btn"
                                title="Delete & Revert Transaction"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="afrah-app-modal-footer">
              <button onClick={() => setActiveLedgerBankId(null)} className="afrah-app-back-btn">
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE BANK ACCOUNT MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteBankTarget)}
        title="Delete Bank Account"
        message="Are you sure you want to delete this bank account? All associated transaction logs will be permanently removed."
        itemName={deleteBankTarget ? `${deleteBankTarget.bankName} (Balance: ${formatINR(deleteBankTarget.balance)})` : undefined}
        confirmText="Delete Account"
        isDeleting={isDeletingBank}
        onConfirm={handleConfirmDeleteBank}
        onClose={() => setDeleteBankTarget(null)}
      />

      {/* CONFIRM SINGLE DELETE BANK TRANSACTION MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteBankTxTarget)}
        title="Revert & Delete Transaction"
        message="Are you sure you want to delete this transaction record? The account balance will be automatically adjusted."
        itemName={deleteBankTxTarget ? `${deleteBankTxTarget.tx.date} — ${deleteBankTxTarget.tx.type.toUpperCase()} ${formatINR(deleteBankTxTarget.tx.amount)} (${deleteBankTxTarget.tx.note || 'No note'})` : undefined}
        confirmText="Delete Transaction"
        isDeleting={isDeletingBankTx}
        onConfirm={handleConfirmDeleteTx}
        onClose={() => setDeleteBankTxTarget(null)}
      />

      {/* CONFIRM BULK DELETE BANK TRANSACTIONS MODAL */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteTxOpen}
        title="Revert & Delete Selected Transactions"
        message={`Are you sure you want to delete ${selectedTxIds.size} selected transactions? The bank account balance will be adjusted accordingly.`}
        confirmText={`Delete ${selectedTxIds.size} Transactions`}
        isDeleting={isBulkDeletingTx}
        onConfirm={handleConfirmBulkDeleteTx}
        onClose={() => setIsBulkDeleteTxOpen(false)}
      />
    </div>
  );
};
