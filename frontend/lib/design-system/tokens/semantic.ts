/**
 * Semantic design tokens – map primitives to UI roles.
 * @see docs/TOKENS.md
 */

import { primitives } from './primitives';

const p = primitives;

export const semantic = {
  surface: {
    default: p.color.gray[0],
    muted: p.color.gray[50],
    subtle: p.color.gray[100],
  },
  background: { default: '#f5f5f5', page: p.color.gray[50] },
  text: {
    primary: p.color.gray[900],
    secondary: p.color.gray[600],
    muted: p.color.gray[500],
    disabled: p.color.gray[400],
    inverse: p.color.gray[0],
  },
  border: {
    default: p.color.gray[200],
    strong: p.color.gray[300],
    subtle: p.color.gray[100],
  },
  action: {
    primary: { bg: p.color.blue[500], bgHover: p.color.blue[600], text: p.color.gray[0], border: p.color.blue[500] },
    secondary: { bg: p.color.gray[100], bgHover: p.color.gray[200], text: p.color.gray[700], border: p.color.gray[300] },
    ghost: { bg: 'transparent', bgHover: p.color.gray[100], text: p.color.gray[700], border: 'transparent' },
    danger: { bg: p.color.red[600], bgHover: p.color.red[700], text: p.color.gray[0], border: p.color.red[600] },
  },
  success: { bg: p.color.green[100], text: p.color.green[800], border: p.color.green[600], icon: p.color.green[700] },
  warning: { bg: p.color.amber[100], text: p.color.amber[800], border: p.color.amber[600], icon: p.color.amber[700] },
  error: { bg: p.color.red[50], text: p.color.red[800], border: p.color.red[200], icon: p.color.red[700] },
  info: { bg: p.color.blue[100], text: p.color.blue[700], border: p.color.blue[500], icon: p.color.blue[600] },
  focus: {
    ring: `0 0 0 2px ${p.color.gray[0]}, 0 0 0 4px ${p.color.blue[500]}`,
    ringOffset: '2px',
    color: p.color.blue[500],
  },
  disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    bg: p.color.gray[100],
    text: p.color.gray[500],
    border: p.color.gray[200],
  },
} as const;

export type SemanticTokens = typeof semantic;
