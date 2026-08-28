import React, { useState, useMemo } from 'react';
import type { Vendor, VendorShop } from '../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  ArrowLeft,
  Store,
  Phone,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard
} from 'lucide-react';

interface VendorShopsViewProps {
  vendor: Vendor;
  onBack: () => void;
  onSelectShop: (shop: VendorShop) => void;
  onAddShop: (shopData: Omit<VendorShop, 'id' | 'sNo'>) => void;
  onUpdateShop: (updatedShop: VendorShop) => void;
  onDeleteShop: (shopId: string) => void;
}

export const VendorShopsView: React.FC<VendorShopsViewProps> = ({
  vendor,
  onBack,
  onSelectShop,
  onAddShop,
  onUpdateShop,
  onDeleteShop
}) => {
  const shops = vendor.shops || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add Form State (Right Column Card)
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addAddress, setAddAddress] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Delete Modal State
  const [deleteShopTarget, setDeleteShopTarget] = useState<VendorShop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAddFormValid =
    addName.trim().length > 0 &&
    addPhone.trim().length > 0 &&
    addAddress.trim().length > 0;

  const isEditFormValid =
    editName.trim().length > 0 &&
    editPhone.trim().length > 0 &&
    editAddress.trim().length > 0;

  // Filter shops
  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) return shops;
    const q = searchQuery.toLowerCase();
    return shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.address.toLowerCase().includes(q) ||
        String(s.sNo).includes(q)
    );
  }, [shops, searchQuery]);

  // Calculate total pending balance for a shop
  const getShopPendingAmount = (shop: VendorShop) => {
    return (shop.transactions || []).reduce((sum, tx) => sum + (tx.balanceAmount || 0), 0);
  };

  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Pagination computations
  const totalPages = Math.ceil(filteredShops.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredShops.length);
  const paginatedShops = filteredShops.slice(startIndex, endIndex);

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

    onAddShop({
      name: addName.trim(),
      phone: addPhone.trim(),
      address: addAddress.trim(),
      transactions: []
    });

    setAddName('');
    setAddPhone('');
    setAddAddress('');
  };

  // Open Edit Modal
  const handleOpenEdit = (shop: VendorShop, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingShopId(shop.id);
    setEditName(shop.name);
    setEditPhone(shop.phone);
    setEditAddress(shop.address);
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditFormValid || !editingShopId) return;

    const shop = shops.find((s) => s.id === editingShopId);
    if (shop) {
      onUpdateShop({
        ...shop,
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim()
      });
    }

    setIsEditModalOpen(false);
    setEditingShopId(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteShopTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteShop(deleteShopTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteShopTarget(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Breadcrumb / Back Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={onBack} className="aftrah-app-back-btn">
          <ArrowLeft size={16} />
          <span>Back to All Vendor Categories</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Selected Trade:</span>
          <span className="section-total-badge" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            {vendor.type}
          </span>
        </div>
      </div>

      <div className="aftrah-app-wireframe-layout">
        {/* LEFT COLUMN: VENDOR SHOPS LIST */}
        <section className="aftrah-app-table-section">
          <div className="aftrah-app-section-header">
            <div>
              <h1 className="aftrah-app-section-title">{vendor.type.toUpperCase()} · SHOPS LIST</h1>
              <span className="aftrah-app-section-subtitle">
                {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} · Click a shop to view line-item transaction ledger
              </span>
            </div>

            <div className="aftrah-app-search-wrapper">
              <Search size={14} className="aftrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search shop name, phone, address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="aftrah-app-search-input"
              />
            </div>
          </div>

          {/* Table matching handwritten sketch: S.NO, NAME, PHONE, ADDRESS + Pending Balance + Actions */}
          <div className="aftrah-app-table-container">
            <table className="aftrah-app-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.NO</th>
                  <th>NAME (SUPPLIER / SHOP)</th>
                  <th style={{ width: '155px' }}>PHONE</th>
                  <th>ADDRESS</th>
                  <th style={{ width: '135px', textAlign: 'right' }}>PENDING DUES</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedShops.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
                      {searchQuery ? 'No matching shops found.' : `No shops registered under ${vendor.type} yet. Add one on the right.`}
                    </td>
                  </tr>
                ) : (
                  paginatedShops.map((shop, index) => {
                    const pending = getShopPendingAmount(shop);
                    return (
                      <tr
                        key={shop.id}
                        onClick={() => onSelectShop(shop)}
                        className="clickable-client-row"
                      >
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                          #{startIndex + index + 1}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="aftrah-app-user-avatar" style={{ background: 'rgba(226, 195, 153, 0.15)', color: 'var(--primary)' }}>
                              <Store size={14} />
                            </div>
                            <span style={{ color: 'var(--text-primary)', fontSize: '13.5px', fontWeight: 600 }}>
                              {shop.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={13} color="var(--primary)" />
                            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{shop.phone}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                            <MapPin size={13} color="var(--primary)" />
                            <span style={{ fontSize: '12.5px' }}>{shop.address}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: 700,
                              fontSize: '12.5px',
                              color: pending > 0 ? '#f87171' : '#4ade80'
                            }}
                          >
                            {formatINR(pending)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <button
                              onClick={(e) => handleOpenEdit(shop, e)}
                              className="aftrah-app-action-btn aftrah-app-edit-btn"
                              title="Edit Shop"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteShopTarget(shop);
                              }}
                              className="aftrah-app-action-btn aftrah-app-delete-btn"
                              title="Delete Shop"
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
          {filteredShops.length > 0 && (
            <div className="aftrah-app-pagination-bar">
              <div className="aftrah-app-pagination-left">
                <span className="aftrah-app-pagination-info">
                  Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredShops.length}</strong>
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

        {/* RIGHT COLUMN: ADD DETAILS CARD (Matches handwritten sketch) */}
        <aside className="aftrah-app-form-card">
          <div className="aftrah-app-form-card-header">
            <h2 className="aftrah-app-form-card-title">Add Details</h2>
          </div>

          <form onSubmit={handleAddSubmit} className="aftrah-app-add-form">
            <div className="aftrah-app-form-group">
              <label className="aftrah-app-label">Name (Shop / Supplier) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Bricks"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="aftrah-app-input"
              />
            </div>

            <div className="aftrah-app-form-group">
              <label className="aftrah-app-label">Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98451 22334"
                value={addPhone}
                onChange={(e) => setAddPhone(e.target.value)}
                className="aftrah-app-input"
              />
            </div>

            <div className="aftrah-app-form-group">
              <label className="aftrah-app-label">Address *</label>
              <textarea
                rows={3}
                required
                placeholder="Yard location, Industrial zone, City..."
                value={addAddress}
                onChange={(e) => setAddAddress(e.target.value)}
                className="aftrah-app-input aftrah-app-textarea"
              />
            </div>

            {!isAddFormValid && (
              <div className="aftrah-app-validation-notice">
                * All 3 fields are required to register this supplier.
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

        {/* Edit Shop Modal */}
        {isEditModalOpen && (
          <div className="aftrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
            <div
              className="aftrah-app-modal-container"
              style={{ maxWidth: '460px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aftrah-app-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pencil size={17} color="var(--primary)" />
                  <h3 className="aftrah-app-modal-title">Edit Shop Information</h3>
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
                    <label className="aftrah-app-label">Name *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Address *</label>
                    <textarea
                      rows={3}
                      required
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="aftrah-app-input aftrah-app-textarea"
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
      </div>

      {/* CONFIRM DELETE VENDOR SHOP MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteShopTarget)}
        title="Delete Supplier Shop"
        message="Are you sure you want to delete this vendor shop? All associated purchase ledger entries and settlement records will be permanently removed."
        itemName={deleteShopTarget ? `${deleteShopTarget.name} (${deleteShopTarget.phone})` : undefined}
        confirmText="Delete Shop"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteShopTarget(null)}
      />
    </div>
  );
};
