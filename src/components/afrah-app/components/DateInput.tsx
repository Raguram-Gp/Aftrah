import React, { useState, useEffect, useRef, useId } from 'react';

/**
 * Result structure from parsing and normalizing date input strings
 */
export interface ParsedDateResult {
  isValid: boolean;
  displayStr: string; // Formatted "DD/MM/YYYY" or normalized/partial representation
  isoStr: string;     // ISO "YYYY-MM-DD" or empty string if invalid
  error?: 'format' | 'min' | 'max';
}

/**
 * Validates whether a given year, month, and day constitute a real calendar date,
 * correctly handling 30-day months and leap years (1900-2100).
 */
export const isValidCalendarDate = (year: number, month: number, day: number): boolean => {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
};

/**
 * Check if a date string falls within minDate and maxDate bounds.
 */
const checkBounds = (
  displayStr: string,
  isoStr: string,
  minDate?: string,
  maxDate?: string
): ParsedDateResult => {
  if (minDate) {
    const minIso = formatToYYYYMMDD(minDate);
    if (minIso && isoStr < minIso) {
      return { isValid: false, displayStr, isoStr, error: 'min' };
    }
  }
  if (maxDate) {
    const maxIso = formatToYYYYMMDD(maxDate);
    if (maxIso && isoStr > maxIso) {
      return { isValid: false, displayStr, isoStr, error: 'max' };
    }
  }
  return { isValid: true, displayStr, isoStr };
};

const validateAndBuildResult = (
  dayStr: string,
  monthStr: string,
  yearStr: string,
  minDate?: string,
  maxDate?: string
): ParsedDateResult => {
  const d = parseInt(dayStr, 10);
  const m = parseInt(monthStr, 10);
  const y = parseInt(yearStr, 10);

  const displayStr = `${dayStr}/${monthStr}/${yearStr}`;

  if (!isValidCalendarDate(y, m, d)) {
    return { isValid: false, displayStr, isoStr: '', error: 'format' };
  }

  const isoStr = `${yearStr}-${monthStr}-${dayStr}`;
  return checkBounds(displayStr, isoStr, minDate, maxDate);
};

/**
 * Parses and normalizes any user date string into standard DD/MM/YYYY and YYYY-MM-DD.
 * Supports:
 * - "today" / "t" shorthand
 * - 6-digit shorthand: "110926" -> "11/09/2026"
 * - 8-digit shorthand: "11092026" -> "11/09/2026"
 * - Delimited DMY: "11/09/2026", "11-09-2026", "11.09.2026", "11/9/26"
 * - Delimited ISO YMD: "2026-09-11", "2026/09/11", "2026.09.11"
 * - Bounds verification against optional minDate and maxDate
 */
export const parseAndNormalizeDate = (
  val: string,
  minDate?: string,
  maxDate?: string
): ParsedDateResult => {
  if (!val || typeof val !== 'string') {
    return { isValid: false, displayStr: '', isoStr: '' };
  }
  const trimmed = val.trim();
  if (!trimmed) {
    return { isValid: false, displayStr: '', isoStr: '' };
  }

  // 1. Shorthand: "t" or "today"
  if (/^t(oday)?$/i.test(trimmed)) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());
    const displayStr = `${day}/${month}/${year}`;
    const isoStr = `${year}-${month}-${day}`;
    return checkBounds(displayStr, isoStr, minDate, maxDate);
  }

  // 2. 6-digit pure number: DDMMYY (e.g. 110926 -> 11/09/2026)
  const match6 = trimmed.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (match6) {
    const day = match6[1];
    const month = match6[2];
    const yy = parseInt(match6[3], 10);
    const year = String(yy < 50 ? 2000 + yy : 1900 + yy);
    return validateAndBuildResult(day, month, year, minDate, maxDate);
  }

  // 3. 8-digit pure number: DDMMYYYY (e.g. 11092026 -> 11/09/2026)
  const match8 = trimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (match8) {
    const day = match8[1];
    const month = match8[2];
    const year = match8[3];
    return validateAndBuildResult(day, month, year, minDate, maxDate);
  }

  // 4. Delimited DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (supports 1 or 2 digit day/month, 2 or 4 digit year)
  const matchDmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
  if (matchDmy) {
    const day = matchDmy[1].padStart(2, '0');
    const month = matchDmy[2].padStart(2, '0');
    let year = matchDmy[3];
    if (year.length === 2) {
      const yy = parseInt(year, 10);
      year = String(yy < 50 ? 2000 + yy : 1900 + yy);
    }
    return validateAndBuildResult(day, month, year, minDate, maxDate);
  }

  // 5. Delimited ISO YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const matchYmd = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (matchYmd) {
    const year = matchYmd[1];
    const month = matchYmd[2].padStart(2, '0');
    const day = matchYmd[3].padStart(2, '0');
    return validateAndBuildResult(day, month, year, minDate, maxDate);
  }

  return { isValid: false, displayStr: trimmed, isoStr: '', error: 'format' };
};

