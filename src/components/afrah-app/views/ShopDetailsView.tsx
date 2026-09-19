import React, { useState, useMemo } from "react";
import type { Vendor, VendorShop, ShopTransaction } from "../types";
import { VENDOR_MATERIAL_PRESETS, COMMON_MATERIAL_PRESETS } from "../types";
import { SearchableExpenseSelect } from "../components/SearchableExpenseSelect";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { TableFormPopover } from "../components/TableFormPopover";
import { ShopPrintPreviewModal } from "../components/ShopPrintPreviewModal";
import {
  DateInput,
  isValidDate,
  formatToDDMMYYYY,
  compareByDateDesc,
} from "../components/DateInput";
import { newId } from "@/lib/id";
import {
  Wallet,
  TrendingDown,
  Scale,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  ArrowDownLeft,
  Printer,
} from "lucide-react";

interface ShopDetailsViewProps {
  vendor: Vendor;
  shop: VendorShop;
  clientOptions?: string[];
  onBack: () => void;
  onUpdateShop: (updatedShop: VendorShop) => void;
  onAddTransaction?: (
    categoryId: string,
    shopId: string,
    txData: Omit<ShopTransaction, "id" | "sNo">,
  ) => Promise<any>;
  onUpdateTransaction?: (
    categoryId: string,
    shopId: string,
    txData: ShopTransaction,
  ) => Promise<any>;
  onDeleteTransaction?: (
    categoryId: string,
    shopId: string,
    txId: string,
  ) => Promise<any>;
  onDeleteMultipleShopTransactions?: (
    categoryId: string,
    shopId: string,
    txIds: string[],
  ) => Promise<any>;
}

