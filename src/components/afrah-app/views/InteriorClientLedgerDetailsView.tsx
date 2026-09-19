import React, { useState, useMemo } from "react";
import type { Client, AdvancePayment, ExpenseItem } from "../types";
import { PAYMENT_MODES } from "../types";
import { SearchableExpenseSelect } from "../components/SearchableExpenseSelect";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { TableFormPopover } from "../components/TableFormPopover";
import {
  DateInput,
  isValidDate,
  formatToDDMMYYYY,
  compareByDateDesc,
} from "../components/DateInput";
import { showToast } from "../layout/ToastContainer";
import { StatementPrintPreviewModal } from "../components/StatementPrintPreviewModal";
import {
  Plus,
  Trash2,
  Wallet,
  TrendingDown,
  Scale,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
} from "lucide-react";

export const PREDEFINED_INTERIOR_EXPENSES = [
  'Plywood (BWP 710)',
  'Plywood (MR Grade)',
  'Laminate Sheets (1mm)',
  'Laminate Sheets (0.8mm)',
  'Modular Kitchen Hardware',
  'Modular Kitchen Quartz Countertop',
  'Acrylic Cabinet Shutters',
  'False Ceiling Gypsum',
  'LED Profile & Strip Lights',
  'Electrical Fixtures & Switches',
  'Carpenter Team Wages',
  'PU Polish & Paint Finish',
  'Designer Wallpaper & Textured Paint',
  'Veneer Paneling Sheets',
  'Wardrobe Sliding Fittings',
  'Master Bedroom Bed & Paneling',
  'Toughened Glass Partitions',
  'Hardware & Hinges (Soft Close)',
  'Curtains & Blinds',
  'Other Interior Work',
];

const formatINR = (val: number): string => {
  return "₹" + Number(val || 0).toLocaleString("en-IN");
};

interface InteriorClientLedgerDetailsViewProps {
  client: Client;
  onBack?: () => void;
  onUpdateClient: (id: string, updates: Partial<Client>) => Promise<Client | null>;
  onAddAdvance: (clientId: string, payment: Omit<AdvancePayment, "id" | "createdAt">) => Promise<AdvancePayment | null>;
  onUpdateAdvance: (id: string, updates: Partial<AdvancePayment>) => Promise<AdvancePayment | null>;
  onDeleteAdvance: (id: string) => Promise<boolean>;
  onDeleteMultipleAdvancePayments: (ids: string[]) => Promise<boolean>;
  onAddExpense: (clientId: string, expense: Omit<ExpenseItem, "id" | "createdAt">) => Promise<ExpenseItem | null>;
  onUpdateExpense: (id: string, updates: Partial<ExpenseItem>) => Promise<ExpenseItem | null>;
  onDeleteExpense: (id: string) => Promise<boolean>;
  onDeleteMultipleExpenses: (ids: string[]) => Promise<boolean>;
}

