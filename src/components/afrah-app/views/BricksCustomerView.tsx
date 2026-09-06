import React, { useState, useMemo } from 'react';
import type { BrickCustomer } from '../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  BrickWall,
  Users,
  Search,
  Trash2,
  Phone,
  MapPin,
  UserPlus,
  Pencil,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Wallet,
  IndianRupee,
  RotateCcw,
  Printer
} from 'lucide-react';

interface BricksCustomerViewProps {
  customers: BrickCustomer[];
  onSelectCustomer: (customer: BrickCustomer) => void;
  onAddCustomer: (customerData: { name: string; phone: string; address: string }) => Promise<any>;
  onUpdateCustomer: (updated: BrickCustomer) => Promise<any>;
  onDeleteCustomer: (id: string) => Promise<any>;
  onDeleteMultipleCustomers?: (ids: string[]) => Promise<any>;
}

export const BricksCustomerView: React.FC<BricksCustomerViewProps> = ({
  customers,
  onSelectCustomer,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onDeleteMultipleCustomers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk Delete Modal State
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Add Customer Form State (Right Panel)
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addAddress, setAddAddress] = useState('');

  // Edit Customer Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<BrickCustomer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Delete Customer Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<BrickCustomer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format INR Currency
  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Validation Flags
  const isAddValid =
    addName.trim().length > 0 &&
    addPhone.trim().length > 0 &&
    addAddress.trim().length > 0;

  const isEditValid =
    editName.trim().length > 0 &&
    editPhone.trim().length > 0 &&
    editAddress.trim().length > 0;

  // Handle Add Customer Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddValid) return;

    await onAddCustomer({
      name: addName.trim(),
      phone: addPhone.trim(),
      address: addAddress.trim()
    });

    setAddName('');
    setAddPhone('');
    setAddAddress('');
    setCurrentPage(1);
  };

  // Handle Clear / Close Add Form
  const handleClearAddForm = () => {
    setAddName('');
    setAddPhone('');
    setAddAddress('');
  };

  // Open Edit Modal
  const handleOpenEdit = (customer: BrickCustomer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditAddress(customer.address);
    setIsEditModalOpen(true);
  };

  // Save Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditValid || !editingCustomer) return;

    await onUpdateCustomer({
      ...editingCustomer,
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim()
    });

    setIsEditModalOpen(false);
    setEditingCustomer(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteCustomer(deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Filter customers by search query
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        String(c.balance).includes(q) ||
        String(c.sNo).includes(q)
    );
  }, [customers, searchQuery]);

  // Overall totals for statistics bar
  const totalOutstandingBalance = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  }, [customers]);

  // Pagination computations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCustomers.length);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Multi-select Checkbox Handlers
  const isAllSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((c) => selectedCustomerIds.has(c.id));

  const isSomeSelected =
    selectedCustomerIds.size > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCustomerIds(new Set());
    } else {
      setSelectedCustomerIds(new Set(filteredCustomers.map((c) => c.id)));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomerIds((prev) => {
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
    if (selectedCustomerIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      if (onDeleteMultipleCustomers) {
        await onDeleteMultipleCustomers(Array.from(selectedCustomerIds));
      } else {
        for (const id of selectedCustomerIds) {
          await onDeleteCustomer(id);
        }
      }
      setSelectedCustomerIds(new Set());
      setIsBulkDeleteOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Print Statement Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="afrah-app-wireframe-layout">
      {/* PRINT-ONLY HEADER */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">AFRAH CONSTRUCTIONS</h1>
            <p className="print-company-sub">Civil Construction, Materials Procurement & Financial ERP</p>
          </div>
          <div className="print-badge-statement">
            <span>BRICKS CUSTOMER DIRECTORY</span>
          </div>
        </div>

        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Total Customers:</span> <strong>{filteredCustomers.length} Records</strong>
          </div>
          <div className="print-total-item">
            <span>Total Outstanding Balance:</span> <strong style={{ color: totalOutstandingBalance > 0 ? '#b91c1c' : '#15803d' }}>{formatINR(totalOutstandingBalance)}</strong>
          </div>
          <div className="print-total-item">
            <span>Report Date:</span> <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: VIEW BRICKS CUSTOMER TABLE */}
      <section className="afrah-app-table-section">
        <div className="afrah-app-section-header no-print">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                <BrickWall size={18} color="var(--primary)" />
              </div>
              <h1 className="afrah-app-section-title" style={{ letterSpacing: '0.02em' }}>
                BRICKS CUSTOMER LIST
              </h1>
            </div>
            <span className="afrah-app-section-subtitle">
              {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer record' : 'customer records'} · Total Outstanding: <strong style={{ color: totalOutstandingBalance > 0 ? '#f87171' : 'var(--primary)' }}>{formatINR(totalOutstandingBalance)}</strong> · Click row to view transactions
            </span>
          </div>

          {/* Quick Search & Print / Bulk Delete Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="afrah-app-search-wrapper">
              <Search size={14} className="afrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search name, phone, address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="afrah-app-search-input"
              />
            </div>

            <button
              onClick={handlePrint}
              className="afrah-app-back-btn"
              title="Print Customer Directory"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Table matching the sketch: S.NO | NAME | PHONE | BALANCE | Address | Edit / Delete */}
        <div className="afrah-app-table-container">
          <table className="afrah-app-table">
            <thead>
              <tr>
                <th style={{ width: '55px', textAlign: 'center' }}>S.NO</th>
                <th>NAME</th>
                <th style={{ width: '150px' }}>PHONE</th>
                <th style={{ width: '140px', textAlign: 'right' }}>BALANCE</th>
                <th>ADDRESS</th>
                <th className="no-print" style={{ width: '90px', textAlign: 'center' }}>EDIT / DELETE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '44px 16px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <BrickWall size={32} style={{ opacity: 0.3, margin: '0 auto 10px auto', display: 'block' }} />
                    {searchQuery
                      ? 'No matching bricks customers found.'
                      : 'No bricks customers added yet. Fill out the "Add Bricks Customer" form on the right.'}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer, index) => {
                  const currentBalance = customer.balance || 0;
                  return (
                    <tr
                      key={customer.id}
                      onClick={() => onSelectCustomer(customer)}
                      className="clickable-client-row"
                      title="Click to view brick deliveries, ledger and payments"
                    >
                      <td
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          textAlign: 'center'
                        }}
                      >
                        #{startIndex + index + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="afrah-app-user-avatar" style={{ background: 'rgba(226, 195, 153, 0.15)', color: 'var(--primary)' }}>
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span
                              style={{
                                color: 'var(--text-primary)',
                                fontSize: '13.5px',
                                fontWeight: 600,
                                display: 'block'
                              }}
                            >
                              {customer.name}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              {(customer.transactions || []).length} {((customer.transactions || []).length === 1) ? 'delivery order' : 'delivery orders'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} color="var(--primary)" />
                          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                            {customer.phone}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: '12.5px',
                            background:
                              currentBalance > 0
                                ? 'rgba(239, 68, 68, 0.12)'
                                : 'rgba(34, 197, 94, 0.12)',
                            color: currentBalance > 0 ? '#f87171' : '#4ade80',
                            border: `1px solid ${currentBalance > 0
                              ? 'rgba(239, 68, 68, 0.25)'
                              : 'rgba(34, 197, 94, 0.25)'
                              }`
                          }}
                        >
                          {formatINR(currentBalance)}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'flex-start',
                            gap: '6px',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <MapPin size={13} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span
                            style={{
                              fontSize: '12.5px',
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {customer.address}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px'
                          }}
                        >
                          <button
                            onClick={(e) => handleOpenEdit(customer, e)}
                            className="afrah-app-action-btn afrah-app-edit-btn"
                            title="Edit Customer Details"
                            aria-label="Edit Customer Details"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(customer);
                            }}
                            className="afrah-app-action-btn afrah-app-delete-btn"
                            title="Delete Customer"
                            aria-label="Delete Customer"
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
        {filteredCustomers.length > 0 && (
          <div className="afrah-app-pagination-bar">
            <div className="afrah-app-pagination-left">
              <span className="afrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{' '}
                <strong>{filteredCustomers.length}</strong>
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

      {/* RIGHT COLUMN: ADD BRICKS CUSTOMER CARD */}
      <aside className="afrah-app-form-card">
        <div className="afrah-app-form-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrickWall size={17} color="var(--primary)" />
            <h2 className="afrah-app-form-card-title">Add Bricks Customer</h2>
          </div>
        </div>

        <form onSubmit={handleAddSubmit} className="afrah-app-add-form">
          <div className="afrah-app-form-group">
            <label className="afrah-app-label">NAME *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kabibullah Rahman"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="afrah-app-input"
            />
          </div>

          <div className="afrah-app-form-group">
            <label className="afrah-app-label">PHONE *</label>
            <input
              type="tel"
              required
              placeholder="+91 98410 23456"
              value={addPhone}
              onChange={(e) => setAddPhone(e.target.value)}
              className="afrah-app-input"
            />
          </div>

          <div className="afrah-app-form-group">
            <label className="afrah-app-label">Address *</label>
            <textarea
              rows={3}
              required
              placeholder="Site location, Street, Area, City..."
              value={addAddress}
              onChange={(e) => setAddAddress(e.target.value)}
              className="afrah-app-input afrah-app-textarea"
            />
          </div>

          {!isAddValid && (
            <div className="afrah-app-validation-notice">
              * Name, Phone and Address are required to submit.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="submit"
              disabled={!isAddValid}
              className="btn-theme-primary afrah-app-submit-btn"
              style={{ flex: 1 }}
            >
              <UserPlus size={16} strokeWidth={2.5} />
              <span>Submit</span>
            </button>

            {(addName || addPhone || addAddress) && (
              <button
                type="button"
                onClick={handleClearAddForm}
                className="afrah-app-back-btn"
                style={{ height: '42px', padding: '0 14px' }}
                title="Close / Clear Form"
              >
                <RotateCcw size={14} />
                <span>Close</span>
              </button>
            )}
          </div>
        </form>
      </aside>

      {/* EDIT CUSTOMER MODAL */}
      {isEditModalOpen && (
        <div className="afrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="afrah-app-modal-container"
            style={{ maxWidth: '460px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="afrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={17} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Bricks Customer</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="afrah-app-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">NAME *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">PHONE *</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Address *</label>
                  <textarea
                    rows={3}
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="afrah-app-input afrah-app-textarea"
                  />
                </div>

                {!isEditValid && (
                  <div className="afrah-app-validation-notice">
                    * All fields must be filled to save changes.
                  </div>
                )}
              </div>

              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="afrah-app-back-btn"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!isEditValid}
                  className="btn-theme-primary"
                  style={{ minWidth: '120px', height: '40px', fontSize: '13px' }}
                >
                  <Check size={16} strokeWidth={2.5} />
                  <span>Submit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM SINGLE DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Bricks Customer"
        message="Are you sure you want to delete this customer? All associated brick delivery transactions and balance records will also be permanently deleted."
        itemName={deleteTarget ? `${deleteTarget.name} (${deleteTarget.phone})` : undefined}
        confirmText="Delete Customer"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* CONFIRM BULK DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteOpen}
        title="Delete Selected Customers"
        message={`Are you sure you want to delete ${selectedCustomerIds.size} selected bricks customers? All associated delivery entries and ledgers will also be permanently deleted.`}
        confirmText={`Delete ${selectedCustomerIds.size} Customers`}
        isDeleting={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setIsBulkDeleteOpen(false)}
      />
    </div>
  );
};
