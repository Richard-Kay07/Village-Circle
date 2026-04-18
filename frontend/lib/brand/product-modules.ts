/**
 * VillageCircle360 product module architecture (backward-compatible layer).
 * Prefer lib/brand/architecture.ts for full config; this file preserves existing API.
 *
 * @see lib/brand/architecture.ts
 * @see docs/DESIGN_SYSTEM.md
 */

import {
  BRAND_MODULE_CONFIG,
  MVP_MODULE_IDS,
  LATER_MODULE_IDS,
  getBrandModuleConfig,
  type ProductModuleId,
} from './architecture';

export const MASTER_BRAND = 'VillageCircle360' as const;

export type { ProductModuleId };

export interface ProductModule {
  id: ProductModuleId;
  name: string;
  tagline: string;
  scope: 'mvp' | 'later';
}

function toProductModule(id: ProductModuleId): ProductModule {
  const c = BRAND_MODULE_CONFIG[id];
  return {
    id: c.id,
    name: c.displayName,
    tagline: c.purposeSummary.split('.')[0] ?? c.purposeSummary,
    scope: c.status === 'MVP' ? 'mvp' : 'later',
  };
}

export const PRODUCT_MODULES: Record<ProductModuleId, ProductModule> = {
  save: toProductModule('save'),
  hub: toProductModule('hub'),
  grow: toProductModule('grow'),
  pay: toProductModule('pay'),
  learn: toProductModule('learn'),
};

export const MVP_MODULES: ProductModuleId[] = MVP_MODULE_IDS;
export const LATER_MODULES: ProductModuleId[] = LATER_MODULE_IDS;

export function getProductModule(id: ProductModuleId): ProductModule {
  return PRODUCT_MODULES[id];
}

export function isMvpModule(id: ProductModuleId): boolean {
  return getBrandModuleConfig(id).status === 'MVP';
}
