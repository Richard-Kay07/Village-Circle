import React from 'react';
import { getCopy, COPY_KEYS } from '@/lib/copy';
import { tokens } from '@/lib/design-system/tokens';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  message,
  onRetry,
}: ErrorStateProps) {
  const displayTitle = title ?? getCopy(COPY_KEYS.common_error_generic);
  const retryLabel = getCopy(COPY_KEYS.common_button_retry);
  return (
    <div
      style={{
        textAlign: 'center',
        padding: `${tokens.space[8]} ${tokens.space[6]}`,
        backgroundColor: tokens.color.errorMuted,
        borderRadius: tokens.radius.lg,
        border: `1px solid ${tokens.color.errorBorder}`,
      }}
    >
      <h2
        style={{
          fontSize: tokens.font.size.lg,
          fontWeight: tokens.font.weight.semibold,
          margin: `0 0 ${tokens.space[2]}`,
          color: tokens.color.error,
        }}
      >
        {displayTitle}
      </h2>
      <p
        style={{
          fontSize: tokens.font.size.base,
          color: tokens.color.errorText,
          margin: `0 0 ${tokens.space[4]}`,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: `${tokens.space[2]} ${tokens.space[4]}`,
            fontSize: tokens.font.size.base,
            fontWeight: tokens.font.weight.medium,
            color: tokens.color.error,
            backgroundColor: tokens.color.surface,
            border: `1px solid ${tokens.color.errorBorder}`,
            borderRadius: tokens.radius.md,
            cursor: 'pointer',
            minHeight: tokens.touchTargetMin,
          }}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