export const InteriorClientLedgerDetailsView: React.FC<InteriorClientLedgerDetailsViewProps> = ({
  client,
  onBack: _onBack,
  onUpdateClient: _onUpdateClient,
  onAddAdvance,
  onUpdateAdvance,
  onDeleteAdvance,
  onDeleteMultipleAdvancePayments,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onDeleteMultipleExpenses,
}) => {
  // Advance Payments State
  const advancePayments = client.advancePayments || [];
  const [advFromDate] = useState("");
  const [advToDate] = useState("");
  const [selectedAdvIds, setSelectedAdvIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteAdvOpen, setIsBulkDeleteAdvOpen] = useState(false);
  const [isBulkDeletingAdv, setIsBulkDeletingAdv] = useState(false);
  const [advCurrentPage, setAdvCurrentPage] = useState(1);
  const [advItemsPerPage, setAdvItemsPerPage] = useState(5);

  // Add Advance Popover State
  const [isAddAdvModalOpen, setIsAddAdvModalOpen] = useState(false);
  const [advDate, setAdvDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [advAmount, setAdvAmount] = useState("");
  const [advMode, setAdvMode] = useState(PAYMENT_MODES[0]);

  // Edit Advance Modal State
  const [isEditAdvModalOpen, setIsEditAdvModalOpen] = useState(false);
  const [editingAdvId, setEditingAdvId] = useState<string | null>(null);
  const [editAdvDate, setEditAdvDate] = useState("");
  const [editAdvAmount, setEditAdvAmount] = useState("");
  const [editAdvMode, setEditAdvMode] = useState(PAYMENT_MODES[0]);

  // Delete Single Advance Modal State
  const [deleteAdvTarget, setDeleteAdvTarget] = useState<AdvancePayment | null>(null);
  const [isDeletingAdv, setIsDeletingAdv] = useState(false);

  // Expenses State
  const expenses = client.expenses || [];
  const [expFromDate] = useState("");
  const [expToDate] = useState("");
  const [selectedExpIds, setSelectedExpIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteExpOpen, setIsBulkDeleteExpOpen] = useState(false);
  const [isBulkDeletingExp, setIsBulkDeletingExp] = useState(false);
  const [expCurrentPage, setExpCurrentPage] = useState(1);
  const [expItemsPerPage, setExpItemsPerPage] = useState(5);

  // Add Expense Popover State
  const [isAddExpModalOpen, setIsAddExpModalOpen] = useState(false);
  const [expDate, setExpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expName, setExpName] = useState("");
  const [expQuantity, setExpQuantity] = useState("1");
  const [expRate, setExpRate] = useState("");

  // Edit Expense Modal State
  const [isEditExpModalOpen, setIsEditExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpDate, setEditExpDate] = useState("");
  const [editExpName, setEditExpName] = useState("");
  const [editExpQuantity, setEditExpQuantity] = useState("");
  const [editExpRate, setEditExpRate] = useState("");

  // Delete Single Expense Modal State
  const [deleteExpTarget, setDeleteExpTarget] = useState<ExpenseItem | null>(null);
  const [isDeletingExp, setIsDeletingExp] = useState(false);

  // Statement Print Preview Modal State
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'expenses' | 'advances' | 'statement'>('statement');

  const handleOpenPrintPreview = (
    mode: 'expenses' | 'advances' | 'statement' = 'statement'
  ) => {
    setPreviewMode(mode);
    setIsPrintPreviewOpen(true);
  };

  // Calculations for Financial Summaries
  const totalAdvance = useMemo(() => {
    return advancePayments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [advancePayments]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  }, [expenses]);

  const balance = totalAdvance - totalExpense;

  // Filtered Advance Payments
  const filteredAdvance = useMemo(() => {
    return advancePayments
      .filter((item) => {
        if (advFromDate && item.date < advFromDate) return false;
        if (advToDate && item.date > advToDate) return false;
        return true;
      })
      .sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo));
  }, [advancePayments, advFromDate, advToDate]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        if (expFromDate && item.date < expFromDate) return false;
        if (expToDate && item.date > expToDate) return false;
        return true;
      })
      .sort((a, b) => compareByDateDesc(a.date, b.date, a.sNo, b.sNo));
  }, [expenses, expFromDate, expToDate]);

  // Advance Payments Pagination Computations
  const advTotalPages = Math.max(1, Math.ceil(filteredAdvance.length / advItemsPerPage));
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
  const expTotalPages = Math.max(1, Math.ceil(filteredExpenses.length / expItemsPerPage));
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

  // Validation
  const isAdvValid =
    isValidDate(advDate) &&
    advAmount !== "" &&
    parseFloat(advAmount) > 0 &&
    Boolean(advMode);

  const isEditAdvValid =
    isValidDate(editAdvDate) &&
    editAdvAmount !== "" &&
    parseFloat(editAdvAmount) > 0 &&
    Boolean(editAdvMode);

  const isExpValid =
    isValidDate(expDate) &&
    expName.trim().length > 0 &&
    expQuantity !== "" &&
    parseFloat(expQuantity) > 0 &&
    expRate !== "" &&
    parseFloat(expRate) > 0;

  const isEditExpValid =
    isValidDate(editExpDate) &&
    editExpName.trim().length > 0 &&
    editExpQuantity !== "" &&
    parseFloat(editExpQuantity) > 0 &&
    editExpRate !== "" &&
    parseFloat(editExpRate) > 0;

  // Handlers for Advance Payments
  const handleAddAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdvValid) return;

    try {
      await onAddAdvance(client.id, {
        date: advDate,
        amount: parseFloat(advAmount),
        mode: advMode,
      });

      setAdvAmount("");
      setIsAddAdvModalOpen(false);
      setAdvCurrentPage(1);
      showToast("Advance payment recorded successfully!", "success");
    } catch (err) {
      showToast("Failed to record advance payment", "error");
    }
  };

  const handleOpenEditAdv = (item: AdvancePayment) => {
    setEditingAdvId(item.id);
    setEditAdvDate(item.date);
    setEditAdvAmount(String(item.amount));
    setEditAdvMode(item.mode);
    setIsEditAdvModalOpen(true);
  };

  const handleEditAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdvId || !isEditAdvValid) return;

    try {
      await onUpdateAdvance(editingAdvId, {
        date: editAdvDate,
        amount: parseFloat(editAdvAmount),
        mode: editAdvMode,
      });

      setIsEditAdvModalOpen(false);
      setEditingAdvId(null);
      showToast("Advance payment updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update advance payment", "error");
    }
  };

  const handleConfirmDeleteAdv = async () => {
    if (!deleteAdvTarget) return;
    try {
      setIsDeletingAdv(true);
      await onDeleteAdvance(deleteAdvTarget.id);
      showToast("Advance payment deleted!", "success");
      setDeleteAdvTarget(null);
    } catch (err) {
      showToast("Failed to delete advance payment", "error");
    } finally {
      setIsDeletingAdv(false);
    }
  };

  const handleConfirmBulkDeleteAdv = async () => {
    if (selectedAdvIds.size === 0) return;
    try {
      setIsBulkDeletingAdv(true);
      await onDeleteMultipleAdvancePayments(Array.from(selectedAdvIds));
      setSelectedAdvIds(new Set());
      setIsBulkDeleteAdvOpen(false);
      showToast("Selected advance payments deleted!", "success");
    } catch (err) {
      showToast("Failed to delete advance payments", "error");
    } finally {
      setIsBulkDeletingAdv(false);
    }
  };

  // Handlers for Expenses
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExpValid) return;

    const qty = parseFloat(expQuantity);
    const rate = parseFloat(expRate);
    const totalAmount = qty * rate;

    try {
      await onAddExpense(client.id, {
        date: expDate,
        expenseName: expName.trim(),
        quantity: qty,
        rate: rate,
        totalAmount: totalAmount,
      });

      setExpName("");
      setExpQuantity("1");
      setExpRate("");
      setIsAddExpModalOpen(false);
      setExpCurrentPage(1);
      showToast("Expense added successfully!", "success");
    } catch (err) {
      showToast("Failed to add expense", "error");
    }
  };

  const handleOpenEditExp = (item: ExpenseItem) => {
    setEditingExpId(item.id);
    setEditExpDate(item.date);
    setEditExpName(item.expenseName);
    setEditExpQuantity(String(item.quantity));
    setEditExpRate(String(item.rate));
    setIsEditExpModalOpen(true);
  };

  const handleEditExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpId || !isEditExpValid) return;

    const qty = parseFloat(editExpQuantity);
    const rate = parseFloat(editExpRate);
    const totalAmount = qty * rate;

    try {
      await onUpdateExpense(editingExpId, {
        date: editExpDate,
        expenseName: editExpName.trim(),
        quantity: qty,
        rate: rate,
        totalAmount: totalAmount,
      });

      setIsEditExpModalOpen(false);
      setEditingExpId(null);
      showToast("Expense updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update expense", "error");
    }
  };

  const handleConfirmDeleteExp = async () => {
    if (!deleteExpTarget) return;
    try {
      setIsDeletingExp(true);
      await onDeleteExpense(deleteExpTarget.id);
      showToast("Expense record deleted!", "success");
      setDeleteExpTarget(null);
    } catch (err) {
      showToast("Failed to delete expense", "error");
    } finally {
      setIsDeletingExp(false);
    }
  };

  const handleConfirmBulkDeleteExp = async () => {
    if (selectedExpIds.size === 0) return;
    try {
      setIsBulkDeletingExp(true);
      await onDeleteMultipleExpenses(Array.from(selectedExpIds));
      setSelectedExpIds(new Set());
      setIsBulkDeleteExpOpen(false);
      showToast("Selected expenses deleted!", "success");
    } catch (err) {
      showToast("Failed to delete expenses", "error");
    } finally {
      setIsBulkDeletingExp(false);
    }
  };

  return (
    <div className="client-details-page">
      {/* PRINT-ONLY STATEMENT HEADER */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">KAAB INTERIOR</h1>
            <p className="print-company-sub">
              Interior Design, Fit-outs & Financial ERP
            </p>
          </div>
          <div className="print-badge-statement">
            <span>CLIENT ACCOUNT STATEMENT</span>
          </div>
        </div>

        <div className="print-meta-grid">
          <div className="print-meta-box">
            <span className="print-meta-title">CLIENT DETAILS</span>
            <div className="print-meta-val">
              <strong>{client.name}</strong>
            </div>
            <div className="print-meta-sub">Phone: {client.phone}</div>
            <div className="print-meta-sub">
              Site / Address: {client.address}
            </div>
          </div>

          <div className="print-meta-box">
            <span className="print-meta-title">FINANCIAL SUMMARY</span>
            <div className="print-meta-sub">
              Total Advances: <strong>{formatINR(totalAdvance)}</strong>
            </div>
            <div className="print-meta-sub">
              Total Expenses: <strong>{formatINR(totalExpense)}</strong>
            </div>
            <div
              className="print-meta-val"
              style={{
                marginTop: "4px",
                color: balance >= 0 ? "#15803d" : "#b91c1c",
              }}
            >
              {balance >= 0
                ? `Net Balance: ${formatINR(balance)}`
                : `Overdue Deficit: ${formatINR(Math.abs(balance))}`}
            </div>
          </div>
        </div>

        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Advance Payments:</span>{" "}
            <strong>
              {filteredAdvance.length} Entries ({formatINR(totalAdvance)})
            </strong>
          </div>
          <div className="print-total-item">
            <span>Site Expenses:</span>{" "}
            <strong>
              {filteredExpenses.length} Entries ({formatINR(totalExpense)})
            </strong>
          </div>
          <div className="print-total-item">
            <span>Statement Date:</span>{" "}
            <strong>
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>
      </div>

      {/* Screen Header Bar */}
      <div className="client-details-header no-print">
        <div className="client-details-top-actions">
          <button
            onClick={() => handleOpenPrintPreview("statement")}
            className="afrah-app-back-btn"
            title="Preview and Print Client Statement"
          >
            <Printer size={15} />
            <span>Print Preview / Statement</span>
          </button>
        </div>

        {/* Unified Card Container for Client Name & Financial Summary */}
        <div className="client-unified-summary-card">
          {/* Client Name & Contact */}
          <div className="client-unified-card-item client-info-item">
            <h1 className="client-unified-name-title">
              <span className="client-unified-label">Client Name :</span>{" "}
              <span className="client-unified-name">{client.name}</span>
            </h1>
          </div>

          {/* Total Advance */}
          <div className="client-unified-card-item metric-item">
            <div className="metric-icon-wrap gold">
              <Wallet size={24} />
            </div>
            <div>
              <span className="metric-label">TOTAL ADVANCE</span>
              <span className="metric-value gold">
                {formatINR(totalAdvance)}
              </span>
            </div>
          </div>

          {/* Total Expense */}
          <div className="client-unified-card-item metric-item">
            <div className="metric-icon-wrap blue">
              <TrendingDown size={24} />
            </div>
            <div>
              <span className="metric-label">TOTAL EXPENSE</span>
              <span className="metric-value blue">
                {formatINR(totalExpense)}
              </span>
            </div>
          </div>

          {/* Remaining Amount */}
          <div className="client-unified-card-item metric-item">
            <div
              className={`metric-icon-wrap ${balance >= 0 ? "green" : "red"}`}
            >
              <Scale size={24} />
            </div>
            <div>
              <span className="metric-label">
                {balance >= 0 ? "REMAINING AMOUNT" : "DEFICIT OVERDUE"}
              </span>
              <span
                className={`metric-value ${balance >= 0 ? "green" : "red"}`}
              >
                {formatINR(Math.abs(balance))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Combined ledger card: Advance Payments | Site Expenses */}
      <section
        className={`afrah-app-table-section client-ledger-split-card${
          isAddAdvModalOpen || isAddExpModalOpen ? " with-add-popover" : ""
        }`}
      >
        <div className="client-details-side-by-side-grid">
          {/* COLUMN 1: ADVANCE PAYMENTS (STRICTLY NO NOTE COLUMN) */}
          <div className="details-column-panel">
            <div className="afrah-app-section-header no-print">
              <div>
                <h2 className="afrah-app-section-title">Advance Payments</h2>
                <span className="afrah-app-section-subtitle">
                  {(advFromDate || advToDate) && " (filtered)"}
                </span>
              </div>

              <TableFormPopover
                open={isAddAdvModalOpen}
                onOpenChange={setIsAddAdvModalOpen}
                label="Add Advance"
              >
                <form onSubmit={handleAddAdvanceSubmit} className="afrah-app-add-form">
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Date *</label>
                    <DateInput
                      required
                      value={advDate}
                      onChange={setAdvDate}
                      className="afrah-app-input"
                    />
                  </div>
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Payment Mode *</label>
                    <select
                      value={advMode}
                      onChange={(e) => setAdvMode(e.target.value)}
                      className="afrah-app-input"
                    >
                      {PAYMENT_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Amount (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="e.g. 250000"
                      value={advAmount}
                      onChange={(e) => setAdvAmount(e.target.value)}
                      className="afrah-app-input"
                    />
                  </div>
                  <div className="afrah-app-add-popover-actions">
                    <button
                      type="button"
                      onClick={() => setIsAddAdvModalOpen(false)}
                      className="afrah-app-back-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isAdvValid}
                      className="btn-theme-primary"
                    >
                      <Plus size={16} />
                      <span>Save Advance</span>
                    </button>
                  </div>
                </form>
              </TableFormPopover>
            </div>

            <div className="afrah-app-table-container">
              <table className="afrah-app-table">
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: "45px" }}>
                      S.NO
                    </th>
                    <th>DATE</th>
                    <th>PAYMENT MODE</th>
                    <th>AMOUNT (₹)</th>
                    <th
                      className="no-print text-center"
                      style={{ width: "70px" }}
                    >
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdvance.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: "32px 16px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {advFromDate || advToDate
                          ? "No matching advance payments."
                          : "No advance payments added yet."}
                      </td>
                    </tr>
                  ) : (
                    paginatedAdvance.map((item, index) => {
                      return (
                        <tr key={item.id} className="cursor-default">
                          <td className="cell-sno">
                            {advStartIndex + index + 1}
                          </td>
                          <td className="cell-date">
                            {formatToDDMMYYYY(item.date)}
                          </td>
                          <td>
                            <span className="payment-mode-tag">
                              {item.mode}
                            </span>
                          </td>
                          <td className="cell-amount">
                            {formatINR(item.amount)}
                          </td>
                          <td
                            className="no-print text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex-center-4">
                              <button
                                onClick={() => handleOpenEditAdv(item)}
                                className="afrah-app-action-btn afrah-app-edit-btn"
                                title="Edit Payment"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteAdvTarget(item)}
                                className="afrah-app-action-btn afrah-app-delete-btn"
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

            {/* Advance Pagination Bar */}
            {filteredAdvance.length > 0 && (
              <div className="afrah-app-pagination no-print">
                <div className="afrah-app-pagination-left">
                  <span className="afrah-app-pagination-info">
                    {advStartIndex + 1}–{advEndIndex} of {filteredAdvance.length}
                  </span>
                  <div className="afrah-app-rows-selector">
                    <select
                      value={advItemsPerPage}
                      onChange={(e) => {
                        setAdvItemsPerPage(Number(e.target.value));
                        setAdvCurrentPage(1);
                      }}
                      className="afrah-app-select-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>

                <div className="afrah-app-pagination-controls">
                  <button
                    onClick={() => setAdvCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={advCurrentPage === 1}
                    className="afrah-app-page-nav-btn"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="afrah-app-page-numbers-wrap">
                    {advPageNumbers.map((p) => (
                      <button
                        key={p}
                        onClick={() => setAdvCurrentPage(p)}
                        className={`afrah-app-page-num-btn ${
                          advCurrentPage === p ? "active" : ""
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setAdvCurrentPage((p) => Math.min(advTotalPages, p + 1))
                    }
                    disabled={advCurrentPage === advTotalPages}
                    className="afrah-app-page-nav-btn"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: SITE / INTERIOR EXPENSES */}
          <div className="details-column-panel">
            <div className="afrah-app-section-header no-print">
              <div>
                <h2 className="afrah-app-section-title">Site Expenses</h2>
                <span className="afrah-app-section-subtitle">
                  {(expFromDate || expToDate) && " (filtered)"}
                </span>
              </div>

              <TableFormPopover
                open={isAddExpModalOpen}
                onOpenChange={setIsAddExpModalOpen}
                label="Add Expense"
              >
                <form onSubmit={handleAddExpenseSubmit} className="afrah-app-add-form">
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Date *</label>
                    <DateInput
                      required
                      value={expDate}
                      onChange={setExpDate}
                      className="afrah-app-input"
                    />
                  </div>
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Expense Name *</label>
                    <SearchableExpenseSelect
                      options={PREDEFINED_INTERIOR_EXPENSES}
                      value={expName}
                      onChange={setExpName}
                      placeholder="Type or pick interior expense..."
                    />
                  </div>
                  <div className="afrah-app-form-row">
                    <div className="afrah-app-form-group flex-1">
                      <label className="afrah-app-label">Quantity *</label>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        required
                        placeholder="1"
                        value={expQuantity}
                        onChange={(e) => setExpQuantity(e.target.value)}
                        className="afrah-app-input"
                      />
                    </div>
                    <div className="afrah-app-form-group flex-1">
                      <label className="afrah-app-label">Rate (₹) *</label>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        required
                        placeholder="e.g. 2400"
                        value={expRate}
                        onChange={(e) => setExpRate(e.target.value)}
                        className="afrah-app-input"
                      />
                    </div>
                  </div>
                  <div className="calculated-total-display">
                    <span className="total-label">Estimated Total:</span>
                    <span className="total-value">
                      {formatINR(
                        (parseFloat(expQuantity) || 0) * (parseFloat(expRate) || 0)
                      )}
                    </span>
                  </div>
                  <div className="afrah-app-add-popover-actions">
                    <button
                      type="button"
                      onClick={() => setIsAddExpModalOpen(false)}
                      className="afrah-app-back-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isExpValid}
                      className="btn-theme-primary"
                    >
                      <Plus size={16} />
                      <span>Save Expense</span>
                    </button>
                  </div>
                </form>
              </TableFormPopover>
            </div>

            <div className="afrah-app-table-container">
              <table className="afrah-app-table">
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: "45px" }}>
                      S.NO
                    </th>
                    <th>DATE</th>
                    <th>EXPENSE NAME</th>
                    <th>QTY</th>
                    <th>RATE</th>
                    <th>TOTAL</th>
                    <th
                      className="no-print text-center"
                      style={{ width: "70px" }}
                    >
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: "32px 16px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {expFromDate || expToDate
                          ? "No matching expenses found."
                          : "No expenses logged yet."}
                      </td>
                    </tr>
                  ) : (
                    paginatedExpenses.map((exp, index) => {
                      return (
                        <tr key={exp.id} className="cursor-default">
                          <td className="cell-sno">
                            {expStartIndex + index + 1}
                          </td>
                          <td className="cell-date">
                            {formatToDDMMYYYY(exp.date)}
                          </td>
                          <td className="cell-item-type">
                            {exp.expenseName}
                          </td>
                          <td className="cell-qty">{exp.quantity}</td>
                          <td className="cell-rate">{formatINR(exp.rate)}</td>
                          <td className="cell-amount">
                            {formatINR(exp.totalAmount)}
                          </td>
                          <td
                            className="no-print text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex-center-4">
                              <button
                                onClick={() => handleOpenEditExp(exp)}
                                className="afrah-app-action-btn afrah-app-edit-btn"
                                title="Edit Expense"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteExpTarget(exp)}
                                className="afrah-app-action-btn afrah-app-delete-btn"
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

            {/* Expenses Pagination Bar */}
            {filteredExpenses.length > 0 && (
              <div className="afrah-app-pagination no-print">
                <div className="afrah-app-pagination-left">
                  <span className="afrah-app-pagination-info">
                    {expStartIndex + 1}–{expEndIndex} of {filteredExpenses.length}
                  </span>
                  <div className="afrah-app-rows-selector">
                    <select
                      value={expItemsPerPage}
                      onChange={(e) => {
                        setExpItemsPerPage(Number(e.target.value));
                        setExpCurrentPage(1);
                      }}
                      className="afrah-app-select-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>

                <div className="afrah-app-pagination-controls">
                  <button
                    onClick={() => setExpCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={expCurrentPage === 1}
                    className="afrah-app-page-nav-btn"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="afrah-app-page-numbers-wrap">
                    {expPageNumbers.map((p) => (
                      <button
                        key={p}
                        onClick={() => setExpCurrentPage(p)}
                        className={`afrah-app-page-num-btn ${
                          expCurrentPage === p ? "active" : ""
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setExpCurrentPage((p) => Math.min(expTotalPages, p + 1))
                    }
                    disabled={expCurrentPage === expTotalPages}
                    className="afrah-app-page-nav-btn"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* EDIT ADVANCE MODAL (NO NOTE INPUT) */}
      {isEditAdvModalOpen && (
        <div
          className="afrah-app-modal-backdrop"
          onClick={() => setIsEditAdvModalOpen(false)}
        >
          <div className="afrah-app-modal" onClick={(e) => e.stopPropagation()}>
            <div className="afrah-app-modal-header">
              <h2 className="afrah-app-modal-title">Edit Advance Payment</h2>
              <button
                onClick={() => setIsEditAdvModalOpen(false)}
                className="afrah-app-modal-close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditAdvanceSubmit}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Date *</label>
                  <DateInput
                    required
                    value={editAdvDate}
                    onChange={setEditAdvDate}
                    className="afrah-app-input"
                  />
                </div>
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Payment Mode *</label>
                  <select
                    value={editAdvMode}
                    onChange={(e) => setEditAdvMode(e.target.value)}
                    className="afrah-app-input"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={editAdvAmount}
                    onChange={(e) => setEditAdvAmount(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>
              </div>
              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditAdvModalOpen(false)}
                  className="afrah-app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditAdvValid}
                  className="afrah-app-btn-primary"
                >
                  Update Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ADVANCE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deleteAdvTarget}
        title="Delete Advance Payment"
        message={`Are you sure you want to delete advance payment of ${formatINR(
          deleteAdvTarget?.amount || 0
        )} on ${deleteAdvTarget?.date}?`}
        confirmLabel="Delete Payment"
        isLoading={isDeletingAdv}
        onConfirm={handleConfirmDeleteAdv}
        onCancel={() => setDeleteAdvTarget(null)}
      />

      {/* CONFIRM BULK DELETE ADVANCE MODAL */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteAdvOpen}
        title="Delete Selected Advance Payments"
        message={`Are you sure you want to delete ${selectedAdvIds.size} selected advance payments?`}
        confirmLabel="Delete Payments"
        isLoading={isBulkDeletingAdv}
        onConfirm={handleConfirmBulkDeleteAdv}
        onCancel={() => setIsBulkDeleteAdvOpen(false)}
      />

      {/* EDIT EXPENSE MODAL */}
      {isEditExpModalOpen && (
        <div
          className="afrah-app-modal-backdrop"
          onClick={() => setIsEditExpModalOpen(false)}
        >
          <div className="afrah-app-modal" onClick={(e) => e.stopPropagation()}>
            <div className="afrah-app-modal-header">
              <h2 className="afrah-app-modal-title">Edit Expense Entry</h2>
              <button
                onClick={() => setIsEditExpModalOpen(false)}
                className="afrah-app-modal-close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditExpenseSubmit}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Date *</label>
                  <DateInput
                    required
                    value={editExpDate}
                    onChange={setEditExpDate}
                    className="afrah-app-input"
                  />
                </div>
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Expense Name *</label>
                  <SearchableExpenseSelect
                    options={PREDEFINED_INTERIOR_EXPENSES}
                    value={editExpName}
                    onChange={setEditExpName}
                    placeholder="Type or select expense..."
                  />
                </div>
                <div className="afrah-app-form-row">
                  <div className="afrah-app-form-group flex-1">
                    <label className="afrah-app-label">Quantity *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={editExpQuantity}
                      onChange={(e) => setEditExpQuantity(e.target.value)}
                      className="afrah-app-input"
                    />
                  </div>
                  <div className="afrah-app-form-group flex-1">
                    <label className="afrah-app-label">Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={editExpRate}
                      onChange={(e) => setEditExpRate(e.target.value)}
                      className="afrah-app-input"
                    />
                  </div>
                </div>
                <div className="calculated-total-display">
                  <span className="total-label">Total Amount:</span>
                  <span className="total-value">
                    {formatINR(
                      (parseFloat(editExpQuantity) || 0) * (parseFloat(editExpRate) || 0)
                    )}
                  </span>
                </div>
              </div>
              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditExpModalOpen(false)}
                  className="afrah-app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditExpValid}
                  className="afrah-app-btn-primary"
                >
                  Update Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE EXPENSE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deleteExpTarget}
        title="Delete Expense Item"
        message={`Are you sure you want to delete expense "${deleteExpTarget?.expenseName}" of ${formatINR(
          deleteExpTarget?.totalAmount || 0
        )}?`}
        confirmLabel="Delete Expense"
        isLoading={isDeletingExp}
        onConfirm={handleConfirmDeleteExp}
        onCancel={() => setDeleteExpTarget(null)}
      />

      {/* CONFIRM BULK DELETE EXPENSE MODAL */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteExpOpen}
        title="Delete Selected Expenses"
        message={`Are you sure you want to delete ${selectedExpIds.size} selected expenses?`}
        confirmLabel="Delete Expenses"
        isLoading={isBulkDeletingExp}
        onConfirm={handleConfirmBulkDeleteExp}
        onCancel={() => setIsBulkDeleteExpOpen(false)}
      />

      {/* STATEMENT PRINT PREVIEW MODAL */}
      <StatementPrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        client={client}
        advancePayments={filteredAdvance}
        expenses={filteredExpenses}
        initialMode={previewMode}
      />
    </div>
  );
};
