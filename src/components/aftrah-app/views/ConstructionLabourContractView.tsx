import React, { useState, useMemo } from 'react';
import type { LabourContract } from '../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { SearchableExpenseSelect } from '../components/SearchableExpenseSelect';
import {
  HardHat,
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  IndianRupee,
  Wallet,
  Scale
} from 'lucide-react';

interface ConstructionLabourContractViewProps {
  contracts: LabourContract[];
  onSelectContract: (contract: LabourContract) => void;
  onAddContract: (contractData: Omit<LabourContract, 'id' | 'sNo'>) => Promise<any> | void;
  onUpdateContract: (updated: LabourContract) => Promise<any> | void;
  onDeleteContract: (id: string) => Promise<any> | void;
  siteOptions?: string[];
}

export const ConstructionLabourContractView: React.FC<ConstructionLabourContractViewProps> = ({
  contracts,
  onSelectContract,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  siteOptions = ['Dr. K. Rajendran Villa - Site #4', 'Commercial Complex - Anna Nagar', 'Green Valley Plot 14 Residence']
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add Form State (Right Column Card)
  const todayStr = new Date().toISOString().split('T')[0];
  const [addDate, setAddDate] = useState(todayStr);
  const [addLabourName, setAddLabourName] = useState('');
  const [addSiteName, setAddSiteName] = useState('');
  const [addLabourCharge, setAddLabourCharge] = useState('50000');
  const [addPhone, setAddPhone] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editLabourName, setEditLabourName] = useState('');
  const [editSiteName, setEditSiteName] = useState('');
  const [editLabourCharge, setEditLabourCharge] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Delete Modals
  const [deleteTarget, setDeleteTarget] = useState<LabourContract | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format Currency
  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Helper calculations for each contract
  const getContractBalance = (contract: LabourContract) => {
    const charge = Number(contract.labourCharge || 50000);
    const paid = (contract.entries || []).reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
    return charge - paid;
  };

  // Form Validations
  const isAddFormValid =
    addDate.trim().length > 0 &&
    addLabourName.trim().length > 0 &&
    addSiteName.trim().length > 0 &&
    parseFloat(addLabourCharge) > 0 &&
    addPhone.trim().length > 0;

  const isEditFormValid =
    editDate.trim().length > 0 &&
    editLabourName.trim().length > 0 &&
    editSiteName.trim().length > 0 &&
    parseFloat(editLabourCharge) > 0 &&
    editPhone.trim().length > 0;

  // Filter contracts
  const filteredContracts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return contracts;
    return contracts.filter(
      (c) =>
        c.labourName.toLowerCase().includes(q) ||
        c.siteName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.date.includes(q)
    );
  }, [contracts, searchQuery]);

  // Overall calculations
  const totalAgreedCharges = useMemo(() => {
    return contracts.reduce((sum, c) => sum + (Number(c.labourCharge) || 0), 0);
  }, [contracts]);

  const totalPaidAcrossAll = useMemo(() => {
    return contracts.reduce((sum, c) => {
      const contractPaid = (c.entries || []).reduce((s, e) => s + (Number(e.totalAmount) || 0), 0);
      return sum + contractPaid;
    }, 0);
  }, [contracts]);

  const netBalancePayable = totalAgreedCharges - totalPaidAcrossAll;

  // Pagination computations
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredContracts.length);
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddFormValid) return;

    await onAddContract({
      date: addDate.trim(),
      labourName: addLabourName.trim(),
      siteName: addSiteName.trim(),
      labourCharge: parseFloat(addLabourCharge) || 50000,
      phone: addPhone.trim(),
      entries: []
    });

    setAddLabourName('');
    setAddSiteName('');
    setAddLabourCharge('50000');
    setAddPhone('');
    setCurrentPage(1);
  };

  // Open Edit Modal
  const handleOpenEdit = (contract: LabourContract, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingContractId(contract.id);
    setEditDate(contract.date);
    setEditLabourName(contract.labourName);
    setEditSiteName(contract.siteName);
    setEditLabourCharge(String(contract.labourCharge || 50000));
    setEditPhone(contract.phone);
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditFormValid || !editingContractId) return;

    const target = contracts.find((c) => c.id === editingContractId);
    if (target) {
      await onUpdateContract({
        ...target,
        date: editDate.trim(),
        labourName: editLabourName.trim(),
        siteName: editSiteName.trim(),
        labourCharge: parseFloat(editLabourCharge) || 50000,
        phone: editPhone.trim()
      });
    }

    setIsEditModalOpen(false);
    setEditingContractId(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteContract(deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="aftrah-app-wireframe-layout">
      {/* LEFT COLUMN: LABOUR CONTRACTS LIST */}
      <section className="aftrah-app-table-section">
        <div className="aftrah-app-section-header">
          <div>
            <h1 className="aftrah-app-section-title">CONSTRUCTION LABOUR CONTRACTS</h1>
            <span className="aftrah-app-section-subtitle">
              {filteredContracts.length} {filteredContracts.length === 1 ? 'record' : 'records'} · Total Agreed: {formatINR(totalAgreedCharges)} · Paid: {formatINR(totalPaidAcrossAll)} · Balance: {formatINR(netBalancePayable)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="aftrah-app-search-wrapper">
              <Search size={14} className="aftrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search contractor, site, phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="aftrah-app-search-input"
              />
            </div>
          </div>
        </div>

        {/* Table: S.NO, DATE, LABOUR NAME, CONSTRUCTION SITE NAME, PHONE, LABOUR CHARGE, REMAINING AMOUNT, ACTIONS */}
        <div className="aftrah-app-table-container">
          <table className="aftrah-app-table">
            <thead>
              <tr>
                <th style={{ width: '55px', textAlign: 'center' }}>S.NO</th>
                <th style={{ width: '105px' }}>DATE</th>
                <th>CONTRACTOR / LABOUR NAME</th>
                <th>CONSTRUCTION SITE NAME</th>
                <th style={{ width: '140px' }}>PHONE</th>
                <th style={{ width: '135px' }}>LABOUR CHARGE</th>
                <th style={{ width: '140px' }}>REMAINING AMOUNT</th>
                <th style={{ width: '80px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
                    {searchQuery ? 'No matching construction labour contracts found.' : 'No construction labour contracts added yet. Use the form on the right to add one.'}
                  </td>
                </tr>
              ) : (
                paginatedContracts.map((contract, index) => {
                  const balance = getContractBalance(contract);
                  const charge = Number(contract.labourCharge || 50000);
                  return (
                    <tr
                      key={contract.id}
                      onClick={() => onSelectContract(contract)}
                      className="clickable-client-row"
                    >
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                        #{startIndex + index + 1}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={12} color="var(--primary)" />
                          <span>{contract.date}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            className="aftrah-app-user-avatar"
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#f59e0b',
                              border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            {contract.labourName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-primary)', fontSize: '13.5px', fontWeight: 600 }}>
                              {contract.labourName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <MapPin size={13} color="#f59e0b" />
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{contract.siteName}</span>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} color="var(--primary)" />
                          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{contract.phone}</span>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                          {formatINR(charge)}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '13px',
                            color: balance > 0 ? '#f59e0b' : '#4ade80'
                          }}
                        >
                          {formatINR(balance)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => handleOpenEdit(contract, e)}
                            className="aftrah-app-action-btn aftrah-app-edit-btn"
                            title="Edit Contract Details"
                            aria-label="Edit Contract Details"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(contract);
                            }}
                            className="aftrah-app-action-btn aftrah-app-delete-btn"
                            title="Delete Contract"
                            aria-label="Delete Contract"
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
        {filteredContracts.length > 0 && (
          <div className="aftrah-app-pagination-bar">
            <div className="aftrah-app-pagination-left">
              <span className="aftrah-app-pagination-info">
                Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredContracts.length}</strong>
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

      {/* RIGHT COLUMN: ADD DETAILS CARD (Matching handwritten sketch) */}
      <aside className="aftrah-app-form-card">
        <div className="aftrah-app-form-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardHat size={18} color="#f59e0b" />
            <h2 className="aftrah-app-form-card-title">Add Contract</h2>
          </div>
        </div>

        <form onSubmit={handleAddSubmit} className="aftrah-app-add-form">
          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">Date *</label>
            <input
              type="date"
              required
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              className="aftrah-app-input"
            />
          </div>

          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">Contractor / Labour Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Arumugam (Bar Bending)"
              value={addLabourName}
              onChange={(e) => setAddLabourName(e.target.value)}
              className="aftrah-app-input"
            />
          </div>

          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">Construction Site Name *</label>
            <SearchableExpenseSelect
              options={siteOptions}
              value={addSiteName}
              onChange={(val) => setAddSiteName(val)}
              placeholder="Select or type site location..."
            />
          </div>

          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">Total Labour Charge (₹) *</label>
            <input
              type="number"
              required
              min="0"
              step="100"
              placeholder="e.g. 50000"
              value={addLabourCharge}
              onChange={(e) => setAddLabourCharge(e.target.value)}
              className="aftrah-app-input"
            />
          </div>

          <div className="aftrah-app-form-group">
            <label className="aftrah-app-label">Phone *</label>
            <input
              type="tel"
              required
              placeholder="+91 94432 18920"
              value={addPhone}
              onChange={(e) => setAddPhone(e.target.value)}
              className="aftrah-app-input"
            />
          </div>

          {!isAddFormValid && (
            <div className="aftrah-app-validation-notice">
              * All fields are required to register a construction contract.
            </div>
          )}

          <button
            type="submit"
            disabled={!isAddFormValid}
            className="btn-theme-primary aftrah-app-submit-btn"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Contract</span>
          </button>
        </form>
      </aside>

      {/* EDIT CONTRACT MODAL */}
      {isEditModalOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="aftrah-app-modal-container"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={17} color="#f59e0b" />
                <h3 className="aftrah-app-modal-title">Edit Contract Details</h3>
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
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Labour / Contractor Name *</label>
                  <input
                    type="text"
                    required
                    value={editLabourName}
                    onChange={(e) => setEditLabourName(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Construction Site Name *</label>
                  <SearchableExpenseSelect
                    options={siteOptions}
                    value={editSiteName}
                    onChange={(val) => setEditSiteName(val)}
                    placeholder="Select or type site location..."
                  />
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Agreed Labour Charge (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={editLabourCharge}
                    onChange={(e) => setEditLabourCharge(e.target.value)}
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
                  style={{ minWidth: '120px', height: '40px', fontSize: '13px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Construction Labour Contract"
        message="Are you sure you want to delete this labour contract record? All logged work muster entries and payments will also be permanently deleted."
        itemName={deleteTarget ? `${deleteTarget.labourName} (${deleteTarget.siteName})` : undefined}
        confirmText="Delete Contract"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
