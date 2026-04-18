/**
 * VillageCircle360 brand architecture – public API.
 *
 * - architecture.ts: machine-readable config (status, displayName, legal notes, surfaces, tokens).
 * - product-modules.ts: backward-compatible ProductModule API.
 * - mvp-module-copy.ts: MVP-safe positioning copy and example snippets.
 * - do-not-say.ts: risky wording list and findDoNotSayViolation().
 * - example-snippets.ts: nav, dashboard, onboarding, legal examples.
 */

export {
  BRAND_MODULE_CONFIG,
  MASTER_BRAND_CONFIG,
  MVP_MODULE_IDS,
  LATER_MODULE_IDS,
  getBrandModuleConfig,
  isModuleAllowedOnSurface,
  isLaterModuleVisibleOnSurface,
  MASTER_BRAND_ID,
  MASTER_BRAND_DISPLAY_NAME,
  MASTER_BRAND_SHORT_LABEL,
  type BrandModuleConfig,
  type MasterBrandConfig,
  type ModuleStatus,
  type ProductModuleId,
  type AllowedUISurface,
} from './architecture';

export {
  MASTER_BRAND,
  PRODUCT_MODULES,
  MVP_MODULES,
  LATER_MODULES,
  getProductModule,
  isMvpModule,
  type ProductModule,
} from './product-modules';

export {
  MVP_MODULE_POSITIONING,
  EXAMPLE_NAV_LABELS,
  EXAMPLE_DASHBOARD_MODULE_CARDS,
  EXAMPLE_ONBOARDING_MODULE_DESCRIPTIONS,
  EXAMPLE_LEGAL_BRAND_USAGE,
  getModulePositioningCopy,
  type ModulePositioningCopy,
} from './mvp-module-copy';

export {
  DO_NOT_SAY_LIST,
  findDoNotSayViolation,
  type DoNotSayEntry,
} from './do-not-say';

export {
  NAV_MODULE_IDS,
  ROUTED_MODULE_IDS,
  isShowLaterModulesOnDashboard,
  getDashboardCardModuleIds,
  isLaterModule,
  mayShowModuleOnSurface,
} from './module-visibility';

export {
  getModuleDisplayName,
  getMasterBrandDisplayName,
  APP_NAV_LABELS_EXAMPLE,
  DASHBOARD_MODULE_CARDS_EXAMPLE,
  ONBOARDING_MODULE_DESCRIPTIONS_EXAMPLE,
  LEGAL_BRAND_USAGE_EXAMPLE,
} from './example-snippets';

export {
  BRAND_ASSET_MANIFEST,
  getBrandAssetById,
  getLockupForTheme,
  getSymbolForTheme,
  getBrandAssetUrl,
  BRAND_ASSET_BASE,
  type BrandAssetEntry,
  type BrandAssetType,
  type ThemeSupport,
} from './logo-manifest';

export {
  PLATFORM_BRANDING_SPEC,
  PLATFORM_BRANDING_REQUIRED_FIELDS,
  PLATFORM_BRANDING_NO_TM_ASSET_TYPES,
  getPlatformBrandingById,
  getPlatformBrandingByPlatform,
  getPlatformBrandingByType,
  getPlatformBrandingAssetUrl,
  type PlatformBrandingAssetSpec,
  type PlatformBrandingPlatform,
  type PlatformBrandingAssetType,
  type PlatformSourceVariant,
  type PlatformThemeSupport,
  type PlatformBackgroundStyle,
} from './platform-branding';
