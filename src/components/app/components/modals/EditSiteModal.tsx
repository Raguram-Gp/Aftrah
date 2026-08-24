import React, { useState, useEffect, useMemo } from 'react';
import type { Site, ProjectType, SiteStatus } from '../../types';
import { useSiteManager } from '../../context/SiteManagerContext';
import { DatePicker } from '../ui/DatePicker';
import { SearchableCreatableSelect } from '../ui/SearchableCreatableSelect';
import { X, Building2, Pencil, CheckCircle2 } from 'lucide-react';

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

interface EditSiteModalProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditSiteModal: React.FC<EditSiteModalProps> = ({ site, isOpen, onClose }) => {
  const { updateSite, sites } = useSiteManager();

  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('Commercial High-Rise');
  const [status, setStatus] = useState<SiteStatus>('Active Construction');
  const [startDate, setStartDate] = useState('');
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

  useEffect(() => {
    if (site) {
      setSiteName(site.siteName || '');
      setClientName(site.clientName || '');
      setSiteAddress(site.siteAddress || site.address || '');
      setContactNumber(site.contactNumber || '');
      setEmail(site.email || '');
      setProjectType(site.projectType || 'Commercial High-Rise');
      setStatus(site.status || 'Active Construction');
      setStartDate(site.startDate || '');
      setEstimatedCompletion(site.estimatedCompletion || '');
      setNotes(site.notes || '');
    }
  }, [site]);

  if (!isOpen || !site) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteName.trim() || !clientName.trim() || !siteAddress.trim() || !contactNumber.trim()) {
      alert('Please fill all required fields (Site Landmark, Client Name, Address, Contact Number).');
      return;
    }

    updateSite(site.id, {
      siteName: siteName.trim(),
      clientName: clientName.trim(),
      siteAddress: siteAddress.trim(),
      address: siteAddress.trim(),
      contactNumber: contactNumber.trim(),
      email: email.trim() || undefined,
      projectType,
      status,
      startDate: startDate || undefined,
      estimatedCompletion: estimatedCompletion || undefined,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pencil size={18} color="var(--primary)" />
            <div>
              <h2 className="modal-title">Edit Site & Client Details</h2>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {site.siteName}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Site Name & Client Name */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Site Name / Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aurum Sky Residences"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

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
            </div>

            {/* Project Type & Status */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Project Type *</label>
                <SearchableCreatableSelect
                  value={projectType}
                  onChange={(val) => setProjectType(val as ProjectType)}
                  options={projectTypeOptions}
                  placeholder="Select or create project type..."
                  searchPlaceholder="Search or type new project type..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Execution Status *</label>
                <SearchableCreatableSelect
                  value={status}
                  onChange={(val) => setStatus(val as SiteStatus)}
                  options={[
                    'Active Construction',
                    'Planning',
                    'Finishing & Interior',
                    'Handover / Completed'
                  ]}
                  placeholder="Select status..."
                  searchPlaceholder="Search execution status..."
                  allowCreate={false}
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Site Physical Address / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Plot 42, Road No. 36, Jubilee Hills, Hyderabad"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Contact & Email */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98401 23456"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. client@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Timeline Dates */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Project Commencement Date</label>
                <DatePicker
                  value={startDate}
                  onChange={(d) => setStartDate(d || '')}
                  placeholder="Select start date"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Est. Handover Completion</label>
                <DatePicker
                  value={estimatedCompletion}
                  onChange={(d) => setEstimatedCompletion(d || '')}
                  placeholder="Select completion date"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Scope / Project Description Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. 24-floor luxury residential tower with 2 basements and rooftop infinity pool..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-gold">
              <CheckCircle2 size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
