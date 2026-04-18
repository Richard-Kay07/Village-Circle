'use client';

import React from 'react';
import { FilePicker } from './FilePicker';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export interface ImagePickerProps {
  onSelect: (file: File) => void;
  onError?: (message: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  maxSizeBytes?: number;
}

export function ImagePicker({
  onSelect,
  onError,
  label = 'Choose image',
  error,
  disabled,
  id,
  maxSizeBytes = 10 * 1024 * 1024,
}: ImagePickerProps) {
  const handleSelect = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError?.('Please choose a JPEG, PNG, GIF or WebP image.');
      return;
    }
    if (file.size > maxSizeBytes) {
      onError?.('Image is too large. Maximum size is ' + Math.round(maxSizeBytes / 1024 / 1024) + ' MB.');
      return;
    }
    onError?.('');
    onSelect(file);
  };
  return (
    <FilePicker
      id={id}
      accept={ALLOWED_IMAGE_TYPES.join(',')}
      onSelect={handleSelect}
      label={label}
      error={error}
      disabled={disabled}
    />
  );
}
