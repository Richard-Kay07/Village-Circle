/**
 * Logo-derived module accent tokens – VC Save, VC Hub, VC Grow (MVP); VC Pay, VC Learn (placeholders).
 * Derived from VillageCircle360 master logo (green–teal gradient). Use flat tokens for operational UI;
 * gradients only where allowed (see docs/MODULE_ACCENT_PALETTE.md).
 * Do not use for destructive actions. Pair with labels/icons; do not rely on colour alone.
 *
 * @see docs/MODULE_ACCENT_PALETTE.md
 * @see docs/TOKENS.md
 */

import { primitives } from './primitives';

const p = primitives;

/** Per-module semantic accent set (flat equivalents for UI) */
export interface ModuleAccentSet {
  accent: string;
  accentText: string;
  accentSoftBg: string;
  accentBorder: string;
  accentHover: string;
  accentActive: string;
  accentFocusRing: string;
  accentOnDark: string;
  accentOnLight: string;
  /** @deprecated use accent */
  default: string;
  /** @deprecated use accentActive or accentHover */
  muted: string;
  /** @deprecated use accentSoftBg */
  bg: string;
  /** @deprecated use accentText */
  textOnAccent: string;
}

function buildFocusRing(accentHex: string): string {
  return `0 0 0 2px ${p.color.gray[0]}, 0 0 0 4px ${accentHex}`;
}

export const moduleAccents: Record<'vcSave' | 'vcHub' | 'vcGrow' | 'vcPay' | 'vcLearn', ModuleAccentSet> = {
  /** VC Save – from logo dark teal. Trust, savings records, receipts. */
  vcSave: {
    accent: p.color.teal[600],
    accentText: p.color.gray[0],
    accentSoftBg: p.color.teal[50],
    accentBorder: p.color.teal[600],
    accentHover: p.color.teal[700],
    accentActive: p.color.teal[700],
    accentFocusRing: buildFocusRing(p.color.teal[600]),
    accentOnDark: p.color.gray[0],
    accentOnLight: p.color.teal[600],
    default: p.color.teal[600],
    muted: p.color.teal[700],
    bg: p.color.teal[50],
    textOnAccent: p.color.gray[0],
  },
  /** VC Hub – cool violet, distinct from logo green. Governance, meetings, share-out. */
  vcHub: {
    accent: p.color.violet[600],
    accentText: p.color.gray[0],
    accentSoftBg: p.color.violet[50],
    accentBorder: p.color.violet[600],
    accentHover: p.color.violet[700],
    accentActive: p.color.violet[700],
    accentFocusRing: buildFocusRing(p.color.violet[600]),
    accentOnDark: p.color.gray[0],
    accentOnLight: p.color.violet[600],
    default: p.color.violet[600],
    muted: p.color.violet[700],
    bg: p.color.violet[50],
    textOnAccent: p.color.gray[0],
  },
  /** VC Grow – from logo emerald/mid green. Growth, progress, loan/repayment UI. */
  vcGrow: {
    accent: p.color.green[700],
    accentText: p.color.gray[0],
    accentSoftBg: p.color.green[100],
    accentBorder: p.color.green[700],
    accentHover: p.color.green[800],
    accentActive: p.color.green[800],
    accentFocusRing: buildFocusRing(p.color.green[700]),
    accentOnDark: p.color.gray[0],
    accentOnLight: p.color.green[700],
    default: p.color.green[700],
    muted: p.color.green[800],
    bg: p.color.green[100],
    textOnAccent: p.color.gray[0],
  },
  /** VC Pay – placeholder (later). Roadmap/coming soon only. */
  vcPay: {
    accent: p.color.orange[600],
    accentText: p.color.gray[0],
    accentSoftBg: 'rgba(234,88,12,0.08)',
    accentBorder: p.color.orange[600],
    accentHover: p.color.orange[600],
    accentActive: p.color.orange[600],
    accentFocusRing: buildFocusRing(p.color.orange[600]),
    accentOnDark: p.color.gray[0],
    accentOnLight: p.color.orange[600],
    default: p.color.orange[600],
    muted: p.color.orange[600],
    bg: 'rgba(234,88,12,0.08)',
    textOnAccent: p.color.gray[0],
  },
  /** VC Learn – placeholder (later). Roadmap/coming soon only. */
  vcLearn: {
    accent: p.color.sky[600],
    accentText: p.color.gray[0],
    accentSoftBg: 'rgba(2,132,199,0.08)',
    accentBorder: p.color.sky[600],
    accentHover: p.color.sky[700],
    accentActive: p.color.sky[700],
    accentFocusRing: buildFocusRing(p.color.sky[600]),
    accentOnDark: p.color.gray[0],
    accentOnLight: p.color.sky[600],
    default: p.color.sky[600],
    muted: p.color.sky[700],
    bg: 'rgba(2,132,199,0.08)',
    textOnAccent: p.color.gray[0],
  },
};

export type ModuleAccentId = keyof typeof moduleAccents;
export type ModuleAccents = typeof moduleAccents;

/** Required alias keys for integrity checks */
export const MODULE_ACCENT_ALIASES = [
  'accent',
  'accentText',
  'accentSoftBg',
  'accentBorder',
  'accentHover',
  'accentActive',
  'accentFocusRing',
  'accentOnDark',
  'accentOnLight',
] as const;