export const ShopDetailsView: React.FC<ShopDetailsViewProps> = ({
  vendor,
  shop,
  clientOptions = [],
  onBack: _onBack,
  onUpdateShop,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onDeleteMultipleShopTransactions,
}) => {
  const transactions = shop.transactions || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk Delete Modal State
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Add Details popover
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Purchase Form State
  const [txDate, setTxDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [txItemType, setTxItemType] = useState("");
  const [txClientName, setTxClientName] = useState("");
  const [txQuantity, setTxQuantity] = useState("");
  const [txRate, setTxRate] = useState("");
  const [txTotal, setTxTotal] = useState("");
  const [txReceived, setTxReceived] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editTxDate, setEditTxDate] = useState("");
  const [editTxItemType, setEditTxItemType] = useState("");
  const [editTxClientName, setEditTxClientName] = useState("");
  const [editTxQuantity, setEditTxQuantity] = useState("");
  const [editTxRate, setEditTxRate] = useState("");
  const [editTxTotal, setEditTxTotal] = useState("");
  const [editTxReceived, setEditTxReceived] = useState("");

  // Delete Modal State
  const [deleteTxTarget, setDeleteTxTarget] = useState<ShopTransaction | null>(
    null,
  );
  const [isDeletingTx, setIsDeletingTx] = useState(false);

  // Contextual material/item presets based on vendor category and past shop transactions
  const itemOptions = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    const add = (val?: string) => {
      const trimmed = val?.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (lower === "settlement" || lower.includes("settlement")) return;
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push(trimmed);
      }
    };

    // 1. Items already logged in this shop (highest relevance)
    (shop.transactions || []).forEach((t) => add(t.itemType));

    // 2. Items logged in sibling shops under the same vendor
    (vendor.shops || []).forEach((s) => {
      (s.transactions || []).forEach((t) => add(t.itemType));
    });

    // 3. Category presets for this vendor's type (e.g. Bricks, Cement, Steel, etc.)
    if (vendor.type && VENDOR_MATERIAL_PRESETS[vendor.type]) {
      VENDOR_MATERIAL_PRESETS[vendor.type].forEach(add);
    }

    // 4. Common construction materials fallback
    COMMON_MATERIAL_PRESETS.forEach(add);

    return list;
  }, [vendor, shop]);

  const parseOptionalNumber = (val: string) => {
    if (val.trim() === "") return 0;
    const n = parseFloat(val);
    return Number.isNaN(n) ? 0 : n;
  };

  const syncTotalFromQtyRate = (
    qtyStr: string,
    rateStr: string,
    setTotal: (value: string) => void,
  ) => {
    if (qtyStr.trim() === "" || rateStr.trim() === "") return;
    const qty = parseFloat(qtyStr);
    const rate = parseFloat(rateStr);
    if (!Number.isNaN(qty) && !Number.isNaN(rate)) {
      setTotal(String(qty * rate));
    }
  };

  const qtyRateTotal =
    parseOptionalNumber(txQuantity) * parseOptionalNumber(txRate);
  const calculatedTotal =
    txTotal.trim() === "" ? qtyRateTotal : parseOptionalNumber(txTotal);
  const calculatedBalance = calculatedTotal - parseOptionalNumber(txReceived);

  const editQtyRateTotal =
    parseOptionalNumber(editTxQuantity) * parseOptionalNumber(editTxRate);
  const editCalculatedTotal =
    editTxTotal.trim() === ""
      ? editQtyRateTotal
      : parseOptionalNumber(editTxTotal);
  const editCalculatedBalance =
    editCalculatedTotal - parseOptionalNumber(editTxReceived);

  // All fields are optional; only block save if a date was entered but is invalid
  const isAddValid = !txDate || isValidDate(txDate);
  const isEditValid = !editTxDate || isValidDate(editTxDate);

  // Filter transactions by search query
  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (tx) =>
          (tx.itemType || "").toLowerCase().includes(q) ||
          (tx.clientName && tx.clientName.toLowerCase().includes(q)) ||
          tx.date.includes(q) ||
          formatToDDMMYYYY(tx.date).includes(q) ||
          String(tx.quantity).includes(q) ||
          String(tx.rate).includes(q) ||
          String(tx.totalAmount).includes(q) ||
          String(tx.receivedAmount).includes(q) ||
          String(tx.balanceAmount).includes(q) ||
          String(tx.sNo).includes(q),
      );
    }
    return [...list].sort((a, b) =>
      compareByDateDesc(a.date, b.date, a.sNo, b.sNo),
    );
  }, [transactions, searchQuery]);

  // Financial summary computations
  const totalPurchase = filteredTransactions.reduce(
    (sum, tx) => sum + (tx.totalAmount || 0),
    0,
  );
  const totalReceived = filteredTransactions.reduce(
    (sum, tx) => sum + (tx.receivedAmount || 0),
    0,
  );
  const totalBalance = Math.max(0, totalPurchase - totalReceived);

  const formatINR = (val: number) => {
    return "₹" + Number(val || 0).toLocaleString("en-IN");
  };

  // Multi-select Checkbox Handlers
  const isAllSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((tx) => selectedTxIds.has(tx.id));

  const isSomeSelected = selectedTxIds.size > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(filteredTransactions.map((tx) => tx.id)));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTxIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk Delete Confirmation
  const handleConfirmBulkDelete = async () => {
    if (selectedTxIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      if (onDeleteMultipleShopTransactions) {
        await onDeleteMultipleShopTransactions(
          vendor.id,
          shop.id,
          Array.from(selectedTxIds),
        );
      } else if (onDeleteTransaction) {
        for (const id of selectedTxIds) {
          await onDeleteTransaction(vendor.id, shop.id, id);
        }
      }
      setSelectedTxIds(new Set());
      setIsBulkDeleteOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Print Statement Preview State
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Print Statement Handler - opens preview modal first
  const handlePrint = () => {
    setIsPrintPreviewOpen(true);
  };

  // Historical settlement records (created before Add Record unified the form)
  const isSettlementTx = (tx: ShopTransaction) =>
    (tx.itemType || "").toLowerCase().includes("settlement");

  // Pagination computations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredTransactions.length,
  );
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  const resetAddForm = () => {
    setTxDate(new Date().toISOString().slice(0, 10));
    setTxItemType("");
    setTxClientName("");
    setTxQuantity("");
    setTxRate("");
    setTxTotal("");
    setTxReceived("");
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleAddTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddValid) return;

    const qty = parseOptionalNumber(txQuantity);
    const rate = parseOptionalNumber(txRate);
    const received = parseOptionalNumber(txReceived);
    const total =
      txTotal.trim() === "" ? qty * rate : parseOptionalNumber(txTotal);
    const balance = total - received;
    const date = isValidDate(txDate)
      ? txDate
      : new Date().toISOString().slice(0, 10);

    const txPayload = {
      date,
      itemType: txItemType.trim(),
      clientName: txClientName.trim() || undefined,
      quantity: qty,
      rate,
      totalAmount: total,
      receivedAmount: received,
      balanceAmount: balance,
    };

    if (onAddTransaction) {
      await onAddTransaction(vendor.id, shop.id, txPayload);
    } else {
      const newTx: ShopTransaction = {
        id: newId(),
        sNo: transactions.length + 1,
        ...txPayload,
      };

      onUpdateShop({
        ...shop,
        transactions: [...transactions, newTx],
      });
    }

    resetAddForm();
    setIsAddFormOpen(false);
    setCurrentPage(1);
  };

  const handleOpenEdit = (tx: ShopTransaction) => {
    setEditingTxId(tx.id);
    setEditTxDate(tx.date);
    setEditTxItemType(tx.itemType || "");
    setEditTxClientName(tx.clientName || "");
    setEditTxQuantity(tx.quantity ? String(tx.quantity) : "");
    setEditTxRate(tx.rate ? String(tx.rate) : "");
    setEditTxTotal(tx.totalAmount ? String(tx.totalAmount) : "");
    setEditTxReceived(tx.receivedAmount ? String(tx.receivedAmount) : "");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditValid || !editingTxId) return;

    const qty = parseOptionalNumber(editTxQuantity);
    const rate = parseOptionalNumber(editTxRate);
    const received = parseOptionalNumber(editTxReceived);
    const total =
      editTxTotal.trim() === "" ? qty * rate : parseOptionalNumber(editTxTotal);
    const balance = total - received;
    const date = isValidDate(editTxDate)
      ? editTxDate
      : new Date().toISOString().slice(0, 10);

    const updatedTx: ShopTransaction = {
      id: editingTxId,
      sNo: transactions.find((t) => t.id === editingTxId)?.sNo || 1,
      date,
      itemType: editTxItemType.trim(),
      clientName: editTxClientName.trim() || undefined,
      quantity: qty,
      rate,
      totalAmount: total,
      receivedAmount: received,
      balanceAmount: balance,
    };

    if (onUpdateTransaction) {
      await onUpdateTransaction(vendor.id, shop.id, updatedTx);
    } else {
      const updated = transactions.map((t) =>
        t.id === editingTxId ? updatedTx : t,
      );

      onUpdateShop({
        ...shop,
        transactions: updated,
      });
    }

    setIsEditModalOpen(false);
    setEditingTxId(null);
  };

  // Handle Confirm Delete Transaction
  const handleConfirmDeleteTransaction = async () => {
    if (!deleteTxTarget) return;
    setIsDeletingTx(true);
    try {
      if (onDeleteTransaction) {
        await onDeleteTransaction(vendor.id, shop.id, deleteTxTarget.id);
      } else {
        const updated = transactions
          .filter((t) => t.id !== deleteTxTarget.id)
          .map((t, idx) => ({ ...t, sNo: idx + 1 }));

        onUpdateShop({
          ...shop,
          transactions: updated,
        });
      }
    } finally {
      setIsDeletingTx(false);
      setDeleteTxTarget(null);
    }
  };

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
            <span>VENDOR SUPPLIER STATEMENT</span>
          </div>
        </div>

        <div className="print-meta-grid">
          <div className="print-meta-box">
            <span className="print-meta-title">SHOP / SUPPLIER DETAILS</span>
            <div className="print-meta-val">
              <strong>{shop.name}</strong>
            </div>
            <div className="print-meta-sub">
              Category: {vendor.type} Supplier
            </div>
            <div className="print-meta-sub">
              Phone: {shop.phone} · Address: {shop.address}
            </div>
          </div>

          <div className="print-meta-box">
            <span className="print-meta-title">STATEMENT SUMMARY</span>
            <div className="print-meta-sub">
              Period: <strong>All Recorded Transactions</strong>
            </div>
            <div className="print-meta-sub">
              Generated:{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div
              className="print-meta-val"
              style={{
                marginTop: "4px",
                color: totalBalance > 0 ? "#b91c1c" : "#15803d",
              }}
            >
              Pending Balance: {formatINR(totalBalance)}
            </div>
          </div>
        </div>

        {/* Print Summary Totals Row */}
        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Total Records:</span>{" "}
            <strong>{filteredTransactions.length} Transactions</strong>
          </div>
          <div className="print-total-item">
            <span>Total Purchases:</span>{" "}
            <strong>{formatINR(totalPurchase)}</strong>
          </div>
          <div className="print-total-item">
            <span>Amount Settled / Paid:</span>{" "}
            <strong>{formatINR(totalReceived)}</strong>
          </div>
          <div className="print-total-item">
            <span>Outstanding Balance:</span>{" "}
            <strong style={{ color: totalBalance > 0 ? "#b91c1c" : "#15803d" }}>
              {formatINR(totalBalance)}
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
            title="Preview and Print Statement"
          >
            <Printer size={15} />
            <span>Print Preview / Statement</span>
          </button>
        </div>

        <div className="client-unified-summary-card">
          <div className="client-unified-card-item client-info-item">
            <h1 className="client-unified-name-title">
              <span className="client-unified-label">Vendor:</span>{" "}
              <span className="client-unified-name">{shop.name}</span>
            </h1>
          </div>

          <div className="client-unified-card-item metric-item">
            <div className="metric-icon-wrap gold">
              <Wallet size={24} />
            </div>
            <div>
              <span className="metric-label">TOTAL PURCHASES</span>
              <span className="metric-value gold">
                {formatINR(totalPurchase)}
              </span>
            </div>
          </div>

          <div className="client-unified-card-item metric-item">
            <div className="metric-icon-wrap blue">
              <TrendingDown size={24} />
            </div>
            <div>
              <span className="metric-label">AMOUNT PAID / SETTLED</span>
              <span className="metric-value blue">
                {formatINR(totalReceived)}
              </span>
            </div>
          </div>

          <div className="client-unified-card-item metric-item">
            <div
              className={`metric-icon-wrap ${totalBalance > 0 ? "red" : "green"}`}
            >
              <Scale size={24} />
            </div>
            <div>
              <span className="metric-label">
                {totalBalance > 0 ? "OUTSTANDING BALANCE" : "FULLY SETTLED"}
              </span>
              <span
                className={`metric-value ${totalBalance > 0 ? "red" : "green"}`}
              >
                {formatINR(totalBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table Section */}
      <section
        className={`afrah-app-table-section${isAddFormOpen ? " with-add-popover" : ""}`}
      >
        <div className="afrah-app-section-header no-print">
          <div>
            <h2 className="afrah-app-section-title">
              MATERIAL PROCUREMENT & SETTLEMENT LEDGER
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <TableFormPopover
              open={isAddFormOpen}
              onOpenChange={setIsAddFormOpen}
              label="Add Details"
              onOpen={resetAddForm}
            >
              <form
                onSubmit={handleAddTransactionSubmit}
                className="afrah-app-add-form"
              >
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Date</label>
                  <DateInput
                    value={txDate}
                    onChange={setTxDate}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Client / Site Tag
                  </label>
                  <SearchableExpenseSelect
                    value={txClientName}
                    onChange={(val) => setTxClientName(val)}
                    options={clientOptions}
                    placeholder="Allocate to client..."
                    searchPlaceholder="Search client name..."
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Item / Material Description
                  </label>
                  <SearchableExpenseSelect
                    value={txItemType}
                    onChange={(val) => setTxItemType(val)}
                    options={itemOptions}
                    placeholder="e.g. Wirecut Red Bricks Grade A"
                    searchPlaceholder="Search or type description..."
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 5000"
                    value={txQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTxQuantity(val);
                      syncTotalFromQtyRate(val, txRate, setTxTotal);
                    }}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Rate per Unit (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 12"
                    value={txRate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTxRate(val);
                      syncTotalFromQtyRate(txQuantity, val, setTxTotal);
                    }}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={txTotal}
                    onChange={(e) => setTxTotal(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Paid (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={txReceived}
                    onChange={(e) => setTxReceived(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Balance Remaining (₹)
                  </label>
                  <div
                    className="total-amount-display"
                    style={{
                      color: calculatedBalance > 0 ? "#f87171" : "#4ade80",
                    }}
                  >
                    {formatINR(calculatedBalance)}
                  </div>
                </div>

                <div className="afrah-app-add-popover-actions">
                  <button
                    type="button"
                    onClick={handleCloseAddForm}
                    className="afrah-app-back-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isAddValid}
                    className="btn-theme-primary"
                  >
                    <Plus size={16} />
                    <span>Save Details</span>
                  </button>
                </div>
              </form>
            </TableFormPopover>
          </div>
        </div>

        {/* Ledger Table: S.NO, DATE, TYPE, CLIENT NAME, QTY, RATE, TOTAL, PAID, BALANCE */}
        <div className="afrah-app-table-container">
          <table className="afrah-app-table has-col-separators">
            <thead>
              <tr>
                <th style={{ width: "45px", textAlign: "center" }}>S.NO</th>
                <th className="col-divider" style={{ width: "104px" }}>
                  DATE
                </th>
                <th className="col-divider" style={{ width: "220px" }}>
                  TYPE / ITEM DESCRIPTION
                </th>
                <th className="col-divider" style={{ width: "180px" }}>
                  CLIENT / SITE TAG
                </th>
                <th className="col-metric">QTY</th>
                <th className="col-metric">RATE</th>
                <th className="col-metric">TOTAL</th>
                <th className="col-metric">PAID</th>
                <th className="col-metric">BALANCE</th>
                <th
                  className="no-print"
                  style={{ width: "70px", textAlign: "center" }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      textAlign: "center",
                      padding: "40px 16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {searchQuery
                      ? "No matching transactions."
                      : 'No entries logged for this shop yet. Use "Add Details" above.'}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, index) => {
                  const isSettlement = isSettlementTx(tx);
                  return (
                    <tr
                      key={tx.id}
                      style={{
                        background: isSettlement
                          ? "rgba(16, 185, 129, 0.04)"
                          : undefined,
                        cursor: "default",
                      }}
                    >
                      <td className="cell-sno">
                        {startIndex + index + 1}
                      </td>
                      <td className="cell-date col-divider">
                        {formatToDDMMYYYY(tx.date)}
                      </td>
                      <td className="col-divider">
                        {isSettlement ? (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 9px",
                                borderRadius: "6px",
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#34d399",
                                border: "1px solid rgba(52, 211, 153, 0.3)",
                                fontSize: "var(--fs-2xs)",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                              }}
                            >
                              <ArrowDownLeft size={12} strokeWidth={2.5} />
                              Settlement
                            </span>
                            {tx.itemType !== "Settlement" &&
                              tx.itemType
                                .replace(/^Settlement\s*[-–:]?\s*/i, "")
                                .trim() && (
                                <span
                                  style={{
                                    fontSize: "var(--fs-sm)",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  (
                                  {tx.itemType
                                    .replace(/^Settlement\s*[-–:]?\s*/i, "")
                                    .trim()}
                                  )
                                </span>
                              )}
                          </div>
                        ) : tx.itemType ? (
                          <span className="expense-name-tag">
                            {tx.itemType}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "var(--fs-sm)",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="col-divider">
                        {tx.clientName ? (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <User size={12} color="var(--primary)" />
                            <span className="row-entity-name">
                              {tx.clientName}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="cell-meta"
                            style={{
                              fontStyle: "italic",
                            }}
                          >
                            {isSettlement
                              ? "General Account Settlement"
                              : "General Stock"}
                          </span>
                        )}
                      </td>
                      <td
                        className="cell-amount col-metric"
                        style={{
                          color:
                            !tx.quantity || isSettlement
                              ? "var(--text-secondary)"
                              : undefined,
                        }}
                      >
                        {tx.quantity ? tx.quantity : "—"}
                      </td>
                      <td className="cell-amount col-metric">
                        {tx.rate ? formatINR(tx.rate) : "—"}
                      </td>
                      <td className="cell-amount col-metric">
                        {tx.totalAmount ? formatINR(tx.totalAmount) : "—"}
                      </td>
                      <td className="cell-amount col-metric">
                        {formatINR(tx.receivedAmount)}
                      </td>
                      <td className="cell-amount col-metric">
                        {isSettlement ? (
                          <span>- {formatINR(tx.receivedAmount)}</span>
                        ) : (
                          <span>{formatINR(tx.balanceAmount)}</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="afrah-app-action-btn afrah-app-edit-btn"
                            title="Edit Record"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTxTarget(tx)}
                            className="afrah-app-action-btn afrah-app-delete-btn"
                            title="Delete Record"
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

        {/* Pagination Bar */}
        {filteredTransactions.length > 0 && (
          <div className="afrah-app-pagination-bar">
            <div className="afrah-app-pagination-left">
              <span className="afrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–
                <strong>{endIndex}</strong> of{" "}
                <strong>{filteredTransactions.length}</strong>
              </span>

              <div className="afrah-app-rows-selector">
                <label className="afrah-app-rows-label">Rows per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
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
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="afrah-app-page-nav-btn"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="afrah-app-page-numbers-wrap">
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`afrah-app-page-num-btn ${currentPage === p ? "active" : ""}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="afrah-app-page-nav-btn"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* EDIT RECORD MODAL */}
      {isEditModalOpen && (
        <div
          className="afrah-app-modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="afrah-app-modal-container"
            style={{ maxWidth: "540px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="afrah-app-modal-header">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Pencil size={17} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Record</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="afrah-app-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Date</label>
                  <DateInput
                    value={editTxDate}
                    onChange={setEditTxDate}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Client / Site Tag</label>
                  <SearchableExpenseSelect
                    value={editTxClientName}
                    onChange={(val) => setEditTxClientName(val)}
                    options={clientOptions}
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Item / Material Description
                  </label>
                  <SearchableExpenseSelect
                    value={editTxItemType}
                    onChange={(val) => setEditTxItemType(val)}
                    options={itemOptions}
                    placeholder="e.g. Wirecut Red Bricks Grade A"
                    searchPlaceholder="Search or type description..."
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={editTxQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditTxQuantity(val);
                      syncTotalFromQtyRate(val, editTxRate, setEditTxTotal);
                    }}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Rate per Unit (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={editTxRate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditTxRate(val);
                      syncTotalFromQtyRate(
                        editTxQuantity,
                        val,
                        setEditTxTotal,
                      );
                    }}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Total Amount (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={editTxTotal}
                    onChange={(e) => setEditTxTotal(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Paid (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={editTxReceived}
                    onChange={(e) => setEditTxReceived(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Balance Remaining (₹)
                  </label>
                  <div
                    className="total-amount-display"
                    style={{
                      color: editCalculatedBalance > 0 ? "#f87171" : "#4ade80",
                    }}
                  >
                    {formatINR(editCalculatedBalance)}
                  </div>
                </div>
              </div>

              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="afrah-app-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditValid}
                  className="btn-theme-primary"
                >
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM SINGLE DELETE TRANSACTION / SETTLEMENT MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTxTarget)}
        title={
          deleteTxTarget && isSettlementTx(deleteTxTarget)
            ? "Delete Settlement Payment"
            : "Delete Purchase Record"
        }
        message="Are you sure you want to delete this ledger record? The supplier's outstanding balance will be recalculated immediately."
        itemName={
          deleteTxTarget
            ? `${deleteTxTarget.date} — ${deleteTxTarget.itemType} (${formatINR(deleteTxTarget.totalAmount || deleteTxTarget.receivedAmount)})`
            : undefined
        }
        confirmText="Delete Record"
        isDeleting={isDeletingTx}
        onConfirm={handleConfirmDeleteTransaction}
        onClose={() => setDeleteTxTarget(null)}
      />

      {/* CONFIRM BULK DELETE TRANSACTIONS MODAL */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteOpen}
        title="Delete Selected Ledger Records"
        message={`Are you sure you want to delete ${selectedTxIds.size} selected ledger entries? The supplier's balances will be recalculated immediately.`}
        confirmText={`Delete ${selectedTxIds.size} Records`}
        isDeleting={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setIsBulkDeleteOpen(false)}
      />

      {/* VENDOR SHOP STATEMENT PRINT PREVIEW MODAL */}
      <ShopPrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        vendor={vendor}
        shop={shop}
        transactions={filteredTransactions}
        totalPurchase={totalPurchase}
        totalReceived={totalReceived}
        totalBalance={totalBalance}
      />
    </div>
  );
};
