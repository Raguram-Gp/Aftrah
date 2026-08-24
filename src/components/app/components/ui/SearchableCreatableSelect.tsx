import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Plus, Check, X } from 'lucide-react';

export type SelectOption = string | { label: string; value: string };

interface SearchableCreatableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  allowCreate?: boolean;
  className?: string;
  prefixLabel?: string;
  triggerStyle?: React.CSSProperties;
}

export const SearchableCreatableSelect: React.FC<SearchableCreatableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search or create new...',
  allowCreate = true,
  className = '',
  prefixLabel,
  triggerStyle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize options to { label, value }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  // Selected label
  const selectedLabel = useMemo(() => {
    const found = normalizedOptions.find((opt) => opt.value === value);
    return found ? found.label : value;
  }, [normalizedOptions, value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  // Check if search query matches an existing option
  const exactMatchExists = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.some(
      (opt) => opt.label.toLowerCase() === q || opt.value.toLowerCase() === q
    );
  }, [normalizedOptions, searchQuery]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreate = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={containerRef} className={`searchable-select-container ${className}`} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="form-input searchable-select-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          paddingRight: '12px',
          height: '38px',
          gap: '8px',
          ...triggerStyle
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate" style={{ color: value ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: value ? 500 : 400, flex: 1 }}>
          {prefixLabel && <span style={{ color: 'var(--text-secondary)', marginRight: '4px' }}>{prefixLabel}:</span>}
          {selectedLabel || placeholder}
        </span>
        <ChevronDown 
          size={15} 
          style={{ 
            color: 'var(--primary)', 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }} 
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div 
          className="searchable-select-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 1100,
            background: 'var(--surface-container, #1e2023)',
            border: '1px solid var(--border-stroke, #232730)',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            minWidth: '180px',
            animation: 'dropdownFade 0.15s ease-out'
          }}
        >
          {/* Search Box Header */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-stroke, #232730)', position: 'relative' }}>
            <Search 
              size={14} 
              style={{ 
                position: 'absolute', 
                left: '18px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-secondary)' 
              }} 
            />
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!exactMatchExists && searchQuery.trim() && allowCreate) {
                    handleCreate();
                  } else if (filteredOptions.length > 0) {
                    handleSelect(filteredOptions[0].value);
                  }
                } else if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
              className="form-input"
              style={{
                height: '34px',
                paddingLeft: '32px',
                paddingRight: searchQuery ? '28px' : '10px',
                fontSize: '12px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-ghost-icon"
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '4px' }}>
            {filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className="searchable-option-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isSelected ? 'rgba(226, 195, 153, 0.12)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: '12.5px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} color="var(--primary)" />}
                </button>
              );
            })}

            {filteredOptions.length === 0 && !searchQuery && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                No options available
              </div>
            )}

            {filteredOptions.length === 0 && searchQuery && !allowCreate && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                No matching results
              </div>
            )}
          </div>

          {/* Option to Create New if no exact match and allowCreate is true */}
          {allowCreate && searchQuery.trim() && !exactMatchExists && (
            <div style={{ padding: '4px 6px 6px', borderTop: '1px solid var(--border-stroke, #232730)' }}>
              <button
                type="button"
                onClick={handleCreate}
                className="btn-create-option"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px dashed var(--primary)',
                  background: 'rgba(226, 195, 153, 0.08)',
                  color: 'var(--primary)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>
                  Create &quot;<strong style={{ textDecoration: 'underline' }}>{searchQuery.trim()}</strong>&quot;
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
