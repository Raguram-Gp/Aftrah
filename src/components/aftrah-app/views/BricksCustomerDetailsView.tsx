import React, { useState, useMemo } from 'react';
import type { BrickCustomer, BrickTransaction } from '../types';
import { PREDEFINED_BRICK_TYPES } from '../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { DateFilterBar } from '../components/DateFilterBar';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  BrickWall,
  Boxes,
  Truck,
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
  CreditCard,
  Building,
  CheckCircle2,
  Printer,
  CheckSquare,
  Square
} from 'lucide-react';

interface BricksCustomerDetailsViewProps {
  customer: BrickCustomer;
  onBack: () => void;
  onUpdateCustomer: (updatedCustomer: BrickCustomer) => Promise<any>;
  onAddTransaction: (customerId: string, txData: Omit<BrickTransaction, 'id' | 'sNo'>) => Promise<any>;
  onUpdateTransaction: (customerId: string, txData: BrickTransaction) => Promise<any>;
  onDeleteTransaction: (customerId: string, txId: string) => Promise<any>;
  onDeleteMultipleTransactions?: (customerId: string, txIds: string[]) => Promise<any>;
}

export const BricksCustomerDetailsView: React.FC<BricksCustomerDetailsViewProps> = ({
  customer,
  onBack,
  onUpdateCustomer,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onDeleteMultipleTransactions
}) => {
  const transactions = customer.transactions || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk Delete Modal State
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Add Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [txBrickType, setTxBrickType] = useState(PREDEFINED_BRICK_TYPES[0]);
  const [customBrickType, setCustomBrickType] = useState('');
  const [txQuantity, setTxQuantity] = useState('');
  const [txRate, setTxRate] = useState('');
  const [txPaid, setTxPaid] = useState('0');
  const [txSiteLocation, setTxSiteLocation] = useState('');
  const [txVehicleNumber, setTxVehicleNumber] = useState('');
  const [txDriverPhone, setTxDriverPhone] = useState('');
  const [txNotes, setTxNotes] = useState('');

  // Edit Transaction Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxBrickType, setEditTxBrickType] = useState('');
  const [editCustomBrickType, setEditCustomBrickType] = useState('');
  const [editTxQuantity, setEditTxQuantity] = useState('');
  const [editTxRate, setEditTxRate] = useState('');
  const [editTxPaid, setEditTxPaid] = useState('');
  const [editTxSiteLocation, setEditTxSiteLocation] = useState('');
  const [editTxVehicleNumber, setEditTxVehicleNumber] = useState('');
  const [editTxDriverPhone, setEditTxDriverPhone] = useState('');
  const [editTxNotes, setEditTxNotes] = useState('');

  // Delete Single Transaction Modal State
  const [deleteTxTarget, setDeleteTxTarget] = useState<BrickTransaction | null>(null);
  const [isDeletingTx, setIsDeletingTx] = useState(false);

  // Auto-calculated totals for Add Modal
  const calculatedTotal = (parseFloat(txQuantity) || 0) * (parseFloat(txRate) || 0);
  const calculatedBalance = Math.max(0, calculatedTotal - (parseFloat(txPaid) || 0));

  // Auto-calculated totals for Edit Modal
  const editCalculatedTotal = (parseFloat(editTxQuantity) || 0) * (parseFloat(editTxRate) || 0);
  const editCalculatedBalance = Math.max(0, editCalculatedTotal - (parseFloat(editTxPaid) || 0));

  // Validations
  const isAddValid =
    txDate.trim().length > 0 &&
    (txBrickType !== 'Custom / Other' || customBrickType.trim().length > 0) &&
    parseFloat(txQuantity) > 0 &&
    parseFloat(txRate) > 0 &&
    txPaid !== '';

  const isEditValid =
    editTxDate.trim().length > 0 &&
    (editTxBrickType !== 'Custom / Other' || editCustomBrickType.trim().length > 0) &&
    parseFloat(editTxQuantity) > 0 &&
    parseFloat(editTxRate) > 0 &&
    editTxPaid !== '';

  // Currency format
  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Filter transactions by search query AND date range
  const filteredTransactions = useMemo(() => {
    let list = transactions;

    // Date range filter
    if (fromDate) {
      list = list.filter((tx) => tx.date >= fromDate);
    }
    if (toDate) {
      list = list.filter((tx) => tx.date <= toDate);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (tx) =>
          (tx.brickType && tx.brickType.toLowerCase().includes(q)) ||
          (tx.siteLocation && tx.siteLocation.toLowerCase().includes(q)) ||
          (tx.vehicleNumber && tx.vehicleNumber.toLowerCase().includes(q)) ||
          (tx.date && tx.date.includes(q)) ||
          (tx.notes && tx.notes.toLowerCase().includes(q)) ||
          String(tx.quantity).includes(q) ||
          String(tx.totalAmount).includes(q) ||
          String(tx.balanceAmount).includes(q) ||
          String(tx.sNo).includes(q)
      );
    }

    return list;
  }, [transactions, searchQuery, fromDate, toDate]);

  // Metrics for filtered selection
  const totalOrders = filteredTransactions.length;
  const totalQuantity = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.quantity) || 0), 0);
  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.totalAmount) || 0), 0);
  const totalPaid = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.paidAmount) || 0), 0);
  const totalBalance = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.balanceAmount) || 0), 0);

  // Pagination computations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Multi-select Checkbox Handlers
  const isAllSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((tx) => selectedTxIds.has(tx.id));

  const isSomeSelected =
    selectedTxIds.size > 0 && !isAllSelected;

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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Bulk Delete Confirmation
  const handleConfirmBulkDelete = async () => {
    if (selectedTxIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      if (onDeleteMultipleTransactions) {
        await onDeleteMultipleTransactions(customer.id, Array.from(selectedTxIds));
      } else {
        for (const id of selectedTxIds) {
          await onDeleteTransaction(customer.id, id);
        }
      }
      setSelectedTxIds(new Set());
      setIsBulkDeleteOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Print Statement Handler
  const handlePrint = () => {
    window.print();
  };

  // Reset Add Form
  const resetAddForm = () => {
    setTxDate(new Date().toISOString().slice(0, 10));
    setTxBrickType(PREDEFINED_BRICK_TYPES[0]);
    setCustomBrickType('');
    setTxQuantity('');
    setTxRate('');
    setTxPaid('0');
    setTxSiteLocation('');
    setTxVehicleNumber('');
    setTxDriverPhone('');
    setTxNotes('');
  };

  // Submit Add Transaction
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddValid) return;

    const finalBrickType =
      txBrickType === 'Custom / Other' ? customBrickType.trim() : txBrickType;

    await onAddTransaction(customer.id, {
      date: txDate,
      brickType: finalBrickType,
      quantity: parseFloat(txQuantity),
      rate: parseFloat(txRate),
      totalAmount: calculatedTotal,
      paidAmount: parseFloat(txPaid) || 0,
      balanceAmount: calculatedBalance,
      siteLocation: txSiteLocation.trim() || undefined,
      vehicleNumber: txVehicleNumber.trim() || undefined,
      driverPhone: txDriverPhone.trim() || undefined,
      notes: txNotes.trim() || undefined
    });

    setIsAddModalOpen(false);
    resetAddForm();
    setCurrentPage(1);
  };

  // Open Edit Modal
  const handleOpenEdit = (tx: BrickTransaction) => {
    setEditingTxId(tx.id);
    setEditTxDate(tx.date);

    if (PREDEFINED_BRICK_TYPES.includes(tx.brickType)) {
      setEditTxBrickType(tx.brickType);
      setEditCustomBrickType('');
    } else {
      setEditTxBrickType('Custom / Other');
      setEditCustomBrickType(tx.brickType);
    }

    setEditTxQuantity(String(tx.quantity));
    setEditTxRate(String(tx.rate));
    setEditTxPaid(String(tx.paidAmount));
    setEditTxSiteLocation(tx.siteLocation || '');
    setEditTxVehicleNumber(tx.vehicleNumber || '');
    setEditTxDriverPhone(tx.driverPhone || '');
    setEditTxNotes(tx.notes || '');
    setIsEditModalOpen(true);
  };

  // Save Edit Transaction
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditValid || !editingTxId) return;

    const finalBrickType =
      editTxBrickType === 'Custom / Other'
        ? editCustomBrickType.trim()
        : editTxBrickType;

    const existingTx = transactions.find((t) => t.id === editingTxId);
    if (!existingTx) return;

    await onUpdateTransaction(customer.id, {
      ...existingTx,
      date: editTxDate,
      brickType: finalBrickType,
      quantity: parseFloat(editTxQuantity),
      rate: parseFloat(editTxRate),
      totalAmount: editCalculatedTotal,
      paidAmount: parseFloat(editTxPaid) || 0,
      balanceAmount: editCalculatedBalance,
      siteLocation: editTxSiteLocation.trim() || undefined,
      vehicleNumber: editTxVehicleNumber.trim() || undefined,
      driverPhone: editTxDriverPhone.trim() || undefined,
      notes: editTxNotes.trim() || undefined
    });

    setIsEditModalOpen(false);
    setEditingTxId(null);
  };

  // Confirm Delete Transaction
  const handleConfirmDeleteTx = async () => {
    if (!deleteTxTarget) return;
    setIsDeletingTx(true);
    try {
      await onDeleteTransaction(customer.id, deleteTxTarget.id);
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
            <h1 className="print-company-name">AFTRAH CONSTRUCTIONS</h1>
            <p className="print-company-sub">Civil Construction, Materials Procurement & Financial ERP</p>
          </div>
          <div className="print-badge-statement">
            <span>KABIBULLAH BRICKS STATEMENT</span>
          </div>
        </div>

        <div className="print-meta-grid">
          <div className="print-meta-box">
            <span className="print-meta-title">CUSTOMER DETAILS</span>
            <div className="print-meta-val"><strong>{customer.name}</strong></div>
            <div className="print-meta-sub">Phone: {customer.phone}</div>
            <div className="print-meta-sub">Address: {customer.address}</div>
          </div>

          <div className="print-meta-box">
            <span className="print-meta-title">STATEMENT SUMMARY</span>
            <div className="print-meta-sub">
              Period: <strong>{fromDate && toDate ? `${fromDate} to ${toDate}` : fromDate ? `From ${fromDate}` : toDate ? `Up to ${toDate}` : 'All Recorded Transactions'}</strong>
            </div>
            <div className="print-meta-sub">Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div className="print-meta-val" style={{ marginTop: '4px', color: totalBalance > 0 ? '#b91c1c' : '#15803d' }}>
              Balance Due: {formatINR(totalBalance)}
            </div>
          </div>
        </div>

        {/* Print Summary Totals Row */}
        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Total Deliveries:</span> <strong>{totalOrders} Batches ({totalQuantity.toLocaleString('en-IN')} units)</strong>
          </div>
          <div className="print-total-item">
            <span>Total Billing:</span> <strong>{formatINR(totalAmount)}</strong>
          </div>
          <div className="print-total-item">
            <span>Total Paid:</span> <strong>{formatINR(totalPaid)}</strong>
          </div>
          <div className="print-total-item">
            <span>Outstanding Balance:</span> <strong style={{ color: totalBalance > 0 ? '#b91c1c' : '#15803d' }}>{formatINR(totalBalance)}</strong>
          </div>
        </div>
      </div>

      {/* Screen Header Bar */}
      <div className="client-details-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={onBack}
            className="aftrah-app-back-btn"
            title="Return to Bricks Customers List"
            aria-label="Back to Bricks Customers List"
          >
            <ArrowLeft size={16} />
            <span>Back to Customers</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              className="aftrah-app-back-btn"
              title="Print or export ledger statement"
            >
              <Printer size={15} />
              <span>Print Statement</span>
            </button>

            <button
              onClick={() => {
                resetAddForm();
                setIsAddModalOpen(true);
              }}
              className="btn-theme-primary"
              style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Brick Delivery</span>
            </button>
          </div>
        </div>

        <div className="client-details-title-row">
          <div>
            <h1 className="client-details-main-title">
              {customer.name} <span>· Brick Delivery Ledger</span>
            </h1>
            <div className="client-meta-row">
              <span className="client-meta-pill">
                <Phone size={13} color="var(--primary)" />
                {customer.phone}
              </span>
              <span className="client-meta-pill">
                <MapPin size={13} color="var(--primary)" />
                {customer.address}
              </span>
            </div>
          </div>

          {/* Top KPI Financial Summary Cards */}
          <div className="client-financial-summary">
            {/* 1. Total Order Value */}
            <div className="summary-metric-card">
              <div className="metric-icon-wrap gold">
                <Wallet size={24} />
              </div>
              <div>
                <span className="metric-label">TOTAL BILLING</span>
                <span className="metric-value gold">{formatINR(totalAmount)}</span>
              </div>
            </div>

            {/* 3. Total Received */}
            <div className="summary-metric-card">
              <div className="metric-icon-wrap green">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="metric-label">TOTAL PAID</span>
                <span className="metric-value green">{formatINR(totalPaid)}</span>
              </div>
            </div>

            {/* 4. Outstanding Balance */}
            <div className="summary-metric-card">
              <div className={`metric-icon-wrap ${totalBalance > 0 ? 'red' : 'green'}`}>
                <Scale size={24} />
              </div>
              <div>
                <span className="metric-label">
                  {totalBalance > 0 ? 'OUTSTANDING BALANCE' : 'FULLY SETTLED'}
                </span>
                <span className={`metric-value ${totalBalance > 0 ? 'red' : 'green'}`}>
                  {formatINR(totalBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter Toolbar & Bulk Actions */}
      <DateFilterBar
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={(d) => {
          setFromDate(d);
          setCurrentPage(1);
        }}
        onToDateChange={(d) => {
          setToDate(d);
          setCurrentPage(1);
        }}
        onClearDates={() => {
          setFromDate('');
          setToDate('');
          setCurrentPage(1);
        }}
        selectedCount={selectedTxIds.size}
        onBulkDelete={() => setIsBulkDeleteOpen(true)}
        onPrint={handlePrint}
        printLabel="Print Statement"
      />

      {/* Transactions Section */}
      <section className="aftrah-app-table-section" style={{ minHeight: 'auto' }}>
        <div className="aftrah-app-section-header no-print">
          <div>
            <h2 className="aftrah-app-section-title" style={{ fontSize: '16px' }}>
              DELIVERY & PAYMENT LEDGER
            </h2>
            <span className="aftrah-app-section-subtitle">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'entry' : 'entries'} recorded
              {(fromDate || toDate) && ' (filtered by date)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="aftrah-app-search-wrapper">
              <Search size={14} className="aftrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search type, location, vehicle..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="aftrah-app-search-input"
              />
            </div>

            <button
              onClick={() => {
                resetAddForm();
                setIsAddModalOpen(true);
              }}
              className="btn-theme-primary"
              style={{ height: '36px', padding: '0 14px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
            >
              <Plus size={15} />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="aftrah-app-table-container">
          <table className="aftrah-app-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>S.NO</th>
                <th style={{ width: '105px' }}>DATE</th>
                <th>BRICK TYPE / DESCRIPTION</th>
                <th style={{ width: '90px', textAlign: 'right' }}>QTY</th>
                <th style={{ width: '90px', textAlign: 'right' }}>RATE (₹)</th>
                <th style={{ width: '120px', textAlign: 'right' }}>TOTAL (₹)</th>
                <th style={{ width: '120px', textAlign: 'right' }}>PAID (₹)</th>
                <th style={{ width: '120px', textAlign: 'right' }}>BALANCE (₹)</th>
                <th className="no-print" style={{ width: '75px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}
                  >
                    <BrickWall size={32} style={{ opacity: 0.3, margin: '0 auto 8px auto', display: 'block' }} />
                    {searchQuery || fromDate || toDate
                      ? 'No matching ledger transactions found for the selected filter.'
                      : 'No delivery entries logged for this customer yet. Click "New Brick Delivery" above.'}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, idx) => {
                  return (
                    <tr
                      key={tx.id}
                      style={{ cursor: 'default' }}
                    >
                      <td
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          textAlign: 'center'
                        }}
                      >
                        #{startIndex + idx + 1}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="var(--primary)" />
                          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{tx.date}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              fontSize: '13px'
                            }}
                          >
                            {tx.brickType}
                          </span>
                          {tx.notes && (
                            <span
                              style={{
                                display: 'block',
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                marginTop: '2px'
                              }}
                            >
                              {tx.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                        {Number(tx.quantity).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      ₹{Number(tx.rate).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatINR(tx.totalAmount)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#4ade80', fontWeight: 600 }}>
                      {formatINR(tx.paidAmount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          background:
                            (tx.balanceAmount || 0) > 0
                              ? 'rgba(239, 68, 68, 0.12)'
                              : 'rgba(34, 197, 94, 0.12)',
                          color: (tx.balanceAmount || 0) > 0 ? '#f87171' : '#4ade80'
                        }}
                      >
                        {formatINR(tx.balanceAmount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="aftrah-app-action-btn aftrah-app-edit-btn"
                          title="Edit Transaction"
                          aria-label="Edit Transaction"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTxTarget(tx)}
                          className="aftrah-app-action-btn aftrah-app-delete-btn"
                          title="Delete Transaction"
                          aria-label="Delete Transaction"
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
        {filteredTransactions.length > 0 && (
          <div className="aftrah-app-pagination-bar">
            <div className="aftrah-app-pagination-left">
              <span className="aftrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{' '}
                <strong>{filteredTransactions.length}</strong>
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

      {/* ADD TRANSACTION MODAL */}
      {isAddModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="aftrah-app-modal-container"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrickWall size={17} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">New Brick Delivery Entry</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="aftrah-app-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="aftrah-app-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Date *</label>
                    <input
                      type="date"
                      required
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Brick Type *</label>
                    <select
                      value={txBrickType}
                      onChange={(e) => setTxBrickType(e.target.value)}
                      className="aftrah-app-input"
                    >
                      {PREDEFINED_BRICK_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {txBrickType === 'Custom / Other' && (
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Specify Custom Brick Type *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Special Handmade Fire Bricks"
                      value={customBrickType}
                      onChange={(e) => setCustomBrickType(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Site / Delivery Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Site #4, Anna Nagar"
                      value={txSiteLocation}
                      onChange={(e) => setTxSiteLocation(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Vehicle Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TN 58 AA 1234"
                      value={txVehicleNumber}
                      onChange={(e) => setTxVehicleNumber(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                </div>

                {/* Calculation Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '14px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Quantity (Units) *</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="e.g. 5000"
                      value={txQuantity}
                      onChange={(e) => setTxQuantity(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Rate per Unit (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      placeholder="e.g. 11.50"
                      value={txRate}
                      onChange={(e) => setTxRate(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Calculated Total</label>
                    <div
                      style={{
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        background: 'var(--surface-container-low, #141618)',
                        border: '1px solid var(--border-stroke, #232730)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: 'var(--primary)'
                      }}
                    >
                      {formatINR(calculatedTotal)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Amount Paid / Advance (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="0"
                      value={txPaid}
                      onChange={(e) => setTxPaid(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Pending Balance (₹)</label>
                    <div
                      style={{
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        background: 'var(--surface-container-low, #141618)',
                        border: '1px solid var(--border-stroke, #232730)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: calculatedBalance > 0 ? '#f87171' : '#4ade80'
                      }}
                    >
                      {formatINR(calculatedBalance)}
                    </div>
                  </div>
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Notes / Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Unloaded at site 2nd floor, driver Murugan"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
              </div>

              <div className="aftrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="aftrah-app-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isAddValid}
                  className="btn-theme-primary"
                  style={{ minWidth: '130px', height: '40px', fontSize: '13px' }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Save Delivery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {isEditModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="aftrah-app-modal-container"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={17} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Edit Brick Delivery Entry</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="aftrah-app-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="aftrah-app-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Date *</label>
                    <input
                      type="date"
                      required
                      value={editTxDate}
                      onChange={(e) => setEditTxDate(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Brick Type *</label>
                    <select
                      value={editTxBrickType}
                      onChange={(e) => setEditTxBrickType(e.target.value)}
                      className="aftrah-app-input"
                    >
                      {PREDEFINED_BRICK_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {editTxBrickType === 'Custom / Other' && (
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Specify Custom Brick Type *</label>
                    <input
                      type="text"
                      required
                      value={editCustomBrickType}
                      onChange={(e) => setEditCustomBrickType(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Site / Delivery Location</label>
                    <input
                      type="text"
                      value={editTxSiteLocation}
                      onChange={(e) => setEditTxSiteLocation(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Vehicle Number</label>
                    <input
                      type="text"
                      value={editTxVehicleNumber}
                      onChange={(e) => setEditTxVehicleNumber(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '14px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Quantity *</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={editTxQuantity}
                      onChange={(e) => setEditTxQuantity(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Rate per Unit (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={editTxRate}
                      onChange={(e) => setEditTxRate(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Calculated Total</label>
                    <div
                      style={{
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        background: 'var(--surface-container-low, #141618)',
                        border: '1px solid var(--border-stroke, #232730)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: 'var(--primary)'
                      }}
                    >
                      {formatINR(editCalculatedTotal)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Amount Paid / Advance (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={editTxPaid}
                      onChange={(e) => setEditTxPaid(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Pending Balance (₹)</label>
                    <div
                      style={{
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        background: 'var(--surface-container-low, #141618)',
                        border: '1px solid var(--border-stroke, #232730)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: editCalculatedBalance > 0 ? '#f87171' : '#4ade80'
                      }}
                    >
                      {formatINR(editCalculatedBalance)}
                    </div>
                  </div>
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Notes / Remarks</label>
                  <input
                    type="text"
                    value={editTxNotes}
                    onChange={(e) => setEditTxNotes(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>
              </div>

              <div className="aftrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="aftrah-app-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditValid}
                  className="btn-theme-primary"
                  style={{ minWidth: '130px', height: '40px', fontSize: '13px' }}
                >
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  <span>Update Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM SINGLE DELETE TRANSACTION MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTxTarget)}
        title="Delete Delivery Entry"
        message="Are you sure you want to delete this delivery entry? The customer's balance will automatically be recalculated."
        itemName={deleteTxTarget ? `${deleteTxTarget.brickType} (${deleteTxTarget.date})` : undefined}
        confirmText="Delete Entry"
        isDeleting={isDeletingTx}
        onConfirm={handleConfirmDeleteTx}
        onClose={() => setDeleteTxTarget(null)}
      />

      {/* CONFIRM BULK DELETE TRANSACTIONS MODAL */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteOpen}
        title="Delete Selected Entries"
        message={`Are you sure you want to delete ${selectedTxIds.size} selected delivery entries? All corresponding amounts and outstanding balances will be recalculated.`}
        confirmText={`Delete ${selectedTxIds.size} Entries`}
        isDeleting={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setIsBulkDeleteOpen(false)}
      />
    </div>
  );
};
