import React, { useState, useRef, useEffect } from 'react';

const CustomSelector = ({ 
  label, 
  options, 
  value, 
  onChange, 
  name, 
  placeholder = "Select an option", 
  multiple = false,
  disabled = false,
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(multiple ? (Array.isArray(value) ? value : []) : value || '');
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedOptions(multiple ? (Array.isArray(value) ? value : []) : value || '');
  }, [value, multiple]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option) => {
    if (multiple) {
      let newSelected;
      if (selectedOptions.includes(option.value)) {
        newSelected = selectedOptions.filter(item => item !== option.value);
      } else {
        newSelected = [...selectedOptions, option.value];
      }
      setSelectedOptions(newSelected);
      
      // Create synthetic event
      const syntheticEvent = {
        target: {
          name,
          value: newSelected
        }
      };
      onChange(syntheticEvent);
    } else {
      setSelectedOptions(option.value);
      setIsOpen(false);
      
      // Create synthetic event
      const syntheticEvent = {
        target: {
          name,
          value: option.value
        }
      };
      onChange(syntheticEvent);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (selectedOptions.length === 0) return placeholder;
      
      const selectedLabels = options
        .filter(option => selectedOptions.includes(option.value))
        .map(option => option.label);
      
      return selectedLabels.length > 1 
        ? `${selectedLabels[0]} +${selectedLabels.length - 1} more` 
        : selectedLabels[0];
    } else {
      if (!selectedOptions) return placeholder;
      
      const selected = options.find(option => option.value === selectedOptions);
      return selected ? selected.label : placeholder;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div ref={dropdownRef} className="relative">
        <div
          className={`flex items-center justify-between w-full px-3 py-2 border ${
            disabled ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-900'
          } border-gray-300 rounded-md shadow-sm cursor-pointer ${
            isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
          onClick={toggleDropdown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          role="combobox"
        >
          <div className="flex-1 truncate">{getDisplayValue()}</div>
          <div className="ml-2 text-gray-400">
            <svg className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <ul role="listbox">
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={
                    multiple 
                      ? selectedOptions.includes(option.value) 
                      : selectedOptions === option.value
                  }
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                    multiple 
                      ? selectedOptions.includes(option.value) ? 'bg-blue-100' : ''
                      : selectedOptions === option.value ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="flex items-center">
                    {multiple && (
                      <div className="mr-2">
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(option.value)}
                          onChange={() => {}}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    )}
                    <span>{option.label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Hidden input for form submission compatibility */}
      <input 
        type="hidden" 
        name={name} 
        value={multiple ? JSON.stringify(selectedOptions) : selectedOptions} 
      />
    </div>
  );
};

export default CustomSelector;