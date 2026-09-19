import React, { useState, useMemo } from 'react';
import type { BrickStockItem } from '../types';
import {
  Boxes,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Printer,
  X
} from 'lucide-react';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { TableFormPopover } from '../components/TableFormPopover';
import { TablePrintPreviewModal } from '../components/TablePrintPreviewModal';

interface BricksStockRegisterViewProps {
  stockItems: BrickStockItem[];
  stats?: {
    totalOpening: number;
    totalProduction: number;
    totalSales: number;
    totalPendingStock: number;
    totalStockUnits: number;
  };
  onSelectItem?: (item: BrickStockItem) => void;
  onAddStockItem: (
    data: Omit<BrickStockItem, 'id' | 'sNo' | 'pendingStock' | 'createdAt' | 'updatedAt'>
  ) => Promise<any>;
  onUpdateStockItem: (updated: BrickStockItem) => Promise<any>;
  onDeleteStockItem?: (id: string) => Promise<any>;
  onDeleteMultipleStockItems?: (ids: string[]) => Promise<any>;
}

export const BricksStockRegisterView: React.FC<BricksStockRegisterViewProps> = ({
  stockItems,
  onSelectItem,
  onAddStockItem,
  onUpdateStockItem,
  onDeleteStockItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addItem, setAddItem] = useState('');
  const [addOpening, setAddOpening] = useState('');
  const [addNewStock, setAddNewStock] = useState('');
  const [addUsage, setAddUsage] = useState('');
  const [addUnitName, setAddUnitName] = useState('Units');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState('');
  const [editUnitName, setEditUnitName] = useState('Units');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BrickStockItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered Stock Items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return stockItems;
    return stockItems.filter(
      (item) =>
        item.item.toLowerCase().includes(q) ||
        String(item.stockOpening).includes(q) ||
        String(item.currentProduction).includes(q) ||
        String(item.sales).includes(q) ||
        String(item.pendingStock).includes(q) ||
        String(item.sNo).includes(q)
    );
  }, [stockItems, searchQuery]);

  const totalSales = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + (Number(item.sales) || 0), 0);
  }, [filteredItems]);

  const totalPendingStock = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + (Number(item.pendingStock) || 0), 0);
  }, [filteredItems]);

  // Pagination computations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Print Statement Preview State
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const existingItemNames = useMemo(
    () => new Set(stockItems.map((item) => item.item.trim().toLowerCase())),
    [stockItems]
  );

  const trimmedAddItem = addItem.trim();
  const isDuplicateName =
    trimmedAddItem.length > 0 && existingItemNames.has(trimmedAddItem.toLowerCase());
  const isAddFormValid = trimmedAddItem.length > 0 && !isDuplicateName && !isAdding;

  const trimmedEditItem = editItem.trim();
  const isEditDuplicateName =
    trimmedEditItem.length > 0 &&
    stockItems.some(
      (item) =>
        item.id !== editingItemId &&
        item.item.trim().toLowerCase() === trimmedEditItem.toLowerCase()
    );
  const isEditFormValid =
    trimmedEditItem.length > 0 && !isEditDuplicateName && !isSavingEdit && Boolean(editingItemId);

  const resetAddForm = () => {
    setAddItem('');
    setAddOpening('');
    setAddNewStock('');
    setAddUsage('');
    setAddUnitName('Units');
    setAddError('');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddFormValid) return;

    setIsAdding(true);
    setAddError('');
    try {
      await onAddStockItem({
        item: trimmedAddItem,
        stockOpening: parseFloat(addOpening) || 0,
        currentProduction: parseFloat(addNewStock) || 0,
        sales: parseFloat(addUsage) || 0,
        materialUsage: parseFloat(addUsage) || 0,
        unitName: addUnitName.trim() || 'Units',
        notes: '',
        entries: []
      });
      resetAddForm();
      setIsAddModalOpen(false);
      setCurrentPage(1);
    } catch (err: any) {
      const message = String(err?.message || '');
      if (err?.code === '23505' || message.toLowerCase().includes('duplicate')) {
        setAddError('A stock category with this name already exists.');
      } else {
        setAddError(message || 'Failed to add stock category.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenEdit = (item: BrickStockItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItemId(item.id);
    setEditItem(item.item);
    setEditUnitName(item.unitName || 'Units');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingItemId(null);
    setEditError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditFormValid || !editingItemId) return;

    const target = stockItems.find((item) => item.id === editingItemId);
    if (!target) return;

    setIsSavingEdit(true);
    setEditError('');
    try {
      await onUpdateStockItem({
        ...target,
        item: trimmedEditItem,
        unitName: editUnitName.trim() || 'Units'
      });
      handleCloseEdit();
    } catch (err: any) {
      const message = String(err?.message || '');
      if (err?.code === '23505' || message.toLowerCase().includes('duplicate')) {
        setEditError('A stock category with this name already exists.');
      } else {
        setEditError(message || 'Failed to update stock category.');
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDeleteStockItem) return;
    setIsDeleting(true);
    try {
      await onDeleteStockItem(deleteTarget.id);
      const remaining = filteredItems.filter((item) => item.id !== deleteTarget.id).length;
      const nextTotalPages = Math.max(1, Math.ceil(remaining / itemsPerPage));
      if (currentPage > nextTotalPages) setCurrentPage(nextTotalPages);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Print Handler - opens preview modal first
  const handlePrint = () => {
    setIsPrintPreviewOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* PRINT-ONLY HEADER */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">KABIBULLAH BRICKS</h1>
            <p className="print-company-sub">Brick Stock Register, Manufacturing & Inventory Management</p>
          </div>
          <div className="print-badge-statement">
            <span>STOCK REGISTER</span>
          </div>
        </div>

        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Total Items:</span> <strong>{filteredItems.length} Records</strong>
          </div>
          <div className="print-total-item">
            <span>Total Sales:</span> <strong className="text-negative">{Number(totalSales).toLocaleString('en-IN')} Units</strong>
          </div>
          <div className="print-total-item">
            <span>Total Pending Stock:</span> <strong style={{ color: '#16a34a' }}>{Number(totalPendingStock).toLocaleString('en-IN')} Units</strong>
          </div>
          <div className="print-total-item">
            <span>Statement Date:</span> <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
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
      </div>

      {/* MAIN OVERVIEW TABLE SECTION */}
      <section className={`afrah-app-table-section${isAddModalOpen ? ' with-add-popover' : ''}`} style={{ width: '100%' }}>
        <div className="afrah-app-section-header no-print">
          <div>
            <div className="flex-center-10">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(226, 195, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(226, 195, 153, 0.3)'
                }}
              >
                <Boxes size={18} color="var(--primary)" />
              </div>
              <h1 className="afrah-app-section-title" style={{ letterSpacing: '0.04em' }}>
                STOCK REGISTER
              </h1>
            </div>
            <span className="afrah-app-section-subtitle">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} · Click any row to open its detailed ledger
            </span>
          </div>

          {/* Search & Print Actions */}
          <div className="flex-center-wrap-10">
            <div className="afrah-app-search-wrapper">
              <Search size={14} className="afrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search item, sales, stock..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="afrah-app-search-input"
              />
            </div>

            <TableFormPopover
              open={isAddModalOpen}
              onOpenChange={setIsAddModalOpen}
              label="Add Details"
              onOpen={resetAddForm}
            >
              <form onSubmit={handleAddSubmit} className="afrah-app-add-form">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Stock Category <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flyash, Cement, Coal..."
                    value={addItem}
                    onChange={(e) => {
                      setAddItem(e.target.value);
                      setAddError('');
                    }}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Opening Stock</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={addOpening}
                    onChange={(e) => setAddOpening(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">New Stock</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={addNewStock}
                    onChange={(e) => setAddNewStock(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Usage</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={addUsage}
                    onChange={(e) => setAddUsage(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Unit</label>
                  <input
                    type="text"
                    placeholder="Units"
                    value={addUnitName}
                    onChange={(e) => setAddUnitName(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                {!trimmedAddItem && (
                  <div className="afrah-app-validation-notice mt-6">
                    * Enter a stock category name to enable submission.
                  </div>
                )}

                {isDuplicateName && (
                  <div className="afrah-app-validation-notice mt-6">
                    A stock category named "{trimmedAddItem}" already exists.
                  </div>
                )}

                {addError && (
                  <div className="afrah-app-validation-notice mt-6">
                    {addError}
                  </div>
                )}

                <div className="afrah-app-add-popover-actions">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="afrah-app-back-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isAddFormValid}
                    className="btn-theme-primary"
                  >
                    <Plus size={16} />
                    <span>{isAdding ? 'Saving...' : 'Save Details'}</span>
                  </button>
                </div>
              </form>
            </TableFormPopover>
          </div>
        </div>

        {/* Table: S NO | ITEM | TOTAL SALES / USAGE | PENDING STOCK */}
        <div className="afrah-app-table-container">
          <table className="afrah-app-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th className="text-center" style={{ width: '70px' }}>S NO</th>
                <th style={{ width: '28%', paddingLeft: '16px' }}>ITEM</th>
                <th style={{ width: '32%', textAlign: 'left', paddingLeft: '16px' }}>TOTAL SALES / USAGE</th>
                <th style={{ width: '28%', textAlign: 'right', paddingRight: '16px' }}>PENDING STOCK</th>
                <th className="no-print text-center" style={{ width: '96px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state-cell">
                    {searchQuery
                      ? 'No matching stock items found.'
                      : 'No stock categories found. Use "Add Details" to add one.'}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                  const displaySNo = startIndex + index + 1;

                  return (
                    <tr
                      key={item.id}
                      className="clickable-client-row"
                      onClick={() => onSelectItem && onSelectItem(item)}
                      title={`Click to manage ${item.item} ledger`}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* S NO */}
                      <td className="cell-sno">
                        {displaySNo}
                      </td>

                      {/* ITEM */}
                      <td style={{ paddingLeft: '16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              padding: '3px 12px',
                              borderRadius: '6px',
                              fontSize: 'var(--fs-xs)',
                              fontWeight: 'var(--fw-bold)',
                              background: 'rgba(226, 195, 153, 0.15)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(226, 195, 153, 0.25)'
                            }}
                          >
                            {item.item}
                          </span>
                        </div>
                      </td>

                      {/* TOTAL SALES / USAGE */}
                      <td
                        style={{
                          textAlign: 'left',
                          fontWeight: 'var(--fw-bold)',
                          color: '#f87171',
                          fontSize: 'var(--fs-sm)',
                          paddingLeft: '16px'
                        }}
                      >
                        {Number(item.sales || 0).toLocaleString('en-IN')} Units
                      </td>

                      {/* PENDING STOCK */}
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 'var(--fw-black)',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--fs-sm)',
                          paddingRight: '16px'
                        }}
                      >
                        {Number(item.pendingStock || 0).toLocaleString('en-IN')} Units
                      </td>

                      <td className="no-print text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="cell-actions">
                          <button
                            onClick={(e) => handleOpenEdit(item, e)}
                            className="afrah-app-action-btn afrah-app-edit-btn"
                            title={`Edit ${item.item}`}
                          >
                            <Pencil size={13} />
                          </button>
                          {onDeleteStockItem && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(item);
                              }}
                              className="afrah-app-action-btn afrah-app-delete-btn"
                              title={`Delete ${item.item}`}
                              aria-label={`Delete ${item.item}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
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
        {filteredItems.length > 0 && (
          <div className="afrah-app-pagination-bar">
            <div className="afrah-app-pagination-left">
              <span className="afrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{' '}
                <strong>{filteredItems.length}</strong> | Sales: <strong style={{ color: '#f87171' }}>{Number(totalSales).toLocaleString('en-IN')}</strong> · Pending Stock: <strong className="text-primary-gold">{Number(totalPendingStock).toLocaleString('en-IN')}</strong>
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
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="afrah-app-pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="afrah-app-page-nav-btn"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="afrah-app-page-numbers-wrap">
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`afrah-app-page-num-btn ${currentPage === p ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="afrah-app-page-nav-btn"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* STOCK REGISTER PRINT PREVIEW MODAL */}
      <TablePrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        shareKind="brick_stock_register"
        shareTitle="Stock Register & Inventory Statement"
        title="Stock Register & Inventory Statement"
        badgeLabel="Brick Stock Register"
        badgeIcon={<Boxes size={16} color="var(--primary, #e2c399)" />}
        companyName="KABIBULLAH BRICKS"
        companySub="BRICK STOCK REGISTER, MANUFACTURING & INVENTORY MANAGEMENT"
        metaTitle="REGISTER"
        metaValue="FACTORY INVENTORY & FINISHED GOODS"
        highlightBanner={{
          label: 'TOTAL AVAILABLE FINISHED STOCK',
          value: `${Number(totalPendingStock).toLocaleString('en-IN')} Units`,
          isNegative: false,
          color: '#16a34a'
        }}
        headers={['S.NO', 'ITEM', 'OPENING STOCK', 'PRODUCTION / INFLOW', 'SALES / USAGE', 'PENDING STOCK']}
        colAlignments={['center', 'left', 'center', 'center', 'center', 'center']}
        rows={filteredItems.map((item, idx) => {
          const unit = item.unitName || 'Units';
          const pending = Number(item.pendingStock || 0);
          return [
            idx + 1,
            <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{item.item}</span>,
            Number(item.stockOpening || 0).toLocaleString('en-IN'),
            Number(item.currentProduction || 0).toLocaleString('en-IN'),
            Number(item.sales || 0).toLocaleString('en-IN'),
            <strong style={{ color: pending > 0 ? '#16a34a' : '#ef4444' }}>
              {pending.toLocaleString('en-IN')} {unit}
            </strong>
          ];
        })}
        totalRow={{
          labelIndex: 1,
          values: [
            '',
            'TOTAL',
            filteredItems.reduce((sum, item) => sum + (Number(item.stockOpening) || 0), 0).toLocaleString('en-IN'),
            filteredItems.reduce((sum, item) => sum + (Number(item.currentProduction) || 0), 0).toLocaleString('en-IN'),
            `${Number(totalSales).toLocaleString('en-IN')} Units`,
            `${Number(totalPendingStock).toLocaleString('en-IN')} Units`
          ]
        }}
        summaryItems={[
          { label: 'Total Stock Items', value: `${filteredItems.length} Records` },
          { label: 'Total Dispatched / Sales', value: `${Number(totalSales).toLocaleString('en-IN')} Units` },
          { label: 'Current Available Stock', value: `${Number(totalPendingStock).toLocaleString('en-IN')} Units`, highlightColor: '#16a34a' }
        ]}
      />

      {isEditModalOpen && (
        <div className="afrah-app-modal-overlay" onClick={handleCloseEdit}>
          <div
            className="afrah-app-modal-container modal-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="afrah-app-modal-header">
              <div className="flex-center">
                <Pencil size={17} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Stock Category</h3>
              </div>
              <button
                onClick={handleCloseEdit}
                className="afrah-app-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">
                    Stock Category <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flyash, Cement, Coal..."
                    value={editItem}
                    onChange={(e) => {
                      setEditItem(e.target.value);
                      setEditError('');
                    }}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Unit</label>
                  <input
                    type="text"
                    placeholder="Units"
                    value={editUnitName}
                    onChange={(e) => setEditUnitName(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                {!trimmedEditItem && (
                  <div className="afrah-app-validation-notice mt-6">
                    * Enter a stock category name to save changes.
                  </div>
                )}

                {isEditDuplicateName && (
                  <div className="afrah-app-validation-notice mt-6">
                    A stock category named "{trimmedEditItem}" already exists.
                  </div>
                )}

                {editError && (
                  <div className="afrah-app-validation-notice mt-6">
                    {editError}
                  </div>
                )}
              </div>

              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="afrah-app-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isEditFormValid}
                  className="btn-theme-primary"
                >
                  <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Stock Category"
        message="Are you sure you want to delete this stock category? All ledger entries for this item will be permanently deleted."
        itemName={deleteTarget?.item}
        confirmText="Delete Category"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
