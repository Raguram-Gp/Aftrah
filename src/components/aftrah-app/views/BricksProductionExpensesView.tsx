import React, { useState, useMemo } from 'react';
import type { BrickProductionExpense } from '../types';
import { BRICK_PRODUCTION_EXPENSE_OPTIONS } from '../types';
import { SearchableExpenseSelect } from '../components/SearchableExpenseSelect';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  Flame,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
  RotateCcw,
  Check
} from 'lucide-react';

interface BricksProductionExpensesViewProps {
  expenses: BrickProductionExpense[];
  stats?: {
    totalExpenses: number;
    fuelMaterialExpenses: number;
    laborWagesExpenses: number;
    thisMonthExpenses: number;
  };
  onAddExpense: (data: Omit<BrickProductionExpense, 'id' | 'sNo' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  onUpdateExpense: (updated: BrickProductionExpense) => Promise<any>;
  onDeleteExpense: (id: string) => Promise<any>;
  onDeleteMultipleExpenses?: (ids: string[]) => Promise<any>;
}

export const BricksProductionExpensesView: React.FC<BricksProductionExpensesViewProps> = ({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onDeleteMultipleExpenses
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk Delete Modal State
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Right Side "Add details" Form State (Matching handwritten sketch)
  const [addDate, setAddDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [addExpenseName, setAddExpenseName] = useState(BRICK_PRODUCTION_EXPENSE_OPTIONS[0]);
  const [addQuality, setAddQuality] = useState('');
  const [addRate, setAddRate] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editExpenseName, setEditExpenseName] = useState('');
  const [editQuality, setEditQuality] = useState('');
  const [editRate, setEditRate] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<BrickProductionExpense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format currency
  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Live computed total for Add Form
  const calculatedAddTotal = (parseFloat(addQuality) || 0) * (parseFloat(addRate) || 0);

  // Live computed total for Edit Form
  const calculatedEditTotal = (parseFloat(editQuality) || 0) * (parseFloat(editRate) || 0);

  // Validation
  const isAddValid =
    addDate.trim().length > 0 &&
    addExpenseName.trim().length > 0 &&
    (parseFloat(addQuality) || 0) > 0 &&
    (parseFloat(addRate) || 0) >= 0;

  const isEditValid =
    editDate.trim().length > 0 &&
    editExpenseName.trim().length > 0 &&
    (parseFloat(editQuality) || 0) > 0 &&
    (parseFloat(editRate) || 0) >= 0;

  // Handle Add Details Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddValid) return;

    const finalExpenseName = addExpenseName.trim();
    const qty = parseFloat(addQuality) || 0;
    const rate = parseFloat(addRate) || 0;
    const total = qty * rate;

    await onAddExpense({
      date: addDate,
      category: finalExpenseName,
      expenseName: finalExpenseName,
      quantity: qty,
      unit: 'Units',
      rate: rate,
      totalAmount: total,
      paymentMode: 'Cash'
    });

    // Reset Form (keep date & first expense, reset numeric fields)
    setAddQuality('');
    setAddRate('');
    setCurrentPage(1);
  };

  // Handle Clear Add Form
  const handleClearAddForm = () => {
    setAddQuality('');
    setAddRate('');
    setAddExpenseName(BRICK_PRODUCTION_EXPENSE_OPTIONS[0]);
  };

  // Open Edit Modal
  const handleOpenEdit = (expense: BrickProductionExpense, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExpenseId(expense.id);
    setEditDate(expense.date);
    setEditExpenseName(expense.expenseName || expense.category);
    setEditQuality(expense.quantity ? expense.quantity.toString() : '');
    setEditRate(expense.rate ? expense.rate.toString() : '');
    setIsEditModalOpen(true);
  };

  // Save Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditValid || !editingExpenseId) return;

    const target = expenses.find((x) => x.id === editingExpenseId);
    if (!target) return;

    const qty = parseFloat(editQuality) || 0;
    const rate = parseFloat(editRate) || 0;
    const total = qty * rate;

    await onUpdateExpense({
      ...target,
      date: editDate,
      category: editExpenseName.trim(),
      expenseName: editExpenseName.trim(),
      quantity: qty,
      rate: rate,
      totalAmount: total
    });

    setIsEditModalOpen(false);
    setEditingExpenseId(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteExpense(deleteTarget.id);
      setSelectedExpenseIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Handle Bulk Delete Confirmation
  const handleConfirmBulkDelete = async () => {
    if (!onDeleteMultipleExpenses || selectedExpenseIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      await onDeleteMultipleExpenses(Array.from(selectedExpenseIds));
      setSelectedExpenseIds(new Set());
      setIsBulkDeleteOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Filter expenses by search query
  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return expenses;
    return expenses.filter(
      (item) =>
        item.expenseName.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.date && item.date.includes(q)) ||
        String(item.quantity).includes(q) ||
        String(item.rate).includes(q) ||
        String(item.totalAmount).includes(q) ||
        String(item.sNo).includes(q)
    );
  }, [expenses, searchQuery]);

  // Overall Total
  const totalProductionExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  }, [expenses]);

  const filteredTotalProductionExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  }, [filteredExpenses]);

  // Pagination computations
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredExpenses.length);
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Multi-select Checkbox Handlers
  const isAllSelected =
    paginatedExpenses.length > 0 &&
    paginatedExpenses.every((e) => selectedExpenseIds.has(e.id));
  const isSomeSelected =
    paginatedExpenses.some((e) => selectedExpenseIds.has(e.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedExpenseIds((prev) => {
        const next = new Set(prev);
        paginatedExpenses.forEach((e) => next.delete(e.id));
        return next;
      });
    } else {
      setSelectedExpenseIds((prev) => {
        const next = new Set(prev);
        paginatedExpenses.forEach((e) => next.add(e.id));
        return next;
      });
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExpenseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="aftrah-app-wireframe-layout">
      {/* PRINT-ONLY HEADER */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">KABIBULLAH BRICKS</h1>
            <p className="print-company-sub">Brick Manufacturing, Kiln Operations & Production Expenses</p>
          </div>
          <div className="print-badge-statement">
            <span>PRODUCTION EXPENSES</span>
          </div>
        </div>

        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Total Expense Records:</span> <strong>{filteredExpenses.length} Entries</strong>
          </div>
          <div className="print-total-item">
            <span>Total Production Spend:</span> <strong style={{ color: '#b91c1c' }}>{formatINR(totalProductionExpenses)}</strong>
          </div>
          <div className="print-total-item">
            <span>Statement Date:</span> <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: PRODUCTION EXPENSES TABLE (Matching sketch: S NO | DATE | EXPENSES | Quality | Rate | Total) */}
      <section className="aftrah-app-table-section">
        <div className="aftrah-app-section-header no-print">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <Flame size={18} color="#f87171" />
              </div>
              <h1 className="aftrah-app-section-title" style={{ letterSpacing: '0.04em' }}>
                PRODUCTION EXPENSES
              </h1>
            </div>
            <span className="aftrah-app-section-subtitle">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense entry' : 'expense entries'} · Total Production Spend:{' '}
              <strong style={{ color: '#f87171' }}>{formatINR(totalProductionExpenses)}</strong>
            </span>
          </div>

          {/* Search, Bulk Delete, & Print Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="aftrah-app-search-wrapper">
              <Search size={14} className="aftrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search expense, date, rate..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="aftrah-app-search-input"
              />
            </div>

            <button
              onClick={handlePrint}
              className="aftrah-app-back-btn"
              title="Print Production Expenses"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Table matching the sketch: S NO | DATE | EXPENSES | Quality | Rate | Total */}
        <div className="aftrah-app-table-container">
          <table className="aftrah-app-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>S NO</th>
                <th style={{ width: '110px' }}>DATE</th>
                <th>EXPENSES</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Quality</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Rate</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Total</th>
                <th className="no-print" style={{ width: '90px', textAlign: 'center' }}>EDIT / DELETE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="aftrah-app-empty-cell">
                    <div className="empty-state-wrap">
                      <Flame size={28} className="empty-icon" color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                      <span className="empty-text">No production expense records found</span>
                      <span className="empty-subtext">
                        {searchQuery
                          ? 'No entries match your search query.'
                          : 'Use the "Add details" form on the right to record new production expenses.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((expense, index) => {
                  const displaySNo = startIndex + index + 1;

                  return (
                    <tr
                      key={expense.id}
                      style={{ cursor: 'default' }}
                    >
                      {/* S NO */}

                      {/* S NO */}
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {displaySNo}
                      </td>

                      {/* DATE */}
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {expense.date}
                      </td>

                      {/* EXPENSES */}
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              background:
                                expense.expenseName === 'Wood' || expense.expenseName === 'Soil'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : expense.expenseName === 'Disel' || expense.expenseName === 'Oil'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : expense.expenseName?.includes('rent')
                                  ? 'rgba(59, 130, 246, 0.15)'
                                  : 'rgba(226, 195, 153, 0.15)',
                              color:
                                expense.expenseName === 'Wood' || expense.expenseName === 'Soil'
                                  ? '#fbbf24'
                                  : expense.expenseName === 'Disel' || expense.expenseName === 'Oil'
                                  ? '#f87171'
                                  : expense.expenseName?.includes('rent')
                                  ? '#60a5fa'
                                  : 'var(--primary)'
                            }}
                          >
                            {expense.expenseName || expense.category}
                          </span>
                        </div>
                      </td>

                      {/* Quality (Quantity) */}
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {Number(expense.quantity || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Rate */}
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {expense.rate > 0 ? `₹${Number(expense.rate).toLocaleString('en-IN')}` : '-'}
                      </td>

                      {/* Total */}
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#f87171' }}>
                        {formatINR(expense.totalAmount)}
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="no-print" style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px'
                          }}
                        >
                          <button
                            onClick={(e) => handleOpenEdit(expense, e)}
                            className="aftrah-app-action-btn aftrah-app-edit-btn"
                            title="Edit Expense"
                            aria-label="Edit Expense"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(expense);
                            }}
                            className="aftrah-app-action-btn aftrah-app-delete-btn"
                            title="Delete Expense"
                            aria-label="Delete Expense"
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

        {/* Pagination Controls */}
        {filteredExpenses.length > 0 && (
          <div className="aftrah-app-pagination-bar">
            <div className="aftrah-app-pagination-left">
              <span className="aftrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{' '}
                <strong>{filteredExpenses.length}</strong> | Total: <strong style={{ color: '#f87171' }}>{formatINR(filteredTotalProductionExpenses)}</strong>
              </span>

              <div className="aftrah-app-rows-selector">
                <label className="aftrah-app-rows-label">Rows per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="aftrah-app-select-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="aftrah-app-pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="aftrah-app-page-nav-btn"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="aftrah-app-page-numbers-wrap">
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`aftrah-app-page-num-btn ${currentPage === p ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="aftrah-app-page-nav-btn"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* RIGHT COLUMN: "Add details" PANEL (Matching handwritten sketch: Date, Expenses [v], Quality, Rate) */}
      <aside className="aftrah-app-form-card">
        {/* Header matching box: [ Add details ] */}
        <div className="aftrah-app-form-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} color="var(--primary)" />
            <h2 className="aftrah-app-form-card-title">Add details</h2>
          </div>
        </div>

        <form onSubmit={handleAddSubmit} className="aftrah-app-add-form">
          {/* 1. Date */}
          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">
              Date <span className="required-star">*</span>
            </label>
            <input
              type="date"
              required
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              className="aftrah-app-input"
            />
          </div>

          {/* 2. Expenses Searchable Dropdown matching Photo 2: Soil, Wood, Msand Tust, Disel, Oil, Jcb - rent, Tractor - rent, Machine expense */}
          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">
              Expenses <span className="required-star">*</span>
            </label>
            <SearchableExpenseSelect
              value={addExpenseName}
              onChange={(val) => setAddExpenseName(val)}
              options={BRICK_PRODUCTION_EXPENSE_OPTIONS}
              placeholder="Search or select expense..."
              searchPlaceholder="Filter (Soil, Wood, Disel...)"
            />
          </div>

          {/* 3. Quality (Quantity / Qty) */}
          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">
              Quality / Quantity <span className="required-star">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              placeholder="Enter quality / quantity..."
              value={addQuality}
              onChange={(e) => setAddQuality(e.target.value)}
              className="aftrah-app-input"
            />
          </div>

          {/* 4. Rate */}
          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">
              Rate (₹) <span className="required-star">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              placeholder="Enter rate per unit..."
              value={addRate}
              onChange={(e) => setAddRate(e.target.value)}
              className="aftrah-app-input"
            />
          </div>

          {/* Live Computed Total Display */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'var(--surface-container, #1e2126)',
              border: '1px solid var(--border-stroke, #2c303a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '4px 0 6px 0'
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total Amount:
            </span>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#f87171', fontFamily: 'Cinzel, serif' }}>
              {formatINR(calculatedAddTotal)}
            </span>
          </div>

          {/* Validation Notice */}
          {!isAddValid && (
            <div className="aftrah-app-validation-notice">
              * Date, Expenses, Quality and Rate are required to submit.
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="submit"
              disabled={!isAddValid}
              className="btn-theme-primary aftrah-app-submit-btn"
              style={{ flex: 1 }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Expense</span>
            </button>

            {(addQuality || addRate) && (
              <button
                type="button"
                onClick={handleClearAddForm}
                className="aftrah-app-back-btn"
                style={{ height: '44px', padding: '0 14px', marginTop: '4px' }}
                title="Clear Form"
              >
                <RotateCcw size={14} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </form>
      </aside>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="aftrah-app-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={16} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Edit Production Expense</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="aftrah-app-modal-close"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="aftrah-app-add-form" style={{ padding: '16px' }}>
              {/* Date */}
              <div className="aftrah-app-form-group">
                <label className="aftrah-app-label">
                  Date <span className="required-star">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="aftrah-app-input"
                />
              </div>

              {/* Expenses Searchable Dropdown */}
              <div className="aftrah-app-form-group">
                <label className="aftrah-app-label">
                  Expenses <span className="required-star">*</span>
                </label>
                <SearchableExpenseSelect
                  value={editExpenseName}
                  onChange={(val) => setEditExpenseName(val)}
                  options={BRICK_PRODUCTION_EXPENSE_OPTIONS}
                  placeholder="Search or select expense..."
                  searchPlaceholder="Filter (Soil, Wood, Disel...)"
                />
              </div>

              {/* Quality / Quantity */}
              <div className="aftrah-app-form-group">
                <label className="aftrah-app-label">
                  Quality / Quantity <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={editQuality}
                  onChange={(e) => setEditQuality(e.target.value)}
                  className="aftrah-app-input"
                />
              </div>

              {/* Rate */}
              <div className="aftrah-app-form-group">
                <label className="aftrah-app-label">
                  Rate (₹) <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  className="aftrah-app-input"
                />
              </div>

              {/* Computed Total */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--surface-container, #1e2126)',
                  border: '1px solid var(--border-stroke, #2c303a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total:</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#f87171', fontFamily: 'Cinzel, serif' }}>
                  {formatINR(calculatedEditTotal)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="aftrah-app-back-btn"
                  style={{ flex: 1, height: '42px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditValid}
                  className="btn-theme-primary"
                  style={{ flex: 1, height: '42px' }}
                >
                  <Check size={15} strokeWidth={2.5} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Production Expense"
        message={`Are you sure you want to delete the expense "${deleteTarget?.expenseName}" of ${formatINR(deleteTarget?.totalAmount || 0)}? This action cannot be undone.`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteOpen}
        title={`Delete ${selectedExpenseIds.size} Selected Expenses`}
        message={`Are you sure you want to delete ${selectedExpenseIds.size} selected production expense entries? This action cannot be undone.`}
        isDeleting={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setIsBulkDeleteOpen(false)}
      />
    </div>
  );
};
