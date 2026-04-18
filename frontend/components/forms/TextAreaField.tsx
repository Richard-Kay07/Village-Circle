'use client';

import React from 'react';

export interface TextAreaFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  id?: string;
  name?: string;
}

export function TextAreaField(props: TextAreaFieldProps) {
  const { value, onChange, onBlur, placeholder, label, error, disabled, rows = 3, maxLength, id, name } = props;
  const errorId = id ? `${id}-error` : undefined;
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label htmlFor={id} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{label}</label>}
      <textarea
        id={id}
        name={name}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={errorId}
        style={{ width: '100%', minHeight: 44, padding: '0.5rem 0.75rem', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
      />
      {error && <p id={errorId} role="alert" style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
