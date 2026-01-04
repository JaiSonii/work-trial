'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-0.5">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm
          text-gray-900 placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

