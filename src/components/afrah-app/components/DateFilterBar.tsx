import React from 'react';
import { Calendar, Trash2, Printer, X, Filter } from 'lucide-react';

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

  return (
    <div className="table-filter-toolbar no-print">
      <div className="filter-toolbar-left">
        {/* Date Filter Inputs */}
        <div className="date-filter-group">
          <div className="date-filter-item">
            <label className="date-filter-label">From Date</label>
            <div className="date-input-wrap">
              <Calendar size={13} className="date-input-icon" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="date-input-control"
                placeholder="From Date"
              />
            </div>
          </div>

          <div className="date-filter-item">
            <label className="date-filter-label">To Date</label>
            <div className="date-input-wrap">
              <Calendar size={13} className="date-input-icon" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className="date-input-control"
                placeholder="To Date"
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
