import React, { useState, useEffect } from 'react';

/**
 * Basic Date Validation Helper
 * Validates formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
 * Checks year range (1900-2100), month range (1-12), and valid calendar days including leap years.
 */
export const isValidDate = (val: string): boolean => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;

  // Format 1: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
  }

  // Format 2: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
  }

  return false;
};

/**
 * Format any valid date string (YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY) into standard display "DD-MM-YYYY"
 */
export const formatToDDMMYYYY = (val: string): string => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';

  // Match YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  // Match DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${day}-${month}-${year}`;
  }

  return trimmed;
};

/**
 * Format any valid date string into standard ISO "YYYY-MM-DD" (for database / ISO comparisons)
 */
export const formatToYYYYMMDD = (val: string): string => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';

  // Match DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Match YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return trimmed;
};

/**
 * Get current date as DD-MM-YYYY string
 */
export const getTodayDDMMYYYY = (): string => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Normalize valid date strings into standard DD-MM-YYYY
 */
export const normalizeDate = (val: string): string => {
  return formatToDDMMYYYY(val);
};

export interface DateInputProps {
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  showErrorNotice?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  className = 'afrah-app-input',
  placeholder = 'DD-MM-YYYY',
  id,
  name,
  autoFocus = false,
  style,
  showErrorNotice = true
}) => {
  // Always display DD-MM-YYYY format in the input field
  const [text, setText] = useState(() => formatToDDMMYYYY(value || ''));
  const [touched, setTouched] = useState(false);

  // Synchronize when external value changes
  useEffect(() => {
    setText(formatToDDMMYYYY(value || ''));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Optional quick format: if user pastes or types 8 continuous digits DDMMYYYY
    if (/^\d{8}$/.test(val)) {
      val = `${val.slice(0, 2)}-${val.slice(2, 4)}-${val.slice(4, 8)}`;
    }

    setText(val);

    if (!val.trim()) {
      onChange('');
      return;
    }

    if (isValidDate(val)) {
      onChange(formatToYYYYMMDD(val));
    } else {
      onChange(val);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (!text.trim()) {
      if (required) {
        onChange('');
      }
      return;
    }

    if (isValidDate(text)) {
      const formatted = formatToDDMMYYYY(text);
      setText(formatted);
      onChange(formatToYYYYMMDD(text));
    }
  };

  const isInvalid = touched && text.trim().length > 0 && !isValidDate(text);
  const isRequiredMissing = touched && required && !text.trim();

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <input
        type="text"
        id={id}
        name={name}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
        className={className}
        title={isInvalid ? "Please enter a valid date in DD-MM-YYYY format" : undefined}
        style={{
          boxSizing: 'border-box',
          width: '100%',
          cursor: 'text',
          ...(isInvalid || isRequiredMissing ? { borderColor: '#ef4444' } : {}),
          ...style
        }}
      />
      {showErrorNotice && isInvalid && (
        <div
          style={{
            color: '#f87171',
            fontSize: '11px',
            marginTop: '4px',
            lineHeight: 1.2
          }}
        >
          * Enter a valid date in DD-MM-YYYY format (e.g. 25-12-2025)
        </div>
      )}
      {showErrorNotice && isRequiredMissing && (
        <div
          style={{
            color: '#f87171',
            fontSize: '11px',
            marginTop: '4px',
            lineHeight: 1.2
          }}
        >
          * Date is required
        </div>
      )}
    </div>
  );
};

export default DateInput;
