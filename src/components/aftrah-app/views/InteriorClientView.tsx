import React, { useState, useMemo } from 'react';
import type { InteriorClient } from '../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  Paintbrush,
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  Building,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface InteriorClientViewProps {
  clients: InteriorClient[];
  onSelectClient: (client: InteriorClient) => void;
  onAddClient: (clientData: Omit<InteriorClient, 'id' | 'sNo'>) => Promise<any>;
  onUpdateClient: (updatedClient: InteriorClient) => Promise<any>;
  onDeleteClient: (id: string) => Promise<any>;
  onDeleteMultipleClients?: (ids: string[]) => Promise<any>;
}

export const InteriorClientView: React.FC<InteriorClientViewProps> = ({
  clients,
  onSelectClient,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onDeleteMultipleClients
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());

  // Add Client Form State (Right Panel)
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addAddress, setAddAddress] = useState('');

  // Edit Client Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Delete Modals State
  const [deleteClientTarget, setDeleteClientTarget] = useState<InteriorClient | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Formatting Currency
  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Helper calculations for client financials
  const getClientTotals = (client: InteriorClient) => {
    const totalAdvance = (client.advancePayments || []).reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    const totalExpenses = (client.expenses || []).reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
    const balance = totalAdvance - totalExpenses;
    return { totalAdvance, totalExpenses, balance };
  };

  // Filter Clients
  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [clients, searchQuery]);

  // Aggregate stats
  const totalAdvancesSum = filteredClients.reduce((sum, c) => sum + getClientTotals(c).totalAdvance, 0);
  const totalExpensesSum = filteredClients.reduce((sum, c) => sum + getClientTotals(c).totalExpenses, 0);
  const totalNetBalance = totalAdvancesSum - totalExpensesSum;

  // Pagination computations
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredClients.length);
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Multi-select Checkbox Handlers
  const isAllSelected =
    filteredClients.length > 0 &&
    filteredClients.every((c) => selectedClientIds.has(c.id));

  const isSomeSelected = selectedClientIds.size > 0 && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedClientIds(new Set());
    } else {
      setSelectedClientIds(new Set(filteredClients.map((c) => c.id)));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Add Client Submit
  const isAddValid = addName.trim().length > 0 && addPhone.trim().length > 0;
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddValid) return;

    await onAddClient({
      name: addName.trim(),
      phone: addPhone.trim(),
      address: addAddress.trim()
    });

    setAddName('');
    setAddPhone('');
    setAddAddress('');
    setCurrentPage(1);
  };

  // Edit Client Submit
  const handleOpenEdit = (client: InteriorClient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClientId(client.id);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditAddress(client.address || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClientId || !editName.trim()) return;

    const target = clients.find((c) => c.id === editingClientId);
    if (target) {
      await onUpdateClient({
        ...target,
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim()
      });
    }

    setIsEditModalOpen(false);
    setEditingClientId(null);
  };

  // Confirm Single Delete
  const handleConfirmDelete = async () => {
    if (!deleteClientTarget) return;
    setIsDeletingClient(true);
    try {
      await onDeleteClient(deleteClientTarget.id);
      if (selectedClientIds.has(deleteClientTarget.id)) {
        setSelectedClientIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteClientTarget.id);
          return next;
        });
      }
    } finally {
      setIsDeletingClient(false);
      setDeleteClientTarget(null);
    }
  };

  // Confirm Bulk Delete
  const handleConfirmBulkDelete = async () => {
    if (selectedClientIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      if (onDeleteMultipleClients) {
        await onDeleteMultipleClients(Array.from(selectedClientIds));
      } else {
        for (const id of selectedClientIds) {
          await onDeleteClient(id);
        }
      }
      setSelectedClientIds(new Set());
      setIsBulkDeleteOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="aftrah-app-wireframe-layout">
      {/* PRINT-ONLY STATEMENT HEADER */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">KAAB INTERIOR · AFTRAH CONSTRUCTIONS</h1>
            <p className="print-company-sub">Luxury Interiors, Modular Woodwork, Architectural Ceiling & Turnkey Execution</p>
          </div>
          <div className="print-badge-statement">
            <span>INTERIOR CLIENTS DIRECTORY</span>
          </div>
        </div>

        <div className="print-totals-summary-bar">
          <div className="print-total-item">
            <span>Total Projects:</span> <strong>{filteredClients.length} Clients</strong>
          </div>
          <div className="print-total-item">
            <span>Total Advances Received:</span> <strong>{formatINR(totalAdvancesSum)}</strong>
          </div>
          <div className="print-total-item">
            <span>Total Interior Expenses:</span> <strong>{formatINR(totalExpensesSum)}</strong>
          </div>
          <div className="print-total-item">
            <span>Net Balance:</span> <strong style={{ color: totalNetBalance >= 0 ? '#15803d' : '#b91c1c' }}>{formatINR(totalNetBalance)}</strong>
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: CLIENT LIST TABLE */}
      <section className="aftrah-app-table-section">
        <div className="aftrah-app-section-header no-print">
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
                <Paintbrush size={18} color="var(--primary)" />
              </div>
              <h1 className="aftrah-app-section-title" style={{ letterSpacing: '0.02em' }}>
                KAAB INTERIOR CLIENTS
              </h1>
            </div>
            <span className="aftrah-app-section-subtitle">
              {filteredClients.length} {filteredClients.length === 1 ? 'project logged' : 'projects logged'} · Total Advances: <strong style={{ color: 'var(--primary)' }}>{formatINR(totalAdvancesSum)}</strong> · Click client row to view project ledger
            </span>
          </div>

          {/* Search, Bulk Actions & Print */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="aftrah-app-search-wrapper">
              <Search size={14} className="aftrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search name, phone, site..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="aftrah-app-search-input"
              />
            </div>

            <button
              onClick={handlePrint}
              className="aftrah-app-back-btn"
              title="Print Interior Directory"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="aftrah-app-table-container">
          <table className="aftrah-app-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>S.NO</th>
                <th>CLIENT / PROJECT</th>
                <th>PHONE & ADDRESS</th>
                <th style={{ textAlign: 'right' }}>TOTAL ADVANCE</th>
                <th style={{ textAlign: 'right' }}>TOTAL EXPENSES</th>
                <th style={{ textAlign: 'right' }}>BALANCE</th>
                <th className="no-print" style={{ width: '70px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}
                  >
                    <Paintbrush size={32} style={{ opacity: 0.3, margin: '0 auto 8px auto', display: 'block' }} />
                    {searchQuery
                      ? 'No interior clients found matching your search.'
                      : 'No interior clients added yet. Fill out the form on the right to add your first interior project.'}
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client, index) => {
                  const { totalAdvance, totalExpenses, balance } = getClientTotals(client);

                  return (
                    <tr
                      key={client.id}
                      onClick={() => onSelectClient(client)}
                      className="clickable-client-row"
                      style={{ cursor: 'pointer' }}
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
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                          {client.name}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                            <Phone size={12} color="var(--primary)" />
                            <span>{client.phone}</span>
                          </div>
                          {client.address && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11.5px',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              <MapPin size={11} />
                              <span>{client.address}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#4ade80'
                        }}
                      >
                        {formatINR(totalAdvance)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--primary)'
                        }}
                      >
                        {formatINR(totalExpenses)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            background: balance >= 0 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                            color: balance >= 0 ? '#4ade80' : '#f87171'
                          }}
                        >
                          {formatINR(balance)}
                        </span>
                      </td>
                      <td className="no-print" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => handleOpenEdit(client, e)}
                            className="aftrah-app-action-btn aftrah-app-edit-btn"
                            title="Edit Client"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteClientTarget(client);
                            }}
                            className="aftrah-app-action-btn aftrah-app-delete-btn"
                            title="Delete Client"
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
        {filteredClients.length > 0 && (
          <div className="aftrah-app-pagination-bar no-print">
            <div className="aftrah-app-pagination-left">
              <span className="aftrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{' '}
                <strong>{filteredClients.length}</strong>
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
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="aftrah-app-page-nav-btn"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`aftrah-app-page-btn ${currentPage === p ? 'active' : ''}`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="aftrah-app-page-nav-btn"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* RIGHT COLUMN: ADD INTERIOR CLIENT FORM */}
      <aside className="aftrah-app-form-card no-print">
        <div className="aftrah-app-form-header">
          <div className="aftrah-app-form-icon-wrap">
            <Plus size={18} color="var(--primary)" />
          </div>
          <div>
            <h2 className="aftrah-app-form-title">Add Interior Client</h2>
            <p className="aftrah-app-form-subtitle">Register new turnkey interior project</p>
          </div>
        </div>

        <form onSubmit={handleAddSubmit} className="aftrah-app-form-body">
          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">Client Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Aravind Swamy"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="aftrah-app-input"
            />
          </div>

          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">Phone Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. 98401 23456"
              value={addPhone}
              onChange={(e) => setAddPhone(e.target.value)}
              className="aftrah-app-input"
            />
          </div>

          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">Address</label>
            <textarea
              rows={3}
              placeholder="e.g. Uthamapalayam, Theni"
              value={addAddress}
              onChange={(e) => setAddAddress(e.target.value)}
              className="aftrah-app-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={!isAddValid}
            className="btn-theme-primary"
            style={{ width: '100%', height: '42px', marginTop: '6px' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Client</span>
          </button>
        </form>
      </aside>

      {/* EDIT CLIENT MODAL */}
      {isEditModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="aftrah-app-modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={18} color="var(--primary)" />
                <h3 className="aftrah-app-modal-title">Edit Interior Client</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="aftrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="aftrah-app-modal-body">
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Address</label>
                  <textarea
                    rows={3}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="aftrah-app-textarea"
                  />
                </div>
              </div>

              <div className="aftrah-app-modal-footer">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="aftrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" disabled={!editName.trim()} className="btn-theme-primary">
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE SINGLE CLIENT MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteClientTarget)}
        title="Delete Interior Client"
        message="Are you sure you want to delete this interior client? All associated advance payment receipts and site expense logs will be permanently deleted."
        itemName={deleteClientTarget ? `${deleteClientTarget.name} (${deleteClientTarget.phone})` : undefined}
        confirmText="Delete Client"
        isDeleting={isDeletingClient}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteClientTarget(null)}
      />

      {/* CONFIRM BULK DELETE CLIENTS MODAL */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteOpen}
        title="Delete Selected Interior Clients"
        message={`Are you sure you want to delete ${selectedClientIds.size} selected interior clients? All associated advance payments and expense logs will be permanently deleted.`}
        confirmText={`Delete ${selectedClientIds.size} Clients`}
        isDeleting={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setIsBulkDeleteOpen(false)}
      />
    </div>
  );
};
