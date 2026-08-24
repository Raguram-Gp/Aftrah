import React, { useState, useMemo } from 'react';
import type { ProjectType, SiteStatus, PaymentMode } from '../../types';
import { useSiteManager } from '../../context/SiteManagerContext';
import { DatePicker } from '../ui/DatePicker';
import { SearchableCreatableSelect } from '../ui/SearchableCreatableSelect';
import { X, Building2, Plus, DollarSign, Wallet } from 'lucide-react';

const DEFAULT_PROJECT_TYPES = [
  'Commercial High-Rise',
  'Luxury Villa',
  'Residential Complex',
  'Corporate Campus',
  'Infrastructure',
  'Hospitality & Resort',
  'Industrial & Warehouse',
  'Institutional / Education',
  'Retail Mall / Arcade'
];

const EXECUTION_STATUS_OPTIONS = [
  'Active Construction',
  'Planning',
  'Finishing & Interior',
  'Handover / Completed'
];

const PAYMENT_MODES = [
  'Bank Transfer',
  'UPI',
  'Cash',
  'Cheque',
  'RTGS'
];

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated?: (siteId: string) => void;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({ isOpen, onClose, onSiteCreated }) => {
  const { addSite, sites } = useSiteManager();

  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('Commercial High-Rise');
  const [status, setStatus] = useState<SiteStatus>('Active Construction');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [notes, setNotes] = useState('');

  // Collect all unique project types
  const projectTypeOptions = useMemo(() => {
    const set = new Set<string>(DEFAULT_PROJECT_TYPES);
    (sites || []).forEach((s) => {
      if (s.projectType) set.add(s.projectType);
    });
    return Array.from(set);
  }, [sites]);

  // Initial Advance section
  const [hasInitialAdvance, setHasInitialAdvance] = useState(true);
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>(1000000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Bank Transfer');
  const [advanceNotes, setAdvanceNotes] = useState('Project Inception Mobilization Advance');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteName.trim() || !clientName.trim() || !siteAddress.trim() || !contactNumber.trim()) {
      alert('Please fill all required fields (Site Name, Client Name, Address, Contact Number).');
      return;
    }

    const newId = addSite({
      siteName: siteName.trim(),
      clientName: clientName.trim(),
      siteAddress: siteAddress.trim(),
      contactNumber: contactNumber.trim(),
      email: email.trim() || undefined,
      projectType,
      status,
      startDate,
      estimatedCompletion: estimatedCompletion || undefined,
      notes: notes.trim() || undefined,
      initialAdvance: hasInitialAdvance && Number(advanceAmount) > 0 ? {
        amount: Number(advanceAmount),
        paymentMode,
        referenceNotes: advanceNotes
      } : undefined
    });

    onClose();
    if (onSiteCreated) {
      onSiteCreated(newId);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="var(--primary)" />
            <h2 className="modal-title">+ Add Client & Construction Site</h2>
          </div>
          <button onClick={onClose} className="btn-ghost-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Site / Project Name */}
            <div className="form-group">
              <label className="form-label">Site / Project Landmark Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. The Aurum Residences (Tower B)"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Client Info */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Client / Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Rajesh Vardhan"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98401 23456"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Site Physical Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. Plot 42, Jubilee Hills Road 36, Hyderabad"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Project Type & Status */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Project Type</label>
                <SearchableCreatableSelect
                  value={projectType}
                  onChange={(val) => setProjectType(val as ProjectType)}
                  options={projectTypeOptions}
                  placeholder="Select or create project type..."
                  searchPlaceholder="Search or type new project type..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Execution Status</label>
                <SearchableCreatableSelect
                  value={status}
                  onChange={(val) => setStatus(val as SiteStatus)}
                  options={EXECUTION_STATUS_OPTIONS}
                  placeholder="Select status..."
                  searchPlaceholder="Search execution status..."
                  allowCreate={false}
                />
              </div>
            </div>

            {/* Start Date & Est Completion */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Site Start Date</label>
                <DatePicker
                  value={startDate}
                  onChange={(newDate) => setStartDate(newDate)}
                  placeholder="Select start date"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Completion (Optional)</label>
                <DatePicker
                  value={estimatedCompletion}
                  onChange={(newDate) => setEstimatedCompletion(newDate)}
                  placeholder="Select completion date"
                />
              </div>
            </div>

            {/* Initial Advance Toggle Box */}
            <div 
              style={{
                background: 'var(--surface-container, #1e2023)',
                border: '1px solid var(--border-stroke, #232730)',
                borderRadius: '10px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasInitialAdvance ? '14px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={16} color="var(--primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Record Initial Client Advance
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={hasInitialAdvance}
                  onChange={(e) => setHasInitialAdvance(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
              </div>

              {hasInitialAdvance && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Advance Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="1000000"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Payment Mode</label>
                      <SearchableCreatableSelect
                        value={paymentMode}
                        onChange={(val) => setPaymentMode(val as PaymentMode)}
                        options={PAYMENT_MODES}
                        placeholder="Select payment mode..."
                        searchPlaceholder="Search payment mode..."
                        allowCreate={false}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reference Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. RTGS Ref / Advance Cheque"
                      value={advanceNotes}
                      onChange={(e) => setAdvanceNotes(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Scope / Notes */}
            <div className="form-group">
              <label className="form-label">Site Notes / Scope Overview (Optional)</label>
              <textarea
                rows={2}
                placeholder="Architectural specs, structural notes, contractor instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-gold">
              <Plus size={15} />
              <span>Create Site Entity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
