import React, { useState } from 'react';
import type { Site, PaymentMode } from '../../types';
import { useSiteManager, formatINR } from '../../context/SiteManagerContext';
import { DatePicker } from '../ui/DatePicker';
import { SearchableCreatableSelect } from '../ui/SearchableCreatableSelect';
import { X, Wallet, Plus, CreditCard, Banknote, Smartphone, CheckCircle2 } from 'lucide-react';

const PAYMENT_MODES = [
  'Bank Transfer',
  'UPI',
  'Cash',
  'Cheque',
  'RTGS'
];

interface AddAdvanceModalProps {
  site: Site;
  isOpen: boolean;
  onClose: () => void;
}

export const AddAdvanceModal: React.FC<AddAdvanceModalProps> = ({ site, isOpen, onClose }) => {
  const { addAdvance } = useSiteManager();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Bank Transfer');
  const [amount, setAmount] = useState<number | ''>('');
  const [referenceNotes, setReferenceNotes] = useState('');
  const [receivedBy, setReceivedBy] = useState('Site Finance Accounts');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid advance amount greater than zero.');
      return;
    }

    if (!referenceNotes.trim()) {
      alert('Please provide reference notes or transaction reference ID.');
      return;
    }

    addAdvance(site.id, {
      date,
      paymentMode,
      amount: Number(amount),
      referenceNotes: referenceNotes.trim(),
      receivedBy: receivedBy.trim() || undefined
    });

    onClose();
    setAmount('');
    setReferenceNotes('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet size={20} color="var(--primary)" />
            <div>
              <h2 className="modal-title">Record Client Advance</h2>
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
            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Advance Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="e.g. 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="form-input"
                style={{ fontSize: '16px', fontWeight: 600 }}
                autoFocus
              />
              {amount !== '' && (
                <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                  Formatted: {formatINR(Number(amount))}
                </div>
              )}
            </div>

            {/* Date & Mode */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Receipt Date *</label>
                <DatePicker
                  value={date}
                  onChange={(newDate) => setDate(newDate || new Date().toISOString().split('T')[0])}
                  placeholder="Select receipt date"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode *</label>
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

            {/* Reference Notes / Transaction ID */}
            <div className="form-group">
              <label className="form-label">Reference Notes / Txn UTR Number *</label>
              <input
                type="text"
                placeholder="e.g. RTGS HDFC009218 / Milestone 2 Slab Tranche"
                value={referenceNotes}
                onChange={(e) => setReferenceNotes(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Received By */}
            <div className="form-group">
              <label className="form-label">Received / Verified By</label>
              <input
                type="text"
                placeholder="e.g. Site Finance / Project Manager"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="form-input"
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
              <span>Credit Advance Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
