import React, { useState, useRef, useEffect } from 'react';
import { PREDEFINED_EXPENSES } from '../types';
import { Search, ChevronDown, Check } from 'lucide-react';

interface SearchableExpenseSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
}

export const SearchableExpenseSelect: React.FC<SearchableExpenseSelectProps> = ({
  value,
  onChange,
  options = PREDEFINED_EXPENSES,
  placeholder = 'Search or select...',
  searchPlaceholder = 'Type to filter...',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter items based on search query
  const filtered = options.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase().trim())
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: string) => {
    onChange(item);
    setQuery('');
    setIsOpen(false);
  };

  const handleCustomInput = (customVal: string) => {
    setQuery(customVal);
    onChange(customVal);
  };

  return (
    <div className="searchable-select-wrapper" ref={wrapperRef}>
      <div
        className={`searchable-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'select-value-text' : 'select-placeholder'}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`select-arrow ${isOpen ? 'rotated' : ''}`} />
      </div>

      {isOpen && (
        <div className="searchable-select-dropdown">
          <div className="searchable-select-search-box">
            <Search size={13} className="search-icon" />
            <input
              type="text"
              autoFocus
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => handleCustomInput(e.target.value)}
              className="searchable-select-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="searchable-select-list">
            {filtered.length === 0 ? (
              <div
                className="searchable-select-custom-item"
                onClick={() => handleSelect(query.trim())}
              >
                Use custom: <strong>"{query}"</strong>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = value.toLowerCase() === item.toLowerCase();
                return (
                  <div
                    key={item}
                    className={`searchable-select-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(item)}
                  >
                    <span>{item}</span>
                    {isSelected && <Check size={13} color="var(--primary)" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
