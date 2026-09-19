import React, { useState, useMemo, useEffect } from "react";
import type {
  InteriorClient,
  InteriorAdvancePayment,
  InteriorExpenseItem,
} from "../types";
import {
  INTERIOR_CATEGORIES,
  INTERIOR_UNITS,
  PREDEFINED_INTERIOR_ITEMS,
  PREDEFINED_INTERIOR_EXPENSES,
} from "../types";
import { SearchableExpenseSelect } from "../components/SearchableExpenseSelect";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { TableFormPopover } from "../components/TableFormPopover";
import { InteriorClientPrintPreviewModal } from "../components/InteriorClientPrintPreviewModal";
import { resolveInteriorQuoteNo } from "../utils/quoteNo";
import {
  DateInput,
  isValidDate,
  formatToYYYYMMDD,
  formatToDDMMYYYY,
} from "../components/DateInput";
import {
  TrendingDown,
  Plus,
  Pencil,
  Trash2,
  Printer,
  X,
} from "lucide-react";

interface InteriorClientDetailsViewProps {
  client: InteriorClient;
  onBack: () => void;
  onUpdateClient: (updatedClient: InteriorClient) => Promise<any>;
  onAddAdvance: (
    clientId: string,
    advData: Omit<InteriorAdvancePayment, "id" | "sNo">,
  ) => Promise<any>;
  onUpdateAdvance: (
    clientId: string,
    advData: InteriorAdvancePayment,
  ) => Promise<any>;
  onDeleteAdvance: (clientId: string, advId: string) => Promise<any>;
  onDeleteMultipleAdvancePayments?: (
    clientId: string,
    advIds: string[],
  ) => Promise<any>;
  onAddExpense: (
    clientId: string,
    expData: Omit<InteriorExpenseItem, "id" | "sNo">,
  ) => Promise<any>;
  onUpdateExpense: (
    clientId: string,
    expData: InteriorExpenseItem,
  ) => Promise<any>;
  onDeleteExpense: (clientId: string, expId: string) => Promise<any>;
  onDeleteMultipleExpenses?: (
    clientId: string,
    expIds: string[],
  ) => Promise<any>;
}

