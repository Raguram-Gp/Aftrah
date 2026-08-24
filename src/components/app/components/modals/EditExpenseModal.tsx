import React, { useState, useEffect, useMemo } from 'react';
import type { ExpenseItem, ExpenseCategory } from '../../types';
import { useSiteManager, formatINR } from '../../context/SiteManagerContext';
import { DatePicker } from '../ui/DatePicker';
import { SearchableCreatableSelect } from '../ui/SearchableCreatableSelect';
import { X, Pencil, Calculator, CheckCircle2 } from 'lucide-react';

interface EditExpenseModalProps {
  siteId: string;
  siteName: string;
  expense: ExpenseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const STANDARD_CATEGORIES: string[] = [
  'Cement & Concrete',
  'Steel Reinforcement',
  'Masonry & Bricks',
  'Electrical & Plumbing',
  'Labor & Contractor',
  'Heavy Equipment & Crane',
  'Interior & Finishing',
  'Permits & Structural',
  'Architectural & Survey',
  'Miscellaneous'
];

const STANDARD_UNITS: string[] = [
  'Cu.M',
  'Tons',
  'Bags',
  'Sq.Ft',
  'Units',
  'Days',
  'Hours',
  'Kg',
  'Lump Sum',
  'Truckloads',
  'Litres'
];

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  siteId,
  siteName,
  expense,
  isOpen,
  onClose
}) => {
  const { updateExpense, sites } = useSiteManager();

  const currentSite = sites.find((s) => s.id === siteId);
  const existingCategories = useMemo(() => {
    const siteCategories = (currentSite?.expenses || []).map((e) => e.category);
    return Array.from(new Set([...STANDARD_CATEGORIES, ...siteCategories]));
  }, [currentSite?.expenses]);

  const [date, setDate] = useState('');
  const [category, setCategory] = useState<string>('Cement & Concrete');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [unit, setUnit] = useState('Cu.M');
  const [unitRate, setUnitRate] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expense) {
      setDate(expense.date || new Date().toISOString().split('T')[0]);
      setCategory(expense.category);
      setQuantity(expense.quantity);
      setUnit(expense.unit || 'Cu.M');
      setUnitRate(expense.unitRate);
      setNotes(expense.notes || '');
    }
  }, [expense]);

  // Live calculated total
  const computedTotal = useMemo(() => {
    const q = Number(quantity) || 0;
    const r = Number(unitRate) || 0;
    return q * r;
  }, [quantity, unitRate]);

  if (!isOpen || !expense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category.trim()) {
      alert('Please select or enter an expense category.');
      return;
    }

    if (!quantity || Number(quantity) <= 0 || !unitRate || Number(unitRate) <= 0) {
      alert('Please provide valid Quantity and Unit Rate greater than zero.');
      return;
    }

    updateExpense(siteId, expense.id, {
      date,
      category: category.trim(),
      quantity: Number(quantity),
      unit: unit.trim() || 'Units',
      unitRate: Number(unitRate),
      totalAmount: computedTotal,
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
              <h2 className="modal-title">Edit Expense Entry</h2>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {siteName}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Category & Date */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '6px' }}>Expense Category *</label>
                <SearchableCreatableSelect
                  value={category}
                  onChange={(val) => {
                    setCategory(val);
                    if (val === 'Cement & Concrete') setUnit('Cu.M');
                    else if (val === 'Steel Reinforcement') setUnit('Tons');
                    else if (val === 'Masonry & Bricks') setUnit('Units');
                    else if (val === 'Labor & Contractor') setUnit('Days');
                    else if (val === 'Heavy Equipment & Crane') setUnit('Days');
                    else if (val === 'Interior & Finishing') setUnit('Sq.Ft');
                  }}
                  options={existingCategories}
                  placeholder="Select or create category..."
                  searchPlaceholder="Search or type new category..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '6px' }}>Expense Date *</label>
                <DatePicker
                  value={date}
                  onChange={(newDate) => setDate(newDate || new Date().toISOString().split('T')[0])}
                  placeholder="Select expense date"
                />
              </div>
            </div>

            {/* Quantity, Unit & Unit Rate */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.4fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit</label>
                <SearchableCreatableSelect
                  value={unit}
                  onChange={setUnit}
                  options={STANDARD_UNITS}
                  placeholder="Unit..."
                  searchPlaceholder="Search or type unit..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit Rate (₹) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  placeholder="e.g. 4500"
                  value={unitRate}
                  onChange={(e) => setUnitRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>

            {/* Calculated Total Display */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface-container-high, #282a2d)',
                border: '1px solid var(--border-stroke, #232730)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={16} color="var(--primary)" />
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Calculated Total:</span>
              </div>
              <span className="font-mono-currency" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary)' }}>
                {formatINR(computedTotal)}
              </span>
            </div>

            {/* Description / Scope */}
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">Notes / Scope / Bill Reference</label>
              <textarea
                rows={2}
                placeholder="e.g. UltraTech M25 ready-mix concrete batch for 4th-floor slab pour"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
              />
            </div>
          </div>

          {/* Actions */}
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
