/**
 * VillageCircle360 design tokens – composed export.
 * Use semantic and module/status tokens in components; avoid hardcoded colours.
 *
 * Backward compatibility: tokens.color, tokens.space, tokens.font, tokens.radius, tokens.shadow
 * map to primitives/semantic for existing consumers.
 *
 * @see docs/TOKENS.md
 */

import { primitives } from './primitives';
import { semantic } from './semantic';
import { moduleAccents } from './module-accents';
import { statusTokens } from './status';

export { primitives } from './primitives';
export { semantic } from './semantic';
export {
  moduleAccents,
  MODULE_ACCENT_ALIASES,
  type ModuleAccentId,
  type ModuleAccents,
  type ModuleAccentSet,
} from './module-accents';
export { statusTokens, type StatusId, type StatusTokens } from './status';

const p = primitives;

/** Legacy-compatible flat color map for existing components */
const legacyColor = {
  primary: p.color.blue[500],
  primaryHover: p.color.blue[600],
  primaryMuted: p.color.blue[100],
  primaryContrast: p.color.gray[0],
  text: semantic.text.primary,
  textSecondary: semantic.text.secondary,
  textMuted: semantic.text.muted,
  textDisabled: semantic.text.disabled,
  border: semantic.border.default,
  borderLight: semantic.border.subtle,
  surface: semantic.surface.default,
  surfaceMuted: semantic.surface.muted,
  background: semantic.background.default,
  success: p.color.green[700],
  successMuted: semantic.success.bg,
  successText: semantic.success.text,
  warning: p.color.amber[700],
  warningMuted: semantic.warning.bg,
  warningText: semantic.warning.text,
  error: semantic.error.icon,
  errorMuted: semantic.error.bg,
  errorText: semantic.error.text,
  errorBorder: semantic.error.border,
  save: moduleAccents.vcSave.default,
  hub: moduleAccents.vcHub.default,
  grow: moduleAccents.vcGrow.default,
  pay: moduleAccents.vcPay.default,
  learn: moduleAccents.vcLearn.default,
} as const;

/** Single tokens object: primitives, semantic, module, status + legacy shape */
export const tokens = {
  primitives,
  semantic,
  module: moduleAccents,
  status: statusTokens,
  color: legacyColor,
  font: {
    family: p.typography.fontFamily,
    size: p.typography.fontSize,
    weight: p.typography.fontWeight,
    lineHeight: p.typography.lineHeight,
  },
  space: p.spacing,
  radius: p.radius,
  shadow: p.shadow,
  borderWidth: p.borderWidth,
  zIndex: p.zIndex,
  motion: p.motion,
  touchTargetMin: p.touchTargetMin,
  breakpoint: p.breakpoint,
} as const;

export type DesignTokens = typeof tokens;
