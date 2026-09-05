import React, { useState, useMemo } from 'react';
import type { InteriorClient, InteriorAdvancePayment, InteriorExpenseItem } from '../types';
import {
  INTERIOR_CATEGORIES,
  INTERIOR_UNITS,
  PREDEFINED_INTERIOR_ITEMS,
  PREDEFINED_INTERIOR_EXPENSES,
  PAYMENT_MODES
} from '../types';
import { SearchableExpenseSelect } from '../components/SearchableExpenseSelect';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { DateFilterBar } from '../components/DateFilterBar';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  TrendingDown,
  Scale,
  Plus,
  Pencil,
  Trash2,
  Printer,
  X,
  CreditCard,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';

interface InteriorClientDetailsViewProps {
  client: InteriorClient;
  onBack: () => void;
  onUpdateClient: (updatedClient: InteriorClient) => Promise<any>;
  onAddAdvance: (clientId: string, advData: Omit<InteriorAdvancePayment, 'id' | 'sNo'>) => Promise<any>;
  onUpdateAdvance: (clientId: string, advData: InteriorAdvancePayment) => Promise<any>;
  onDeleteAdvance: (clientId: string, advId: string) => Promise<any>;
  onDeleteMultipleAdvancePayments?: (clientId: string, advIds: string[]) => Promise<any>;
  onAddExpense: (clientId: string, expData: Omit<InteriorExpenseItem, 'id' | 'sNo'>) => Promise<any>;
  onUpdateExpense: (clientId: string, expData: InteriorExpenseItem) => Promise<any>;
  onDeleteExpense: (clientId: string, expId: string) => Promise<any>;
  onDeleteMultipleExpenses?: (clientId: string, expIds: string[]) => Promise<any>;
}

// Convert numbers to Roman numerals for PDF-style item numbering
const toRomanNumeral = (num: number): string => {
  const romanMap: [number, string][] = [
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i']
  ];
  let result = '';
  let n = num;
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result || String(num);
};

