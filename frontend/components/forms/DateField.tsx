'use client';

import React from 'react';

export interface DateFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  id?: string;
  name?: string;
}

export function DateField(props: DateFieldProps) {
  const { value, onChange, onBlur, label, error, disabled, min, max, id, name } = props;
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label htmlFor={id} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{label}</label>}
      <input
        id={id}
        name={name}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        min={min}
        max={max}
        style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
      />
      {error && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
