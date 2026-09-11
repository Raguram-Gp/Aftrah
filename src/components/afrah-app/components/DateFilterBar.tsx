import React, { useRef } from 'react';
import { Calendar, Trash2, Printer, X } from 'lucide-react';
import { formatToDDMMYYYYDash, formatToYYYYMMDD, isValidDate } from './DateInput';

interface DateFilterBarProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onClearDates: () => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onPrint?: () => void;
  printLabel?: string;
  deleteLabel?: string;
  extraActions?: React.ReactNode;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClearDates,
  selectedCount = 0,
  onBulkDelete,
  onPrint,
  printLabel = 'Print',
  deleteLabel = 'Delete Selected',
  extraActions
}) => {
  const hasActiveFilter = Boolean(fromDate || toDate);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  const triggerPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === 'function') {
        try {
          ref.current.showPicker();
        } catch {
          ref.current.focus();
        }
      } else {
        ref.current.focus();
      }
    }
  };

  return (
    <div className="table-filter-toolbar no-print">
      <div className="filter-toolbar-left">
        {/* Date Filter Inputs */}
        <div className="date-filter-group">
          <div className="date-filter-item">
            <label className="date-filter-label" onClick={() => triggerPicker(fromInputRef)}>
              From Date
            </label>
            <div className="date-input-wrap" title="Click to open calendar picker">
              <Calendar
                size={13}
                className="date-input-icon"
                onClick={() => triggerPicker(fromInputRef)}
              />
              <input
                type="text"
                value={formatToDDMMYYYYDash(fromDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val.trim()) {
                    onFromDateChange('');
                  } else if (isValidDate(val)) {
                    onFromDateChange(formatToYYYYMMDD(val));
                  } else {
                    onFromDateChange(val);
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (isValidDate(val)) {
                    onFromDateChange(formatToYYYYMMDD(val));
                  }
                }}
                placeholder="DD-MM-YYYY"
                className="date-input-control"
                onClick={() => triggerPicker(fromInputRef)}
              />
              <input
                ref={fromInputRef}
                type="date"
                value={formatToYYYYMMDD(fromDate)}
                onChange={(e) => onFromDateChange(e.target.value)}
                tabIndex={-1}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '1px',
                  height: '1px',
                  pointerEvents: 'none',
                  bottom: 0,
                  left: '10px'
                }}
              />
            </div>
          </div>

          <div className="date-filter-item">
            <label className="date-filter-label" onClick={() => triggerPicker(toInputRef)}>
              To Date
            </label>
            <div className="date-input-wrap" title="Click to open calendar picker">
              <Calendar
                size={13}
                className="date-input-icon"
                onClick={() => triggerPicker(toInputRef)}
              />
              <input
                type="text"
                value={formatToDDMMYYYYDash(toDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val.trim()) {
                    onToDateChange('');
                  } else if (isValidDate(val)) {
                    onToDateChange(formatToYYYYMMDD(val));
                  } else {
                    onToDateChange(val);
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (isValidDate(val)) {
                    onToDateChange(formatToYYYYMMDD(val));
                  }
                }}
                placeholder="DD-MM-YYYY"
                className="date-input-control"
                onClick={() => triggerPicker(toInputRef)}
              />
              <input
                ref={toInputRef}
                type="date"
                value={formatToYYYYMMDD(toDate)}
                onChange={(e) => onToDateChange(e.target.value)}
                tabIndex={-1}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '1px',
                  height: '1px',
                  pointerEvents: 'none',
                  bottom: 0,
                  left: '10px'
                }}
              />
            </div>
          </div>

          {hasActiveFilter && (
            <button
              onClick={onClearDates}
              className="clear-date-filter-btn"
              title="Clear date range filter"
            >
              <X size={13} />
              <span>Clear Dates</span>
            </button>
          )}
        </div>
      </div>

      {/* Right actions: Bulk Delete, Print, Extra */}
      <div className="filter-toolbar-right">
        {extraActions}

        {selectedCount > 0 && onBulkDelete && (
          <button
            onClick={onBulkDelete}
            className="bulk-delete-action-btn"
            title={`Delete ${selectedCount} selected items`}
          >
            <Trash2 size={14} />
            <span>
              {deleteLabel} ({selectedCount})
            </span>
          </button>
        )}

        {onPrint && (
          <button
            onClick={onPrint}
            className="print-action-btn"
            title="Print or Export Statement as PDF"
          >
            <Printer size={15} />
            <span>{printLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DateFilterBar;
