import React, { useState, useMemo } from 'react';
import type { LabourContract, LabourContractEntry } from '../types';
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
  Scale
} from 'lucide-react';

interface InteriorLabourContractDetailsViewProps {
  contract: LabourContract;
  onBack: () => void;
  onUpdateContract: (updated: LabourContract) => Promise<any> | void;
  onUpdateLabourCharge: (contractId: string, charge: number) => Promise<any> | void;
  onAddEntry: (contractId: string, entryData: Omit<LabourContractEntry, 'id' | 'sNo'>) => Promise<any> | void;
  onUpdateEntry: (contractId: string, updatedEntry: LabourContractEntry) => Promise<any> | void;
  onDeleteEntry: (contractId: string, entryId: string) => Promise<any> | void;
}

const PRESET_WORK_TYPES = [
  'Carpenter',
  'Masonry Work',
  'False Ceiling / POP',
  'Painting & Polish',
  'Electrical Work',
  'Plumbing Work',
  'Tiling & Granite',
  'Glass & Aluminum',
  'Helper / Unskilled'
];

export const InteriorLabourContractDetailsView: React.FC<InteriorLabourContractDetailsViewProps> = ({
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
  const [addWorkType, setAddWorkType] = useState('Carpenter');
  const [addDays, setAddDays] = useState('1');
  const [addSalaryPerDay, setAddSalaryPerDay] = useState('5000');
  const [addTotalAmount, setAddTotalAmount] = useState('5000');
  const [addNote, setAddNote] = useState('');

  // Edit Labour Charge Modal
  const [isEditChargeOpen, setIsEditChargeOpen] = useState(false);
  const [chargeInput, setChargeInput] = useState(String(contract.labourCharge || 45000));

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

  const labourCharge = Number(contract.labourCharge || 45000);
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
        e.date.includes(q) ||
        (e.note && e.note.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  // Pagination
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

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseFloat(addDays);
    const salary = parseFloat(addSalaryPerDay);
    const total = parseFloat(addTotalAmount);

    if (!addWorkType.trim() || isNaN(days) || isNaN(salary) || isNaN(total)) return;

    await onAddEntry(contract.id, {
      date: addDate.trim(),
      workType: addWorkType.trim(),
      days,
      salaryPerDay: salary,
      totalAmount: total,
      note: addNote.trim() || undefined
    });

    setAddNote('');
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
    if (!editingEntry) return;

    const days = parseFloat(editDays);
    const salary = parseFloat(editSalaryPerDay);
    const total = parseFloat(editTotalAmount);

    if (!editWorkType.trim() || isNaN(days) || isNaN(salary) || isNaN(total)) return;

    await onUpdateEntry(contract.id, {
      ...editingEntry,
      date: editDate.trim(),
      workType: editWorkType.trim(),
      days,
      salaryPerDay: salary,
      totalAmount: total,
      note: editNote.trim() || undefined
    });

    setEditingEntry(null);
  };

  // Save Labour Charge
  const handleSaveCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(chargeInput);
    if (isNaN(num) || num < 0) return;

    await onUpdateLabourCharge(contract.id, num);
    setIsEditChargeOpen(false);
  };

  return (
    <div className="client-details-page">
      {/* Top Header Card using Theme Design System */}
      <div className="client-details-header no-print">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={onBack} className="afrah-app-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Labour Contracts</span>
          </button>

          <button onClick={() => window.print()} className="afrah-app-print-btn">
            <Printer size={15} />
            <span>Print Statement</span>
          </button>
        </div>

        <div className="client-details-title-row">
          <div>
            <h1 className="client-details-main-title">
              {contract.labourName} - {contract.siteName}
            </h1>
            <div className="client-meta-row">
              <span className="client-meta-pill">
                <HardHat size={13} color="var(--primary)" />
                Labour Contractor
              </span>
              <span className="client-meta-pill">
                <Phone size={13} color="var(--primary)" />
                {contract.phone}
              </span>
              <span className="client-meta-pill">
                <Calendar size={13} color="var(--primary)" />
                Registered: {contract.date}
              </span>
            </div>
          </div>

          {/* Top 3 KPI Cards matching sketch: LABOUR CHARGE, Paid Amount, Balance Amount */}
          <div className="client-financial-summary">
            {/* Card 1: LABOUR CHARGE */}
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
                  <span className="metric-label">LABOUR CHARGE</span>
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
                <span className="metric-label">BALANCE AMOUNT</span>
                <span className={`metric-value ${balanceAmount > 0 ? 'red' : 'green'}`}>
                  {formatINR(balanceAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Wireframe Layout matching sketch */}
      <div className="afrah-app-wireframe-layout">
        {/* LEFT COLUMN: TABLE (S.NO, Date, Work Type, DAYS, Salary/Day, Total Amount, ACTIONS) */}
        <section className="afrah-app-table-section">
          <div className="afrah-app-section-header">
            <div>
              <h2 className="afrah-app-section-title">WORK & ATTENDANCE ENTRIES</h2>
              <span className="afrah-app-section-subtitle">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} · Total Paid: {formatINR(paidAmount)} ({totalDays} {totalDays === 1 ? 'Day' : 'Days'})
              </span>
            </div>

            <div className="afrah-app-search-wrapper">
              <Search size={14} className="afrah-app-search-icon" />
              <input
                type="text"
                placeholder="Search work type, date..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="afrah-app-search-input"
              />
            </div>
          </div>

          <div className="afrah-app-table-container">
            <table className="afrah-app-table">
              <thead>
                <tr>
                  <th style={{ width: '55px', textAlign: 'center' }}>S.NO</th>
                  <th style={{ width: '105px' }}>DATE</th>
                  <th>WORK TYPE</th>
                  <th style={{ width: '85px', textAlign: 'center' }}>DAYS</th>
                  <th style={{ width: '130px' }}>SALARY / DAY</th>
                  <th style={{ width: '130px' }}>TOTAL AMOUNT</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>ACTIONS</th>
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
                          <div className="afrah-app-user-avatar" style={{ background: 'rgba(226, 195, 153, 0.12)', color: 'var(--primary)', width: '28px', height: '28px' }}>
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
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            onClick={(e) => handleOpenEdit(entry, e)}
                            className="afrah-app-action-btn afrah-app-edit-btn"
                            title="Edit Entry"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(entry)}
                            className="afrah-app-action-btn afrah-app-delete-btn"
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
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination Bar */}
          {filteredEntries.length > 0 && (
            <div className="afrah-app-pagination-bar">
              <div className="afrah-app-pagination-left">
                <span className="afrah-app-pagination-info">
                  Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of <strong>{filteredEntries.length}</strong>
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

        {/* RIGHT COLUMN: ADD DETAILS CARD (Matching Sketch) */}
        <aside className="afrah-app-form-card">
          <div className="afrah-app-form-card-header">
            <h2 className="afrah-app-form-card-title">Add details</h2>
          </div>

          <form onSubmit={handleAddSubmit} className="afrah-app-add-form">
            <div className="afrah-app-form-group">
              <label className="afrah-app-label">DATE *</label>
              <input
                type="date"
                required
                value={addDate}
                onChange={(e) => setAddDate(e.target.value)}
                className="afrah-app-input"
              />
            </div>

            <div className="afrah-app-form-group">
              <label className="afrah-app-label">WORK TYPE *</label>
              <SearchableExpenseSelect
                value={addWorkType}
                onChange={setAddWorkType}
                options={PRESET_WORK_TYPES}
                placeholder="Search or select work type..."
                searchPlaceholder="Type to filter or enter work type..."
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="afrah-app-form-group">
                <label className="afrah-app-label">DAYS *</label>
                <input
                  type="number"
                  step="any"
                  min="0.5"
                  required
                  placeholder="e.g. 1"
                  value={addDays}
                  onChange={(e) => {
                    setAddDays(e.target.value);
                    handleDaysOrSalaryChange(e.target.value, addSalaryPerDay);
                  }}
                  className="afrah-app-input"
                />
              </div>

              <div className="afrah-app-form-group">
                <label className="afrah-app-label">SALARY / DAY *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 5000"
                  value={addSalaryPerDay}
                  onChange={(e) => {
                    setAddSalaryPerDay(e.target.value);
                    handleDaysOrSalaryChange(addDays, e.target.value);
                  }}
                  className="afrah-app-input"
                />
              </div>
            </div>

            <div className="afrah-app-form-group">
              <label className="afrah-app-label">TOTAL AMOUNT (₹) *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 5000"
                value={addTotalAmount}
                onChange={(e) => setAddTotalAmount(e.target.value)}
                className="afrah-app-input"
              />
            </div>

            <div className="afrah-app-form-group">
              <label className="afrah-app-label">NOTE / WORK PARTICULARS</label>
              <input
                type="text"
                placeholder="e.g. Kitchen bottom cabinet assembly"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                className="afrah-app-input"
              />
            </div>

            <button type="submit" className="btn-theme-primary afrah-app-submit-btn">
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Details</span>
            </button>
          </form>
        </aside>
      </div>

      {/* Edit Labour Charge Modal */}
      {isEditChargeOpen && (
        <div className="afrah-app-modal-overlay" onClick={() => setIsEditChargeOpen(false)}>
          <div className="afrah-app-modal-container" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="afrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={16} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Labour Charge</h3>
              </div>
              <button onClick={() => setIsEditChargeOpen(false)} className="afrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCharge}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Total Agreed Labour Charge (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 45000"
                    value={chargeInput}
                    onChange={(e) => setChargeInput(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>
              </div>

              <div className="afrah-app-modal-footer">
                <button type="button" onClick={() => setIsEditChargeOpen(false)} className="afrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" className="btn-theme-primary">
                  Save Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="afrah-app-modal-overlay" onClick={() => setEditingEntry(null)}>
          <div className="afrah-app-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="afrah-app-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={16} color="var(--primary)" />
                <h3 className="afrah-app-modal-title">Edit Work Entry</h3>
              </div>
              <button onClick={() => setEditingEntry(null)} className="afrah-app-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="afrah-app-modal-body">
                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Work Type *</label>
                  <SearchableExpenseSelect
                    value={editWorkType}
                    onChange={setEditWorkType}
                    options={PRESET_WORK_TYPES}
                    placeholder="Search or select work type..."
                    searchPlaceholder="Type to filter or enter work type..."
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Days *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.5"
                      required
                      value={editDays}
                      onChange={(e) => {
                        setEditDays(e.target.value);
                        handleEditDaysOrSalaryChange(e.target.value, editSalaryPerDay);
                      }}
                      className="afrah-app-input"
                    />
                  </div>

                  <div className="afrah-app-form-group">
                    <label className="afrah-app-label">Salary / Day *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editSalaryPerDay}
                      onChange={(e) => {
                        setEditSalaryPerDay(e.target.value);
                        handleEditDaysOrSalaryChange(editDays, e.target.value);
                      }}
                      className="afrah-app-input"
                    />
                  </div>
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Total Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>

                <div className="afrah-app-form-group">
                  <label className="afrah-app-label">Note / Particulars</label>
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="afrah-app-input"
                  />
                </div>
              </div>

              <div className="afrah-app-modal-footer">
                <button type="button" onClick={() => setEditingEntry(null)} className="afrah-app-back-btn">
                  Cancel
                </button>
                <button type="submit" className="btn-theme-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Entry Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Work Entry"
        message="Are you sure you want to delete this work & attendance entry?"
        itemName={deleteTarget ? `${deleteTarget.workType} (${deleteTarget.date}) - ${formatINR(deleteTarget.totalAmount)}` : undefined}
        confirmText="Delete Entry"
        isDeleting={isDeleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          try {
            await onDeleteEntry(contract.id, deleteTarget.id);
            setDeleteTarget(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
