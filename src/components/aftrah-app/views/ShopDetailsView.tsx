import React, { useState, useMemo } from 'react';
import type { Vendor, VendorShop, ShopTransaction } from '../types';
import { SearchableExpenseSelect } from '../components/SearchableExpenseSelect';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
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
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Store,
  User,
  CreditCard,
  ShoppingBag,
  ArrowDownLeft
} from 'lucide-react';

interface ShopDetailsViewProps {
  vendor: Vendor;
  shop: VendorShop;
  clientOptions?: string[];
  onBack: () => void;
  onUpdateShop: (updatedShop: VendorShop) => void;
  onAddTransaction?: (categoryId: string, shopId: string, txData: Omit<ShopTransaction, 'id' | 'sNo'>) => Promise<any>;
  onUpdateTransaction?: (categoryId: string, shopId: string, txData: ShopTransaction) => Promise<any>;
  onDeleteTransaction?: (categoryId: string, shopId: string, txId: string) => Promise<any>;
}

export const ShopDetailsView: React.FC<ShopDetailsViewProps> = ({
  vendor,
  shop,
  clientOptions = [],
  onBack,
  onUpdateShop,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const transactions = shop.transactions || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'purchase' | 'settlement'>('purchase');

  // Purchase Form State
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [txItemType, setTxItemType] = useState('');
  const [txClientName, setTxClientName] = useState('');
  const [txQuantity, setTxQuantity] = useState('');
  const [txRate, setTxRate] = useState('');
  const [txReceived, setTxReceived] = useState('');

  // Settlement Form State
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementNote, setSettlementNote] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editModalMode, setEditModalMode] = useState<'purchase' | 'settlement'>('purchase');
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxItemType, setEditTxItemType] = useState('');
  const [editTxClientName, setEditTxClientName] = useState('');
  const [editTxQuantity, setEditTxQuantity] = useState('');
  const [editTxRate, setEditTxRate] = useState('');
  const [editTxReceived, setEditTxReceived] = useState('');

  // Delete Modal State
  const [deleteTxTarget, setDeleteTxTarget] = useState<ShopTransaction | null>(null);
  const [isDeletingTx, setIsDeletingTx] = useState(false);

  // Auto-calculated numbers for Purchase Mode
  const calculatedTotal = (parseFloat(txQuantity) || 0) * (parseFloat(txRate) || 0);
  const calculatedBalance = calculatedTotal - (parseFloat(txReceived) || 0);

  // Auto-calculated numbers for Edit Modal
  const editCalculatedTotal = (parseFloat(editTxQuantity) || 0) * (parseFloat(editTxRate) || 0);
  const editCalculatedBalance = editCalculatedTotal - (parseFloat(editTxReceived) || 0);

  // Validations
  const isPurchaseValid =
    txDate.trim().length > 0 &&
    txItemType.trim().length > 0 &&
    parseFloat(txQuantity) > 0 &&
    parseFloat(txRate) > 0 &&
    txReceived !== '';

  const isSettlementValid =
    txDate.trim().length > 0 &&
    parseFloat(settlementAmount) > 0;

  const isAddValid = modalMode === 'purchase' ? isPurchaseValid : isSettlementValid;

  const isEditValid =
    editModalMode === 'purchase'
      ? editTxDate.trim().length > 0 &&
        editTxItemType.trim().length > 0 &&
        parseFloat(editTxQuantity) > 0 &&
        parseFloat(editTxRate) > 0 &&
        editTxReceived !== ''
      : editTxDate.trim().length > 0 && parseFloat(editTxReceived) > 0;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.itemType.toLowerCase().includes(q) ||
        (tx.clientName && tx.clientName.toLowerCase().includes(q)) ||
        tx.date.includes(q) ||
        String(tx.quantity).includes(q) ||
        String(tx.rate).includes(q) ||
        String(tx.totalAmount).includes(q) ||
        String(tx.receivedAmount).includes(q) ||
        String(tx.balanceAmount).includes(q) ||
        String(tx.sNo).includes(q)
    );
  }, [transactions, searchQuery]);

  // Financial summary computations
  const totalPurchase = transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
  const totalReceived = transactions.reduce((sum, tx) => sum + (tx.receivedAmount || 0), 0);
  const totalBalance = Math.max(0, totalPurchase - totalReceived);

  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Helper to check if a transaction is a direct settlement
  const isSettlementTx = (tx: ShopTransaction) => {
    return (
      tx.itemType.toLowerCase().includes('settlement') ||
      ((tx.quantity === 0 || !tx.quantity) && (tx.rate === 0 || !tx.rate) && (tx.totalAmount === 0 || !tx.totalAmount))
    );
  };

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

  // Open Add Modal with specific initial mode
  const handleOpenAddModal = (mode: 'purchase' | 'settlement') => {
    setModalMode(mode);
    setTxDate(new Date().toISOString().slice(0, 10));
    setTxItemType('');
    setTxClientName('');
    setTxQuantity('');
    setTxRate('');
    setTxReceived('');
    setSettlementAmount('');
    setSettlementNote('');
    setIsAddModalOpen(true);
  };

  // Handle Add Transaction Submit (Purchase or Settlement)
  const handleAddTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddValid) return;

    if (modalMode === 'settlement') {
      // SETTLEMENT TRANSACTION
      const paid = parseFloat(settlementAmount) || 0;
      const fullItemType = settlementNote.trim()
        ? `Settlement - ${settlementNote.trim()}`
        : 'Settlement';

      if (onAddTransaction) {
        await onAddTransaction(vendor.id, shop.id, {
          date: txDate,
          itemType: fullItemType,
          clientName: txClientName.trim() || undefined,
          quantity: 0,
          rate: 0,
          totalAmount: 0,
          receivedAmount: paid,
          balanceAmount: -paid,
        });
      } else {
        const newTx: ShopTransaction = {
          id: `tx-${Date.now()}`,
          sNo: transactions.length + 1,
          date: txDate,
          itemType: fullItemType,
          clientName: txClientName.trim() || undefined,
          quantity: 0,
          rate: 0,
          totalAmount: 0,
          receivedAmount: paid,
          balanceAmount: -paid
        };

        onUpdateShop({
          ...shop,
          transactions: [...transactions, newTx]
        });
      }
    } else {
      // MATERIAL PURCHASE TRANSACTION
      const qty = parseFloat(txQuantity);
      const rate = parseFloat(txRate);
      const received = parseFloat(txReceived) || 0;
      const total = qty * rate;
      const balance = total - received;

      if (onAddTransaction) {
        await onAddTransaction(vendor.id, shop.id, {
          date: txDate,
          itemType: txItemType.trim(),
          clientName: txClientName.trim() || undefined,
          quantity: qty,
          rate,
          totalAmount: total,
          receivedAmount: received,
          balanceAmount: balance,
        });
      } else {
        const newTx: ShopTransaction = {
          id: `tx-${Date.now()}`,
          sNo: transactions.length + 1,
          date: txDate,
          itemType: txItemType.trim(),
          clientName: txClientName.trim() || undefined,
          quantity: qty,
          rate,
          totalAmount: total,
          receivedAmount: received,
          balanceAmount: balance
        };

        onUpdateShop({
          ...shop,
          transactions: [...transactions, newTx]
        });
      }
    }

    setTxItemType('');
    setTxClientName('');
    setTxQuantity('');
    setTxRate('');
    setTxReceived('');
    setSettlementAmount('');
    setIsAddModalOpen(false);
    setCurrentPage(1);
  };

  // Open Edit Modal
  const handleOpenEdit = (tx: ShopTransaction) => {
    const isSettlement = isSettlementTx(tx);
    setEditingTxId(tx.id);
    setEditModalMode(isSettlement ? 'settlement' : 'purchase');
    setEditTxDate(tx.date);
    setEditTxItemType(tx.itemType);
    setEditTxClientName(tx.clientName || '');
    setEditTxQuantity(String(tx.quantity || 0));
    setEditTxRate(String(tx.rate || 0));
    setEditTxReceived(String(tx.receivedAmount || 0));
    setIsEditModalOpen(true);
  };

  // Handle Save Edit Submit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditValid || !editingTxId) return;

    let updatedTx: ShopTransaction;

    if (editModalMode === 'settlement') {
      const received = parseFloat(editTxReceived) || 0;
      updatedTx = {
        id: editingTxId,
        sNo: transactions.find((t) => t.id === editingTxId)?.sNo || 1,
        date: editTxDate,
        itemType: editTxItemType.trim() || 'Settlement',
        clientName: editTxClientName.trim() || undefined,
        quantity: 0,
        rate: 0,
        totalAmount: 0,
        receivedAmount: received,
        balanceAmount: -received
      };
    } else {
      const qty = parseFloat(editTxQuantity);
      const rate = parseFloat(editTxRate);
      const received = parseFloat(editTxReceived) || 0;
      const total = qty * rate;
      const balance = total - received;

      updatedTx = {
        id: editingTxId,
        sNo: transactions.find((t) => t.id === editingTxId)?.sNo || 1,
        date: editTxDate,
        itemType: editTxItemType.trim(),
        clientName: editTxClientName.trim() || undefined,
        quantity: qty,
        rate,
        totalAmount: total,
        receivedAmount: received,
        balanceAmount: balance
      };
    }

    if (onUpdateTransaction) {
      await onUpdateTransaction(vendor.id, shop.id, updatedTx);
    } else {
      const updated = transactions.map((t) =>
        t.id === editingTxId ? updatedTx : t
      );

      onUpdateShop({
        ...shop,
        transactions: updated
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
          transactions: updated
        });
      }
    } finally {
      setIsDeletingTx(false);
      setDeleteTxTarget(null);
    }
  };

  return (
    <div className="client-details-page">
      {/* Header Bar */}
      <div className="client-details-header">
        <button onClick={onBack} className="aftrah-app-back-btn">
          <ArrowLeft size={16} />
          <span>Back to {vendor.type} Shops</span>
        </button>

        <div className="client-details-title-row">
          <div>
            <h1 className="client-details-main-title">
              {shop.name} <span>· Purchase & Settlement Ledger</span>
            </h1>
            <div className="client-meta-row">
              <span className="client-meta-pill">
                <Store size={13} color="var(--primary)" />
                {vendor.type} Supplier
              </span>
              <span className="client-meta-pill">
                <Phone size={13} color="var(--primary)" />
                {shop.phone}
              </span>
              <span className="client-meta-pill">
                <MapPin size={13} color="var(--primary)" />
                {shop.address}
              </span>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="client-financial-summary">
            <div className="summary-metric-card">
              <div className="metric-icon-wrap gold">
                <Wallet size={24} />
              </div>
              <div>
                <span className="metric-label">TOTAL PURCHASES</span>
                <span className="metric-value gold">{formatINR(totalPurchase)}</span>
              </div>
            </div>

            <div className="summary-metric-card">
              <div className="metric-icon-wrap blue">
                <TrendingDown size={24} />
              </div>
              <div>
                <span className="metric-label">AMOUNT PAID / SETTLED</span>
                <span className="metric-value blue">{formatINR(totalReceived)}</span>
              </div>
            </div>

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

      {/* Main Ledger Table Section */}
      <section className="aftrah-app-table-section">
        <div className="aftrah-app-section-header">
          <div>
            <h2 className="aftrah-app-section-title">MATERIAL PROCUREMENT & SETTLEMENT LEDGER</h2>
            <span className="aftrah-app-section-subtitle">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'record' : 'records'} logged
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="aftrah-app-search-wrapper">
              <Search size={14} className="aftrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search item, settlement, client..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="aftrah-app-search-input"
              />
            </div>

            {/* Quick Settle Amount Button */}
            <button
              onClick={() => handleOpenAddModal('settlement')}
              className="btn-theme-primary"
              style={{
                height: '36px',
                padding: '0 14px',
                fontSize: '12.5px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
              }}
            >
              <CreditCard size={15} />
              <span>Settle Amount</span>
            </button>

            {/* Record Purchase Button */}
            <button
              onClick={() => handleOpenAddModal('purchase')}
              className="btn-theme-primary"
              style={{ height: '36px', padding: '0 14px', fontSize: '12.5px' }}
            >
              <Plus size={15} />
              <span>Record Purchase</span>
            </button>
          </div>
        </div>

        {/* Ledger Table: S.NO, DATE, TYPE, CLIENT NAME, QTY, RATE, TOTAL, RECEIVED, BALANCE */}
        <div className="aftrah-app-table-container">
          <table className="aftrah-app-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>S.NO</th>
                <th>DATE</th>
                <th>TYPE / ITEM DESCRIPTION</th>
                <th>CLIENT / SITE TAG</th>
                <th style={{ textAlign: 'right' }}>QTY</th>
                <th style={{ textAlign: 'right' }}>RATE</th>
                <th style={{ textAlign: 'right' }}>TOTAL AMOUNT</th>
                <th style={{ textAlign: 'right' }}>RECEIVED / PAID</th>
                <th style={{ textAlign: 'right' }}>STATUS / BALANCE</th>
                <th style={{ width: '70px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
                    {searchQuery ? 'No matching transactions.' : 'No entries logged for this shop yet. Use "Record Purchase" or "Settle Amount" above.'}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, index) => {
                  const isSettlement = isSettlementTx(tx);
                  return (
                    <tr
                      key={tx.id}
                      style={{
                        background: isSettlement ? 'rgba(16, 185, 129, 0.04)' : undefined
                      }}
                    >
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                        #{startIndex + index + 1}
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} color="var(--primary)" />
                          <span>{tx.date}</span>
                        </div>
                      </td>
                      <td>
                        {isSettlement ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                border: '1px solid rgba(52, 211, 153, 0.3)',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                              }}
                            >
                              <ArrowDownLeft size={12} strokeWidth={2.5} />
                              Settlement
                            </span>
                            {tx.itemType !== 'Settlement' && tx.itemType.replace(/^Settlement\s*[-–:]?\s*/i, '').trim() && (
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                ({tx.itemType.replace(/^Settlement\s*[-–:]?\s*/i, '').trim()})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="expense-name-tag">
                            {tx.itemType}
                          </span>
                        )}
                      </td>
                      <td>
                        {tx.clientName ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <User size={12} color="var(--primary)" />
                            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {tx.clientName}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '11.5px', fontStyle: 'italic' }}>
                            {isSettlement ? 'General Account Settlement' : 'General Stock'}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: isSettlement ? 'var(--text-secondary)' : undefined }}>
                        {isSettlement ? '—' : tx.quantity}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: isSettlement ? 'var(--text-secondary)' : undefined }}>
                        {isSettlement ? '—' : formatINR(tx.rate)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: isSettlement ? 'var(--text-secondary)' : 'var(--primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {isSettlement ? '₹0' : formatINR(tx.totalAmount)}
                      </td>
                      <td style={{ textAlign: 'right', color: isSettlement ? '#34d399' : '#93c5fd', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatINR(tx.receivedAmount)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                        {isSettlement ? (
                          <span style={{ color: '#34d399', fontSize: '11.5px' }}>
                            - {formatINR(tx.receivedAmount)}
                          </span>
                        ) : (
                          <span style={{ color: tx.balanceAmount > 0 ? '#f87171' : '#4ade80' }}>
                            {formatINR(tx.balanceAmount)}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="aftrah-app-action-btn aftrah-app-edit-btn"
                            title="Edit Record"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTxTarget(tx)}
                            className="aftrah-app-action-btn aftrah-app-delete-btn"
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
          <div className="aftrah-app-pagination-bar">
            <div className="aftrah-app-pagination-left">
              <span className="aftrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredTransactions.length}</strong>
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
                </select>
              </div>
            </div>

            <div className="aftrah-app-pagination-controls">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="aftrah-app-page-nav-btn"
                title="Previous Page"
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="aftrah-app-page-nav-btn"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ADD TRANSACTION MODAL (Material Purchase OR Settlement Mode) */}
      {isAddModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {modalMode === 'purchase' ? (
                  <>
                    <ShoppingBag size={18} color="var(--primary)" />
                    <h3 className="aftrah-app-modal-title">Record Material Purchase</h3>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} color="#34d399" />
                    <h3 className="aftrah-app-modal-title" style={{ color: '#34d399' }}>Record Direct Settlement</h3>
                  </>
                )}
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '14px 22px 0',
              }}
            >
              <button
                type="button"
                onClick={() => setModalMode('purchase')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: modalMode === 'purchase'
                    ? '1px solid var(--primary)'
                    : '1px solid var(--border-stroke, #2c303a)',
                  background: modalMode === 'purchase'
                    ? 'rgba(226, 195, 153, 0.15)'
                    : 'var(--surface-container, #1e2126)',
                  color: modalMode === 'purchase'
                    ? 'var(--primary)'
                    : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShoppingBag size={14} />
                <span>Material Purchase</span>
              </button>

              <button
                type="button"
                onClick={() => setModalMode('settlement')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: modalMode === 'settlement'
                    ? '1px solid #10b981'
                    : '1px solid var(--border-stroke, #2c303a)',
                  background: modalMode === 'settlement'
                    ? 'rgba(16, 185, 129, 0.18)'
                    : 'var(--surface-container, #1e2126)',
                  color: modalMode === 'settlement'
                    ? '#34d399'
                    : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <CreditCard size={14} />
                <span>Direct Settlement</span>
              </button>
            </div>

            <form onSubmit={handleAddTransactionSubmit}>
              <div className="aftrah-app-modal-body">
                {modalMode === 'settlement' ? (
                  /* ================= SETTLEMENT FORM FIELDS ================= */
                  <>
                    <div
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(52, 211, 153, 0.25)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4
                      }}
                    >
                      <strong style={{ color: '#34d399' }}>Settlement Payment:</strong> Record a direct payment made to {shop.name} without attaching items or total invoice amount. This will directly credit and reduce your pending dues.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                        <label className="aftrah-app-label">Client / Site Tag (Optional)</label>
                        <SearchableExpenseSelect
                          value={txClientName}
                          onChange={(val) => setTxClientName(val)}
                          options={clientOptions}
                          placeholder="Allocate to client (optional)..."
                          searchPlaceholder="Search client name..."
                        />
                      </div>
                    </div>

                    <div className="aftrah-app-form-group">
                      <label className="aftrah-app-label">Settled / Paid Amount (₹) *</label>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        required
                        placeholder="e.g. 50000"
                        value={settlementAmount}
                        onChange={(e) => setSettlementAmount(e.target.value)}
                        className="aftrah-app-input"
                        style={{ fontSize: '15px', fontWeight: 700, color: '#34d399' }}
                      />
                    </div>

                    <div className="aftrah-app-form-group">
                      <label className="aftrah-app-label">Settlement Reference / Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Due clearance / Account settlement"
                        value={settlementNote}
                        onChange={(e) => setSettlementNote(e.target.value)}
                        className="aftrah-app-input"
                      />
                    </div>
                  </>
                ) : (
                  /* ================= MATERIAL PURCHASE FORM FIELDS ================= */
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                        <label className="aftrah-app-label">Client / Site Tag (Optional)</label>
                        <SearchableExpenseSelect
                          value={txClientName}
                          onChange={(val) => setTxClientName(val)}
                          options={clientOptions}
                          placeholder="Allocate to client..."
                          searchPlaceholder="Search client name..."
                        />
                      </div>
                    </div>

                    <div className="aftrah-app-form-group">
                      <label className="aftrah-app-label">Item / Material Description *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wirecut Red Bricks Grade A"
                        value={txItemType}
                        onChange={(e) => setTxItemType(e.target.value)}
                        className="aftrah-app-input"
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
                          min="0.1"
                          required
                          placeholder="e.g. 12"
                          value={txRate}
                          onChange={(e) => setTxRate(e.target.value)}
                          className="aftrah-app-input"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="aftrah-app-form-group">
                        <label className="aftrah-app-label">Total Amount (₹)</label>
                        <div className="total-amount-display">
                          {formatINR(calculatedTotal)}
                        </div>
                      </div>

                      <div className="aftrah-app-form-group">
                        <label className="aftrah-app-label">Received / Paid Amount (₹) *</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="0 if pending"
                          value={txReceived}
                          onChange={(e) => setTxReceived(e.target.value)}
                          className="aftrah-app-input"
                        />
                      </div>
                    </div>

                    <div className="aftrah-app-form-group">
                      <label className="aftrah-app-label">Balance Remaining (₹)</label>
                      <div
                        className="total-amount-display"
                        style={{ color: calculatedBalance > 0 ? '#f87171' : '#4ade80' }}
                      >
                        {formatINR(calculatedBalance)}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isAddValid}
                  className="btn-theme-primary"
                  style={{
                    background: modalMode === 'settlement'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : undefined,
                    color: modalMode === 'settlement' ? '#ffffff' : undefined
                  }}
                >
                  <Plus size={16} />
                  <span>{modalMode === 'settlement' ? 'Save Settlement' : 'Save Transaction'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {isEditModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={17} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">
                  {editModalMode === 'settlement' ? 'Edit Settlement Payment' : 'Edit Material Purchase'}
                </h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="aftrah-app-modal-body">
                {editModalMode === 'settlement' ? (
                  /* ================= EDIT SETTLEMENT ================= */
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                        <label className="aftrah-app-label">Client / Site Tag (Optional)</label>
                        <SearchableExpenseSelect
                          value={editTxClientName}
                          onChange={(val) => setEditTxClientName(val)}
                          options={clientOptions}
                        />
                      </div>
                    </div>

                    <div className="aftrah-app-form-group">
                      <label className="aftrah-app-label">Settlement Description / Note *</label>
                      <input
                        type="text"
                        required
                        value={editTxItemType}
                        onChange={(e) => setEditTxItemType(e.target.value)}
                        className="aftrah-app-input"
                      />
                    </div>

                    <div className="aftrah-app-form-group">
                      <label className="aftrah-app-label">Settled Amount (₹) *</label>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        required
                        value={editTxReceived}
                        onChange={(e) => setEditTxReceived(e.target.value)}
                        className="aftrah-app-input"
                        style={{ fontSize: '15px', fontWeight: 700, color: '#34d399' }}
                      />
                    </div>
                  </>
                ) : (
                  /* ================= EDIT MATERIAL PURCHASE ================= */
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                        <label className="aftrah-app-label">Client / Site Tag</label>
                        <SearchableExpenseSelect
                          value={editTxClientName}
                          onChange={(val) => setEditTxClientName(val)}
                          options={clientOptions}
                        />
                      </div>
                    </div>

                    <div className="aftrah-app-form-group">
                      <label className="aftrah-app-label">Item / Material Description *</label>
                      <input
                        type="text"
                        required
                        value={editTxItemType}
                        onChange={(e) => setEditTxItemType(e.target.value)}
                        className="aftrah-app-input"
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
                          min="0.1"
                          required
                          value={editTxRate}
                          onChange={(e) => setEditTxRate(e.target.value)}
                          className="aftrah-app-input"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="aftrah-app-form-group">
                        <label className="aftrah-app-label">Total Amount (₹)</label>
                        <div className="total-amount-display">
                          {formatINR(editCalculatedTotal)}
                        </div>
                      </div>

                      <div className="aftrah-app-form-group">
                        <label className="aftrah-app-label">Received / Paid Amount (₹) *</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          value={editTxReceived}
                          onChange={(e) => setEditTxReceived(e.target.value)}
                          className="aftrah-app-input"
                        />
                      </div>
                    </div>

                    <div className="aftrah-app-form-group">
                      <label className="aftrah-app-label">Balance Remaining (₹)</label>
                      <div
                        className="total-amount-display"
                        style={{ color: editCalculatedBalance > 0 ? '#f87171' : '#4ade80' }}
                      >
                        {formatINR(editCalculatedBalance)}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!isEditValid} className="btn-theme-primary">
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE TRANSACTION / SETTLEMENT MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTxTarget)}
        title={deleteTxTarget && isSettlementTx(deleteTxTarget) ? 'Delete Settlement Payment' : 'Delete Purchase Record'}
        message="Are you sure you want to delete this ledger record? The supplier's outstanding balance will be recalculated immediately."
        itemName={deleteTxTarget ? `${deleteTxTarget.date} — ${deleteTxTarget.itemType} (${formatINR(deleteTxTarget.totalAmount || deleteTxTarget.receivedAmount)})` : undefined}
        confirmText="Delete Record"
        isDeleting={isDeletingTx}
        onConfirm={handleConfirmDeleteTransaction}
        onClose={() => setDeleteTxTarget(null)}
      />
    </div>
  );
};
