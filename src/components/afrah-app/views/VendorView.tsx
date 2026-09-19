import React, { useState, useMemo } from 'react';
import type { Vendor } from '../types';
import { PREDEFINED_VENDOR_TYPES } from '../types';
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
  X
} from 'lucide-react';

interface VendorViewProps {
  vendors: Vendor[];
  onSelectVendor: (vendor: Vendor) => void;
  onAddVendor: (vendor: Omit<Vendor, 'id' | 'sNo'>) => void;
  onUpdateVendor: (updated: Vendor) => void;
  onDeleteVendor: (id: string) => void;
}

export const VendorView: React.FC<VendorViewProps> = ({
  vendors,
  onSelectVendor,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add Form Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    setIsAddModalOpen(false);
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

  return (
    <div className="w-full">
      {/* VENDOR CATEGORIES LIST (Full Width) */}
      <section className="afrah-app-table-section w-full">
        <div className="afrah-app-section-header">
          <div>
            <h1 className="afrah-app-section-title">Vendor Categories</h1>
            <span className="afrah-app-section-subtitle">
              {filteredVendors.length} {filteredVendors.length === 1 ? 'category' : 'categories'} · Click a row to view shops
            </span>
          </div>

          <div className="flex-center-10">
            <div className="afrah-app-search-wrapper" style={{ margin: 0 }}>
              <Search size={14} className="afrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search vendor category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="afrah-app-search-input"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn-theme-primary btn-add"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Add Details</span>
            </button>
          </div>
        </div>

        {/* Table matching handwritten sketch: S.NO, TYPE, ACTIONS */}
        <div className="afrah-app-table-container">
          <table className="afrah-app-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '60px' }}>S.NO</th>
                <th>TYPE (TRADE / MATERIAL)</th>
                <th className="text-center" style={{ width: '130px' }}>SHOPS COUNT</th>
                <th className="text-center" style={{ width: '85px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state-cell">
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
                      <td className="cell-sno">
                        {startIndex + index + 1}
                      </td>
                      <td>
                        <div className="cell-entity">
                          <div className="afrah-app-user-avatar" style={{ background: 'rgba(226, 195, 153, 0.15)', color: 'var(--primary)' }}>
                            <Truck size={14} />
                          </div>
                          <span className="row-entity-name">
                            {vendor.type}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="section-total-badge" style={{ fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-bold)', padding: '3px 10px' }}>
                          {shopsCount} {shopsCount === 1 ? 'shop' : 'shops'}
                        </span>
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="cell-actions">
                          <button
                            onClick={() => handleOpenEdit(vendor)}
                            className="afrah-app-action-btn afrah-app-edit-btn"
                            title="Edit Category"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteVendorTarget(vendor);
                            }}
                            className="afrah-app-action-btn afrah-app-delete-btn"
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
          <div className="afrah-app-pagination-bar">
            <div className="afrah-app-pagination-left">
              <span className="afrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredVendors.length}</strong>
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Add Details Modal */}
      {isAddModalOpen && (
        <div className="afrah-app-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
              className="afrah-app-modal-container modal-w-md"
              onClick={(e) => e.stopPropagation()}
          >
            <div className="afrah-app-modal-header">
              <div className="flex-center">
                <Plus size={17} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Add Details</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="afrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Type (Vendor / Material Category) *</label>
                  <SearchableExpenseSelect
                    value={addType}
                    onChange={(val) => setAddType(val)}
                    options={PREDEFINED_VENDOR_TYPES}
                    placeholder="Select or enter vendor trade..."
                    searchPlaceholder="Filter or type custom trade..."
                  />
                </div>

                {!isAddFormValid && (
                  <div className="afrah-app-validation-notice mt-6">
                    * Enter or select a trade type to enable submission.
                  </div>
                )}
              </div>

              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="afrah-app-modal-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isAddFormValid}
                  className="btn-theme-primary afrah-app-submit-btn"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Add Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {isEditModalOpen && (
        <div className="afrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
              className="afrah-app-modal-container modal-w-sm"
              onClick={(e) => e.stopPropagation()}
          >
            <div className="afrah-app-modal-header">
              <div className="flex-center">
                <Pencil size={17} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Vendor Category</h3>
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
                  <label className="afrah-app-label">Type (Material Category) *</label>
                  <SearchableExpenseSelect
                    value={editType}
                    onChange={(val) => setEditType(val)}
                    options={PREDEFINED_VENDOR_TYPES}
                  />
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
