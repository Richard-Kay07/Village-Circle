/**
 * Financial and notification status tokens (semantic, not role-specific).
 * Pair with icons and text labels – do not rely on colour alone.
 *
 * @see docs/TOKENS.md
 */

import { primitives } from './primitives';

const p = primitives;

export const statusTokens = {
  recorded: {
    bg: p.color.green[100],
    text: p.color.green[800],
    border: p.color.green[600],
  },
  pending: {
    bg: p.color.amber[100],
    text: p.color.amber[800],
    border: p.color.amber[600],
  },
  approved: {
    bg: p.color.green[100],
    text: p.color.green[800],
    border: p.color.green[600],
  },
  overdue: {
    bg: p.color.red[50],
    text: p.color.red[800],
    border: p.color.red[600],
  },
  reversed: {
    bg: p.color.gray[100],
    text: p.color.gray[700],
    border: p.color.gray[400],
  },
  failed: {
    bg: p.color.red[50],
    text: p.color.red[800],
    border: p.color.red[600],
  },
  delivered: {
    bg: p.color.green[100],
    text: p.color.green[800],
    border: p.color.green[600],
  },
} as const;

export type StatusId = keyof typeof statusTokens;
export type StatusTokens = typeof statusTokens;
