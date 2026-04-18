import React from 'react';

export interface LoadingSkeletonProps {
  lines?: number;
  variant?: 'text' | 'card' | 'list';
  className?: string;
}

const lineStyle: React.CSSProperties = { height: '1rem', borderRadius: '4px', backgroundColor: '#e5e7eb' };
const listItemStyle: React.CSSProperties = { height: '3rem', borderRadius: '6px', backgroundColor: '#e5e7eb' };

export function LoadingSkeleton({ lines = 3, variant = 'text', className }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={`loading-skeleton loading-skeleton--card ${className ?? ''}`} style={{ padding: '1.25rem', borderRadius: '8px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
        <div style={{ ...lineStyle, marginBottom: '0.75rem' }} />
        <div style={{ ...lineStyle, width: '60%', marginBottom: '0.75rem' }} />
        <div style={{ ...lineStyle, width: '40%' }} />
      </div>
    );
  }
  if (variant === 'list') {
    return (
      <div className={`loading-skeleton loading-skeleton--list ${className ?? ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: lines }).map((_, i) => <div key={i} style={listItemStyle} />)}
      </div>
    );
  }
  return (
    <div className={`loading-skeleton loading-skeleton--text ${className ?? ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ ...lineStyle, width: i === lines - 1 && lines > 1 ? '70%' : '100%' }} />
      ))}
    </div>
  );
}
