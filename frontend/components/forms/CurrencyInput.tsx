'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { minorToDisplay, displayToMinor } from '@/lib/validation/currency';

export interface CurrencyInputProps {
  valueMinor?: number;
  onChangeMinor?: (minor: number) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  minMinor?: number;
  maxMinor?: number;
  id?: string;
}

/**
 * GBP currency input. Displays pounds, reports value in minor units (pence) for API.
 */
export function CurrencyInput({
  valueMinor = 0,
  onChangeMinor,
  onBlur,
  placeholder = '0.00',
  label,
  error,
  disabled,
  minMinor,
  maxMinor,
  id,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => (valueMinor !== undefined && valueMinor !== 0 ? minorToDisplay(valueMinor) : ''));
  const isControlled = onChangeMinor != null;
  useEffect(() => {
    if (valueMinor !== undefined && valueMinor === 0) setDisplay('');
    else if (valueMinor !== undefined) setDisplay(minorToDisplay(valueMinor));
  }, [valueMinor]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, '');
      const parts = raw.split('.');
      const formatted = parts.length > 1 ? parts[0] + '.' + parts[1].slice(0, 2) : parts[0];
      setDisplay(formatted);
      const minor = displayToMinor(formatted);
      onChangeMinor?.(minor);
    },
    [onChangeMinor]
  );

  const displayValue = isControlled ? minorToDisplay(valueMinor ?? 0) : display;

  const errorId = id ? `${id}-error` : undefined;
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label htmlFor={id} style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
          {label}
        </label>
      )}
      <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, border: '1px solid #d1d5db', borderRadius: '6px', padding: '0 0.75rem', backgroundColor: disabled ? '#f9fafb' : '#fff' }}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: '0.25rem' }}>£</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          min={minMinor != null ? minMinor / 100 : undefined}
          max={maxMinor != null ? maxMinor / 100 : undefined}
          aria-invalid={!!error}
          aria-describedby={errorId}
          style={{
            width: '100%',
            minWidth: '6rem',
            border: 'none',
            padding: '0.5rem 0',
            fontSize: '1rem',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
        />
      </span>
      {error && <p id={errorId} role="alert" style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
