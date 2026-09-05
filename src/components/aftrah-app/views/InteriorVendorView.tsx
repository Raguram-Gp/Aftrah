import React, { useState, useMemo } from 'react';
import type { Vendor } from '../types';
import { PREDEFINED_INTERIOR_VENDOR_TYPES } from '../types';
import { SearchableExpenseSelect } from '../components/SearchableExpenseSelect';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Hammer,
  Layers,
  Wrench
} from 'lucide-react';

interface InteriorVendorViewProps {
  vendors: Vendor[];
  onSelectVendor: (vendor: Vendor) => void;
  onAddVendor: (vendor: Omit<Vendor, 'id' | 'sNo'>) => void;
  onUpdateVendor: (updated: Vendor) => void;
  onDeleteVendor: (id: string) => void;
}

export const InteriorVendorView: React.FC<InteriorVendorViewProps> = ({
  vendors,
  onSelectVendor,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add Form State (Right Column Card)
  const [addType, setAddType] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [editType, setEditType] = useState('');

  // Delete Modal State
  const [deleteVendorTarget, setDeleteVendorTarget] = useState<Vendor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Validations
  const isAddFormValid = addType.trim().length > 0;
  const isEditFormValid = editType.trim().length > 0;

  // Filter vendors
  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const q = searchQuery.toLowerCase();
    return vendors.filter(
      (v) =>
        v.type.toLowerCase().includes(q) ||
        String(v.sNo).includes(q)
    );
  }, [vendors, searchQuery]);

  // Pagination computations
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredVendors.length);
  const paginatedVendors = filteredVendors.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddFormValid) return;

    onAddVendor({
      type: addType.trim(),
      shops: []
    });

    setAddType('');
  };

  // Open Edit Modal
  const handleOpenEdit = (vendor: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVendorId(vendor.id);
    setEditType(vendor.type);
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditFormValid || !editingVendorId) return;

    const vendor = vendors.find((v) => v.id === editingVendorId);
    if (vendor) {
      onUpdateVendor({
        ...vendor,
        type: editType.trim()
      });
    }

    setIsEditModalOpen(false);
    setEditingVendorId(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteVendorTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteVendor(deleteVendorTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteVendorTarget(null);
    }
  };

  // Category icon helper
  const getCategoryIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('carpenter') || lower.includes('carpender')) {
      return <Hammer size={14} />;
    }
    if (lower.includes('plywood') || lower.includes('sheet') || lower.includes('panel')) {
      return <Layers size={14} />;
    }
    if (lower.includes('hardware') || lower.includes('fittings')) {
      return <Wrench size={14} />;
    }
    return <Truck size={14} />;
  };

  return (
    <div className="aftrah-app-wireframe-layout">
      {/* LEFT COLUMN: VENDOR CATEGORIES LIST */}
      <section className="aftrah-app-table-section">
        <div className="aftrah-app-section-header">
          <div>
            <h1 className="aftrah-app-section-title">VENDOR CATEGORIES</h1>
            <span className="aftrah-app-section-subtitle">
              {filteredVendors.length} {filteredVendors.length === 1 ? 'category' : 'categories'} · Click a row to view shops
            </span>
          </div>

          <div className="aftrah-app-search-wrapper">
            <Search size={14} className="aftrah-app-search-icon" />
            <input
              type="text"
              placeholder="Search vendor category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="aftrah-app-search-input"
            />
          </div>
        </div>

        {/* Table matching handwritten sketch: S.NO, TYPE (TRADE / MATERIAL), SHOPS COUNT, ACTIONS */}
        <div className="aftrah-app-table-container">
          <table className="aftrah-app-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>S.NO</th>
                <th>TYPE (TRADE / MATERIAL)</th>
                <th style={{ width: '130px', textAlign: 'center' }}>SHOPS COUNT</th>
                <th style={{ width: '85px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
                    {searchQuery ? 'No matching vendor categories.' : 'No vendor categories found. Add one on the right.'}
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((vendor, index) => {
                  const shopsCount = vendor.shops?.length || 0;
                  return (
                    <tr
                      key={vendor.id}
                      onClick={() => onSelectVendor(vendor)}
                      className="clickable-client-row"
                    >
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                        #{startIndex + index + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="aftrah-app-user-avatar" style={{ background: 'rgba(226, 195, 153, 0.15)', color: 'var(--primary)' }}>
                            {getCategoryIcon(vendor.type)}
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-primary)', fontSize: '13.5px', fontWeight: 600 }}>
                              {vendor.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="section-total-badge" style={{ fontSize: '11.5px', padding: '2px 8px' }}>
                          {shopsCount} {shopsCount === 1 ? 'shop' : 'shops'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleOpenEdit(vendor, {} as any)}
                            className="aftrah-app-action-btn aftrah-app-edit-btn"
                            title="Edit Category"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteVendorTarget(vendor);
                            }}
                            className="aftrah-app-action-btn aftrah-app-delete-btn"
                            title="Delete Category"
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
        {filteredVendors.length > 0 && (
          <div className="aftrah-app-pagination-bar">
            <div className="aftrah-app-pagination-left">
              <span className="aftrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredVendors.length}</strong>
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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

      {/* RIGHT COLUMN: ADD DETAILS CARD */}
      <aside className="aftrah-app-form-card">
        <div className="aftrah-app-form-card-header">
          <h2 className="aftrah-app-form-card-title">Add Details</h2>
        </div>

        <form onSubmit={handleAddSubmit} className="aftrah-app-add-form">
          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">TYPE (VENDOR / MATERIAL CATEGORY) *</label>
            <SearchableExpenseSelect
              value={addType}
              onChange={(val) => setAddType(val)}
              options={PREDEFINED_INTERIOR_VENDOR_TYPES}
              placeholder="Select or enter vendor trade..."
              searchPlaceholder="Filter or type trade (e.g. Hardware, Carpenter, Plywoods)..."
            />
          </div>

          {!isAddFormValid && (
            <div className="aftrah-app-validation-notice">
              * Enter or select a trade type to enable submission.
            </div>
          )}

          <button
            type="submit"
            disabled={!isAddFormValid}
            className="btn-theme-primary aftrah-app-submit-btn"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Details</span>
          </button>
        </form>
      </aside>

      {/* Edit Vendor Modal */}
      {isEditModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="aftrah-app-modal-container"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={17} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Edit Vendor Category</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="aftrah-app-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="aftrah-app-modal-body">
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">TYPE (VENDOR / MATERIAL CATEGORY) *</label>
                  <SearchableExpenseSelect
                    value={editType}
                    onChange={(val) => setEditType(val)}
                    options={PREDEFINED_INTERIOR_VENDOR_TYPES}
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
                  disabled={!isEditFormValid}
                  className="btn-theme-primary"
                >
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE VENDOR CATEGORY MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteVendorTarget)}
        title="Delete Vendor Category"
        message="Are you sure you want to delete this category? All associated shops and transaction records under this category will be permanently removed."
        itemName={deleteVendorTarget ? deleteVendorTarget.type : undefined}
        confirmText="Delete Category"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteVendorTarget(null)}
      />
    </div>
  );
};