export const InteriorClientDetailsView: React.FC<InteriorClientDetailsViewProps> = ({
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
  const advancePayments = client.advancePayments || [];
  const expenses = client.expenses || [];

  // ===================== ADVANCE PAYMENTS STATE =====================
  const [advSearch, setAdvSearch] = useState('');
  const [advFromDate, setAdvFromDate] = useState('');
  const [advToDate, setAdvToDate] = useState('');
  const [advCurrentPage, setAdvCurrentPage] = useState(1);
  const [advItemsPerPage, setAdvItemsPerPage] = useState(10);
  const [selectedAdvIds, setSelectedAdvIds] = useState<Set<string>>(new Set());

  // Add Advance Modal
  const [isAddAdvModalOpen, setIsAddAdvModalOpen] = useState(false);
  const [newAdvDate, setNewAdvDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newAdvAmount, setNewAdvAmount] = useState('');
  const [newAdvMode, setNewAdvMode] = useState(PAYMENT_MODES[0]);
  const [newAdvNote, setNewAdvNote] = useState('');

  // Edit Advance Modal
  const [isEditAdvModalOpen, setIsEditAdvModalOpen] = useState(false);
  const [editingAdvId, setEditingAdvId] = useState<string | null>(null);
  const [editAdvDate, setEditAdvDate] = useState('');
  const [editAdvAmount, setEditAdvAmount] = useState('');
  const [editAdvMode, setEditAdvMode] = useState('');
  const [editAdvNote, setEditAdvNote] = useState('');

  // Delete Advance Modals
  const [deleteAdvTarget, setDeleteAdvTarget] = useState<InteriorAdvancePayment | null>(null);
  const [isDeletingAdv, setIsDeletingAdv] = useState(false);
  const [isBulkDeleteAdvOpen, setIsBulkDeleteAdvOpen] = useState(false);
  const [isBulkDeletingAdv, setIsBulkDeletingAdv] = useState(false);

  // ===================== SITE EXPENSES (ESTIMATE) STATE =====================
  const [expSearch, setExpSearch] = useState('');
  const [expFromDate, setExpFromDate] = useState('');
  const [expToDate, setExpToDate] = useState('');
  const [selectedExpIds, setSelectedExpIds] = useState<Set<string>>(new Set());

  // Add Expense Modal State
  const [isAddExpModalOpen, setIsAddExpModalOpen] = useState(false);
  const [newExpDate, setNewExpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newExpCategory, setNewExpCategory] = useState<string>(INTERIOR_CATEGORIES[0]);
  const [newExpParticulars, setNewExpParticulars] = useState('');
  const [newExpQuantity, setNewExpQuantity] = useState('1');
  const [newExpUnit, setNewExpUnit] = useState<string>('Sq.ft');
  const [newExpRate, setNewExpRate] = useState('');

  // Edit Expense Modal State
  const [isEditExpModalOpen, setIsEditExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpDate, setEditExpDate] = useState('');
  const [editExpCategory, setEditExpCategory] = useState<string>(INTERIOR_CATEGORIES[0]);
  const [editExpParticulars, setEditExpParticulars] = useState('');
  const [editExpQuantity, setEditExpQuantity] = useState('');
  const [editExpUnit, setEditExpUnit] = useState('Sq.ft');
  const [editExpRate, setEditExpRate] = useState('');

  // Delete Expense Modals State
  const [deleteExpTarget, setDeleteExpTarget] = useState<InteriorExpenseItem | null>(null);
  const [isDeletingExp, setIsDeletingExp] = useState(false);
  const [isBulkDeleteExpOpen, setIsBulkDeleteExpOpen] = useState(false);
  const [isBulkDeletingExp, setIsBulkDeletingExp] = useState(false);

  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ===================== ADVANCE FILTERING & COMPUTATIONS =====================
  const filteredAdvance = useMemo(() => {
    let list = advancePayments;
    if (advFromDate) list = list.filter((a) => a.date >= advFromDate);
    if (advToDate) list = list.filter((a) => a.date <= advToDate);
    if (advSearch.trim()) {
      const q = advSearch.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.mode.toLowerCase().includes(q) ||
          (a.note && a.note.toLowerCase().includes(q)) ||
          a.date.includes(q) ||
          String(a.amount).includes(q)
      );
    }
    return list;
  }, [advancePayments, advSearch, advFromDate, advToDate]);

  const totalAdvanceAmount = filteredAdvance.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const advTotalPages = Math.ceil(filteredAdvance.length / advItemsPerPage) || 1;
  const advStartIndex = (advCurrentPage - 1) * advItemsPerPage;
  const advEndIndex = Math.min(advStartIndex + advItemsPerPage, filteredAdvance.length);
  const paginatedAdvance = filteredAdvance.slice(advStartIndex, advEndIndex);

  const isAllAdvSelected =
    filteredAdvance.length > 0 &&
    filteredAdvance.every((item) => selectedAdvIds.has(item.id));

  const isSomeAdvSelected = selectedAdvIds.size > 0 && !isAllAdvSelected;

  const handleToggleSelectAllAdv = () => {
    if (isAllAdvSelected) {
      setSelectedAdvIds(new Set());
    } else {
      setSelectedAdvIds(new Set(filteredAdvance.map((a) => a.id)));
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

  // ===================== EXPENSES FILTERING & SEGREGATION =====================
  const filteredExpenses = useMemo(() => {
    let list = expenses;
    if (expFromDate) list = list.filter((e) => e.date >= expFromDate);
    if (expToDate) list = list.filter((e) => e.date <= expToDate);
    if (expSearch.trim()) {
      const q = expSearch.toLowerCase().trim();
      list = list.filter(
        (e) =>
          (e.category && e.category.toLowerCase().includes(q)) ||
          e.expenseName.toLowerCase().includes(q) ||
          (e.unit && e.unit.toLowerCase().includes(q)) ||
          e.date.includes(q) ||
          String(e.quantity).includes(q) ||
          String(e.rate).includes(q) ||
          String(e.totalAmount).includes(q)
      );
    }
    return list;
  }, [expenses, expSearch, expFromDate, expToDate]);

  const totalExpensesAmount = filteredExpenses.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);

  // Group filtered expenses by Category matching the PDF structure
  const groupedExpenses = useMemo(() => {
    const groups: { category: string; items: InteriorExpenseItem[]; subtotal: number }[] = [];
    const categoryMap = new Map<string, InteriorExpenseItem[]>();

    filteredExpenses.forEach((exp) => {
      const cat = exp.category || 'OTHER WORK';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push(exp);
    });

    // 1. Defined categories in ordered sequence
    INTERIOR_CATEGORIES.forEach((cat) => {
      if (categoryMap.has(cat)) {
        const items = categoryMap.get(cat)!;
        const subtotal = items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
        groups.push({ category: cat, items, subtotal });
        categoryMap.delete(cat);
      }
    });

    // 2. Any additional custom categories created by the user
    categoryMap.forEach((items, cat) => {
      const subtotal = items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
      groups.push({ category: cat, items, subtotal });
    });

    return groups;
  }, [filteredExpenses]);

  const isAllExpSelected =
    filteredExpenses.length > 0 &&
    filteredExpenses.every((item) => selectedExpIds.has(item.id));

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

  // Overall Financial Balance
  const netBalance = totalAdvanceAmount - totalExpensesAmount;

  // ===================== ADVANCE HANDLERS =====================
  const isAddAdvValid = newAdvDate.trim().length > 0 && parseFloat(newAdvAmount) > 0;
  const handleAddAdvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddAdvValid) return;

    await onAddAdvance(client.id, {
      date: newAdvDate,
      amount: parseFloat(newAdvAmount),
      mode: newAdvMode,
      note: newAdvNote.trim() || undefined
    });

    setNewAdvAmount('');
    setNewAdvNote('');
    setIsAddAdvModalOpen(false);
  };

  const handleOpenEditAdv = (item: InteriorAdvancePayment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAdvId(item.id);
    setEditAdvDate(item.date);
    setEditAdvAmount(String(item.amount));
    setEditAdvMode(item.mode);
    setEditAdvNote(item.note || '');
    setIsEditAdvModalOpen(true);
  };

  const handleSaveEditAdv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdvId || parseFloat(editAdvAmount) <= 0) return;

    await onUpdateAdvance(client.id, {
      id: editingAdvId,
      clientId: client.id,
      sNo: 1,
      date: editAdvDate,
      amount: parseFloat(editAdvAmount),
      mode: editAdvMode,
      note: editAdvNote.trim() || undefined
    });

    setIsEditAdvModalOpen(false);
    setEditingAdvId(null);
  };

  const handleConfirmDeleteAdv = async () => {
    if (!deleteAdvTarget) return;
    setIsDeletingAdv(true);
    try {
      await onDeleteAdvance(client.id, deleteAdvTarget.id);
      if (selectedAdvIds.has(deleteAdvTarget.id)) {
        setSelectedAdvIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteAdvTarget.id);
          return next;
        });
      }
    } finally {
      setIsDeletingAdv(false);
      setDeleteAdvTarget(null);
    }
  };

  const handleConfirmBulkDeleteAdv = async () => {
    if (selectedAdvIds.size === 0) return;
    setIsBulkDeletingAdv(true);
    try {
      if (onDeleteMultipleAdvancePayments) {
        await onDeleteMultipleAdvancePayments(client.id, Array.from(selectedAdvIds));
      } else {
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

  // ===================== EXPENSE HANDLERS =====================
  const calculatedNewExpTotal = (parseFloat(newExpQuantity) || 0) * (parseFloat(newExpRate) || 0);
  const isAddExpValid =
    newExpDate.trim().length > 0 &&
    newExpParticulars.trim().length > 0 &&
    parseFloat(newExpQuantity) > 0 &&
    parseFloat(newExpRate) >= 0;

  // Preset Selection auto-fill
  const handleSelectPreset = (presetItem: (typeof PREDEFINED_INTERIOR_ITEMS)[0]) => {
    setNewExpCategory(presetItem.category);
    setNewExpParticulars(presetItem.particulars);
    setNewExpUnit(presetItem.unit);
    setNewExpRate(presetItem.defaultRate > 0 ? String(presetItem.defaultRate) : '');
  };

  const handleAddExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddExpValid) return;

    const qty = parseFloat(newExpQuantity);
    const rate = parseFloat(newExpRate);
    await onAddExpense(client.id, {
      date: newExpDate,
      category: newExpCategory.trim() || 'OTHER WORK',
      expenseName: newExpParticulars.trim(),
      quantity: qty,
      unit: newExpUnit.trim() || 'Sq.ft',
      rate: rate,
      totalAmount: qty * rate
    });

    setNewExpParticulars('');
    setNewExpQuantity('1');
    setNewExpRate('');
    setIsAddExpModalOpen(false);
  };

  const handleOpenEditExp = (item: InteriorExpenseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExpId(item.id);
    setEditExpDate(item.date);
    setEditExpCategory(item.category || INTERIOR_CATEGORIES[0]);
    setEditExpParticulars(item.expenseName);
    setEditExpQuantity(String(item.quantity));
    setEditExpUnit(item.unit || 'Sq.ft');
    setEditExpRate(String(item.rate));
    setIsEditExpModalOpen(true);
  };

  const calculatedEditExpTotal = (parseFloat(editExpQuantity) || 0) * (parseFloat(editExpRate) || 0);
  const handleSaveEditExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpId || parseFloat(editExpQuantity) <= 0 || parseFloat(editExpRate) < 0) return;

    const qty = parseFloat(editExpQuantity);
    const rate = parseFloat(editExpRate);
    await onUpdateExpense(client.id, {
      id: editingExpId,
      clientId: client.id,
      sNo: 1,
      date: editExpDate,
      category: editExpCategory.trim() || 'OTHER WORK',
      expenseName: editExpParticulars.trim(),
      quantity: qty,
      unit: editExpUnit.trim() || 'Sq.ft',
      rate: rate,
      totalAmount: qty * rate
    });

    setIsEditExpModalOpen(false);
    setEditingExpId(null);
  };

  const handleConfirmDeleteExp = async () => {
    if (!deleteExpTarget) return;
    setIsDeletingExp(true);
    try {
      await onDeleteExpense(client.id, deleteExpTarget.id);
      if (selectedExpIds.has(deleteExpTarget.id)) {
        setSelectedExpIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteExpTarget.id);
          return next;
        });
      }
    } finally {
      setIsDeletingExp(false);
      setDeleteExpTarget(null);
    }
  };

  const handleConfirmBulkDeleteExp = async () => {
    if (selectedExpIds.size === 0) return;
    setIsBulkDeletingExp(true);
    try {
      if (onDeleteMultipleExpenses) {
        await onDeleteMultipleExpenses(client.id, Array.from(selectedExpIds));
      } else {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="client-details-page">
      {/* PRINT-ONLY STATEMENT HEADER */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">ESTIMATE FOR INTERIOR WORKS</h1>
            <p className="print-company-sub">
              Materials of 16mm MDF with Mica lamination and 6mm Back-panel ply with PVC edgeband along with Handles and Hardwares etc.
            </p>
          </div>
          <div className="print-badge-statement">
            <span>KAAB INTERIOR · AFTRAH</span>
          </div>
        </div>

        <div className="print-meta-grid">
          <div className="print-meta-box">
            <span className="print-meta-title">TO / CLIENT</span>
            <div className="print-meta-val"><strong>{client.name}</strong></div>
            <div className="print-meta-sub">Phone: {client.phone} · Address: {client.address}</div>
          </div>

          <div className="print-meta-box">
            <span className="print-meta-title">ESTIMATE & PAYMENT TERMS</span>
            <div className="print-meta-sub">Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div className="print-meta-val" style={{ marginTop: '4px', color: netBalance >= 0 ? '#15803d' : '#b91c1c' }}>
              Balance Due: {formatINR(Math.abs(netBalance))}
            </div>
          </div>
        </div>

        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Estimate Total (Works):</span> <strong style={{ color: '#b45309' }}>{formatINR(totalExpensesAmount)}</strong>
          </div>
          <div className="print-total-item">
            <span>Total Advance Received:</span> <strong style={{ color: '#15803d' }}>{formatINR(totalAdvanceAmount)}</strong>
          </div>
          <div className="print-total-item">
            <span>Net Balance:</span> <strong style={{ color: netBalance >= 0 ? '#15803d' : '#b91c1c' }}>{formatINR(netBalance)}</strong>
          </div>
        </div>
      </div>

      {/* Screen Header Bar */}
      <div className="client-details-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={onBack} className="aftrah-app-back-btn">
            <ArrowLeft size={16} />
            <span>Back to KAAB INTERIOR</span>
          </button>

          <button
            onClick={handlePrint}
            className="aftrah-app-back-btn"
            title="Print or Export Interior Estimate Statement"
          >
            <Printer size={15} />
            <span>Print Estimate Statement</span>
          </button>
        </div>

        <div className="client-details-title-row">
          <div>
            <h1 className="client-details-main-title">
              {client.name} <span>· Interior Estimate & Ledger</span>
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
              <div className="metric-icon-wrap green">
                <Wallet size={24} />
              </div>
              <div>
                <span className="metric-label">TOTAL ADVANCE RECEIVED</span>
                <span className="metric-value green">{formatINR(totalAdvanceAmount)}</span>
              </div>
            </div>

            <div className="summary-metric-card">
              <div className="metric-icon-wrap gold">
                <TrendingDown size={24} />
              </div>
              <div>
                <span className="metric-label">TOTAL ESTIMATE AMOUNT</span>
                <span className="metric-value gold">{formatINR(totalExpensesAmount)}</span>
              </div>
            </div>

            <div className="summary-metric-card">
              <div className={`metric-icon-wrap ${netBalance >= 0 ? 'green' : 'red'}`}>
                <Scale size={24} />
              </div>
              <div>
                <span className="metric-label">
                  {netBalance >= 0 ? 'SURPLUS / UNUSED ADVANCE' : 'OUTSTANDING BALANCE DUE'}
                </span>
                <span className={`metric-value ${netBalance >= 0 ? 'green' : 'red'}`}>
                  {formatINR(netBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DUAL LEDGER SECTIONS: ADVANCE PAYMENTS & INTERIOR EXPENSES */}
      <div className="client-details-side-by-side-grid">
        {/* ================= COLUMN 1: ADVANCE PAYMENTS (LEFT AS IS) ================= */}
        <div className="details-column-panel">
          <DateFilterBar
            fromDate={advFromDate}
            toDate={advToDate}
            onFromDateChange={setAdvFromDate}
            onToDateChange={setAdvToDate}
            onClearDates={() => {
              setAdvFromDate('');
              setAdvToDate('');
            }}
            selectedCount={selectedAdvIds.size}
            onBulkDelete={() => setIsBulkDeleteAdvOpen(true)}
          />

          <section className="aftrah-app-table-section">
            <div className="aftrah-app-section-header no-print">
              <div>
                <h2 className="aftrah-app-section-title">ADVANCE PAYMENT RECEIPTS</h2>
                <span className="aftrah-app-section-subtitle">
                  {filteredAdvance.length} {filteredAdvance.length === 1 ? 'receipt' : 'receipts'} · Total: <strong style={{ color: '#4ade80' }}>{formatINR(totalAdvanceAmount)}</strong>
                </span>
              </div>

              <button
                onClick={() => {
                  setNewAdvDate(new Date().toISOString().slice(0, 10));
                  setNewAdvAmount('');
                  setNewAdvMode(PAYMENT_MODES[0]);
                  setNewAdvNote('');
                  setIsAddAdvModalOpen(true);
                }}
                className="btn-theme-primary"
                style={{ height: '36px', padding: '0 14px', fontSize: '12.5px' }}
              >
                <Plus size={15} />
                <span>Add Advance</span>
              </button>
            </div>

            <div className="aftrah-app-table-container">
              <table className="aftrah-app-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>S.NO</th>
                    <th>DATE</th>
                    <th>PAYMENT MODE</th>
                    <th>NOTE / MILESTONE</th>
                    <th style={{ textAlign: 'right' }}>AMOUNT (₹)</th>
                    <th className="no-print" style={{ width: '70px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdvance.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                        {advFromDate || advToDate || advSearch
                          ? 'No matching advance receipts found for filter.'
                          : 'No advance receipts logged yet. Click "Add Advance" above.'}
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
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: 'rgba(74, 222, 128, 0.12)',
                                color: '#4ade80',
                                fontSize: '11.5px',
                                fontWeight: 600
                              }}
                            >
                              <CreditCard size={11} />
                              {item.mode}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            {item.note || '—'}
                          </td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#4ade80'
                            }}
                          >
                            {formatINR(item.amount)}
                          </td>
                          <td className="no-print" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={(e) => handleOpenEditAdv(item, e)}
                                className="aftrah-app-action-btn aftrah-app-edit-btn"
                                title="Edit Advance"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteAdvTarget(item)}
                                className="aftrah-app-action-btn aftrah-app-delete-btn"
                                title="Delete Advance"
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
          </section>
        </div>

        {/* ================= COLUMN 2: ESTIMATE FOR INTERIOR WORKS (SEGREGATED AS IN PDF) ================= */}
        <div className="details-column-panel">
          <DateFilterBar
            fromDate={expFromDate}
            toDate={expToDate}
            onFromDateChange={setExpFromDate}
            onToDateChange={setExpToDate}
            onClearDates={() => {
              setExpFromDate('');
              setExpToDate('');
            }}
            selectedCount={selectedExpIds.size}
            onBulkDelete={() => setIsBulkDeleteExpOpen(true)}
          />

          <section className="aftrah-app-table-section">
            <div className="aftrah-app-section-header no-print">
              <div>
                <h2 className="aftrah-app-section-title">ESTIMATE FOR INTERIOR WORKS</h2>
                <span className="aftrah-app-section-subtitle">
                  {filteredExpenses.length} items across {groupedExpenses.length} sections · Total: <strong style={{ color: 'var(--primary)' }}>{formatINR(totalExpensesAmount)}</strong>
                </span>
              </div>

              <button
                onClick={() => {
                  setNewExpDate(new Date().toISOString().slice(0, 10));
                  setNewExpCategory(INTERIOR_CATEGORIES[0]);
                  setNewExpParticulars('');
                  setNewExpQuantity('1');
                  setNewExpUnit('Sq.ft');
                  setNewExpRate('');
                  setIsAddExpModalOpen(true);
                }}
                className="btn-theme-primary"
                style={{ height: '36px', padding: '0 14px', fontSize: '12.5px' }}
              >
                <Plus size={15} />
                <span>Add Item</span>
              </button>
            </div>

            {/* SEGREGATED TABLE MATCHING PDF COLUMNS: SI.No | Particulars | Qty | Per | Rate | Amount */}
            <div className="aftrah-app-table-container">
              <table className="aftrah-app-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>SI.No</th>
                    <th>Particulars</th>
                    <th style={{ width: '60px', textAlign: 'right' }}>Qty</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Per</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>Rate</th>
                    <th style={{ width: '115px', textAlign: 'right' }}>Amount</th>
                    <th className="no-print" style={{ width: '65px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                        {expFromDate || expToDate || expSearch
                          ? 'No matching items found for filter.'
                          : 'No interior estimate items recorded yet. Click "Add Item" above.'}
                      </td>
                    </tr>
                  ) : (
                    groupedExpenses.map((group, groupIdx) => (
                      <React.Fragment key={group.category}>
                        {/* CATEGORY SECTION HEADER ROW */}
                        <tr className="category-header-row">
                          <td
                            colSpan={7}
                            style={{
                              background: 'var(--surface-container-high, #1e2126)',
                              padding: '8px 14px',
                              borderTop: groupIdx > 0 ? '1px solid var(--border-stroke, #2d3139)' : undefined,
                              borderBottom: '1px solid var(--border-stroke, #2d3139)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    background: 'rgba(226, 195, 153, 0.15)',
                                    color: 'var(--primary)',
                                    fontSize: '11px',
                                    fontWeight: 800
                                  }}
                                >
                                  {groupIdx + 1}
                                </span>
                                <span
                                  style={{
                                    fontWeight: 800,
                                    fontSize: '12.5px',
                                    letterSpacing: '0.04em',
                                    color: 'var(--text-primary)',
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  {group.category}
                                </span>
                              </div>
                              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                Subtotal: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{formatINR(group.subtotal)}</strong>
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* ITEMS UNDER THIS CATEGORY */}
                        {group.items.map((exp, itemIdx) => {
                          return (
                            <tr
                              key={exp.id}
                              style={{ cursor: 'default' }}
                            >
                              <td
                                style={{
                                  fontFamily: 'monospace',
                                  fontWeight: 600,
                                  color: 'var(--text-secondary)',
                                  textAlign: 'center',
                                  fontSize: '12px'
                                }}
                              >
                                {toRomanNumeral(itemIdx + 1)}
                              </td>
                              <td>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                                  {exp.expenseName}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                                {exp.quantity}
                              </td>
                              <td
                                style={{
                                  textAlign: 'center',
                                  color: 'var(--text-secondary)',
                                  fontSize: '12px',
                                  fontWeight: 500
                                }}
                              >
                                {exp.unit || 'Sq.ft'}
                              </td>
                              <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                {Number(exp.rate || 0).toLocaleString('en-IN')}
                              </td>
                              <td
                                style={{
                                  textAlign: 'right',
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  color: 'var(--primary)'
                                }}
                              >
                                {formatINR(exp.totalAmount)}
                              </td>
                              <td className="no-print" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <button
                                    onClick={(e) => handleOpenEditExp(exp, e)}
                                    className="aftrah-app-action-btn aftrah-app-edit-btn"
                                    title="Edit Item"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteExpTarget(exp)}
                                    className="aftrah-app-action-btn aftrah-app-delete-btn"
                                    title="Delete Item"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {/* SECTION SUBTOTAL ROW */}
                        <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-stroke, #2d3139)' }}>
                          <td colSpan={6} style={{ textAlign: 'right', fontWeight: 700, fontSize: '11.5px', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                            TOTAL ({group.category}):
                          </td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              fontSize: '13px',
                              color: 'var(--primary)'
                            }}
                          >
                            {formatINR(group.subtotal)}
                          </td>
                          <td className="no-print"></td>
                        </tr>
                      </React.Fragment>
                    ))
                  )}

                  {/* FINAL TOTAL ROW AT THE BOTTOM OF THE TABLE */}
                  {groupedExpenses.length > 0 && (
                    <tr
                      style={{
                        background: 'rgba(226, 195, 153, 0.12)',
                        borderTop: '2px solid var(--primary)'
                      }}
                    >
                      <td
                        colSpan={6}
                        style={{
                          textAlign: 'right',
                          fontWeight: 900,
                          fontSize: '13px',
                          letterSpacing: '0.06em',
                          color: 'var(--text-primary)',
                          padding: '12px 16px'
                        }}
                      >
                        FINAL TOTAL:
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          fontSize: '15px',
                          color: 'var(--primary)',
                          padding: '12px 16px'
                        }}
                      >
                        {formatINR(totalExpensesAmount)}
                      </td>
                      <td className="no-print"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* ================= MODALS: ADD & EDIT ADVANCE ================= */}
      {isAddAdvModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsAddAdvModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Record Advance Receipt</h3>
              </div>
              <button onClick={() => setIsAddAdvModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAdvSubmit}>
              <div className="aftrah-app-modal-body">
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={newAdvDate}
                    onChange={(e) => setNewAdvDate(e.target.value)}
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
                    placeholder="e.g. 163845"
                    value={newAdvAmount}
                    onChange={(e) => setNewAdvAmount(e.target.value)}
                    className="aftrah-app-input"
                    style={{ fontSize: '15px', fontWeight: 700, color: '#4ade80' }}
                  />
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Payment Mode *</label>
                  <select
                    value={newAdvMode}
                    onChange={(e) => setNewAdvMode(e.target.value)}
                    className="aftrah-app-select"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Note / Milestone Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 50% Advance on confirmation & PO"
                    value={newAdvNote}
                    onChange={(e) => setNewAdvNote(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
              </div>

              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsAddAdvModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!isAddAdvValid} className="btn-theme-primary">
                  <span>Save Advance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditAdvModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditAdvModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={18} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Edit Advance Receipt</h3>
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
                    className="aftrah-app-select"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Note / Milestone</label>
                  <input
                    type="text"
                    value={editAdvNote}
                    onChange={(e) => setEditAdvNote(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
              </div>

              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsEditAdvModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!editAdvAmount || parseFloat(editAdvAmount) <= 0} className="btn-theme-primary">
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODALS: ADD & EDIT EXPENSE / ESTIMATE ITEM ================= */}
      {isAddExpModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsAddExpModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Add Interior Estimate Item</h3>
              </div>
              <button onClick={() => setIsAddExpModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExpSubmit}>
              <div className="aftrah-app-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Date *</label>
                    <input
                      type="date"
                      required
                      value={newExpDate}
                      onChange={(e) => setNewExpDate(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Category / Room Section *</label>
                    <SearchableExpenseSelect
                      value={newExpCategory}
                      onChange={(val) => setNewExpCategory(val)}
                      options={INTERIOR_CATEGORIES}
                      placeholder="Select or type category..."
                      searchPlaceholder="Filter category..."
                    />
                  </div>
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Particulars (Item Description) *</label>
                  <SearchableExpenseSelect
                    value={newExpParticulars}
                    onChange={(val) => {
                      setNewExpParticulars(val);
                      const matched = PREDEFINED_INTERIOR_ITEMS.find((p) => p.particulars.toLowerCase() === val.toLowerCase());
                      if (matched) {
                        setNewExpCategory(matched.category);
                        setNewExpUnit(matched.unit);
                        if (matched.defaultRate > 0) {
                          setNewExpRate(String(matched.defaultRate));
                        }
                      }
                    }}
                    options={PREDEFINED_INTERIOR_EXPENSES}
                    placeholder="Search estimate items or type custom description..."
                    searchPlaceholder="Type to filter estimate items..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Qty *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={newExpQuantity}
                      onChange={(e) => setNewExpQuantity(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Per (Unit) *</label>
                    <select
                      value={newExpUnit}
                      onChange={(e) => setNewExpUnit(e.target.value)}
                      className="aftrah-app-select"
                    >
                      {INTERIOR_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="e.g. 1350"
                      value={newExpRate}
                      onChange={(e) => setNewExpRate(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Amount (Total)</label>
                  <div className="total-amount-display">
                    {formatINR(calculatedNewExpTotal)}
                  </div>
                </div>
              </div>

              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsAddExpModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!isAddExpValid} className="btn-theme-primary">
                  <span>Save Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditExpModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditExpModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={18} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Edit Interior Estimate Item</h3>
              </div>
              <button onClick={() => setIsEditExpModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditExp}>
              <div className="aftrah-app-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                    <label className="aftrah-app-label">Category / Room Section *</label>
                    <SearchableExpenseSelect
                      value={editExpCategory}
                      onChange={(val) => setEditExpCategory(val)}
                      options={INTERIOR_CATEGORIES}
                      placeholder="Select or type category..."
                      searchPlaceholder="Filter category..."
                    />
                  </div>
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Particulars (Item Description) *</label>
                  <SearchableExpenseSelect
                    value={editExpParticulars}
                    onChange={(val) => {
                      setEditExpParticulars(val);
                      const matched = PREDEFINED_INTERIOR_ITEMS.find((p) => p.particulars.toLowerCase() === val.toLowerCase());
                      if (matched) {
                        setEditExpCategory(matched.category);
                        setEditExpUnit(matched.unit);
                        if (matched.defaultRate > 0) {
                          setEditExpRate(String(matched.defaultRate));
                        }
                      }
                    }}
                    options={PREDEFINED_INTERIOR_EXPENSES}
                    placeholder="Search estimate items or type custom description..."
                    searchPlaceholder="Type to filter estimate items..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Qty *</label>
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
                    <label className="aftrah-app-label">Per (Unit) *</label>
                    <select
                      value={editExpUnit}
                      onChange={(e) => setEditExpUnit(e.target.value)}
                      className="aftrah-app-select"
                    >
                      {INTERIOR_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={editExpRate}
                      onChange={(e) => setEditExpRate(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Amount (Total)</label>
                  <div className="total-amount-display">
                    {formatINR(calculatedEditExpTotal)}
                  </div>
                </div>
              </div>

              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsEditExpModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!editExpParticulars || parseFloat(editExpRate) < 0} className="btn-theme-primary">
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
        title="Delete Advance Receipt"
        message="Are you sure you want to delete this advance receipt? The client's project balance will be updated immediately."
        itemName={deleteAdvTarget ? `${deleteAdvTarget.date} — ${formatINR(deleteAdvTarget.amount)} (${deleteAdvTarget.mode})` : undefined}
        confirmText="Delete Receipt"
        isDeleting={isDeletingAdv}
        onConfirm={handleConfirmDeleteAdv}
        onClose={() => setDeleteAdvTarget(null)}
      />

      <ConfirmDeleteModal
        isOpen={isBulkDeleteAdvOpen}
        title="Delete Selected Advance Receipts"
        message={`Are you sure you want to delete ${selectedAdvIds.size} selected advance receipts?`}
        confirmText={`Delete ${selectedAdvIds.size} Receipts`}
        isDeleting={isBulkDeletingAdv}
        onConfirm={handleConfirmBulkDeleteAdv}
        onClose={() => setIsBulkDeleteAdvOpen(false)}
      />

      {/* CONFIRM DELETE EXPENSE MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteExpTarget)}
        title="Delete Estimate Item"
        message="Are you sure you want to delete this estimate item? The project total and balance will be recalculated."
        itemName={deleteExpTarget ? `${deleteExpTarget.category ? `[${deleteExpTarget.category}] ` : ''}${deleteExpTarget.expenseName} (${formatINR(deleteExpTarget.totalAmount)})` : undefined}
        confirmText="Delete Item"
        isDeleting={isDeletingExp}
        onConfirm={handleConfirmDeleteExp}
        onClose={() => setDeleteExpTarget(null)}
      />

      <ConfirmDeleteModal
        isOpen={isBulkDeleteExpOpen}
        title="Delete Selected Estimate Items"
        message={`Are you sure you want to delete ${selectedExpIds.size} selected estimate items?`}
        confirmText={`Delete ${selectedExpIds.size} Items`}
        isDeleting={isBulkDeletingExp}
        onConfirm={handleConfirmBulkDeleteExp}
        onClose={() => setIsBulkDeleteExpOpen(false)}
      />
    </div>
  );
};
