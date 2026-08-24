import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string; // Format: "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view year and month from value or today
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getFullYear()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    isNaN(initialDate.getMonth()) ? new Date().getMonth() : initialDate.getMonth()
  );

  // Update view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const m = viewMonth === 0 ? 12 : viewMonth;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({ day, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, isCurrentMonth: true, dateStr });
  }

  // Next month leading days (fill up to 35 or 42 cells)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const m = viewMonth === 11 ? 1 : viewMonth + 2;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, isCurrentMonth: false, dateStr });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleQuickSelect = (type: 'today' | 'yesterday') => {
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    const str = d.toISOString().split('T')[0];
    onChange(str);
    setIsOpen(false);
  };

  // Format date display nicely
  const formatDisplay = (val: string) => {
    if (!val) return '';
    try {
      const parts = val.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      // Fallback
    }
    return val;
  };

  return (
    <div className={`date-picker-wrapper ${className}`} ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input Trigger Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`date-picker-input ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'var(--surface-container, #1e2023)',
          border: isOpen ? '1px solid var(--primary, #e2c399)' : '1px solid var(--border-stroke, #232730)',
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: '38px',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 2px rgba(226, 195, 153, 0.2)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={15} color="var(--primary)" />
          <span style={{ fontSize: '13px', fontWeight: value ? 600 : 400, color: value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {value ? `${formatDisplay(value)} (${value})` : placeholder}
          </span>
        </div>
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%'
            }}
            title="Clear date"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div
          className="date-picker-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 9999,
            width: '280px',
            background: 'var(--surface-container-high, #222529)',
            border: '1px solid var(--border-stroke, #333842)',
            borderRadius: '12px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 20px rgba(226, 195, 153, 0.1)',
            padding: '14px',
            boxSizing: 'border-box',
            animation: 'popoverFadeIn 0.15s ease-out'
          }}
        >
          {/* Month & Year Navigation Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={prevMonth}
              className="btn-ghost-icon"
              style={{ width: '28px', height: '28px', borderRadius: '6px' }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="btn-ghost-icon"
              style={{ width: '28px', height: '28px', borderRadius: '6px' }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day of Week Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
            {WEEK_DAYS.map((wd) => (
              <span
                key={wd}
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((item, idx) => {
              const isSelected = item.dateStr === value;
              const isToday = item.dateStr === todayStr;

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectDay(item.dateStr)}
                  style={{
                    height: '30px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected
                      ? 'var(--primary, #e2c399)'
                      : isToday
                      ? 'rgba(226, 195, 153, 0.15)'
                      : 'transparent',
                    color: isSelected
                      ? '#000000'
                      : item.isCurrentMonth
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)',
                    opacity: !item.isCurrentMonth ? 0.4 : 1,
                    fontWeight: isSelected || isToday ? 700 : 500,
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: isToday && !isSelected ? '1px solid var(--primary)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(226, 195, 153, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isToday ? 'rgba(226, 195, 153, 0.15)' : 'transparent';
                    }
                  }}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-stroke, #333842)'
            }}
          >
            <button
              type="button"
              onClick={() => handleQuickSelect('today')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('yesterday')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              Yesterday
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
