import { useState, useRef, useEffect } from 'react';
import './Dropdown.scss';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
}

export const Dropdown = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  multiple = false
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    } else {
      onChange([optionValue]);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      return options.find(opt => opt.value === value[0])?.label || placeholder;
    }
    return `${value.length} selected`;
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      {label && <label className="dropdown__label">{label}</label>}
      
      <div
        className={`dropdown__trigger ${isOpen ? 'dropdown__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="dropdown__display">{getDisplayText()}</span>
        <span className="dropdown__arrow">▼</span>
      </div>
      
      {isOpen && (
        <div className="dropdown__content">
          {options.map(option => (
            <label
              key={option.value}
              className={`dropdown__option ${
                value.includes(option.value) ? 'dropdown__option--selected' : ''
              }`}
            >
              {multiple && (
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => handleOptionClick(option.value)}
                />
              )}
              <span onClick={() => handleOptionClick(option.value)}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