// Convert numbers to Roman numerals for PDF-style item numbering
const toRomanNumeral = (num: number): string => {
  const romanMap: [number, string][] = [
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let result = "";
  let n = num;
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result || String(num);
};

export const InteriorClientDetailsView: React.FC<
  InteriorClientDetailsViewProps
> = ({
  client,
  onBack: _onBack,
  onUpdateClient,
  onAddAdvance: _onAddAdvance,
  onUpdateAdvance: _onUpdateAdvance,
  onDeleteAdvance: _onDeleteAdvance,
  onDeleteMultipleAdvancePayments: _onDeleteMultipleAdvancePayments,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onDeleteMultipleExpenses,
}) => {
    const expenses = client.expenses || [];

    // ===================== SITE EXPENSES (ESTIMATE) STATE =====================
    const defaultQuoteDate =
      client.quoteDate ||
      client.createdAt?.slice(0, 10) ||
      new Date().toISOString().slice(0, 10);
    const [quoteDate, setQuoteDate] = useState(defaultQuoteDate);
    const [quoteNo, setQuoteNo] = useState(() => resolveInteriorQuoteNo(client));
    const [selectedExpIds, setSelectedExpIds] = useState<Set<string>>(new Set());

    // Add Expense Modal State
    const [isAddExpModalOpen, setIsAddExpModalOpen] = useState(false);
    const [newExpDate, setNewExpDate] = useState(() =>
      new Date().toISOString().slice(0, 10),
    );
    const [newExpCategory, setNewExpCategory] = useState<string>(
      INTERIOR_CATEGORIES[0],
    );
    const [newExpParticulars, setNewExpParticulars] = useState("");
    const [newExpQuantity, setNewExpQuantity] = useState("1");
    const [newExpUnit, setNewExpUnit] = useState<string>("Sq.ft");
    const [newExpRate, setNewExpRate] = useState("");

    // Edit Expense Modal State
    const [isEditExpModalOpen, setIsEditExpModalOpen] = useState(false);
    const [editingExpId, setEditingExpId] = useState<string | null>(null);
    const [editExpDate, setEditExpDate] = useState("");
    const [editExpCategory, setEditExpCategory] = useState<string>(
      INTERIOR_CATEGORIES[0],
    );
    const [editExpParticulars, setEditExpParticulars] = useState("");
    const [editExpQuantity, setEditExpQuantity] = useState("");
    const [editExpUnit, setEditExpUnit] = useState("Sq.ft");
    const [editExpRate, setEditExpRate] = useState("");

    // Delete Expense Modals State
    const [deleteExpTarget, setDeleteExpTarget] =
      useState<InteriorExpenseItem | null>(null);
    const [isDeletingExp, setIsDeletingExp] = useState(false);
    const [isBulkDeleteExpOpen, setIsBulkDeleteExpOpen] = useState(false);
    const [isBulkDeletingExp, setIsBulkDeletingExp] = useState(false);

    const formatINR = (val: number) => {
      return (
        "₹" +
        Number(val || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    };

    // ===================== ESTIMATION =====================
    useEffect(() => {
      setQuoteDate(
        client.quoteDate ||
          client.createdAt?.slice(0, 10) ||
          new Date().toISOString().slice(0, 10),
      );
      setQuoteNo(resolveInteriorQuoteNo(client));
    }, [client.id, client.quoteDate, client.quoteNo, client.createdAt, client.sNo]);

    const handleQuoteDateChange = async (next: string) => {
      setQuoteDate(next);
      const iso = formatToYYYYMMDD(next) || next;
      if (!iso || iso.length < 10) return;
      await onUpdateClient({ ...client, quoteDate: iso, quoteNo });
    };

    const handleQuoteNoBlur = async () => {
      const next = quoteNo.trim() || resolveInteriorQuoteNo(client);
      setQuoteNo(next);
      if (next === (client.quoteNo || "").trim()) return;
      await onUpdateClient({ ...client, quoteDate, quoteNo: next });
    };

    const sortedExpenses = useMemo(
      () => [...expenses].sort((a, b) => (a.sNo || 0) - (b.sNo || 0)),
      [expenses],
    );

    const totalExpensesAmount = sortedExpenses.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0,
    );

    // Group filtered expenses by Category matching the PDF structure
    const groupedExpenses = useMemo(() => {
      const groups: {
        category: string;
        items: InteriorExpenseItem[];
        subtotal: number;
      }[] = [];
      const categoryMap = new Map<string, InteriorExpenseItem[]>();

      sortedExpenses.forEach((exp) => {
        const cat = exp.category || "OTHER WORK";
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, []);
        }
        categoryMap.get(cat)!.push(exp);
      });

      // 1. Defined categories in ordered sequence
      INTERIOR_CATEGORIES.forEach((cat) => {
        if (categoryMap.has(cat)) {
          const items = categoryMap.get(cat)!;
          const subtotal = items.reduce(
            (sum, item) => sum + (Number(item.totalAmount) || 0),
            0,
          );
          groups.push({ category: cat, items, subtotal });
          categoryMap.delete(cat);
        }
      });

      // 2. Any additional custom categories created by the user
      categoryMap.forEach((items, cat) => {
        const subtotal = items.reduce(
          (sum, item) => sum + (Number(item.totalAmount) || 0),
          0,
        );
        groups.push({ category: cat, items, subtotal });
      });

      return groups;
    }, [sortedExpenses]);

    const isAllExpSelected =
      sortedExpenses.length > 0 &&
      sortedExpenses.every((item) => selectedExpIds.has(item.id));

    const isSomeExpSelected = selectedExpIds.size > 0 && !isAllExpSelected;

    const handleToggleSelectAllExp = () => {
      if (isAllExpSelected) {
        setSelectedExpIds(new Set());
      } else {
        setSelectedExpIds(new Set(sortedExpenses.map((e) => e.id)));
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

    // ===================== EXPENSE HANDLERS =====================
    const calculatedNewExpTotal =
      (parseFloat(newExpQuantity) || 0) * (parseFloat(newExpRate) || 0);
    const isAddExpValid =
      isValidDate(newExpDate) &&
      newExpParticulars.trim().length > 0 &&
      parseFloat(newExpQuantity) > 0 &&
      parseFloat(newExpRate) >= 0;

    // Preset Selection auto-fill
    const handleSelectPreset = (
      presetItem: (typeof PREDEFINED_INTERIOR_ITEMS)[0],
    ) => {
      setNewExpCategory(presetItem.category);
      setNewExpParticulars(presetItem.particulars);
      setNewExpUnit(presetItem.unit);
      setNewExpRate(
        presetItem.defaultRate > 0 ? String(presetItem.defaultRate) : "",
      );
    };

    const handleAddExpSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAddExpValid) return;

      const qty = parseFloat(newExpQuantity);
      const rate = parseFloat(newExpRate);
      await onAddExpense(client.id, {
        date: newExpDate,
        category: newExpCategory.trim() || "OTHER WORK",
        expenseName: newExpParticulars.trim(),
        quantity: qty,
        unit: newExpUnit.trim() || "Sq.ft",
        rate: rate,
        totalAmount: qty * rate,
      });

      setNewExpParticulars("");
      setNewExpQuantity("1");
      setNewExpRate("");
      setIsAddExpModalOpen(false);
    };

    const handleOpenEditExp = (
      item: InteriorExpenseItem,
      e: React.MouseEvent,
    ) => {
      e.stopPropagation();
      setEditingExpId(item.id);
      setEditExpDate(item.date);
      setEditExpCategory(item.category || INTERIOR_CATEGORIES[0]);
      setEditExpParticulars(item.expenseName);
      setEditExpQuantity(String(item.quantity));
      setEditExpUnit(item.unit || "Sq.ft");
      setEditExpRate(String(item.rate));
      setIsEditExpModalOpen(true);
    };

    const calculatedEditExpTotal =
      (parseFloat(editExpQuantity) || 0) * (parseFloat(editExpRate) || 0);
    const handleSaveEditExp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !editingExpId ||
        parseFloat(editExpQuantity) <= 0 ||
        parseFloat(editExpRate) < 0
      )
        return;

      const qty = parseFloat(editExpQuantity);
      const rate = parseFloat(editExpRate);
      await onUpdateExpense(client.id, {
        id: editingExpId,
        clientId: client.id,
        sNo: 1,
        date: editExpDate,
        category: editExpCategory.trim() || "OTHER WORK",
        expenseName: editExpParticulars.trim(),
        quantity: qty,
        unit: editExpUnit.trim() || "Sq.ft",
        rate: rate,
        totalAmount: qty * rate,
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

    // Print Statement Preview State
    const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

    // Print Statement Handler - opens preview modal first
    const handlePrint = () => {
      setIsPrintPreviewOpen(true);
    };

    return (
      <div className="client-details-page">
        {/* PRINT-ONLY STATEMENT HEADER */}
        <div className="print-only-statement-header">
          <div className="print-brand-row">
            <div>
              <h1 className="print-company-name">ESTIMATE FOR INTERIOR WORKS</h1>
              <p className="print-company-sub">
                Materials of 16mm MDF with Mica lamination and 6mm Back-panel ply
                with PVC edgeband along with Handles and Hardwares etc.
              </p>
            </div>
            <div className="print-badge-statement">
              <span>KAAB INTERIOR · AFRAH</span>
            </div>
          </div>

          <div className="print-meta-grid">
            <div className="print-meta-box">
              <span className="print-meta-title">TO / CLIENT</span>
              <div className="print-meta-val">
                <strong>{client.name}</strong>
              </div>
              <div className="print-meta-sub">
                Phone: {client.phone} · Address: {client.address}
              </div>
            </div>

            <div className="print-meta-box">
              <span className="print-meta-title">QUOTATION</span>
              <div className="print-meta-sub">
                Quote No: {quoteNo} · Date: {formatToDDMMYYYY(quoteDate)}
              </div>
              <div className="print-meta-val" style={{ marginTop: "4px" }}>
                Estimation Amount: {formatINR(totalExpensesAmount)}
              </div>
            </div>
          </div>

          <div className="print-totals-summary-bar">
            <div className="print-total-item">
              <span>Estimation Amount:</span>{" "}
              <strong style={{ color: "#b45309" }}>
                {formatINR(totalExpensesAmount)}
              </strong>
            </div>
          </div>
        </div>

        {/* Screen Header Bar */}
        <div className="client-details-header no-print">
          <div className="client-details-top-actions">
            <button
              onClick={handlePrint}
              className="afrah-app-back-btn"
              title="Preview and Print Quotation"
            >
              <Printer size={15} />
              <span>Print Preview / Quotation</span>
            </button>
          </div>

          <div className="client-unified-summary-card">
            <div className="client-unified-card-item client-info-item">
              <h1 className="client-unified-name-title">
                <span className="client-unified-label">Client Name :</span>{" "}
                <span className="client-unified-name">{client.name}</span>
              </h1>
            </div>

            <div className="client-unified-card-item metric-item">
              <div className="metric-icon-wrap gold">
                <TrendingDown size={24} />
              </div>
              <div>
                <span className="metric-label">ESTIMATION AMOUNT</span>
                <span className="metric-value gold">
                  {formatINR(totalExpensesAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estimate for Interior Works */}
        <section className={`afrah-app-table-section w-full${isAddExpModalOpen ? " with-add-popover" : ""}`}>
          <div className="afrah-app-section-header no-print">
            <div>
              <h2 className="afrah-app-section-title">
                ESTIMATE FOR INTERIOR WORKS
              </h2>
              <span className="afrah-app-section-subtitle">
                {sortedExpenses.length} items across{" "}
                {groupedExpenses.length} sections · Estimation Amount:{" "}
                <strong className="text-primary-gold">
                  {formatINR(totalExpensesAmount)}
                </strong>
              </span>
            </div>

            <TableFormPopover
              open={isAddExpModalOpen}
              onOpenChange={setIsAddExpModalOpen}
              label="Add Item"
              onOpen={() => {
                setNewExpDate(new Date().toISOString().slice(0, 10));
                setNewExpCategory(INTERIOR_CATEGORIES[0]);
                setNewExpParticulars("");
                setNewExpQuantity("1");
                setNewExpUnit("Sq.ft");
                setNewExpRate("");
              }}
            >
              <form onSubmit={handleAddExpSubmit} className="afrah-app-add-form">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Date *</label>
                  <DateInput
                    required
                    value={newExpDate}
                    onChange={setNewExpDate}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Category / Room Section *
                  </label>
                  <SearchableExpenseSelect
                    value={newExpCategory}
                    onChange={(val) => setNewExpCategory(val)}
                    options={INTERIOR_CATEGORIES}
                    placeholder="Select or type category..."
                    searchPlaceholder="Filter category..."
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Particulars (Item Description) *
                  </label>
                  <SearchableExpenseSelect
                    value={newExpParticulars}
                    onChange={(val) => {
                      setNewExpParticulars(val);
                      const matched = PREDEFINED_INTERIOR_ITEMS.find(
                        (p) =>
                          p.particulars.toLowerCase() === val.toLowerCase(),
                      );
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

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Qty *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    required
                    value={newExpQuantity}
                    onChange={(e) => setNewExpQuantity(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Per (Unit) *</label>
                  <select
                    value={newExpUnit}
                    onChange={(e) => setNewExpUnit(e.target.value)}
                    className="afrah-app-select"
                  >
                    {INTERIOR_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Rate (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="e.g. 1350"
                    value={newExpRate}
                    onChange={(e) => setNewExpRate(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Amount (Total)</label>
                  <div className="total-amount-display">
                    {formatINR(calculatedNewExpTotal)}
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
                    disabled={!isAddExpValid}
                    className="btn-theme-primary"
                  >
                    <span>Save Item</span>
                  </button>
                </div>
              </form>
            </TableFormPopover>
          </div>

          <div className="table-filter-toolbar no-print">
            <div className="filter-toolbar-left">
              <div className="date-filter-group">
                <div className="date-filter-item">
                  <label className="date-filter-label">Quote No</label>
                  <input
                    type="text"
                    value={quoteNo}
                    onChange={(e) => setQuoteNo(e.target.value)}
                    onBlur={handleQuoteNoBlur}
                    className="afrah-app-input"
                    placeholder="Q/2026/001"
                    style={{ minWidth: "140px" }}
                  />
                </div>
                <div className="date-filter-item">
                  <label className="date-filter-label">Quotation Date</label>
                  <DateInput
                    required
                    value={quoteDate}
                    onChange={handleQuoteDateChange}
                    className="afrah-app-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="afrah-app-table-container">
            <table className="afrah-app-table">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: "55px" }}>
                    SI.NO
                  </th>
                  <th>PARTICULARS</th>
                  <th style={{ width: "95px" }}>
                    QTY
                  </th>
                  <th className="text-center" style={{ width: "85px" }}>
                    PER
                  </th>
                  <th style={{ width: "120px" }}>
                    RATE
                  </th>
                  <th style={{ width: "140px" }}>
                    AMOUNT
                  </th>
                  <th
                    className="no-print"
                    style={{ width: "80px", textAlign: "center" }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedExpenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "36px 16px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {'No interior estimate items recorded yet. Click "Add Item" above.'}
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
                            background:
                              "var(--surface-container-high, #1e2126)",
                            padding: "8px 14px",
                            borderTop:
                              groupIdx > 0
                                ? "1px solid var(--border-stroke, #2d3139)"
                                : undefined,
                            borderBottom:
                              "1px solid var(--border-stroke, #2d3139)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div className="flex-center">
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "4px",
                                  background: "rgba(226, 195, 153, 0.15)",
                                  color: "var(--primary)",
                                  fontSize: "11px",
                                  fontWeight: 800,
                                }}
                              >
                                {groupIdx + 1}
                              </span>
                              <span
                                className="row-entity-name"
                                style={{
                                  letterSpacing: "0.04em",
                                  textTransform: "uppercase",
                                }}
                              >
                                {group.category}
                              </span>
                            </div>
                            <span
                              className="cell-meta"
                              style={{ fontWeight: 600 }}
                            >
                              Subtotal:{" "}
                              <strong className="cell-amount">
                                {formatINR(group.subtotal)}
                              </strong>
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* ITEMS UNDER THIS CATEGORY */}
                      {group.items.map((exp, itemIdx) => {
                        return (
                          <tr key={exp.id} className="cursor-default">
                            <td className="cell-sno">
                              {toRomanNumeral(itemIdx + 1)}
                            </td>
                            <td>
                              <span className="row-entity-name">
                                {exp.expenseName}
                              </span>
                            </td>
                            <td className="cell-amount">
                              {exp.quantity}
                            </td>
                            <td
                              className="cell-meta"
                              style={{ textAlign: "center" }}
                            >
                              {exp.unit || "Sq.ft"}
                            </td>
                            <td className="cell-amount">
                              {Number(exp.rate || 0).toLocaleString("en-IN")}
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
                                  onClick={(e) => handleOpenEditExp(exp, e)}
                                  className="afrah-app-action-btn afrah-app-edit-btn"
                                  title="Edit Item"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setDeleteExpTarget(exp)}
                                  className="afrah-app-action-btn afrah-app-delete-btn"
                                  title="Delete Item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}

                {/* FINAL TOTAL ROW AT THE BOTTOM OF THE TABLE */}
                {groupedExpenses.length > 0 && (
                  <tr
                    style={{
                      background: "rgba(226, 195, 153, 0.12)",
                      borderTop: "2px solid var(--primary)",
                    }}
                  >
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "right",
                        fontWeight: 900,
                        fontSize: "var(--fs-sm)",
                        letterSpacing: "0.06em",
                        color: "var(--text-primary)",
                        padding: "12px 16px",
                      }}
                    >
                      ESTIMATION AMOUNT:
                    </td>
                    <td
                      className="cell-amount"
                      style={{ padding: "12px 16px" }}
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


        {isEditExpModalOpen && (
          <div
            className="afrah-app-modal-overlay"
            onClick={() => setIsEditExpModalOpen(false)}
          >
            <div
              className="afrah-app-modal-container"
              style={{ maxWidth: "520px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="afrah-app-modal-header">
                <div className="flex-center">
                  <Pencil size={18} color="var(--primary)" />
                  <h3 className="afrah-app-modal-title">
                    Edit Interior Estimate Item
                  </h3>
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
                  <div className="grid-2-12">
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
                      <label className="afrah-app-label">
                        Category / Room Section *
                      </label>
                      <SearchableExpenseSelect
                        value={editExpCategory}
                        onChange={(val) => setEditExpCategory(val)}
                        options={INTERIOR_CATEGORIES}
                        placeholder="Select or type category..."
                        searchPlaceholder="Filter category..."
                      />
                    </div>
                  </div>

                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">
                      Particulars (Item Description) *
                    </label>
                    <SearchableExpenseSelect
                      value={editExpParticulars}
                      onChange={(val) => {
                        setEditExpParticulars(val);
                        const matched = PREDEFINED_INTERIOR_ITEMS.find(
                          (p) =>
                            p.particulars.toLowerCase() === val.toLowerCase(),
                        );
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

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "10px",
                    }}
                  >
                    <div className="afrah-app-form-group">
                      <label className="afrah-app-label">Qty *</label>
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
                      <label className="afrah-app-label">Per (Unit) *</label>
                      <select
                        value={editExpUnit}
                        onChange={(e) => setEditExpUnit(e.target.value)}
                        className="afrah-app-select"
                      >
                        {INTERIOR_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="afrah-app-form-group">
                      <label className="afrah-app-label">Rate (₹) *</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={editExpRate}
                        onChange={(e) => setEditExpRate(e.target.value)}
                        className="afrah-app-input"
                      />
                    </div>
                  </div>

                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Amount (Total)</label>
                    <div className="total-amount-display">
                      {formatINR(calculatedEditExpTotal)}
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
                    disabled={!editExpParticulars || parseFloat(editExpRate) < 0}
                    className="btn-theme-primary"
                  >
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONFIRM DELETE EXPENSE MODAL */}
        <ConfirmDeleteModal
          isOpen={Boolean(deleteExpTarget)}
          title="Delete Estimate Item"
          message="Are you sure you want to delete this estimate item? The estimation amount will be recalculated."
          itemName={
            deleteExpTarget
              ? `${deleteExpTarget.category ? `[${deleteExpTarget.category}] ` : ""}${deleteExpTarget.expenseName} (${formatINR(deleteExpTarget.totalAmount)})`
              : undefined
          }
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

        {/* INTERIOR CLIENT STATEMENT PRINT PREVIEW MODAL */}
        <InteriorClientPrintPreviewModal
          isOpen={isPrintPreviewOpen}
          onClose={() => setIsPrintPreviewOpen(false)}
          client={{ ...client, quoteDate, quoteNo }}
          expenses={sortedExpenses}
        />
      </div>
    );
  };