/**
 * Basic Date Validation Helper
 * Validates calendar validity and optional minDate/maxDate range.
 */
export const isValidDate = (val: string, minDate?: string, maxDate?: string): boolean => {
  if (!val || typeof val !== 'string') return false;
  const res = parseAndNormalizeDate(val, minDate, maxDate);
  return res.isValid;
};

/**
 * Format any valid date string into standard display "DD/MM/YYYY"
 */
export const formatToDDMMYYYY = (val: string): string => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  const res = parseAndNormalizeDate(trimmed);
  if (res.displayStr) {
    return res.displayStr;
  }
  return trimmed;
};

/**
 * Format any valid date string into standard display "DD-MM-YYYY" (retained for filter inputs)
 */
export const formatToDDMMYYYYDash = (val: string): string => {
  const dmy = formatToDDMMYYYY(val);
  return dmy.replace(/\//g, '-');
};

/**
 * Format any valid date string into standard ISO "YYYY-MM-DD" (for database / ISO comparisons)
 */
export const formatToYYYYMMDD = (val: string): string => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  const res = parseAndNormalizeDate(trimmed);
  if (res.isoStr) {
    return res.isoStr;
  }
  return trimmed;
};

/**
 * Get current date as DD/MM/YYYY string
 */
export const getTodayDDMMYYYY = (): string => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Normalize valid date strings into standard DD/MM/YYYY
 */
export const normalizeDate = (val: string): string => {
  return formatToDDMMYYYY(val);
};

/**
 * Auto-formats numeric typing into DD/MM/YYYY format:
 * - Does NOT prematurely prepend zeros (e.g. typing '4' leaves '4', not '04/').
 * - Does NOT clamp invalid numbers while typing (e.g. month '13' remains '13/', marked invalid on blur/validation).
 * - Only inserts slashes when 2 digits (day) or 4 digits (day + month) have been fully typed.
 * - Preserves shorthand prefix during typing (e.g. 't' or 'today').
 */
