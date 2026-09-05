import React, { useState, useMemo } from 'react';
import type { LabourContract, LabourContractEntry } from '../types';
import { PREDEFINED_CONSTRUCTION_WORK_TYPES } from '../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { SearchableExpenseSelect } from '../components/SearchableExpenseSelect';
import {
  ArrowLeft,
  HardHat,
  Phone,
  Calendar,
  IndianRupee,
  Plus,
  Pencil,
  Trash2,
  Printer,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Wallet,
  Clock,
  Scale,
  MapPin
} from 'lucide-react';

interface ConstructionLabourContractDetailsViewProps {
  contract: LabourContract;
  onBack: () => void;
  onUpdateContract: (updated: LabourContract) => Promise<any> | void;
  onUpdateLabourCharge: (contractId: string, charge: number) => Promise<any> | void;
  onAddEntry: (contractId: string, entryData: Omit<LabourContractEntry, 'id' | 'sNo'>) => Promise<any> | void;
  onUpdateEntry: (contractId: string, updatedEntry: LabourContractEntry) => Promise<any> | void;
  onDeleteEntry: (contractId: string, entryId: string) => Promise<any> | void;
}

export const ConstructionLabourContractDetailsView: React.FC<ConstructionLabourContractDetailsViewProps> = ({
  contract,
  onBack,
  onUpdateContract,
  onUpdateLabourCharge,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add Details Form State (Right Column Card)
  const todayStr = new Date().toISOString().split('T')[0];
  const [addDate, setAddDate] = useState(todayStr);
  const [addWorkType, setAddWorkType] = useState('Centring & Shuttering');
  const [addDays, setAddDays] = useState('1');
  const [addSalaryPerDay, setAddSalaryPerDay] = useState('4500');
  const [addTotalAmount, setAddTotalAmount] = useState('4500');
  const [addNote, setAddNote] = useState('');

  // Edit Labour Charge Modal
  const [isEditChargeOpen, setIsEditChargeOpen] = useState(false);
  const [chargeInput, setChargeInput] = useState(String(contract.labourCharge || 50000));

  // Edit Entry Modal State
  const [editingEntry, setEditingEntry] = useState<LabourContractEntry | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editWorkType, setEditWorkType] = useState('');
  const [editDays, setEditDays] = useState('1');
  const [editSalaryPerDay, setEditSalaryPerDay] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editNote, setEditNote] = useState('');

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<LabourContractEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto calculate total for add form
  const handleDaysOrSalaryChange = (daysVal: string, salaryVal: string) => {
    const numDays = parseFloat(daysVal) || 0;
    const numSalary = parseFloat(salaryVal) || 0;
    setAddTotalAmount(String(Math.round(numDays * numSalary)));
  };

  // Auto calculate total for edit form
  const handleEditDaysOrSalaryChange = (daysVal: string, salaryVal: string) => {
    const numDays = parseFloat(daysVal) || 0;
    const numSalary = parseFloat(salaryVal) || 0;
    setEditTotalAmount(String(Math.round(numDays * numSalary)));
  };

  const entries = contract.entries || [];

  // Total Paid Amount = sum of entries totalAmount
  const paidAmount = useMemo(() => {
    return entries.reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
  }, [entries]);

  const totalDays = useMemo(() => {
    return entries.reduce((sum, e) => sum + (Number(e.days) || 0), 0);
  }, [entries]);

  const labourCharge = Number(contract.labourCharge || 50000);
  const balanceAmount = labourCharge - paidAmount;

  // Format INR Currency
  const formatINR = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.workType.toLowerCase().includes(q) ||
        (e.note && e.note.toLowerCase().includes(q)) ||
        e.date.includes(q)
    );
  }, [entries, searchQuery]);

  // Pagination computations
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredEntries.length);
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (currentPage > 1) pages.push(currentPage - 1);
    pages.push(currentPage);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // Form Validation
  const isAddFormValid =
    addDate.trim().length > 0 &&
    addWorkType.trim().length > 0 &&
    parseFloat(addDays) > 0 &&
    parseFloat(addSalaryPerDay) > 0;

  const isEditFormValid =
    editDate.trim().length > 0 &&
    editWorkType.trim().length > 0 &&
    parseFloat(editDays) > 0 &&
    parseFloat(editSalaryPerDay) > 0;

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddFormValid) return;

    await onAddEntry(contract.id, {
      date: addDate.trim(),
      workType: addWorkType.trim(),
      days: parseFloat(addDays) || 1,
      salaryPerDay: parseFloat(addSalaryPerDay) || 0,
      totalAmount: parseFloat(addTotalAmount) || (parseFloat(addDays) * parseFloat(addSalaryPerDay)),
      note: addNote.trim() || undefined
    });

    setAddDays('1');
    setAddNote('');
    handleDaysOrSalaryChange('1', addSalaryPerDay);
    setCurrentPage(1);
  };

  // Open Edit Entry Modal
  const handleOpenEdit = (entry: LabourContractEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntry(entry);
    setEditDate(entry.date);
    setEditWorkType(entry.workType);
    setEditDays(String(entry.days));
    setEditSalaryPerDay(String(entry.salaryPerDay));
    setEditTotalAmount(String(entry.totalAmount));
    setEditNote(entry.note || '');
  };

  // Save Edit Entry
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditFormValid || !editingEntry) return;

    await onUpdateEntry(contract.id, {
      ...editingEntry,
      date: editDate.trim(),
      workType: editWorkType.trim(),
      days: parseFloat(editDays) || 1,
      salaryPerDay: parseFloat(editSalaryPerDay) || 0,
      totalAmount: parseFloat(editTotalAmount) || (parseFloat(editDays) * parseFloat(editSalaryPerDay)),
      note: editNote.trim() || undefined
    });

    setEditingEntry(null);
  };

  // Handle Save Labour Charge
  const handleSaveCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(chargeInput);
    if (isNaN(val) || val < 0) return;

    await onUpdateLabourCharge(contract.id, val);
    setIsEditChargeOpen(false);
  };

  // Confirm Delete Entry
  const handleConfirmDeleteEntry = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteEntry(contract.id, deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="client-details-page">
      {/* Print-Only Formal Statement Header */}
      <div className="print-only-statement-header">
        <div className="print-brand-row">
          <div>
            <h1 className="print-company-name">AFRAH CONSTRUCTIONS</h1>
            <p className="print-company-sub">
              Engineering, Civil Construction & Infrastructure · Site Labour Ledger Statement
            </p>
          </div>
          <div className="print-badge-statement">
            <span>LABOUR MUSTER ROLL</span>
          </div>
        </div>

        <div className="print-meta-grid">
          <div className="print-meta-box">
            <span className="print-meta-title">CONTRACTOR INFORMATION</span>
            <div className="print-meta-val">{contract.labourName}</div>
            <div className="print-meta-sub">Phone: {contract.phone}</div>
            <div className="print-meta-sub">Site: {contract.siteName}</div>
          </div>
          <div className="print-meta-box">
            <span className="print-meta-title">CONTRACT FINANCIALS</span>
            <div className="print-meta-val">Agreed Labour Charge: {formatINR(labourCharge)}</div>
            <div className="print-meta-sub" style={{ color: '#047857' }}>Total Paid: {formatINR(paidAmount)}</div>
            <div className="print-meta-sub" style={{ color: '#b45309' }}>Balance Remaining: {formatINR(balanceAmount)}</div>
          </div>
        </div>
      </div>

      {/* Screen View Header & Navigation */}
      <div className="client-details-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={onBack} className="aftrah-app-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Contracts</span>
          </button>

          <button onClick={handlePrint} className="aftrah-app-print-btn">
            <Printer size={15} />
            <span>Print Muster Roll</span>
          </button>
        </div>

        <div className="client-details-title-row">
          <div>
            <h1 className="client-details-main-title">
              {contract.labourName}
            </h1>
            <div className="client-meta-row">
              <span className="client-meta-pill">
                <HardHat size={13} color="var(--primary)" />
                Construction Contractor
              </span>
              <span className="client-meta-pill">
                <MapPin size={13} color="var(--primary)" />
                {contract.siteName}
              </span>
              <span className="client-meta-pill">
                <Phone size={13} color="var(--primary)" />
                {contract.phone}
              </span>
              <span className="client-meta-pill">
                <Calendar size={13} color="var(--primary)" />
                Started: {contract.date}
              </span>
            </div>
          </div>

          {/* Top 3 KPI Cards: Agreed Labour Charge, Paid Amount, Balance Amount */}
          <div className="client-financial-summary">
            {/* Card 1: Agreed Labour Charge */}
            <div
              className="summary-metric-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setChargeInput(String(labourCharge));
                setIsEditChargeOpen(true);
              }}
              title="Click to edit Labour Charge"
            >
              <div className="metric-icon-wrap gold">
                <Wallet size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span className="metric-label">AGREED CHARGE</span>
                  <Pencil size={11} color="var(--primary)" />
                </div>
                <span className="metric-value gold">{formatINR(labourCharge)}</span>
              </div>
            </div>

            {/* Card 2: Paid Amount */}
            <div className="summary-metric-card">
              <div className="metric-icon-wrap green">
                <IndianRupee size={22} />
              </div>
              <div>
                <span className="metric-label">PAID AMOUNT</span>
                <span className="metric-value green">{formatINR(paidAmount)}</span>
              </div>
            </div>

            {/* Card 3: Balance Amount */}
            <div className="summary-metric-card">
              <div className={`metric-icon-wrap ${balanceAmount > 0 ? 'red' : 'green'}`}>
                <Scale size={22} />
              </div>
              <div>
                <span className="metric-label">BALANCE PAYABLE</span>
                <span className={`metric-value ${balanceAmount > 0 ? 'red' : 'green'}`}>
                  {formatINR(balanceAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Wireframe Layout matching sketch */}
      <div className="aftrah-app-wireframe-layout">
        {/* LEFT COLUMN: TABLE (S.NO, Date, Work Type, DAYS, Salary/Day, Total Amount, ACTIONS) */}
        <section className="aftrah-app-table-section">
          <div className="aftrah-app-section-header">
            <div>
              <h2 className="aftrah-app-section-title">DAILY MUSTER & WORK ENTRIES</h2>
              <span className="aftrah-app-section-subtitle">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} · Total Paid: {formatINR(paidAmount)} ({totalDays} {totalDays === 1 ? 'Day' : 'Days'})
              </span>
            </div>

            <div className="aftrah-app-search-wrapper">
              <Search size={14} className="aftrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search work type, date..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="aftrah-app-search-input"
              />
            </div>
          </div>

          <div className="aftrah-app-table-container">
            <table className="aftrah-app-table">
              <thead>
                <tr>
                  <th style={{ width: '55px', textAlign: 'center' }}>S.NO</th>
                  <th style={{ width: '105px' }}>DATE</th>
                  <th>WORK TYPE</th>
                  <th style={{ width: '85px', textAlign: 'center' }}>DAYS</th>
                  <th style={{ width: '130px' }}>SALARY / DAY</th>
                  <th style={{ width: '130px' }}>TOTAL AMOUNT</th>
                  <th style={{ width: '80px', textAlign: 'center' }} className="no-print">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)' }}>
                      {searchQuery ? 'No matching entries found.' : 'No work entries added yet. Use the form on the right to add daily details.'}
                    </td>
                  </tr>
                ) : (
                  paginatedEntries.map((entry, index) => (
                    <tr key={entry.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                        #{startIndex + index + 1}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={12} color="var(--primary)" />
                          <span>{entry.date}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="aftrah-app-user-avatar" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', width: '28px', height: '28px' }}>
                            <Briefcase size={13} />
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13.5px' }}>
                              {entry.workType}
                            </span>
                            {entry.note && (
                              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {entry.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: '999px',
                            background: 'rgba(96, 165, 250, 0.12)',
                            color: '#60a5fa',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          {entry.days}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {formatINR(entry.salaryPerDay)}
                      </td>
                      <td>
                        <strong style={{ color: '#4ade80', fontSize: '13.5px' }}>
                          {formatINR(entry.totalAmount)}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'center' }} className="no-print">
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => handleOpenEdit(entry, e)}
                            className="aftrah-app-action-btn aftrah-app-edit-btn"
                            title="Edit Entry"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(entry)}
                            className="aftrah-app-action-btn aftrah-app-delete-btn"
                            title="Delete Entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredEntries.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', fontWeight: 700 }}>
                    <td colSpan={3} style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      Total ({filteredEntries.length} entries):
                    </td>
                    <td style={{ textAlign: 'center', color: '#60a5fa' }}>{totalDays}</td>
                    <td>-</td>
                    <td style={{ color: '#4ade80' }}>{formatINR(paidAmount)}</td>
                    <td className="no-print" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination Bar */}
          {filteredEntries.length > 0 && (
            <div className="aftrah-app-pagination-bar no-print">
              <div className="aftrah-app-pagination-left">
                <span className="aftrah-app-pagination-info">
                  Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredEntries.length}</strong>
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

        {/* RIGHT COLUMN: ADD DETAILS CARD (Matching handwritten sketch) */}
        <aside className="aftrah-app-form-card no-print">
          <div className="aftrah-app-form-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16} color="#f59e0b" />
              <h2 className="aftrah-app-form-card-title">Add Details</h2>
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
              <label className="aftrah-app-label">Work Type *</label>
              <SearchableExpenseSelect
                options={PREDEFINED_CONSTRUCTION_WORK_TYPES}
                value={addWorkType}
                onChange={(val) => setAddWorkType(val)}
                placeholder="Select or enter work type..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="aftrah-app-form-group">
                <label className="aftrah-app-label">Days / Labours *</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={addDays}
                  onChange={(e) => {
                    setAddDays(e.target.value);
                    handleDaysOrSalaryChange(e.target.value, addSalaryPerDay);
                  }}
                  className="aftrah-app-input"
                />
              </div>

              <div className="aftrah-app-form-group">
                <label className="aftrah-app-label">Salary / Day (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={addSalaryPerDay}
                  onChange={(e) => {
                    setAddSalaryPerDay(e.target.value);
                    handleDaysOrSalaryChange(addDays, e.target.value);
                  }}
                  className="aftrah-app-input"
                />
              </div>
            </div>

            <div className="aftrah-app-form-group">
              <label className="aftrah-app-label">Total Amount (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={addTotalAmount}
                onChange={(e) => setAddTotalAmount(e.target.value)}
                className="aftrah-app-input"
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px', display: 'block' }}>
                Auto-calculated: {addDays} × ₹{addSalaryPerDay}
              </span>
            </div>

            <div className="aftrah-app-form-group">
              <label className="aftrah-app-label">Note / Scope</label>
              <textarea
                rows={2}
                placeholder="e.g. Column formwork, Beam tying, 9-inch wall..."
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                className="aftrah-app-input aftrah-app-textarea"
              />
            </div>

            {!isAddFormValid && (
              <div className="aftrah-app-validation-notice">
                * Please fill all required fields.
              </div>
            )}

            <button
              type="submit"
              disabled={!isAddFormValid}
              className="btn-theme-primary aftrah-app-submit-btn"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Entry</span>
            </button>
          </form>
        </aside>
      </div>

      {/* EDIT ENTRY MODAL */}
      {editingEntry && (
        <div className="aftrah-app-modal-overlay" onClick={() => setEditingEntry(null)}>
          <div
            className="aftrah-app-modal-container"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={17} color="#f59e0b" />
                <h3 className="aftrah-app-modal-title">Edit Work Entry</h3>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
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
                  <label className="aftrah-app-label">Work Type *</label>
                  <SearchableExpenseSelect
                    options={PREDEFINED_CONSTRUCTION_WORK_TYPES}
                    value={editWorkType}
                    onChange={(val) => setEditWorkType(val)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Days *</label>
                    <input
                      type="number"
                      required
                      min="0.5"
                      step="0.5"
                      value={editDays}
                      onChange={(e) => {
                        setEditDays(e.target.value);
                        handleEditDaysOrSalaryChange(e.target.value, editSalaryPerDay);
                      }}
                      className="aftrah-app-input"
                    />
                  </div>

                  <div className="aftrah-app-form-group">
                    <label className="aftrah-app-label">Salary / Day (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="50"
                      value={editSalaryPerDay}
                      onChange={(e) => {
                        setEditSalaryPerDay(e.target.value);
                        handleEditDaysOrSalaryChange(editDays, e.target.value);
                      }}
                      className="aftrah-app-input"
                    />
                  </div>
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(e.target.value)}
                    className="aftrah-app-input"
                  />
                </div>

                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Note / Particulars</label>
                  <textarea
                    rows={2}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="aftrah-app-input aftrah-app-textarea"
                  />
                </div>
              </div>

              <div className="aftrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
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

      {/* EDIT AGREED LABOUR CHARGE MODAL */}
      {isEditChargeOpen && (
        <div className="aftrah-app-modal-overlay" onClick={() => setIsEditChargeOpen(false)}>
          <div
            className="aftrah-app-modal-container"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aftrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={17} color="#f59e0b" />
                <h3 className="aftrah-app-modal-title">Edit Agreed Labour Charge</h3>
              </div>
              <button
                onClick={() => setIsEditChargeOpen(false)}
                className="aftrah-app-modal-close-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCharge}>
              <div className="aftrah-app-modal-body">
                <div className="aftrah-app-form-group">
                  <label className="aftrah-app-label">Total Agreed Charge (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={chargeInput}
                    onChange={(e) => setChargeInput(e.target.value)}
                    className="aftrah-app-input"
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                    Adjusting this value will automatically recalculate the remaining balance payable.
                  </span>
                </div>
              </div>

              <div className="aftrah-app-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditChargeOpen(false)}
                  className="aftrah-app-back-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-theme-primary"
                  style={{ minWidth: '120px', height: '40px', fontSize: '13px' }}
                >
                  Update Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ENTRY MODAL */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Work Muster Entry"
        message="Are you sure you want to delete this work entry? The paid amount and balance payable will be recalculated."
        itemName={deleteTarget ? `${deleteTarget.date} · ${deleteTarget.workType} (${formatINR(deleteTarget.totalAmount)})` : undefined}
        confirmText="Delete Entry"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDeleteEntry}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
