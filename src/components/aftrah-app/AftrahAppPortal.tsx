import React, { useState, useMemo } from 'react';
import { AftrahAppSidebar } from './layout/AftrahAppSidebar';
import { AftrahAppTopBar } from './layout/AftrahAppTopBar';
import { ToastContainer } from './layout/ToastContainer';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { useClients } from './hooks/useClients';
import { useVendors } from './hooks/useVendors';
import { useBanks } from './hooks/useBanks';
import { ClientDetailsView } from './views/ClientDetailsView';
import { VendorView } from './views/VendorView';
import { VendorShopsView } from './views/VendorShopsView';
import { ShopDetailsView } from './views/ShopDetailsView';
import { BankDetailsView } from './views/BankDetailsView';
import type { Client, Vendor, VendorShop } from './types';
import {
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
  AlertCircle
} from 'lucide-react';
import './styles/aftrah-app.css';

export const AftrahAppPortal: React.FC = () => {
  // Navigation & Drilldown State
  const [activeTab, setActiveTab] = useState<'clients' | 'vendor' | 'banks'>('clients');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Responsive Drawer & Sidebar State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Search & Pagination (Clients View)
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Delete Client Confirmation State
  const [deleteClientTarget, setDeleteClientTarget] = useState<Client | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);

  // Supabase Custom Data Hooks
  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
    isLiveDb,
    addClient,
    updateClient,
    deleteClient,
    addAdvancePayment,
    updateAdvancePayment,
    deleteAdvancePayment,
    addExpense,
    updateExpense,
    deleteExpense
  } = useClients();

  const {
    vendors,
    isLoading: vendorsLoading,
    error: vendorsError,
    addCategory,
    updateCategory,
    deleteCategory,
    addVendorShop,
    updateVendorShop,
    deleteVendorShop,
    addShopTransaction,
    updateShopTransaction,
    deleteShopTransaction
  } = useVendors();

  const {
    bankAccounts,
    isLoading: banksLoading,
    error: banksError,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addBankTransaction,
    deleteBankTransaction
  } = useBanks();

  // Selected Entities Memo
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const selectedVendor = useMemo(() => {
    return vendors.find((v) => v.id === selectedVendorId) || null;
  }, [vendors, selectedVendorId]);

  const selectedShop = useMemo(() => {
    if (!selectedVendor) return null;
    return (selectedVendor.shops || []).find((s) => s.id === selectedShopId) || null;
  }, [selectedVendor, selectedShopId]);

  // Validation Flags
  const isAddClientValid =
    addName.trim().length > 0 &&
    addPhone.trim().length > 0 &&
    addAddress.trim().length > 0;

  const isEditClientValid =
    editName.trim().length > 0 &&
    editPhone.trim().length > 0 &&
    editAddress.trim().length > 0;

  // Handle Add Client Submit
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddClientValid) return;

    await addClient({
      name: addName.trim(),
      phone: addPhone.trim(),
      address: addAddress.trim(),
    });

    setAddName('');
    setAddPhone('');
    setAddAddress('');
    setCurrentPage(1);
  };

  // Open Edit Client Modal
  const handleOpenEditModal = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClientId(client.id);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditAddress(client.address);
    setIsEditModalOpen(true);
  };

  // Save Edit Client Modal
  const handleSaveEditModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditClientValid || !editingClientId) return;

    const target = clients.find((c) => c.id === editingClientId);
    if (target) {
      await updateClient({
        ...target,
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
    }

    setIsEditModalOpen(false);
    setEditingClientId(null);
  };

  // Handle Confirm Delete Client
  const handleConfirmDeleteClient = async () => {
    if (!deleteClientTarget) return;
    setIsDeletingClient(true);
    try {
      await deleteClient(deleteClientTarget.id);
      if (selectedClientId === deleteClientTarget.id) {
        setSelectedClientId(null);
      }
    } finally {
      setIsDeletingClient(false);
      setDeleteClientTarget(null);
    }
  };

  // Filter clients
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

  // Pagination computations for clients
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

  const activeError = clientsError || vendorsError || banksError;

  return (
    <div className="aftrah-app-container">
      {/* Ambient background lighting */}
      <div className="aftrah-app-ambient-glow" />
      <div className="aftrah-app-ambient-glow-2" />

      {/* Sidebar with Brand 'Aftrah constructions' and items 'Clients', 'Vendor', & 'Bank Details' */}
      <AftrahAppSidebar
        clientsCount={clients.length}
        vendorsCount={vendors.length}
        banksCount={bankAccounts.length}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedClientId(null);
          setSelectedVendorId(null);
          setSelectedShopId(null);
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Viewport */}
      <div className="aftrah-app-main-viewport">
        {/* Top Header */}
        <AftrahAppTopBar
          activeTab={activeTab}
          clientsCount={clients.length}
          vendorsCount={vendors.length}
          banksCount={bankAccounts.length}
          selectedClient={selectedClient}
          selectedVendor={selectedVendor}
          selectedShop={selectedShop}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onNavigateHome={() => setSelectedClientId(null)}
          onNavigateVendorRoot={() => {
            setSelectedVendorId(null);
            setSelectedShopId(null);
          }}
          isLiveDb={isLiveDb}
        />

        {/* Global Error Banner (if any) */}
        {activeError && (
          <div
            style={{
              padding: '10px 24px',
              background: '#7f1d1d',
              color: '#fee2e2',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={14} color="#fca5a5" />
            <span>Database Sync Notice: {activeError}</span>
          </div>
        )}

        {/* Main Content */}
        <main className="aftrah-app-main-content">
          {activeTab === 'banks' ? (
            /* BANK DETAILS VIEW (Canara Bank, Bank of Baroda, etc.) */
            <BankDetailsView
              bankAccounts={bankAccounts}
              onAddAccount={addBankAccount}
              onUpdateAccount={updateBankAccount}
              onDeleteAccount={deleteBankAccount}
              onAddTransaction={addBankTransaction}
              onDeleteTransaction={deleteBankTransaction}
            />
          ) : activeTab === 'vendor' ? (
            selectedVendor && selectedShop ? (
              /* SHOP DETAILS VIEW (Transactions table matching handwritten sketch) */
              <ShopDetailsView
                vendor={selectedVendor}
                shop={selectedShop}
                clientOptions={clients.map((c) => c.name)}
                onBack={() => setSelectedShopId(null)}
                onUpdateShop={(updated) => updateVendorShop(selectedVendor.id, updated)}
                onAddTransaction={addShopTransaction}
                onUpdateTransaction={updateShopTransaction}
                onDeleteTransaction={deleteShopTransaction}
              />
            ) : selectedVendor ? (
              /* VENDOR SHOPS LIST (List of shops for e.g. Bricks + Add Shop form) */
              <VendorShopsView
                vendor={selectedVendor}
                onBack={() => setSelectedVendorId(null)}
                onSelectShop={(shop) => setSelectedShopId(shop.id)}
                onAddShop={(shopData) => addVendorShop(selectedVendor.id, shopData)}
                onUpdateShop={(updatedShop) => updateVendorShop(selectedVendor.id, updatedShop)}
                onDeleteShop={(shopId) => deleteVendorShop(selectedVendor.id, shopId)}
              />
            ) : (
              /* VENDOR CATEGORIES LIST (Bricks, Hardware, M.Sand...) */
              <VendorView
                vendors={vendors}
                onSelectVendor={(vendor) => {
                  setSelectedVendorId(vendor.id);
                  setSelectedShopId(null);
                }}
                onAddVendor={addCategory}
                onUpdateVendor={updateCategory}
                onDeleteVendor={deleteCategory}
              />
            )
          ) : selectedClient ? (
            /* CLIENT DETAILS VIEW (Advance Payments + Expenses with Searchable Dropdown) */
            <ClientDetailsView
              client={selectedClient}
              onBack={() => setSelectedClientId(null)}
              onUpdateClient={updateClient}
              onAddAdvance={addAdvancePayment}
              onUpdateAdvance={updateAdvancePayment}
              onDeleteAdvance={deleteAdvancePayment}
              onAddExpense={addExpense}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
            />
          ) : (
            /* CLIENT LIST 2-COLUMN VIEW */
            <div className="aftrah-app-wireframe-layout">
              {/* LEFT COLUMN: CLIENT NAME LIST */}
              <section className="aftrah-app-table-section">
                <div className="aftrah-app-section-header">
                  <div>
                    <h1 className="aftrah-app-section-title">CLIENT NAME LIST</h1>
                    <span className="aftrah-app-section-subtitle">
                      {filteredClients.length} {filteredClients.length === 1 ? 'record' : 'records'} · Click row to view details
                    </span>
                  </div>

                  {/* Quick Search */}
                  <div className="aftrah-app-search-wrapper">
                    <Search size={14} className="aftrah-app-search-icon" />
                    <input
                      type="text"
                      placeholder="Search name, phone, address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="aftrah-app-search-input"
                    />
                  </div>
                </div>

                {/* Table with NAME, PHONE, ADDRESS + Actions (Edit & Delete) */}
                <div className="aftrah-app-table-container">
                  <table className="aftrah-app-table">
                    <thead>
                      <tr>
                        <th style={{ width: '48px', textAlign: 'center' }}>S.NO</th>
                        <th>NAME</th>
                        <th style={{ width: '155px' }}>PHONE</th>
                        <th>ADDRESS</th>
                        <th style={{ width: '75px', textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedClients.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
                            {searchQuery ? 'No matching clients found.' : 'No clients added yet. Use the form on the right to add one.'}
                          </td>
                        </tr>
                      ) : (
                        paginatedClients.map((client, index) => (
                          <tr
                            key={client.id}
                            onClick={() => setSelectedClientId(client.id)}
                            className="clickable-client-row"
                          >
                            <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                              #{startIndex + index + 1}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="aftrah-app-user-avatar">
                                  {client.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ color: 'var(--text-primary)', fontSize: '13.5px', fontWeight: 500 }}>
                                  {client.name}
                                </span>
                              </div>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Phone size={13} color="var(--primary)" />
                                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{client.phone}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                <MapPin size={13} color="var(--primary)" />
                                <span style={{ fontSize: '12.5px' }}>{client.address}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <button
                                  onClick={(e) => handleOpenEditModal(client, e)}
                                  className="aftrah-app-action-btn aftrah-app-edit-btn"
                                  title="Edit Client"
                                  aria-label="Edit Client"
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

                {/* Pagination Controls */}
                {filteredClients.length > 0 && (
                  <div className="aftrah-app-pagination-bar">
                    <div className="aftrah-app-pagination-left">
                      <span className="aftrah-app-pagination-info">
                        Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredClients.length}</strong>
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

              {/* RIGHT COLUMN: ADD DETAILS CARD */}
              <aside className="aftrah-app-form-card">
                <div className="aftrah-app-form-card-header">
                  <h2 className="aftrah-app-form-card-title">Add Details</h2>
                </div>

                <form onSubmit={handleAddClientSubmit} className="aftrah-app-add-form">
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
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
                      placeholder="+91 98765 43210"
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
                      placeholder="Street, City, Postal Code..."
                      value={addAddress}
                      onChange={(e) => setAddAddress(e.target.value)}
                      className="aftrah-app-input aftrah-app-textarea"
                    />
                  </div>

                  {!isAddClientValid && (
                    <div className="aftrah-app-validation-notice">
                      * All 3 fields are required to enable submission.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!isAddClientValid}
                    className="btn-theme-primary aftrah-app-submit-btn"
                  >
                    <UserPlus size={16} strokeWidth={2.5} />
                    <span>Add Details</span>
                  </button>
                </form>
              </aside>
            </div>
          )}
        </main>
      </div>

      {/* Edit Client Modal */}
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
                <h3 className="aftrah-app-modal-title">Edit Client Information</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="aftrah-app-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditModal}>
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

                {!isEditClientValid && (
                  <div className="aftrah-app-validation-notice">
                    * All fields must be filled to save changes.
                  </div>
                )}
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
                  disabled={!isEditClientValid}
                  className="btn-theme-primary"
                  style={{ minWidth: '120px', height: '40px', fontSize: '13px' }}
                >
                  <Check size={16} strokeWidth={2.5} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE CLIENT MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteClientTarget)}
        title="Delete Client Record"
        message="Are you sure you want to delete this client? All associated advance payments and site expenses will also be permanently deleted."
        itemName={deleteClientTarget ? `${deleteClientTarget.name} (${deleteClientTarget.phone})` : undefined}
        confirmText="Delete Client"
        isDeleting={isDeletingClient}
        onConfirm={handleConfirmDeleteClient}
        onClose={() => setDeleteClientTarget(null)}
      />

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
};

export default AftrahAppPortal;