export const autoFormatDateInput = (val: string): string => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';

  // Preserve shorthand prefix while typing ("t", "to", "tod", "toda", "today")
  if (/^(t|to|tod|toda|today)$/i.test(trimmed)) {
    return trimmed;
  }

  // If already standard ISO YYYY-MM-DD, convert directly
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(trimmed)) {
    return formatToDDMMYYYY(trimmed);
  }

  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (!digits) return '';

  // 1 digit typed: D (no slash, no prepended zero)
  if (digits.length === 1) {
    return digits;
  }

  // 2 digits typed: DD/ (insert slash once day digits are typed)
  if (digits.length === 2) {
    return `${digits}/`;
  }

  // 3 digits typed: DD/M (no second slash, no prepended zero to month)
  if (digits.length === 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  // 4 digits typed: DD/MM/ (insert slash once month digits are typed)
  if (digits.length === 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/`;
  }

  // 5 to 8 digits typed: DD/MM/YYYY (up to 4 digits for year)
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
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
  minDate?: string;
  maxDate?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  className = 'afrah-app-input',
  placeholder,
  id,
  name,
  autoFocus = false,
  style,
  showErrorNotice = true,
  minDate,
  maxDate,
  onBlur,
  onFocus,
  onKeyDown
}) => {
  // Extract initial DD, MM, YYYY parts from incoming value
  const parsePartsFromValue = (val: string) => {
    if (!val || typeof val !== 'string') return { d: '', m: '', y: '' };
    const trimmed = val.trim();
    if (!trimmed) return { d: '', m: '', y: '' };

    // Match ISO YYYY-MM-DD or YYYY/MM/DD
    const matchIso = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (matchIso) {
      return {
        y: matchIso[1],
        m: matchIso[2].padStart(2, '0'),
        d: matchIso[3].padStart(2, '0')
      };
    }

    // Match DMY DD/MM/YYYY or DD-MM-YYYY
    const matchDmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (matchDmy) {
      let y = matchDmy[3];
      if (y.length === 2) {
        const yy = parseInt(y, 10);
        y = String(yy < 50 ? 2000 + yy : 1900 + yy);
      }
      return {
        d: matchDmy[1].padStart(2, '0'),
        m: matchDmy[2].padStart(2, '0'),
        y
      };
    }

    // Match 8-digit pure number DDMMYYYY
    const match8 = trimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (match8) {
      return {
        d: match8[1],
        m: match8[2],
        y: match8[3]
      };
    }

    return { d: '', m: '', y: '' };
  };

  const initialParts = parsePartsFromValue(value);
  const [day, setDay] = useState(initialParts.d);
  const [month, setMonth] = useState(initialParts.m);
  const [year, setYear] = useState(initialParts.y);
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const lastEmittedValueRef = useRef<string>(value || '');
  const generatedId = useId();

  // Synchronize when external value changes
  useEffect(() => {
    if (value === lastEmittedValueRef.current) {
      return;
    }
    lastEmittedValueRef.current = value || '';
    const parts = parsePartsFromValue(value);
    setDay(parts.d);
    setMonth(parts.m);
    setYear(parts.y);
  }, [value]);

  const emitDateChange = (d: string, m: string, y: string) => {
    if (!d && !m && !y) {
      lastEmittedValueRef.current = '';
      onChange('');
      return;
    }

    const paddedD = d ? d.padStart(2, '0') : '';
    const paddedM = m ? m.padStart(2, '0') : '';
    const formattedDmy = `${paddedD}/${paddedM}/${y}`;

    // Full 4-digit year, day, and month entered
    if (d.length >= 1 && m.length >= 1 && y.length === 4) {
      const dNum = parseInt(d, 10);
      const mNum = parseInt(m, 10);
      const yNum = parseInt(y, 10);
      if (isValidCalendarDate(yNum, mNum, dNum)) {
        const iso = `${y}-${paddedM}-${paddedD}`;
        if (minDate) {
          const minIso = formatToYYYYMMDD(minDate);
          if (minIso && iso < minIso) {
            lastEmittedValueRef.current = formattedDmy;
            onChange(formattedDmy);
            return;
          }
        }
        if (maxDate) {
          const maxIso = formatToYYYYMMDD(maxDate);
          if (maxIso && iso > maxIso) {
            lastEmittedValueRef.current = formattedDmy;
            onChange(formattedDmy);
            return;
          }
        }
        lastEmittedValueRef.current = iso;
        onChange(iso);
        return;
      }
    }

    // Incomplete or invalid: emit readable string for form awareness
    const partial = `${d}${m ? '/' + m : ''}${y ? '/' + y : ''}`;
    lastEmittedValueRef.current = partial;
    onChange(partial);
  };

  const fillToday = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = String(now.getFullYear());
    setDay(d);
    setMonth(m);
    setYear(y);
    emitDateChange(d, m, y);
    yearRef.current?.focus();
    yearRef.current?.select();
  };

  const commitFinal = () => {
    setTouched(true);
    let finalDay = day.trim();
    let finalMonth = month.trim();
    let finalYear = year.trim();

    if (!finalDay && !finalMonth && !finalYear) {
      setDay('');
      setMonth('');
      setYear('');
      lastEmittedValueRef.current = '';
      onChange('');
      return;
    }

    if (finalDay.length === 1) finalDay = finalDay.padStart(2, '0');
    if (finalMonth.length === 1) finalMonth = finalMonth.padStart(2, '0');
    if (finalYear.length === 2) {
      const yy = parseInt(finalYear, 10);
      finalYear = String(yy < 50 ? 2000 + yy : 1900 + yy);
    }

    setDay(finalDay);
    setMonth(finalMonth);
    setYear(finalYear);
    emitDateChange(finalDay, finalMonth, finalYear);
  };

  // Day segment handlers
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/^t(oday)?$/i.test(raw.trim())) {
      fillToday();
      return;
    }
    const clean = raw.replace(/\D/g, '');
    if (clean.length > 2) {
      if (clean.length >= 8) {
        const d = clean.slice(0, 2);
        const m = clean.slice(2, 4);
        const y = clean.slice(4, 8);
        setDay(d);
        setMonth(m);
        setYear(y);
        emitDateChange(d, m, y);
        yearRef.current?.focus();
        yearRef.current?.select();
        return;
      } else if (clean.length === 6) {
        const d = clean.slice(0, 2);
        const m = clean.slice(2, 4);
        const yy = parseInt(clean.slice(4, 6), 10);
        const y = String(yy < 50 ? 2000 + yy : 1900 + yy);
        setDay(d);
        setMonth(m);
        setYear(y);
        emitDateChange(d, m, y);
        yearRef.current?.focus();
        yearRef.current?.select();
        return;
      }
    }
    const newDay = clean.slice(0, 2);
    setDay(newDay);
    emitDateChange(newDay, month, year);

    // Carry over to Month item once 2 digits are entered
    if (newDay.length === 2) {
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  };

  const handleDayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '/') {
      e.preventDefault();
      if (day) {
        const padded = day.padStart(2, '0');
        setDay(padded);
        emitDateChange(padded, month, year);
      }
      monthRef.current?.focus();
      monthRef.current?.select();
      return;
    }
    if (e.key === 'ArrowRight' && (e.currentTarget.selectionStart === day.length || !day)) {
      monthRef.current?.focus();
      return;
    }
    if (e.key === 'Enter') {
      commitFinal();
    }
    onKeyDown?.(e);
  };

  // Month segment handlers
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/^t(oday)?$/i.test(raw.trim())) {
      fillToday();
      return;
    }
    const clean = raw.replace(/\D/g, '');
    if (clean.length > 2) {
      const m = clean.slice(0, 2);
      const y = clean.slice(2, 6);
      setMonth(m);
      setYear(y);
      emitDateChange(day, m, y);
      yearRef.current?.focus();
      yearRef.current?.select();
      return;
    }
    const newMonth = clean.slice(0, 2);
    setMonth(newMonth);
    emitDateChange(day, newMonth, year);

    // Carry over to Year item once 2 digits are entered
    if (newMonth.length === 2) {
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  };

  const handleMonthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '/') {
      e.preventDefault();
      if (month) {
        const padded = month.padStart(2, '0');
        setMonth(padded);
        emitDateChange(day, padded, year);
      }
      yearRef.current?.focus();
      yearRef.current?.select();
      return;
    }
    // Backspace when empty carries back to Day
    if (e.key === 'Backspace' && (e.currentTarget.selectionStart === 0 || !month)) {
      e.preventDefault();
      dayRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      dayRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowRight' && (e.currentTarget.selectionStart === month.length || !month)) {
      yearRef.current?.focus();
      return;
    }
    if (e.key === 'Enter') {
      commitFinal();
    }
    onKeyDown?.(e);
  };

  // Year segment handlers
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/^t(oday)?$/i.test(raw.trim())) {
      fillToday();
      return;
    }
    const clean = raw.replace(/\D/g, '').slice(0, 4);
    setYear(clean);
    emitDateChange(day, month, clean);
  };

  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace when empty carries back to Month
    if (e.key === 'Backspace' && (e.currentTarget.selectionStart === 0 || !year)) {
      e.preventDefault();
      monthRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      monthRef.current?.focus();
      return;
    }
    if (e.key === 'Enter') {
      commitFinal();
    }
    onKeyDown?.(e);
  };

  // Pasting handling anywhere within the component
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!pasted) return;

    if (/^t(oday)?$/i.test(pasted)) {
      fillToday();
      return;
    }

    const parsed = parseAndNormalizeDate(pasted, minDate, maxDate);
    if (parsed.displayStr && parsed.displayStr.includes('/')) {
      const parts = parsed.displayStr.split('/');
      if (parts.length === 3) {
        setDay(parts[0]);
        setMonth(parts[1]);
        setYear(parts[2]);
        emitDateChange(parts[0], parts[1], parts[2]);
        yearRef.current?.focus();
        yearRef.current?.select();
        return;
      }
    }

    const clean = pasted.replace(/\D/g, '');
    if (clean.length >= 8) {
      const d = clean.slice(0, 2);
      const m = clean.slice(2, 4);
      const y = clean.slice(4, 8);
      setDay(d);
      setMonth(m);
      setYear(y);
      emitDateChange(d, m, y);
      yearRef.current?.focus();
      yearRef.current?.select();
    } else if (clean.length === 6) {
      const d = clean.slice(0, 2);
      const m = clean.slice(2, 4);
      const yy = parseInt(clean.slice(4, 6), 10);
      const y = String(yy < 50 ? 2000 + yy : 1900 + yy);
      setDay(d);
      setMonth(m);
      setYear(y);
      emitDateChange(d, m, y);
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  };

  const handleContainerBlur = (e: React.FocusEvent) => {
    // If moving between segments inside this component, don't trigger blur
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsFocused(false);
    commitFinal();
    onBlur?.(e as unknown as React.FocusEvent<HTMLInputElement>);
  };

  const handleContainerFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'SPAN') {
      if (!day) {
        dayRef.current?.focus();
      } else if (!month) {
        monthRef.current?.focus();
      } else if (!year) {
        yearRef.current?.focus();
      } else {
        yearRef.current?.focus();
      }
    }
  };

  const isComplete = day.length > 0 && month.length > 0 && year.length === 4;
  const hasAnyInput = day.length > 0 || month.length > 0 || year.length > 0;
  const isRequiredMissing = touched && required && !hasAnyInput;

  let isInvalid = false;
  let errorMessage = '';

  if (isRequiredMissing) {
    errorMessage = '* Date is required';
  } else if (touched && hasAnyInput) {
    if (!isComplete) {
      isInvalid = true;
      errorMessage = '* Enter a valid date in DD/MM/YYYY format (e.g. 25/12/2025)';
    } else {
      const dNum = parseInt(day, 10);
      const mNum = parseInt(month, 10);
      const yNum = parseInt(year, 10);
      if (!isValidCalendarDate(yNum, mNum, dNum)) {
        isInvalid = true;
        errorMessage = '* Enter a valid date in DD/MM/YYYY format (e.g. 25/12/2025)';
      } else {
        const iso = `${year.padStart(4, '2000')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        if (minDate) {
          const minIso = formatToYYYYMMDD(minDate);
          if (minIso && iso < minIso) {
            isInvalid = true;
            errorMessage = `* Date must be on or after ${formatToDDMMYYYY(minDate)}`;
          }
        }
        if (maxDate) {
          const maxIso = formatToYYYYMMDD(maxDate);
          if (maxIso && iso > maxIso) {
            isInvalid = true;
            errorMessage = `* Date must be on or before ${formatToDDMMYYYY(maxDate)}`;
          }
        }
      }
    }
  }

  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hasError = (isInvalid || isRequiredMissing) && showErrorNotice;

  const dayPlaceholder = placeholder ? 'DD' : '__';
  const monthPlaceholder = placeholder ? 'MM' : '__';
  const yearPlaceholder = placeholder ? 'YYYY' : '____';

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onBlur={handleContainerBlur}
        onPaste={handlePaste}
        className={`${className} afrah-date-segmented-input ${isFocused ? 'is-focused' : ''} ${isInvalid || isRequiredMissing ? 'is-invalid' : ''}`}
        role="group"
        aria-label="Date Input"
        aria-invalid={touched && (isInvalid || isRequiredMissing) ? true : undefined}
        aria-describedby={hasError ? errorId : undefined}
        title={isInvalid ? (errorMessage.replace(/^\*\s*/, '') || 'Please enter a valid date in DD/MM/YYYY format') : undefined}
        style={{
          boxSizing: 'border-box',
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'text',
          ...(touched && (isInvalid || isRequiredMissing) ? { borderColor: '#ef4444' } : {}),
          ...style
        }}
      >
        {/* Day Segment */}
        <input
          ref={dayRef}
          type="text"
          inputMode="numeric"
          id={inputId}
          placeholder={dayPlaceholder}
          maxLength={2}
          value={day}
          onChange={handleDayChange}
          onKeyDown={handleDayKeyDown}
          onFocus={handleContainerFocus}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          className="afrah-date-segment"
          aria-label="Day"
          aria-required={required ? true : undefined}
          style={{ width: '24px' }}
        />

        {/* Fixed First Slash */}
        <span className="afrah-date-separator" aria-hidden="true">
          /
        </span>

        {/* Month Segment */}
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          placeholder={monthPlaceholder}
          maxLength={2}
          value={month}
          onChange={handleMonthChange}
          onKeyDown={handleMonthKeyDown}
          onFocus={handleContainerFocus}
          disabled={disabled}
          autoComplete="off"
          className="afrah-date-segment"
          aria-label="Month"
          style={{ width: '24px' }}
        />

        {/* Fixed Second Slash */}
        <span className="afrah-date-separator" aria-hidden="true">
          /
        </span>

        {/* Year Segment */}
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          placeholder={yearPlaceholder}
          maxLength={4}
          value={year}
          onChange={handleYearChange}
          onKeyDown={handleYearKeyDown}
          onFocus={handleContainerFocus}
          disabled={disabled}
          autoComplete="off"
          className="afrah-date-segment"
          aria-label="Year"
          style={{ width: '42px' }}
        />

        {/* Optional Hidden input to capture the full serialized date for native forms */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={isComplete ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : ''}
          />
        )}
      </div>

      {hasError && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          style={{
            color: '#f87171',
            fontSize: '11px',
            marginTop: '4px',
            lineHeight: 1.2
          }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default DateInput;


