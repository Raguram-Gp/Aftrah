import React, { useState, useMemo } from "react";
import type { Client, AdvancePayment, ExpenseItem, Expense } from "../types";
import { PAYMENT_MODES } from "../types";
import { SearchableExpenseSelect } from "../components/SearchableExpenseSelect";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { TableFormPopover } from "../components/TableFormPopover";
import {
  DateInput,
  isValidDate,
  formatToDDMMYYYY,
  formatToYYYYMMDD,
  compareByDateDesc,
} from "../components/DateInput";
import { showToast } from "../layout/ToastContainer";
import { newId } from "@/lib/id";
import { StatementPrintPreviewModal } from "../components/StatementPrintPreviewModal";
import {
  CreditCard,
  Receipt,
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

interface ClientDetailsViewProps {
  client: Client;
  onBack?: () => void;
  onUpdateClient: (
    id: string,
    updates: Partial<Client>,
  ) => Promise<Client | null>;
  onAddAdvance: (
    payment: Omit<AdvancePayment, "id" | "createdAt">,
  ) => Promise<AdvancePayment | null>;
  onUpdateAdvance: (
    id: string,
    updates: Partial<AdvancePayment>,
  ) => Promise<AdvancePayment | null>;
  onDeleteAdvance: (id: string) => Promise<boolean>;
  onDeleteMultipleAdvancePayments: (ids: string[]) => Promise<boolean>;
  onAddExpense: (
    expense: Omit<Expense, "id" | "createdAt">,
  ) => Promise<Expense | null>;
  onUpdateExpense: (
    id: string,
    updates: Partial<Expense>,
  ) => Promise<Expense | null>;
  onDeleteExpense: (id: string) => Promise<boolean>;
  onDeleteMultipleExpenses: (ids: string[]) => Promise<boolean>;
}

export const ClientDetailsView: React.FC<ClientDetailsViewProps> = ({
  client,
  onBack: _onBack,
  onUpdateClient,
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
  const [advFromDate, setAdvFromDate] = useState("");
  const [advToDate, setAdvToDate] = useState("");
  const [selectedAdvIds, setSelectedAdvIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteAdvOpen, setIsBulkDeleteAdvOpen] = useState(false);
  const [isBulkDeletingAdv, setIsBulkDeletingAdv] = useState(false);
  const [advCurrentPage, setAdvCurrentPage] = useState(1);
  const [advItemsPerPage, setAdvItemsPerPage] = useState(5);

  // Add Advance Modal State (Add Details - I)
  const [isAddAdvModalOpen, setIsAddAdvModalOpen] = useState(false);
  const [advDate, setAdvDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [advAmount, setAdvAmount] = useState("");
  const [advMode, setAdvMode] = useState(PAYMENT_MODES[0]);

  // Edit Advance Modal State
  const [isEditAdvModalOpen, setIsEditAdvModalOpen] = useState(false);
  const [editingAdvId, setEditingAdvId] = useState<string | null>(null);
  const [editAdvDate, setEditAdvDate] = useState("");
  const [editAdvAmount, setEditAdvAmount] = useState("");
  const [editAdvMode, setEditAdvMode] = useState(PAYMENT_MODES[0]);

  // Expenses State
  const expenses = client.expenses || [];
  const [expFromDate, setExpFromDate] = useState("");
  const [expToDate, setExpToDate] = useState("");
  const [selectedExpIds, setSelectedExpIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteExpOpen, setIsBulkDeleteExpOpen] = useState(false);
  const [isBulkDeletingExp, setIsBulkDeletingExp] = useState(false);
  const [expCurrentPage, setExpCurrentPage] = useState(1);
  const [expItemsPerPage, setExpItemsPerPage] = useState(5);

  // Add Expense Modal State (Add Details - IInd)
  const [isAddExpModalOpen, setIsAddExpModalOpen] = useState(false);
  const [expDate, setExpDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [expName, setExpName] = useState("");
  const [expQuantity, setExpQuantity] = useState("");
  const [expRate, setExpRate] = useState("");

  // Edit Expense Modal State
  const [isEditExpModalOpen, setIsEditExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpDate, setEditExpDate] = useState("");
  const [editExpName, setEditExpName] = useState("");
  const [editExpQuantity, setEditExpQuantity] = useState("");
  const [editExpRate, setEditExpRate] = useState("");

  // Delete Confirmation Modal States
  const [deleteAdvTarget, setDeleteAdvTarget] = useState<AdvancePayment | null>(
    null,
  );
  const [isDeletingAdv, setIsDeletingAdv] = useState(false);
  const [deleteExpTarget, setDeleteExpTarget] = useState<ExpenseItem | null>(
    null,
  );
  const [isDeletingExp, setIsDeletingExp] = useState(false);

  // Auto-calculated total amounts for expenses
  const expTotalAmount =
    (parseFloat(expQuantity) || 0) * (parseFloat(expRate) || 0);

  const editExpTotalAmount =
    (parseFloat(editExpQuantity) || 0) * (parseFloat(editExpRate) || 0);

  const filteredAdvance = useMemo(() => {
    let list = advancePayments;
    if (advFromDate) {
      const fromISO = formatToYYYYMMDD(advFromDate);
      list = list.filter((p) => formatToYYYYMMDD(p.date) >= fromISO);
    }
    if (advToDate) {
      const toISO = formatToYYYYMMDD(advToDate);
      list = list.filter((p) => formatToYYYYMMDD(p.date) <= toISO);
    }
    return [...list].sort((a, b) =>
      compareByDateDesc(a.date, b.date, a.sNo, b.sNo),
    );
  }, [advancePayments, advFromDate, advToDate]);

  const filteredExpenses = useMemo(() => {
    let list = expenses;
    if (expFromDate) {
      const fromISO = formatToYYYYMMDD(expFromDate);
      list = list.filter((e) => formatToYYYYMMDD(e.date) >= fromISO);
    }
    if (expToDate) {
      const toISO = formatToYYYYMMDD(expToDate);
      list = list.filter((e) => formatToYYYYMMDD(e.date) <= toISO);
    }
    return [...list].sort((a, b) =>
      compareByDateDesc(a.date, b.date, a.sNo, b.sNo),
    );
  }, [expenses, expFromDate, expToDate]);

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
        await onDeleteMultipleAdvancePayments(
          client.id,
          Array.from(selectedAdvIds),
        );
      } else if (onDeleteAdvance) {
        for (const id of selectedAdvIds) {
          await onDeleteAdvance(client.id, id);
        }
      }
      setSelectedAdvIds(new Set());
      setIsBulkDeleteAdvOpen(false);
      showToast("Selected advance payments deleted!", "success");
    } catch (err) {
      showToast("Failed to delete advance payments", "error");
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
      showToast("Selected expenses deleted!", "success");
    } catch (err) {
      showToast("Failed to delete expenses", "error");
    } finally {
      setIsBulkDeletingExp(false);
    }
  };

  // Statement Print Preview Modal State
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<
    "expenses" | "advances" | "statement"
  >("expenses");

  // Print Statement Handler - opens preview modal before printing
  const handleOpenPrintPreview = (
    mode: "expenses" | "advances" | "statement" = "statement",
  ) => {
    setPreviewMode(mode);
    setIsPrintPreviewOpen(true);
  };

  const handlePrint = () => {
    handleOpenPrintPreview("statement");
  };

  // Validation
  const isAdvValid =
    isValidDate(advDate) &&
    parseFloat(advAmount) > 0 &&
    advMode.trim().length > 0;

  const isEditAdvValid =
    isValidDate(editAdvDate) &&
    parseFloat(editAdvAmount) > 0 &&
    editAdvMode.trim().length > 0;

  const isExpValid =
    isValidDate(expDate) &&
    expName.trim().length > 0 &&
    parseFloat(expQuantity) > 0 &&
    parseFloat(expRate) > 0;

  const isEditExpValid =
    isValidDate(editExpDate) &&
    editExpName.trim().length > 0 &&
    parseFloat(editExpQuantity) > 0 &&
    parseFloat(editExpRate) > 0;

  // Handle Add Advance Payment Submit
  const handleAddAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdvValid) return;

    try {
      if (onAddAdvance) {
        await onAddAdvance(client.id, {
          date: advDate,
          amount: parseFloat(advAmount),
          mode: advMode,
        });
      } else {
        const newPayment: AdvancePayment = {
          id: newId(),
          sNo: advancePayments.length + 1,
          date: advDate,
          amount: parseFloat(advAmount),
          mode: advMode,
        };
        onUpdateClient({
          ...client,
          advancePayments: [...advancePayments, newPayment],
        });
      }

      setAdvAmount("");
      setIsAddAdvModalOpen(false);
      setAdvCurrentPage(1);
      showToast("Advance payment recorded successfully!", "success");
    } catch (err) {
      showToast("Failed to record advance payment", "error");
    }
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

    try {
      const updatedPayment: AdvancePayment = {
        id: editingAdvId,
        sNo: advancePayments.find((p) => p.id === editingAdvId)?.sNo || 1,
        date: editAdvDate,
        amount: parseFloat(editAdvAmount),
        mode: editAdvMode,
      };

      if (onUpdateAdvance) {
        await onUpdateAdvance(client.id, updatedPayment);
      } else {
        const updated = advancePayments.map((p) =>
          p.id === editingAdvId ? updatedPayment : p,
        );
        onUpdateClient({
          ...client,
          advancePayments: updated,
        });
      }

      setIsEditAdvModalOpen(false);
      setEditingAdvId(null);
      showToast("Advance payment updated!", "success");
    } catch (err) {
      showToast("Failed to update advance payment", "error");
    }
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
          advancePayments: updated,
        });
      }
      showToast("Advance payment deleted!", "success");
    } catch (err) {
      showToast("Failed to delete advance payment", "error");
    } finally {
      setIsDeletingAdv(false);
      setDeleteAdvTarget(null);
    }
  };

  // Handle Add Expense Submit
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExpValid) return;

    try {
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
          id: newId(),
          sNo: expenses.length + 1,
          date: expDate,
          expenseName: expName.trim(),
          quantity: parseFloat(expQuantity),
          rate: parseFloat(expRate),
          totalAmount: expTotalAmount,
        };
        onUpdateClient({
          ...client,
          expenses: [...expenses, newExpense],
        });
      }

      setExpName("");
      setExpQuantity("");
      setExpRate("");
      setIsAddExpModalOpen(false);
      setExpCurrentPage(1);
      showToast("Site expense recorded successfully!", "success");
    } catch (err) {
      showToast("Failed to record site expense", "error");
    }
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

    try {
      const updatedExpense: ExpenseItem = {
        id: editingExpId,
        sNo: expenses.find((exp) => exp.id === editingExpId)?.sNo || 1,
        date: editExpDate,
        expenseName: editExpName.trim(),
        quantity: parseFloat(editExpQuantity),
        rate: parseFloat(editExpRate),
        totalAmount: editExpTotalAmount,
      };

      if (onUpdateExpense) {
        await onUpdateExpense(client.id, updatedExpense);
      } else {
        const updated = expenses.map((exp) =>
          exp.id === editingExpId ? updatedExpense : exp,
        );
        onUpdateClient({
          ...client,
          expenses: updated,
        });
      }

      setIsEditExpModalOpen(false);
      setEditingExpId(null);
      showToast("Site expense updated!", "success");
    } catch (err) {
      showToast("Failed to update site expense", "error");
    }
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
          expenses: updated,
        });
      }
      showToast("Site expense deleted!", "success");
    } catch (err) {
      showToast("Failed to delete site expense", "error");
    } finally {
      setIsDeletingExp(false);
      setDeleteExpTarget(null);
    }
  };

  // Totals calculations
  const totalAdvance = advancePayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0,
  );
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + (exp.totalAmount || 0),
    0,
  );
  const balance = totalAdvance - totalExpenses;

  // Format currency
  const formatINR = (val: number) => {
    return "₹" + Number(val || 0).toLocaleString("en-IN");
  };

  // Advance Payments Pagination Computations
  const advTotalPages =
    Math.ceil(filteredAdvance.length / advItemsPerPage) || 1;
  const advStartIndex = (advCurrentPage - 1) * advItemsPerPage;
  const advEndIndex = Math.min(
    advStartIndex + advItemsPerPage,
    filteredAdvance.length,
  );
  const paginatedAdvance = filteredAdvance.slice(advStartIndex, advEndIndex);

  const advPageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (advCurrentPage > 1) pages.push(advCurrentPage - 1);
    pages.push(advCurrentPage);
    if (advCurrentPage < advTotalPages) pages.push(advCurrentPage + 1);
    return pages;
  }, [advCurrentPage, advTotalPages]);

  // Expenses Pagination Computations
  const expTotalPages =
    Math.ceil(filteredExpenses.length / expItemsPerPage) || 1;
  const expStartIndex = (expCurrentPage - 1) * expItemsPerPage;
  const expEndIndex = Math.min(
    expStartIndex + expItemsPerPage,
    filteredExpenses.length,
  );
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
            <h1 className="print-company-name">AFRAH CONSTRUCTIONS</h1>
            <p className="print-company-sub">
              Civil Construction, Materials Procurement & Financial ERP
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
              Total Expenses: <strong>{formatINR(totalExpenses)}</strong>
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
              {filteredExpenses.length} Entries ({formatINR(totalExpenses)})
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
                {formatINR(totalExpenses)}
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
      <section className={`afrah-app-table-section client-ledger-split-card${isAddAdvModalOpen || isAddExpModalOpen ? " with-add-popover" : ""}`}>
        <div className="client-details-side-by-side-grid">
          {/* COLUMN 1: ADVANCE PAYMENTS */}
          <div className={`details-column-panel${isAddAdvModalOpen ? " with-add-popover" : ""}`}>
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
                    <th>AMOUNT</th>
                    <th>PAYMENT MODE</th>
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
                          <td className="cell-amount">
                            {formatINR(item.amount)}
                          </td>
                          <td>
                            <span className="payment-mode-tag">
                              {item.mode}
                            </span>
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

            {/* Advance Pagination */}
            {filteredAdvance.length > 0 && (
              <div className="afrah-app-pagination-bar compact no-print">
                <div className="afrah-app-pagination-left">
                  <span className="afrah-app-pagination-info">
                    {advStartIndex + 1}–{advEndIndex} of{" "}
                    {filteredAdvance.length}
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
                        className={`afrah-app-page-num-btn ${advCurrentPage === p ? "active" : ""}`}
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

          {/* COLUMN 2: SITE EXPENSES */}
          <div className={`details-column-panel${isAddExpModalOpen ? " with-add-popover" : ""}`}>
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
                    <label className="afrah-app-label">Expense Category *</label>
                    <SearchableExpenseSelect
                      value={expName}
                      onChange={(val) => setExpName(val)}
                      placeholder="Select or type custom expense..."
                    />
                  </div>
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Quantity *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      placeholder="e.g. 10"
                      value={expQuantity}
                      onChange={(e) => setExpQuantity(e.target.value)}
                      className="afrah-app-input"
                    />
                  </div>
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="e.g. 1500"
                      value={expRate}
                      onChange={(e) => setExpRate(e.target.value)}
                      className="afrah-app-input"
                    />
                  </div>
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">
                      Total Calculated (₹)
                    </label>
                    <div className="total-amount-display">
                      {formatINR(expTotalAmount)}
                    </div>
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
                          <td>
                            <span className="expense-name-tag">
                              {exp.expenseName}
                            </span>
                          </td>
                          <td className="cell-amount">
                            {exp.quantity}
                          </td>
                          <td className="cell-amount">
                            {formatINR(exp.rate)}
                          </td>
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

            {/* Expenses Pagination */}
            {filteredExpenses.length > 0 && (
              <div className="afrah-app-pagination-bar compact no-print">
                <div className="afrah-app-pagination-left">
                  <span className="afrah-app-pagination-info">
                    {expStartIndex + 1}–{expEndIndex} of{" "}
                    {filteredExpenses.length}
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
                        className={`afrah-app-page-num-btn ${expCurrentPage === p ? "active" : ""}`}
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


      {/* MODAL 2: EDIT ADVANCE PAYMENT */}
      {isEditAdvModalOpen && (
        <div
          className="afrah-app-modal-overlay"
          onClick={() => setIsEditAdvModalOpen(false)}
        >
          <div
            className="afrah-app-modal-container modal-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="afrah-app-modal-header">
              <div className="flex-center">
                <Pencil size={17} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Advance Payment</h3>
              </div>
              <button
                onClick={() => setIsEditAdvModalOpen(false)}
                className="afrah-app-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEditAdv}>
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
              </div>
              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditAdvModalOpen(false)}
                  className="afrah-app-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditAdvValid}
                  className="btn-theme-primary"
                >
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 4: EDIT EXPENSE */}
      {isEditExpModalOpen && (
        <div
          className="afrah-app-modal-overlay"
          onClick={() => setIsEditExpModalOpen(false)}
        >
          <div
            className="afrah-app-modal-container modal-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="afrah-app-modal-header">
              <div className="flex-center">
                <Pencil size={17} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Site Expense</h3>
              </div>
              <button
                onClick={() => setIsEditExpModalOpen(false)}
                className="afrah-app-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEditExp}>
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
                  <label className="afrah-app-label">Expense Category *</label>
                  <SearchableExpenseSelect
                    value={editExpName}
                    onChange={(val) => setEditExpName(val)}
                  />
                </div>
                <div className="grid-2-12">
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Quantity *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={editExpQuantity}
                      onChange={(e) => setEditExpQuantity(e.target.value)}
                      className="afrah-app-input"
                    />
                  </div>
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Rate (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={editExpRate}
                      onChange={(e) => setEditExpRate(e.target.value)}
                      className="afrah-app-input"
                    />
                  </div>
                </div>
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Total Calculated (₹)
                  </label>
                  <div className="total-amount-display">
                    {formatINR(editExpTotalAmount)}
                  </div>
                </div>
              </div>
              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditExpModalOpen(false)}
                  className="afrah-app-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditExpValid}
                  className="btn-theme-primary"
                >
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
        itemName={
          deleteAdvTarget
            ? `${deleteAdvTarget.date} — ${formatINR(deleteAdvTarget.amount)} (${deleteAdvTarget.mode})`
            : undefined
        }
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
        itemName={
          deleteExpTarget
            ? `${deleteExpTarget.date} — ${deleteExpTarget.expenseName} (${formatINR(deleteExpTarget.totalAmount)})`
            : undefined
        }
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

      {/* STATEMENT PRINT PREVIEW MODAL */}
      <StatementPrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        client={client}
        advancePayments={filteredAdvance}
        expenses={filteredExpenses}
        initialMode={previewMode}
        fromDate={
          previewMode === "expenses"
            ? expFromDate
            : previewMode === "advances"
              ? advFromDate
              : undefined
        }
        toDate={
          previewMode === "expenses"
            ? expToDate
            : previewMode === "advances"
              ? advToDate
              : undefined
        }
      />
    </div>
  );
};
