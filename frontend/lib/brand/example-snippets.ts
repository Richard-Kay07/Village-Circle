/**
 * Example UI label and copy snippets for VillageCircle360 brand architecture.
 * Use these as reference; in production prefer COPY_KEYS and getCopy() where applicable.
 *
 * - App navigation labels
 * - Dashboard module cards
 * - Onboarding module descriptions
 * - Legal page brand naming usage
 *
 * @see lib/brand/architecture.ts
 * @see lib/brand/mvp-module-copy.ts
 * @see docs/BRAND_NAMING_RULES.md
 */

import {
  EXAMPLE_NAV_LABELS,
  EXAMPLE_DASHBOARD_MODULE_CARDS,
  EXAMPLE_ONBOARDING_MODULE_DESCRIPTIONS,
  EXAMPLE_LEGAL_BRAND_USAGE,
} from './mvp-module-copy';
import { BRAND_MODULE_CONFIG, MASTER_BRAND_CONFIG } from './architecture';

export { EXAMPLE_NAV_LABELS, EXAMPLE_DASHBOARD_MODULE_CARDS, EXAMPLE_ONBOARDING_MODULE_DESCRIPTIONS, EXAMPLE_LEGAL_BRAND_USAGE };

/** App navigation labels – example only; align with nav-maps in production */
export const APP_NAV_LABELS_EXAMPLE = EXAMPLE_NAV_LABELS;

/** Dashboard module cards – title and subtitle per MVP module */
export const DASHBOARD_MODULE_CARDS_EXAMPLE = EXAMPLE_DASHBOARD_MODULE_CARDS;

/** Onboarding – heading and body per MVP module */
export const ONBOARDING_MODULE_DESCRIPTIONS_EXAMPLE = EXAMPLE_ONBOARDING_MODULE_DESCRIPTIONS;

/** Legal pages – use VillageCircle360, not module names */
export const LEGAL_BRAND_USAGE_EXAMPLE = EXAMPLE_LEGAL_BRAND_USAGE;

/** Resolve module display name from config (for use in headers/cards) */
export function getModuleDisplayName(
  moduleId: 'save' | 'hub' | 'grow' | 'pay' | 'learn'
): string {
  return BRAND_MODULE_CONFIG[moduleId].displayName;
}

/** Master brand for legal/footer */
export function getMasterBrandDisplayName(): string {
  return MASTER_BRAND_CONFIG.displayName;
}
