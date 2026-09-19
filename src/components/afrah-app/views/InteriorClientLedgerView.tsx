import React, { useState, useMemo } from 'react';
import type { Client } from '../types';
import { TableFormPopover } from '../components/TableFormPopover';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { showToast } from '../layout/ToastContainer';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface InteriorClientLedgerViewProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onAddClient: (clientData: Omit<Client, 'id'>) => Promise<Client | null>;
  onUpdateClient: (client: Client) => Promise<Client | null>;
  onDeleteClient: (id: string) => Promise<boolean>;
}

export const InteriorClientLedgerView: React.FC<InteriorClientLedgerViewProps> = ({
  clients,
  onSelectClient,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add Popover State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addAddress, setAddAddress] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    let result = [...clients];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }
    return result;
  }, [clients, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredClients.length);
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  const isAddClientValid =
    addName.trim().length > 0 &&
    addPhone.trim().length > 0 &&
    addAddress.trim().length > 0;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddClientValid) return;

    try {
      await onAddClient({
        name: addName.trim(),
        phone: addPhone.trim(),
        address: addAddress.trim(),
      });
      setAddName('');
      setAddPhone('');
      setAddAddress('');
      setIsAddModalOpen(false);
      setCurrentPage(1);
      showToast('Client added successfully!', 'success');
    } catch (err) {
      showToast('Failed to add client', 'error');
    }
  };

  const handleOpenEdit = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditAddress(client.address);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      await onUpdateClient({
        ...editingClient,
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
      setIsEditModalOpen(false);
      setEditingClient(null);
      showToast('Client details updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update client', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await onDeleteClient(deleteTarget.id);
      showToast('Client deleted successfully!', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast('Failed to delete client', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section
      className={`afrah-app-table-section${isAddModalOpen ? ' with-add-popover' : ''}`}
      style={{ width: '100%' }}
    >
      <div className="afrah-app-section-header">
        <div>
          <h1 className="afrah-app-section-title">CLIENT NAME LIST</h1>
          <span className="afrah-app-section-subtitle">
            {filteredClients.length} {filteredClients.length === 1 ? 'record' : 'records'} · Click row to view details
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Quick Search */}
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

          <TableFormPopover
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            label="Add Details"
            onOpen={() => {
              setAddName('');
              setAddPhone('');
              setAddAddress('');
            }}
          >
            <form onSubmit={handleAddSubmit} className="afrah-app-add-form">
              <div className="afrah-app-form-group">
                <label className="afrah-app-label">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="afrah-app-input"
                  autoFocus
                />
              </div>

              <div className="afrah-app-form-group">
                <label className="afrah-app-label">Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
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
                  placeholder="Street, City, Postal Code..."
                  value={addAddress}
                  onChange={(e) => setAddAddress(e.target.value)}
                  className="afrah-app-input afrah-app-textarea"
                />
              </div>

              {!isAddClientValid && (
                <div className="afrah-app-validation-notice">
                  * All 3 fields are required to enable submission.
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
                  disabled={!isAddClientValid}
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

      {/* Table with S.NO, NAME, PHONE, ADDRESS, ACTIONS */}
      <div className="afrah-app-table-container">
        <table className="afrah-app-table">
          <thead>
            <tr>
              <th className="text-center" style={{ width: '56px' }}>S.NO</th>
              <th style={{ width: '260px' }}>NAME</th>
              <th style={{ width: '180px' }}>PHONE</th>
              <th>ADDRESS</th>
              <th className="text-center" style={{ width: '80px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state-cell">
                  {searchQuery ? 'No matching clients found.' : 'No clients added yet. Click "+ Add Details" above to add one.'}
                </td>
              </tr>
            ) : (
              paginatedClients.map((client, index) => (
                <tr
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className="clickable-client-row"
                >
                  <td className="cell-sno">
                    {startIndex + index + 1}
                  </td>
                  <td>
                    <div className="cell-entity">
                      <div className="afrah-app-user-avatar">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="row-client-name">
                        {client.name}
                      </span>
                    </div>
                  </td>
                  <td className="nowrap">
                    <div className="cell-icon-text">
                      <Phone size={13} color="var(--primary)" />
                      <span className="cell-phone">{client.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-icon-text is-muted">
                      <MapPin size={13} color="var(--primary)" />
                      <span className="cell-address">{client.address}</span>
                    </div>
                  </td>
                  <td className="text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="cell-actions">
                      <button
                        onClick={(e) => handleOpenEdit(client, e)}
                        className="afrah-app-action-btn afrah-app-edit-btn"
                        title="Edit Client"
                        aria-label="Edit Client"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(client);
                        }}
                        className="afrah-app-action-btn afrah-app-delete-btn"
                        title="Delete Client"
                        aria-label="Delete Client"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {filteredClients.length > 0 && (
        <div className="afrah-app-pagination">
          <div className="afrah-app-pagination-left">
            <span className="afrah-app-pagination-info">
              {startIndex + 1}–{endIndex} of {filteredClients.length}
            </span>
            <div className="afrah-app-rows-selector">
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
              <ChevronLeft size={14} />
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="afrah-app-page-nav-btn"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {isEditModalOpen && (
        <div className="afrah-app-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="afrah-app-modal" onClick={(e) => e.stopPropagation()}>
            <div className="afrah-app-modal-header">
              <h2 className="afrah-app-modal-title">Edit Client Details</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="afrah-app-modal-close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Phone *</label>
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
              </div>
              <div className="afrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="afrah-app-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="afrah-app-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Client"
        message={`Are you sure you want to delete client "${deleteTarget?.name}"? All related advance payments and expenses will be permanently removed.`}
        confirmText="Delete Client"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
};
