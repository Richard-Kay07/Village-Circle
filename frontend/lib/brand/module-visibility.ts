/**
 * Module visibility and feature-flag guardrails for VC Pay / VC Learn.
 * LATER modules are hidden from nav and default dashboard; only shown on roadmap/coming_soon
 * as non-interactive placeholders unless explicitly enabled.
 *
 * @see docs/FUTURE_MODULES_VC_PAY_VC_LEARN.md
 * @see lib/brand/architecture.ts
 */

import {
  BRAND_MODULE_CONFIG,
  MVP_MODULE_IDS,
  LATER_MODULE_IDS,
  type ProductModuleId,
  type AllowedUISurface,
} from './architecture';

/** Modules that may appear in main navigation. Default: MVP only. Do not add pay/learn here until released. */
export const NAV_MODULE_IDS: readonly ProductModuleId[] = MVP_MODULE_IDS;

/** Modules that may have active routes (e.g. /save, /hub, /grow). No /pay or /learn routes in MVP. */
export const ROUTED_MODULE_IDS: readonly ProductModuleId[] = MVP_MODULE_IDS;

/**
 * When true, dashboard (or roadmap surface) may show VC Pay and VC Learn as non-interactive
 * "Coming soon" cards. Default false for MVP production. Set via env or build config if needed.
 */
export function isShowLaterModulesOnDashboard(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_LATER_MODULES_ON_DASHBOARD === 'true';
}

/**
 * Returns module IDs to show as dashboard cards. When isShowLaterModulesOnDashboard() is true,
 * includes pay and learn (render as coming-soon, non-clickable). Otherwise MVP only.
 */
export function getDashboardCardModuleIds(): ProductModuleId[] {
  const showLater = isShowLaterModulesOnDashboard();
  return showLater ? [...MVP_MODULE_IDS, ...LATER_MODULE_IDS] : [...MVP_MODULE_IDS];
}

/**
 * Whether this module is LATER (VC Pay, VC Learn). Use to render coming-soon pattern, not primary CTA.
 */
export function isLaterModule(moduleId: ProductModuleId): boolean {
  return BRAND_MODULE_CONFIG[moduleId].status === 'LATER';
}

/**
 * Whether this module may be shown on the given surface. LATER modules only on roadmap/coming_soon
 * unless feature-flagged for dashboard.
 */
export function mayShowModuleOnSurface(
  moduleId: ProductModuleId,
  surface: AllowedUISurface
): boolean {
  const config = BRAND_MODULE_CONFIG[moduleId];
  if (config.status === 'MVP') return config.allowedUISurfaces.includes(surface);
  if (config.status === 'LATER') {
    if (surface === 'dashboard' && isShowLaterModulesOnDashboard()) return true;
    return config.allowedUISurfaces.includes(surface);
  }
  return false;
}
