'use client';

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export default function Select({ 
  label, 
  error, 
  options, 
  placeholder = 'Select an option',
  className = '',
  ...props 
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-0.5">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`
          w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm
          text-gray-900 bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        style={{
          color: props.value === '' ? '#9ca3af' : '#111827'
        }}
      >
        <option value="" disabled style={{ color: '#9ca3af' }}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ color: '#111827' }}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

