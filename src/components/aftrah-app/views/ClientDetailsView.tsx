import React, { useState, useMemo } from 'react';
import type { Client, AdvancePayment, ExpenseItem } from '../types';
import { PAYMENT_MODES } from '../types';
import { SearchableExpenseSelect } from '../components/SearchableExpenseSelect';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { DateFilterBar } from '../components/DateFilterBar';
import {
  ArrowLeft,
  Phone,
  MapPin,
  CreditCard,
  Receipt,
  Plus,
  Trash2,
  Calendar,
  Wallet,
  TrendingDown,
  Scale,
  Pencil,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Printer
} from 'lucide-react';

interface ClientDetailsViewProps {
  client: Client;
  onBack: () => void;
  onUpdateClient: (updated: Client) => void;
  onAddAdvance?: (clientId: string, payment: Omit<AdvancePayment, 'id' | 'sNo'>) => Promise<any>;
  onUpdateAdvance?: (clientId: string, payment: AdvancePayment) => Promise<any>;
  onDeleteAdvance?: (clientId: string, paymentId: string) => Promise<any>;
  onDeleteMultipleAdvancePayments?: (clientId: string, paymentIds: string[]) => Promise<any>;
  onAddExpense?: (clientId: string, expense: Omit<ExpenseItem, 'id' | 'sNo'>) => Promise<any>;
  onUpdateExpense?: (clientId: string, expense: ExpenseItem) => Promise<any>;
  onDeleteExpense?: (clientId: string, expenseId: string) => Promise<any>;
  onDeleteMultipleExpenses?: (clientId: string, expenseIds: string[]) => Promise<any>;
}

