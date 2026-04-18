/**
 * VillageCircle360 design token primitives.
 * @see docs/TOKENS.md
 */

export const primitives = {
  color: {
    gray: {
      0: '#ffffff', 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
      400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827',
    },
    blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af' },
    green: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534' },
    amber: { 50: '#fffbeb', 100: '#fef3c7', 600: '#d97706', 700: '#b45309', 800: '#92400e' },
    red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b' },
    teal: { 50: '#f0fdfa', 100: '#ccfbf1', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
    violet: { 50: '#f5f3ff', 100: '#ede9fe', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
    orange: { 500: '#f97316', 600: '#ea580c' },
    sky: { 600: '#0284c7', 700: '#0369a1' },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem', sm: '0.8125rem', base: '0.875rem', md: '1rem',
      lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem',
    },
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.625 },
    letterSpacing: { tight: '-0.01em', normal: '0', wide: '0.05em' },
  },
  spacing: {
    0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem',
    6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem',
  },
  radius: { sm: '4px', md: '6px', lg: '8px', xl: '12px', full: '9999px' },
  shadow: {
    xs: '0 1px 2px rgba(0,0,0,0.04)', sm: '0 1px 3px rgba(0,0,0,0.06)',
    md: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
    lg: '0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.08)',
    focus: '0 0 0 3px rgba(37, 99, 235, 0.35)',
  },
  borderWidth: { 0: '0', 1: '1px', 2: '2px' },
  zIndex: { base: 0, dropdown: 100, sticky: 200, overlay: 300, modal: 400, popover: 500, toast: 600 },
  motion: {
    duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
    easing: { default: 'ease', inOut: 'ease-in-out', out: 'ease-out' },
  },
  touchTargetMin: '44px',
  breakpoint: { narrow: 360, mobile: 430, tablet: 768, desktop: 1024 },
} as const;

export type Primitives = typeof primitives;
