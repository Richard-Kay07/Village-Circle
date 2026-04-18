'use client';

import React, { useRef } from 'react';

export interface FilePickerProps {
  onSelect: (file: File) => void;
  accept?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

export function FilePicker({ onSelect, accept = 'image/*', label, error, disabled, id }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = '';
  };
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label htmlFor={id} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{label}</label>}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        style={{ width: '100%', minHeight: 44, fontSize: '0.875rem', padding: '0.25rem 0' }}
      />
      {error && <p id={id ? `${id}-error` : undefined} role="alert" style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
