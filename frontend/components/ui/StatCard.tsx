import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'muted';
}

const cardStyle: React.CSSProperties = {
  padding: '1rem 1.25rem', borderRadius: '8px', backgroundColor: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
};
const mutedStyle: React.CSSProperties = { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.25rem' };
const valueStyle: React.CSSProperties = { display: 'block', fontSize: '1.25rem', fontWeight: 600, color: '#111' };
const subtitleStyle: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.25rem' };

export function StatCard({ label, value, subtitle, variant = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant}`} style={{ ...cardStyle, ...(variant === 'muted' ? mutedStyle : {}) }}>
      <span className="stat-card__label" style={labelStyle}>{label}</span>
      <span className="stat-card__value" style={valueStyle}>{value}</span>
      {subtitle && <span className="stat-card__subtitle" style={subtitleStyle}>{subtitle}</span>}
    </div>
  );
}
