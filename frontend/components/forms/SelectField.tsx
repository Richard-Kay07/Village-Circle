'use client';

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

const wrapStyle = { marginBottom: '1rem' };
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' };
const inputStyle = { width: '100%', minHeight: 44, padding: '0.5rem 0.75rem', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px' };
const errorStyle = { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' };

export function SelectField({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  label,
  error,
  disabled,
  id,
  name,
}: SelectFieldProps) {
  return (
    <div style={wrapStyle}>
      {label && <label htmlFor={id} style={labelStyle}>{label}</label>}
      <select
        id={id}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? (id ? `${id}-error` : undefined) : undefined}
        style={inputStyle}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p id={id ? `${id}-error` : undefined} role="alert" style={errorStyle}>{error}</p>}
    </div>
  );
}