export const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({
  client,
  onBack,
  onUpdateClient,
  onAddAdvance,
  onUpdateAdvance,
  onDeleteAdvance,
  onDeleteMultipleAdvancePayments,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onDeleteMultipleExpenses
}) => {
  // Advance Payments State
  const advancePayments = client.advancePayments || [];
  const [advSearch, setAdvSearch] = useState('');
  const [advFromDate, setAdvFromDate] = useState('');
  const [advToDate, setAdvToDate] = useState('');
  const [selectedAdvIds, setSelectedAdvIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteAdvOpen, setIsBulkDeleteAdvOpen] = useState(false);
  const [isBulkDeletingAdv, setIsBulkDeletingAdv] = useState(false);
  const [advCurrentPage, setAdvCurrentPage] = useState(1);
  const [advItemsPerPage, setAdvItemsPerPage] = useState(5);

  // Add Advance Modal State (Add Details - I)
  const [isAddAdvModalOpen, setIsAddAdvModalOpen] = useState(false);
  const [advDate, setAdvDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [advAmount, setAdvAmount] = useState('');
  const [advMode, setAdvMode] = useState(PAYMENT_MODES[0]);

  // Edit Advance Modal State
  const [isEditAdvModalOpen, setIsEditAdvModalOpen] = useState(false);
  const [editingAdvId, setEditingAdvId] = useState<string | null>(null);
  const [editAdvDate, setEditAdvDate] = useState('');
  const [editAdvAmount, setEditAdvAmount] = useState('');
  const [editAdvMode, setEditAdvMode] = useState(PAYMENT_MODES[0]);

  // Expenses State
  const expenses = client.expenses || [];
  const [expSearch, setExpSearch] = useState('');
  const [expFromDate, setExpFromDate] = useState('');
  const [expToDate, setExpToDate] = useState('');
  const [selectedExpIds, setSelectedExpIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteExpOpen, setIsBulkDeleteExpOpen] = useState(false);
  const [isBulkDeletingExp, setIsBulkDeletingExp] = useState(false);
  const [expCurrentPage, setExpCurrentPage] = useState(1);
  const [expItemsPerPage, setExpItemsPerPage] = useState(5);

  // Add Expense Modal State (Add Details - IInd)
  const [isAddExpModalOpen, setIsAddExpModalOpen] = useState(false);
  const [expDate, setExpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expName, setExpName] = useState('');
  const [expQuantity, setExpQuantity] = useState('');
  const [expRate, setExpRate] = useState('');

  // Edit Expense Modal State
  const [isEditExpModalOpen, setIsEditExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpDate, setEditExpDate] = useState('');
  const [editExpName, setEditExpName] = useState('');
  const [editExpQuantity, setEditExpQuantity] = useState('');
  const [editExpRate, setEditExpRate] = useState('');

  // Delete Confirmation Modal States
  const [deleteAdvTarget, setDeleteAdvTarget] = useState<AdvancePayment | null>(null);
  const [isDeletingAdv, setIsDeletingAdv] = useState(false);
  const [deleteExpTarget, setDeleteExpTarget] = useState<ExpenseItem | null>(null);
  const [isDeletingExp, setIsDeletingExp] = useState(false);

  // Auto-calculated total amounts for expenses
  const expTotalAmount =
    (parseFloat(expQuantity) || 0) * (parseFloat(expRate) || 0);

  const editExpTotalAmount =
    (parseFloat(editExpQuantity) || 0) * (parseFloat(editExpRate) || 0);

  // Filtered Advance Payments by search AND date range
  const filteredAdvance = useMemo(() => {
    let list = advancePayments;
    if (advFromDate) {
      list = list.filter((p) => p.date >= advFromDate);
    }
    if (advToDate) {
      list = list.filter((p) => p.date <= advToDate);
    }
    if (advSearch.trim()) {
      const q = advSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.date.toLowerCase().includes(q) ||
          p.mode.toLowerCase().includes(q) ||
          String(p.amount).includes(q) ||
          String(p.sNo).includes(q)
      );
    }
    return list;
  }, [advancePayments, advSearch, advFromDate, advToDate]);

  // Filtered Expenses by search AND date range
  const filteredExpenses = useMemo(() => {
    let list = expenses;
    if (expFromDate) {
      list = list.filter((e) => e.date >= expFromDate);
    }
    if (expToDate) {
      list = list.filter((e) => e.date <= expToDate);
    }
    if (expSearch.trim()) {
      const q = expSearch.toLowerCase().trim();
      list = list.filter(
        (exp) =>
          exp.expenseName.toLowerCase().includes(q) ||
          exp.date.toLowerCase().includes(q) ||
          String(exp.quantity).includes(q) ||
          String(exp.rate).includes(q) ||
          String(exp.totalAmount).includes(q) ||
          String(exp.sNo).includes(q)
      );
    }
    return list;
  }, [expenses, expSearch, expFromDate, expToDate]);

  // Advance Multi-select handlers
  const isAllAdvSelected =
    filteredAdvance.length > 0 &&
    filteredAdvance.every((p) => selectedAdvIds.has(p.id));

  const isSomeAdvSelected = selectedAdvIds.size > 0 && !isAllAdvSelected;

  const handleToggleSelectAllAdv = () => {
    if (isAllAdvSelected) {
      setSelectedAdvIds(new Set());
    } else {
      setSelectedAdvIds(new Set(filteredAdvance.map((p) => p.id)));
    }
  };

  const handleToggleSelectAdvRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAdvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmBulkDeleteAdv = async () => {
    if (selectedAdvIds.size === 0) return;
    setIsBulkDeletingAdv(true);
    try {
      if (onDeleteMultipleAdvancePayments) {
        await onDeleteMultipleAdvancePayments(client.id, Array.from(selectedAdvIds));
      } else if (onDeleteAdvance) {
        for (const id of selectedAdvIds) {
          await onDeleteAdvance(client.id, id);
        }
      }
      setSelectedAdvIds(new Set());
      setIsBulkDeleteAdvOpen(false);
    } finally {
      setIsBulkDeletingAdv(false);
    }
  };

  // Expenses Multi-select handlers
  const isAllExpSelected =
    filteredExpenses.length > 0 &&
    filteredExpenses.every((e) => selectedExpIds.has(e.id));

  const isSomeExpSelected = selectedExpIds.size > 0 && !isAllExpSelected;

  const handleToggleSelectAllExp = () => {
    if (isAllExpSelected) {
      setSelectedExpIds(new Set());
    } else {
      setSelectedExpIds(new Set(filteredExpenses.map((e) => e.id)));
    }
  };

  const handleToggleSelectExpRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExpIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmBulkDeleteExp = async () => {
    if (selectedExpIds.size === 0) return;
    setIsBulkDeletingExp(true);
    try {
      if (onDeleteMultipleExpenses) {
        await onDeleteMultipleExpenses(client.id, Array.from(selectedExpIds));
      } else if (onDeleteExpense) {
        for (const id of selectedExpIds) {
          await onDeleteExpense(client.id, id);
        }
      }
      setSelectedExpIds(new Set());
      setIsBulkDeleteExpOpen(false);
    } finally {
      setIsBulkDeletingExp(false);
    }
  };

  // Print Statement Handler
  const handlePrint = () => {
    window.print();
  };

  // Validation
  const isAdvValid =
    advDate.trim().length > 0 &&
    parseFloat(advAmount) > 0 &&
    advMode.trim().length > 0;

  const isEditAdvValid =
    editAdvDate.trim().length > 0 &&
    parseFloat(editAdvAmount) > 0 &&
    editAdvMode.trim().length > 0;

  const isExpValid =
    expDate.trim().length > 0 &&
    expName.trim().length > 0 &&
    parseFloat(expQuantity) > 0 &&
    parseFloat(expRate) > 0;

  const isEditExpValid =
    editExpDate.trim().length > 0 &&
    editExpName.trim().length > 0 &&
    parseFloat(editExpQuantity) > 0 &&
    parseFloat(editExpRate) > 0;

  // Handle Add Advance Payment Submit
  const handleAddAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdvValid) return;

    if (onAddAdvance) {
      await onAddAdvance(client.id, {
        date: advDate,
        amount: parseFloat(advAmount),
        mode: advMode,
      });
    } else {
      const newPayment: AdvancePayment = {
        id: `adv-${Date.now()}`,
        sNo: advancePayments.length + 1,
        date: advDate,
        amount: parseFloat(advAmount),
        mode: advMode
      };
      onUpdateClient({
        ...client,
        advancePayments: [...advancePayments, newPayment]
      });
    }

    setAdvAmount('');
    setIsAddAdvModalOpen(false);
    setAdvCurrentPage(1);
  };

  // Open Edit Advance Modal
  const handleOpenEditAdv = (item: AdvancePayment) => {
    setEditingAdvId(item.id);
    setEditAdvDate(item.date);
    setEditAdvAmount(String(item.amount));
    setEditAdvMode(item.mode);
    setIsEditAdvModalOpen(true);
  };

  // Save Edit Advance Modal
  const handleSaveEditAdv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditAdvValid || !editingAdvId) return;

    const updatedPayment: AdvancePayment = {
      id: editingAdvId,
      sNo: advancePayments.find((p) => p.id === editingAdvId)?.sNo || 1,
      date: editAdvDate,
      amount: parseFloat(editAdvAmount),
      mode: editAdvMode
    };

    if (onUpdateAdvance) {
      await onUpdateAdvance(client.id, updatedPayment);
    } else {
      const updated = advancePayments.map((p) =>
        p.id === editingAdvId ? updatedPayment : p
      );
      onUpdateClient({
        ...client,
        advancePayments: updated
      });
    }

    setIsEditAdvModalOpen(false);
    setEditingAdvId(null);
  };

  // Handle Confirm Delete Advance Payment
  const handleConfirmDeleteAdvance = async () => {
    if (!deleteAdvTarget) return;
    setIsDeletingAdv(true);
    try {
      if (onDeleteAdvance) {
        await onDeleteAdvance(client.id, deleteAdvTarget.id);
      } else {
        const updated = advancePayments
          .filter((p) => p.id !== deleteAdvTarget.id)
          .map((p, index) => ({ ...p, sNo: index + 1 }));
        onUpdateClient({
          ...client,
          advancePayments: updated
        });
      }
    } finally {
      setIsDeletingAdv(false);
      setDeleteAdvTarget(null);
    }
  };

  // Handle Add Expense Submit
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExpValid) return;

    if (onAddExpense) {
      await onAddExpense(client.id, {
        date: expDate,
        expenseName: expName.trim(),
        quantity: parseFloat(expQuantity),
        rate: parseFloat(expRate),
        totalAmount: expTotalAmount,
      });
    } else {
      const newExpense: ExpenseItem = {
        id: `exp-${Date.now()}`,
        sNo: expenses.length + 1,
        date: expDate,
        expenseName: expName.trim(),
        quantity: parseFloat(expQuantity),
        rate: parseFloat(expRate),
        totalAmount: expTotalAmount
      };
      onUpdateClient({
        ...client,
        expenses: [...expenses, newExpense]
      });
    }

    setExpName('');
    setExpQuantity('');
    setExpRate('');
    setIsAddExpModalOpen(false);
    setExpCurrentPage(1);
  };

  // Open Edit Expense Modal
  const handleOpenEditExp = (item: ExpenseItem) => {
    setEditingExpId(item.id);
    setEditExpDate(item.date);
    setEditExpName(item.expenseName);
    setEditExpQuantity(String(item.quantity));
    setEditExpRate(String(item.rate));
    setIsEditExpModalOpen(true);
  };

  // Save Edit Expense Modal
  const handleSaveEditExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditExpValid || !editingExpId) return;

    const updatedExpense: ExpenseItem = {
      id: editingExpId,
      sNo: expenses.find((exp) => exp.id === editingExpId)?.sNo || 1,
      date: editExpDate,
      expenseName: editExpName.trim(),
      quantity: parseFloat(editExpQuantity),
      rate: parseFloat(editExpRate),
      totalAmount: editExpTotalAmount
    };

    if (onUpdateExpense) {
      await onUpdateExpense(client.id, updatedExpense);
    } else {
      const updated = expenses.map((exp) =>
        exp.id === editingExpId ? updatedExpense : exp
      );
      onUpdateClient({
        ...client,
        expenses: updated
      });
    }

    setIsEditExpModalOpen(false);
    setEditingExpId(null);
  };

  // Handle Confirm Delete Expense
  const handleConfirmDeleteExpense = async () => {
    if (!deleteExpTarget) return;
    setIsDeletingExp(true);
    try {
      if (onDeleteExpense) {
        await onDeleteExpense(client.id, deleteExpTarget.id);
      } else {
        const updated = expenses
          .filter((exp) => exp.id !== deleteExpTarget.id)
          .map((exp, index) => ({ ...exp, sNo: index + 1 }));
        onUpdateClient({
          ...client,
          expenses: updated
        });
      }
    } finally {
      setIsDeletingExp(false);
      setDeleteExpTarget(null);
    }
  };

  // Totals calculations
  const totalAdvance = advancePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
  const balance = totalAdvance - totalExpenses;

  // Format currency
  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Advance Payments Pagination Computations
  const advTotalPages = Math.ceil(filteredAdvance.length / advItemsPerPage) || 1;
  const advStartIndex = (advCurrentPage - 1) * advItemsPerPage;
  const advEndIndex = Math.min(advStartIndex + advItemsPerPage, filteredAdvance.length);
  const paginatedAdvance = filteredAdvance.slice(advStartIndex, advEndIndex);

  const advPageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (advCurrentPage > 1) pages.push(advCurrentPage - 1);
    pages.push(advCurrentPage);
    if (advCurrentPage < advTotalPages) pages.push(advCurrentPage + 1);
    return pages;
  }, [advCurrentPage, advTotalPages]);

  // Expenses Pagination Computations
  const expTotalPages = Math.ceil(filteredExpenses.length / expItemsPerPage) || 1;
  const expStartIndex = (expCurrentPage - 1) * expItemsPerPage;
  const expEndIndex = Math.min(expStartIndex + expItemsPerPage, filteredExpenses.length);
  const paginatedExpenses = filteredExpenses.slice(expStartIndex, expEndIndex);

  const expPageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (expCurrentPage > 1) pages.push(expCurrentPage - 1);
    pages.push(expCurrentPage);
    if (expCurrentPage < expTotalPages) pages.push(expCurrentPage + 1);
    return pages;
  }, [expCurrentPage, expTotalPages]);

  return (
    <div className="client-details-page">
      {/* PRINT-ONLY STATEMENT HEADER */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">AFTRAH CONSTRUCTIONS</h1>
            <p className="print-company-sub">Civil Construction, Materials Procurement & Financial ERP</p>
          </div>
          <div className="print-badge-statement">
            <span>CLIENT ACCOUNT STATEMENT</span>
          </div>
        </div>

        <div className="print-meta-grid">
          <div className="print-meta-box">
            <span className="print-meta-title">CLIENT DETAILS</span>
            <div className="print-meta-val"><strong>{client.name}</strong></div>
            <div className="print-meta-sub">Phone: {client.phone}</div>
            <div className="print-meta-sub">Site / Address: {client.address}</div>
          </div>

          <div className="print-meta-box">
            <span className="print-meta-title">FINANCIAL SUMMARY</span>
            <div className="print-meta-sub">Total Advances: <strong>{formatINR(totalAdvance)}</strong></div>
            <div className="print-meta-sub">Total Expenses: <strong>{formatINR(totalExpenses)}</strong></div>
            <div className="print-meta-val" style={{ marginTop: '4px', color: balance >= 0 ? '#15803d' : '#b91c1c' }}>
              {balance >= 0 ? `Net Balance: ${formatINR(balance)}` : `Overdue Deficit: ${formatINR(Math.abs(balance))}`}
            </div>
          </div>
        </div>

        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Advance Payments:</span> <strong>{filteredAdvance.length} Entries ({formatINR(totalAdvance)})</strong>
          </div>
          <div className="print-total-item">
            <span>Site Expenses:</span> <strong>{filteredExpenses.length} Entries ({formatINR(totalExpenses)})</strong>
          </div>
          <div className="print-total-item">
            <span>Statement Date:</span> <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          </div>
        </div>
      </div>

      {/* Screen Header Bar */}
      <div className="client-details-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={onBack} className="aftrah-app-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Clients</span>
          </button>

          <button
            onClick={handlePrint}
            className="aftrah-app-back-btn"
            title="Print or Export Client Statement"
          >
            <Printer size={15} />
            <span>Print Statement</span>
          </button>
        </div>

        <div className="client-details-title-row">
          <div>
            <h1 className="client-details-main-title">
              {client.name} <span>· Client Ledger</span>
            </h1>
            <div className="client-meta-row">
              <span className="client-meta-pill">
                <Phone size={13} color="var(--primary)" />
                {client.phone}
              </span>
              <span className="client-meta-pill">
                <MapPin size={13} color="var(--primary)" />
                {client.address}
              </span>
            </div>
          </div>

          {/* Top KPI Financial Summary Cards */}
          <div className="client-financial-summary">
            <div className="summary-metric-card">
              <div className="metric-icon-wrap gold">
                <Wallet size={24} />
              </div>
              <div>
                <span className="metric-label">TOTAL ADVANCE</span>
                <span className="metric-value gold">{formatINR(totalAdvance)}</span>
              </div>
            </div>

            <div className="summary-metric-card">
              <div className="metric-icon-wrap blue">
                <TrendingDown size={24} />
              </div>
              <div>
                <span className="metric-label">TOTAL EXPENSES</span>
                <span className="metric-value blue">{formatINR(totalExpenses)}</span>
              </div>
            </div>

            <div className="summary-metric-card">
              <div className={`metric-icon-wrap ${balance >= 0 ? 'green' : 'red'}`}>
                <Scale size={24} />
              </div>
              <div>
                <span className="metric-label">
                  {balance >= 0 ? 'REMAINING BALANCE' : 'DEFICIT OVERDUE'}
                </span>
                <span className={`metric-value ${balance >= 0 ? 'green' : 'red'}`}>
                  {formatINR(Math.abs(balance))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SIDE-BY-SIDE WIREFRAME GRIDS */}
      <div className="client-details-side-by-side-grid">
        {/* COLUMN 1: ADVANCE PAYMENTS */}
        <div className="details-column-panel">
          {/* Date Filter & Bulk Actions for Advance Payments */}
          <DateFilterBar
            fromDate={advFromDate}
            toDate={advToDate}
            onFromDateChange={(d) => {
              setAdvFromDate(d);
              setAdvCurrentPage(1);
            }}
            onToDateChange={(d) => {
              setAdvToDate(d);
              setAdvCurrentPage(1);
            }}
            onClearDates={() => {
              setAdvFromDate('');
              setAdvToDate('');
              setAdvCurrentPage(1);
            }}
            selectedCount={selectedAdvIds.size}
            onBulkDelete={() => setIsBulkDeleteAdvOpen(true)}
            deleteLabel="Delete Selected"
          />

          <section className="aftrah-app-table-section">
            <div className="aftrah-app-section-header no-print">
              <div>
                <h2 className="aftrah-app-section-title">Advance Payments</h2>
                <span className="aftrah-app-section-subtitle">
                  {filteredAdvance.length} {filteredAdvance.length === 1 ? 'payment' : 'payments'} recorded
                  {(advFromDate || advToDate) && ' (filtered)'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="aftrah-app-search-wrapper" style={{ minWidth: '150px' }}>
                  <Search size={13} className="aftrah-app-search-icon" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={advSearch}
                    onChange={(e) => {
                      setAdvSearch(e.target.value);
                      setAdvCurrentPage(1);
                    }}
                    className="aftrah-app-search-input"
                  />
                </div>

                <button
                  onClick={() => setIsAddAdvModalOpen(true)}
                  className="btn-theme-primary"
                  style={{ height: '34px', padding: '0 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} />
                  <span>Add Advance</span>
                </button>
              </div>
            </div>

            <div className="aftrah-app-table-container">
              <table className="aftrah-app-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>S.NO</th>
                    <th>DATE</th>
                    <th>AMOUNT</th>
                    <th>PAYMENT MODE</th>
                    <th className="no-print" style={{ width: '70px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdvance.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                        {advSearch || advFromDate || advToDate ? 'No matching advance payments.' : 'No advance payments added yet.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedAdvance.map((item, index) => {
                      return (
                        <tr
                          key={item.id}
                          style={{ cursor: 'default' }}
                        >
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                            #{advStartIndex + index + 1}
                          </td>
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={12} color="var(--primary)" />
                              <span>{item.date}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                            {formatINR(item.amount)}
                          </td>
                          <td>
                            <span className="payment-mode-tag">
                              {item.mode}
                            </span>
                          </td>
                          <td className="no-print" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={() => handleOpenEditAdv(item)}
                                className="aftrah-app-action-btn aftrah-app-edit-btn"
                                title="Edit Payment"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteAdvTarget(item)}
                                className="aftrah-app-action-btn aftrah-app-delete-btn"
                                title="Delete Payment"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Advance Pagination */}
            {filteredAdvance.length > 0 && (
              <div className="aftrah-app-pagination-bar compact no-print">
                <div className="aftrah-app-pagination-left">
                  <span className="aftrah-app-pagination-info">
                    {advStartIndex + 1}–{advEndIndex} of {filteredAdvance.length}
                  </span>
                  <div className="aftrah-app-rows-selector">
                    <select
                      value={advItemsPerPage}
                      onChange={(e) => {
                        setAdvItemsPerPage(Number(e.target.value));
                        setAdvCurrentPage(1);
                      }}
                      className="aftrah-app-select-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>

                <div className="aftrah-app-pagination-controls">
                  <button
                    onClick={() => setAdvCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={advCurrentPage === 1}
                    className="aftrah-app-page-nav-btn"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="aftrah-app-page-numbers-wrap">
                    {advPageNumbers.map((p) => (
                      <button
                        key={p}
                        onClick={() => setAdvCurrentPage(p)}
                        className={`aftrah-app-page-num-btn ${advCurrentPage === p ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setAdvCurrentPage((p) => Math.min(advTotalPages, p + 1))}
                    disabled={advCurrentPage === advTotalPages}
                    className="aftrah-app-page-nav-btn"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* COLUMN 2: SITE EXPENSES */}
        <div className="details-column-panel">
          {/* Date Filter & Bulk Actions for Expenses */}
          <DateFilterBar
            fromDate={expFromDate}
            toDate={expToDate}
            onFromDateChange={(d) => {
              setExpFromDate(d);
              setExpCurrentPage(1);
            }}
            onToDateChange={(d) => {
              setExpToDate(d);
              setExpCurrentPage(1);
            }}
            onClearDates={() => {
              setExpFromDate('');
              setExpToDate('');
              setExpCurrentPage(1);
            }}
            selectedCount={selectedExpIds.size}
            onBulkDelete={() => setIsBulkDeleteExpOpen(true)}
            deleteLabel="Delete Selected"
          />

          <section className="aftrah-app-table-section">
            <div className="aftrah-app-section-header no-print">
              <div>
                <h2 className="aftrah-app-section-title">Site Expenses</h2>
                <span className="aftrah-app-section-subtitle">
                  {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'} recorded
                  {(expFromDate || expToDate) && ' (filtered)'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="aftrah-app-search-wrapper" style={{ minWidth: '150px' }}>
                  <Search size={13} className="aftrah-app-search-icon" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={expSearch}
                    onChange={(e) => {
                      setExpSearch(e.target.value);
                      setExpCurrentPage(1);
                    }}
                    className="aftrah-app-search-input"
                  />
                </div>

                <button
                  onClick={() => setIsAddExpModalOpen(true)}
                  className="btn-theme-primary"
                  style={{ height: '34px', padding: '0 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>

            <div className="aftrah-app-table-container">
              <table className="aftrah-app-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>S.NO</th>
                    <th>DATE</th>
                    <th>EXPENSE NAME</th>
                    <th>QTY</th>
                    <th>RATE</th>
                    <th>TOTAL</th>
                    <th className="no-print" style={{ width: '70px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                        {expSearch || expFromDate || expToDate ? 'No matching expenses found.' : 'No expenses logged yet.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedExpenses.map((exp, index) => {
                      return (
                        <tr
                          key={exp.id}
                          style={{ cursor: 'default' }}
                        >
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                            #{expStartIndex + index + 1}
                          </td>
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={12} color="var(--primary)" />
                              <span>{exp.date}</span>
                            </div>
                          </td>
                          <td>
                            <span className="expense-name-tag">
                              {exp.expenseName}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                            {exp.quantity}
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                            {formatINR(exp.rate)}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                            {formatINR(exp.totalAmount)}
                          </td>
                          <td className="no-print" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={() => handleOpenEditExp(exp)}
                                className="aftrah-app-action-btn aftrah-app-edit-btn"
                                title="Edit Expense"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteExpTarget(exp)}
                                className="aftrah-app-action-btn aftrah-app-delete-btn"
                                title="Delete Expense"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Expenses Pagination */}
            {filteredExpenses.length > 0 && (
              <div className="aftrah-app-pagination-bar compact no-print">
                <div className="aftrah-app-pagination-left">
                  <span className="aftrah-app-pagination-info">
                    {expStartIndex + 1}–{expEndIndex} of {filteredExpenses.length}
                  </span>
                  <div className="aftrah-app-rows-selector">
                    <select
                      value={expItemsPerPage}
                      onChange={(e) => {
                        setExpItemsPerPage(Number(e.target.value));
                        setExpCurrentPage(1);
                      }}
                      className="aftrah-app-select-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>

                <div className="aftrah-app-pagination-controls">
                  <button
                    onClick={() => setExpCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={expCurrentPage === 1}
                    className="aftrah-app-page-nav-btn"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="aftrah-app-page-numbers-wrap">
                    {expPageNumbers.map((p) => (
                      <button
                        key={p}
                        onClick={() => setExpCurrentPage(p)}
                        className={`aftrah-app-page-num-btn ${expCurrentPage === p ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setExpCurrentPage((p) => Math.min(expTotalPages, p + 1))}
                    disabled={expCurrentPage === expTotalPages}
                    className="aftrah-app-page-nav-btn"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* MODAL 1: ADD ADVANCE PAYMENT */}
      {isAddAdvModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsAddAdvModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={17} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Add Advance Payment</h3>
              </div>
              <button onClick={() => setIsAddAdvModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddAdvanceSubmit}>
              <div className="aftrah-app-modal-body">
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={advDate}
                    onChange={(e) => setAdvDate(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="e.g. 250000"
                    value={advAmount}
                    onChange={(e) => setAdvAmount(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Payment Mode *</label>
                  <select
                    value={advMode}
                    onChange={(e) => setAdvMode(e.target.value)}
                    className="aftrah-app-input"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsAddAdvModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!isAdvValid} className="btn-theme-primary">
                  <Plus size={16} />
                  <span>Add Advance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ADVANCE PAYMENT */}
      {isEditAdvModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditAdvModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={17} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Edit Advance Payment</h3>
              </div>
              <button onClick={() => setIsEditAdvModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEditAdv}>
              <div className="aftrah-app-modal-body">
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={editAdvDate}
                    onChange={(e) => setEditAdvDate(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={editAdvAmount}
                    onChange={(e) => setEditAdvAmount(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Payment Mode *</label>
                  <select
                    value={editAdvMode}
                    onChange={(e) => setEditAdvMode(e.target.value)}
                    className="aftrah-app-input"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsEditAdvModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!isEditAdvValid} className="btn-theme-primary">
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD EXPENSE */}
      {isAddExpModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsAddExpModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={17} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Add Site Expense</h3>
              </div>
              <button onClick={() => setIsAddExpModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddExpenseSubmit}>
              <div className="aftrah-app-modal-body">
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Expense Category *</label>
                  <SearchableExpenseSelect
                    value={expName}
                    onChange={(val) => setExpName(val)}
                    placeholder="Select or type custom expense..."
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Quantity *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      placeholder="e.g. 10"
                      value={expQuantity}
                      onChange={(e) => setExpQuantity(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="e.g. 1500"
                      value={expRate}
                      onChange={(e) => setExpRate(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                </div>
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Total Calculated (₹)</label>
                  <div className="total-amount-display">
                    {formatINR(expTotalAmount)}
                  </div>
                </div>
              </div>
              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsAddExpModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!isExpValid} className="btn-theme-primary">
                  <Plus size={16} />
                  <span>Add Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT EXPENSE */}
      {isEditExpModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditExpModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={17} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Edit Site Expense</h3>
              </div>
              <button onClick={() => setIsEditExpModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEditExp}>
              <div className="aftrah-app-modal-body">
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={editExpDate}
                    onChange={(e) => setEditExpDate(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Expense Category *</label>
                  <SearchableExpenseSelect
                    value={editExpName}
                    onChange={(val) => setEditExpName(val)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Quantity *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={editExpQuantity}
                      onChange={(e) => setEditExpQuantity(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={editExpRate}
                      onChange={(e) => setEditExpRate(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                </div>
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Total Calculated (₹)</label>
                  <div className="total-amount-display">
                    {formatINR(editExpTotalAmount)}
                  </div>
                </div>
              </div>
              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsEditExpModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!isEditExpValid} className="btn-theme-primary">
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ADVANCE MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteAdvTarget)}
        title="Delete Advance Payment"
        message="Are you sure you want to delete this client advance payment? This will update the client ledger and outstanding balance immediately."
        itemName={deleteAdvTarget ? `${deleteAdvTarget.date} — ${formatINR(deleteAdvTarget.amount)} (${deleteAdvTarget.mode})` : undefined}
        confirmText="Delete Payment"
        isDeleting={isDeletingAdv}
        onConfirm={handleConfirmDeleteAdvance}
        onClose={() => setDeleteAdvTarget(null)}
      />

      {/* CONFIRM BULK DELETE ADVANCE PAYMENTS MODAL */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteAdvOpen}
        title="Delete Selected Advance Payments"
        message={`Are you sure you want to delete ${selectedAdvIds.size} selected advance payments? Financial totals will be recalculated immediately.`}
        confirmText={`Delete ${selectedAdvIds.size} Payments`}
        isDeleting={isBulkDeletingAdv}
        onConfirm={handleConfirmBulkDeleteAdv}
        onClose={() => setIsBulkDeleteAdvOpen(false)}
      />

      {/* CONFIRM DELETE EXPENSE MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteExpTarget)}
        title="Delete Site Expense"
        message="Are you sure you want to delete this expense record? The client's financial totals will be recalculated."
        itemName={deleteExpTarget ? `${deleteExpTarget.date} — ${deleteExpTarget.expenseName} (${formatINR(deleteExpTarget.totalAmount)})` : undefined}
        confirmText="Delete Expense"
        isDeleting={isDeletingExp}
        onConfirm={handleConfirmDeleteExpense}
        onClose={() => setDeleteExpTarget(null)}
      />

      {/* CONFIRM BULK DELETE EXPENSES MODAL */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteExpOpen}
        title="Delete Selected Site Expenses"
        message={`Are you sure you want to delete ${selectedExpIds.size} selected expense records? Financial totals will be recalculated immediately.`}
        confirmText={`Delete ${selectedExpIds.size} Expenses`}
        isDeleting={isBulkDeletingExp}
        onConfirm={handleConfirmBulkDeleteExp}
        onClose={() => setIsBulkDeleteExpOpen(false)}
      />
    </div>
  );
};
