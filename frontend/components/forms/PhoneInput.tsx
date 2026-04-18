'use client';

import React, { useCallback } from 'react';

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

/** Basic UK-friendly: allow digits, spaces, +, -. Format on blur to groups of digits. */
function formatUKPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 4) return digits.replace(/(\d{2})(\d{0,2})/, (_, a, b) => (b ? `${a} ${b}` : a));
  if (digits.length <= 7) return digits.replace(/(\d{4})(\d{0,3})/, (_, a, b) => (b ? `${a} ${b}` : a));
  return digits.replace(/(\d{4})(\d{3})(\d{0,4})/, (_, a, b, c) => (c ? `${a} ${b} ${c}` : b ? `${a} ${b}` : a));
}

const wrapStyle = { marginBottom: '1rem' };
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' };
const inputStyle = { width: '100%', padding: '0.5rem 0.75rem', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px' };
const errorStyle = { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' };

export function PhoneInput({ value, onChange, onBlur, placeholder = '07xxx xxxxxx', label, error, disabled, id, name }: PhoneInputProps) {
  const handleBlur = useCallback(() => {
    if (value) onChange?.(formatUKPhone(value));
    onBlur?.();
  }, [value, onChange, onBlur]);

  return (
    <div style={wrapStyle}>
      {label && <label htmlFor={id} style={labelStyle}>{label}</label>}
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
      />
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}
