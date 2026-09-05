import React, { useState, useMemo } from 'react';
import type { BrickStockItem, BrickStockItemEntry } from '../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  Boxes,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
  RotateCcw,
  Check,
  ArrowDownRight,
  ArrowRightLeft
} from 'lucide-react';

interface BricksStockItemDetailViewProps {
  item: BrickStockItem;
  onBack?: () => void;
  onUpdateStockItem: (updated: BrickStockItem) => Promise<any>;
  onAddEntry: (
    itemId: string,
    entryData: {
      date: string;
      currentProduction?: number;
      sales?: number;
      materialUsage?: number;
      materialInflow?: number;
    }
  ) => Promise<any>;
  onUpdateEntry: (itemId: string, updatedEntry: BrickStockItemEntry) => Promise<any>;
  onDeleteEntry: (itemId: string, entryId: string) => Promise<any>;
  onDeleteMultipleEntries?: (itemId: string, entryIds: string[]) => Promise<any>;
}

export const BricksStockItemDetailView: React.FC<BricksStockItemDetailViewProps> = ({
  item,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry
}) => {
  const isBricks = item.item.toLowerCase() === 'bricks';
  const unitLabel = item.unitName || (isBricks ? 'Units' : 'Units / kg');
  const entries = item.entries || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form State (Date, Production/Sales for Bricks, Material Usage for Raw Materials)
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entryProduction, setEntryProduction] = useState('');
  const [entrySales, setEntrySales] = useState('');
  const [entryUsage, setEntryUsage] = useState('');

  // Edit Entry Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editOpening, setEditOpening] = useState(0);
  const [editProduction, setEditProduction] = useState('');
  const [editSales, setEditSales] = useState('');
  const [editUsage, setEditUsage] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<BrickStockItemEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live Auto-Calculated Balances
  const carriedOpening = Number(item.pendingStock) || 0;

  // Add Form Preview
  const addProdNum = parseFloat(entryProduction) || 0;
  const addSalesNum = parseFloat(entrySales) || 0;
  const addUsageNum = parseFloat(entryUsage) || 0;

  const previewNewPending = isBricks
    ? carriedOpening + addProdNum - addSalesNum
    : carriedOpening - addUsageNum;

  // Edit Form Preview
  const editProdNum = parseFloat(editProduction) || 0;
  const editSalesNum = parseFloat(editSales) || 0;
  const editUsageNum = parseFloat(editUsage) || 0;

  const editPreviewPending = isBricks
    ? editOpening + editProdNum - editSalesNum
    : editOpening - editUsageNum;

  // Validations
  const isAddValid =
    entryDate.trim().length > 0 &&
    (isBricks
      ? entryProduction !== '' || entrySales !== ''
      : entryUsage !== '');

  const isEditValid =
    editDate.trim().length > 0 &&
    (isBricks
      ? editProduction !== '' || editSales !== ''
      : editUsage !== '');

  // Handle Add Entry Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddValid) return;

    if (isBricks) {
      await onAddEntry(item.id, {
        date: entryDate,
        currentProduction: addProdNum,
        sales: addSalesNum
      });
    } else {
      await onAddEntry(item.id, {
        date: entryDate,
        materialUsage: addUsageNum,
        sales: addUsageNum,
        currentProduction: 0
      });
    }

    // Reset Form
    setEntryProduction('');
    setEntrySales('');
    setEntryUsage('');
    setCurrentPage(1);
  };

  // Handle Clear Add Form
  const handleClearAddForm = () => {
    setEntryProduction('');
    setEntrySales('');
    setEntryUsage('');
  };

  // Open Edit Modal
  const handleOpenEdit = (entry: BrickStockItemEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntryId(entry.id);
    setEditDate(entry.date);
    setEditOpening(entry.stockOpening !== undefined ? entry.stockOpening : 0);
    setEditProduction(entry.currentProduction !== undefined ? entry.currentProduction.toString() : '0');
    setEditSales(entry.sales !== undefined ? entry.sales.toString() : '0');
    setEditUsage(
      entry.materialUsage !== undefined
        ? entry.materialUsage.toString()
        : entry.sales !== undefined
        ? entry.sales.toString()
        : '0'
    );
    setIsEditModalOpen(true);
  };

  // Save Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditValid || !editingEntryId) return;

    const target = entries.find((x) => x.id === editingEntryId);
    if (!target) return;

    if (isBricks) {
      await onUpdateEntry(item.id, {
        ...target,
        date: editDate,
        stockOpening: editOpening,
        currentProduction: editProdNum,
        sales: editSalesNum,
        pendingStock: editPreviewPending,
        balanceAfter: editPreviewPending
      });
    } else {
      await onUpdateEntry(item.id, {
        ...target,
        date: editDate,
        stockOpening: editOpening,
        materialUsage: editUsageNum,
        sales: editUsageNum,
        currentProduction: 0,
        pendingStock: editPreviewPending,
        balanceAfter: editPreviewPending
      });
    }

    setIsEditModalOpen(false);
    setEditingEntryId(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteEntry(item.id, deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    let list = entries;

    if (fromDate) {
      list = list.filter((e) => e.date >= fromDate);
    }
    if (toDate) {
      list = list.filter((e) => e.date <= toDate);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.date.includes(q) ||
          (e.item && e.item.toLowerCase().includes(q)) ||
          String(e.stockOpening).includes(q) ||
          String(e.currentProduction).includes(q) ||
          String(e.sales).includes(q) ||
          String(e.materialUsage).includes(q) ||
          String(e.pendingStock).includes(q) ||
          String(e.sNo).includes(q)
      );
    }

    return list;
  }, [entries, fromDate, toDate, searchQuery]);

  // Pagination computations
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredEntries.length);
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TOP HEADER & KPI SUMMARY BAR */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Title Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(226, 195, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(226, 195, 153, 0.3)'
              }}
            >
              <Boxes size={20} color="var(--primary)" />
            </div>
            <div>
              <h1 className="aftrah-app-section-title" style={{ fontSize: '20px', letterSpacing: '0.04em' }}>
                {item.item.toUpperCase()} STOCK REGISTER
              </h1>
              <span className="aftrah-app-section-subtitle">
                {isBricks
                  ? 'Detailed Stock Opening, Production, Sales & Pending Register for Bricks'
                  : `Detailed Stock Opening, Material Usage & Pending Register for ${item.item}`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              className="aftrah-app-back-btn"
              title="Print Item Stock Statement"
            >
              <Printer size={15} />
              <span>Print Statement</span>
            </button>
          </div>
        </div>

        {/* 2 KPI Summary Cards: TOTAL SALES/USAGE & PENDING STOCK */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}
        >
          {/* Card 1: Total Sales (Bricks) OR Total Material Usage (Soil, Msand, Wood, Diesel) */}
          <div
            style={{
              background: 'var(--surface-container-low, #181b1f)',
              border: '1px solid var(--border-stroke, #252830)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f87171' }}>
                {isBricks ? 'Total Sales' : 'Total Material Usage'}
              </span>
              <ArrowDownRight size={16} color="#f87171" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#f87171', fontFamily: 'Cinzel, serif' }}>
              {Number(item.materialUsage !== undefined ? item.materialUsage : item.sales || 0).toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {isBricks ? 'Total Dispatched / Sold Units' : 'Total Material Consumed in Kiln / Production'}
            </span>
          </div>

          {/* Card 2: Pending Stock */}
          <div
            style={{
              background: 'rgba(226, 195, 153, 0.08)',
              border: '1px solid rgba(226, 195, 153, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)' }}>
                Pending Stock
              </span>
              <Boxes size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Cinzel, serif' }}>
              {Number(item.pendingStock || 0).toLocaleString('en-IN')} Units
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {isBricks ? 'Opening + Prod - Sales' : 'Opening - Material Usage'}
            </span>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">KABIBULLAH BRICKS</h1>
            <p className="print-company-sub">
              {isBricks
                ? 'Stock Register & Sales Ledger: Bricks'
                : `Material Register & Consumption Ledger: ${item.item}`}
            </p>
          </div>
          <div className="print-badge-statement">
            <span>{item.item.toUpperCase()} STOCK REGISTER</span>
          </div>
        </div>

        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Stock Opening:</span> <strong>{Number(item.stockOpening).toLocaleString('en-IN')}</strong>
          </div>
          <div className="print-total-item">
            <span>{isBricks ? 'Total Sales:' : 'Total Usage:'}</span>{' '}
            <strong>{Number(item.materialUsage || item.sales || 0).toLocaleString('en-IN')}</strong>
          </div>
          <div className="print-total-item">
            <span>Pending Stock:</span> <strong style={{ color: '#16a34a' }}>{Number(item.pendingStock).toLocaleString('en-IN')} Units</strong>
          </div>
        </div>
      </div>

      {/* SIDE-BY-SIDE WIREFRAME LAYOUT */}
      <div className="aftrah-app-wireframe-layout">
        {/* LEFT COLUMN: STOCK REGISTER TABLE */}
        <section className="aftrah-app-table-section">
          <div className="aftrah-app-section-header no-print">
            <div>
              <h2 className="aftrah-app-section-title" style={{ fontSize: '15px' }}>
                STOCK REGISTER
              </h2>
              <span className="aftrah-app-section-subtitle">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} recorded · Opening balances carry forward automatically
              </span>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="aftrah-app-search-wrapper" style={{ minWidth: '220px' }}>
                <Search size={14} className="aftrah-app-search-icon" />
                <input
                  type="text"
                  placeholder="Search date, usage, stock..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="aftrah-app-search-input"
                />
              </div>
            </div>
          </div>

          {/* TABLE RENDERING: Bricks vs Raw Materials (Soil, Msand, Wood, Diesel) */}
          <div className="aftrah-app-table-container">
            <table className="aftrah-app-table">
              <thead>
                {isBricks ? (
                  /* BRICKS TABLE HEADER (S NO | DATE | STOCK OPENING | CURRENT PRODUCTION | SALES | PENDING STOCK | EDIT/DELETE) */
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S NO</th>
                    <th style={{ width: '120px' }}>DATE</th>
                    <th style={{ textAlign: 'right' }}>STOCK OPENING</th>
                    <th style={{ textAlign: 'right' }}>CURRENT PRODUCTION</th>
                    <th style={{ textAlign: 'right' }}>SALES</th>
                    <th style={{ textAlign: 'right' }}>PENDING STOCK</th>
                    <th className="no-print" style={{ width: '90px', textAlign: 'center' }}>EDIT / DELETE</th>
                  </tr>
                ) : (
                  /* RAW MATERIALS TABLE HEADER (S NO | DATE | ITEM | STOCK OPENING | MATERIAL USAGE (Units / kg) | PENDING STOCK | EDIT/DELETE) */
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S NO</th>
                    <th style={{ width: '110px' }}>DATE</th>
                    <th style={{ width: '110px' }}>ITEM</th>
                    <th style={{ textAlign: 'right' }}>STOCK OPENING</th>
                    <th style={{ textAlign: 'right' }}>MATERIAL USAGE ({unitLabel})</th>
                    <th style={{ textAlign: 'right' }}>PENDING STOCK</th>
                    <th className="no-print" style={{ width: '90px', textAlign: 'center' }}>EDIT / DELETE</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {paginatedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={isBricks ? 7 : 7} className="aftrah-app-empty-cell">
                      <div className="empty-state-wrap">
                        <Boxes size={28} className="empty-icon" color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                        <span className="empty-text">No entries recorded for this item yet</span>
                        <span className="empty-subtext">
                          Use the "Add details" form on the right to log new records.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEntries.map((entry, index) => {
                    const displaySNo = startIndex + index + 1;
                    const openingVal = entry.stockOpening !== undefined ? entry.stockOpening : 0;
                    const prodVal = entry.currentProduction !== undefined ? entry.currentProduction : (entry.type === 'production' ? entry.quantity : 0);
                    const salesVal = entry.sales !== undefined ? entry.sales : (entry.type === 'sales' ? entry.quantity : 0);
                    const usageVal = entry.materialUsage !== undefined ? entry.materialUsage : salesVal;
                    const pendingVal = entry.pendingStock !== undefined
                      ? entry.pendingStock
                      : isBricks
                      ? openingVal + prodVal - salesVal
                      : openingVal - usageVal;

                    return (
                      <tr
                        key={entry.id}
                        style={{ cursor: 'default' }}
                      >
                        {/* S NO */}
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {displaySNo}
                        </td>

                        {/* DATE */}
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {entry.date}
                        </td>

                        {/* For Raw Materials: ITEM Column matching handwritten sheet */}
                        {!isBricks && (
                          <td>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '5px',
                                fontSize: '12px',
                                fontWeight: 700,
                                background: 'rgba(226, 195, 153, 0.15)',
                                color: 'var(--primary)',
                                border: '1px solid rgba(226, 195, 153, 0.25)'
                              }}
                            >
                              {entry.item || item.item}
                            </span>
                          </td>
                        )}

                        {/* STOCK OPENING */}
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {Number(openingVal).toLocaleString('en-IN')}
                        </td>

                        {isBricks ? (
                          <>
                            {/* CURRENT PRODUCTION (Bricks only) */}
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 700,
                                color: prodVal > 0 ? '#3b82f6' : 'var(--text-secondary)'
                              }}
                            >
                              {prodVal > 0 ? Number(prodVal).toLocaleString('en-IN') : '-'}
                            </td>

                            {/* SALES (Bricks only) */}
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 700,
                                color: salesVal > 0 ? '#f87171' : 'var(--text-secondary)'
                              }}
                            >
                              {salesVal > 0 ? Number(salesVal).toLocaleString('en-IN') : '-'}
                            </td>
                          </>
                        ) : (
                          /* MATERIAL USAGE (Soil, Msand, Wood, Diesel) */
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: 700,
                              color: usageVal > 0 ? '#f87171' : 'var(--text-secondary)'
                            }}
                          >
                            {usageVal > 0 ? Number(usageVal).toLocaleString('en-IN') : '-'}
                          </td>
                        )}

                        {/* PENDING STOCK */}
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 800,
                            color: pendingVal >= 0 ? 'var(--primary)' : '#f87171'
                          }}
                        >
                          {Number(pendingVal).toLocaleString('en-IN')}
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
                              onClick={(e) => handleOpenEdit(entry, e)}
                              className="aftrah-app-action-btn aftrah-app-edit-btn"
                              title="Edit Stock Entry"
                              aria-label="Edit Stock Entry"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(entry);
                              }}
                              className="aftrah-app-action-btn aftrah-app-delete-btn"
                              title="Delete Stock Entry"
                              aria-label="Delete Stock Entry"
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
          {filteredEntries.length > 0 && (
            <div className="aftrah-app-pagination-bar">
              <div className="aftrah-app-pagination-left">
                <span className="aftrah-app-pagination-info">
                  Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{' '}
                  <strong>{filteredEntries.length}</strong> entries
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

        {/* RIGHT COLUMN: "Add details" PANEL */}
        <aside className="aftrah-app-form-card">
          <div className="aftrah-app-form-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16} color="var(--primary)" />
              <h2 className="aftrah-app-form-card-title">Add details</h2>
            </div>
          </div>

          <form onSubmit={handleAddSubmit} className="aftrah-app-add-form">
            {/* Auto-Carried Forward Opening Banner */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(226, 195, 153, 0.08)',
                border: '1px solid rgba(226, 195, 153, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowRightLeft size={13} color="var(--primary)" />
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Carried Opening:
                </span>
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  fontFamily: 'Cinzel, serif'
                }}
              >
                {Number(carriedOpening).toLocaleString('en-IN')} Units
              </span>
            </div>

            {/* Date Field */}
            <div className="aftrah-app-form-group">
              <label className="aftrah-app-label">
                DATE <span className="required-star">*</span>
              </label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="aftrah-app-input"
              />
            </div>

            {isBricks ? (
              <>
                {/* Current Production (Bricks) */}
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">CURRENT PRODUCTION</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 50000"
                    value={entryProduction}
                    onChange={(e) => setEntryProduction(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>

                {/* Sales (Bricks) */}
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">SALES</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 35000"
                    value={entrySales}
                    onChange={(e) => setEntrySales(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
              </>
            ) : (
              /* Material Usage (Soil, Msand, Wood, Diesel) */
              <div className="aftrah-app-form-group">
                <label className="aftrah-app-label">
                  MATERIAL USAGE ({unitLabel}) <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="e.g. 5"
                  value={entryUsage}
                  onChange={(e) => setEntryUsage(e.target.value)}
                  className="aftrah-app-input"
                />
              </div>
            )}

            {/* Live Computed Projected Pending Stock */}
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
                Projected Balance:
              </span>
              <span
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: previewNewPending >= 0 ? 'var(--primary)' : '#f87171',
                  fontFamily: 'Cinzel, serif'
                }}
              >
                {Number(previewNewPending || 0).toLocaleString('en-IN')} UNITS
              </span>
            </div>

            {/* Validation Notice */}
            {!isAddValid && (
              <div className="aftrah-app-validation-notice">
                {isBricks
                  ? '* Date and either Production or Sales are required to submit.'
                  : '* Date and Material Usage are required to submit.'}
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
                <span>Add Entry</span>
              </button>

              {(entryProduction || entrySales || entryUsage) && (
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
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="aftrah-app-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={16} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Edit Stock Entry</h3>
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

              {/* Carried Opening info in Edit Modal */}
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(226, 195, 153, 0.08)',
                  border: '1px solid rgba(226, 195, 153, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Stock Opening (Carried):
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                  {Number(editOpening).toLocaleString('en-IN')} Units
                </span>
              </div>

              {isBricks ? (
                <>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Current Production</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editProduction}
                      onChange={(e) => setEditProduction(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Sales</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editSales}
                      onChange={(e) => setEditSales(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                </>
              ) : (
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">
                    Material Usage ({unitLabel}) <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={editUsage}
                    onChange={(e) => setEditUsage(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
              )}

              {/* Computed Pending Stock Preview */}
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
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Pending Stock:
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: editPreviewPending >= 0 ? 'var(--primary)' : '#f87171',
                    fontFamily: 'Cinzel, serif'
                  }}
                >
                  {Number(editPreviewPending || 0).toLocaleString('en-IN')} Units
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
        title="Delete Stock Entry"
        message={`Are you sure you want to delete this entry from ${deleteTarget?.date}? This action will adjust subsequent balances automatically.`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
