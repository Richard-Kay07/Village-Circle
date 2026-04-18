/**
 * VillageCircle360 Product & Brand Architecture – machine-readable config.
 * Defines master brand, module brands (VC Save, VC Hub, VC Grow, VC Pay, VC Learn),
 * UI surfaces, colour/icon tokens, and legal wording notes.
 *
 * @see docs/BRAND_NAMING_RULES.md
 * @see docs/DESIGN_SYSTEM.md
 */

export const MASTER_BRAND_ID = 'villagecircle360' as const;
export const MASTER_BRAND_DISPLAY_NAME = 'VillageCircle360';
export const MASTER_BRAND_SHORT_LABEL = 'VC360';

export type ModuleStatus = 'MVP' | 'LATER';

export type ProductModuleId = 'save' | 'hub' | 'grow' | 'pay' | 'learn';

/** Surfaces where a module name may appear in UI */
export type AllowedUISurface =
  | 'nav'
  | 'dashboard'
  | 'section_header'
  | 'onboarding'
  | 'roadmap'
  | 'coming_soon'
  | 'legal_footer_brand_only';

export interface BrandModuleConfig {
  id: ProductModuleId;
  displayName: string;
  shortLabel: string;
  status: ModuleStatus;
  purposeSummary: string;
  allowedUISurfaces: AllowedUISurface[];
  /** Placeholder for future icon token (e.g. "vc-save-icon") */
  iconTokenPlaceholder: string;
  /** Design token alias for module accent colour */
  colorTokenAlias: string;
  /** Notes for legal/compliance: how this module may be described; what must not be implied */
  legalWordingNotes: string;
}

/** Master brand config (not a product module) */
export interface MasterBrandConfig {
  id: typeof MASTER_BRAND_ID;
  displayName: string;
  shortLabel: string;
  legalEntityNote: string;
}

export const MASTER_BRAND_CONFIG: MasterBrandConfig = {
  id: MASTER_BRAND_ID,
  displayName: MASTER_BRAND_DISPLAY_NAME,
  shortLabel: MASTER_BRAND_SHORT_LABEL,
  legalEntityNote:
    'Use full "VillageCircle360" in legal pages, terms, and regulator-facing copy. Do not substitute module names (VC Save, etc.) for the legal entity or product name where the contract or notice refers to the platform as a whole.',
};

/** Product module architecture – fixed */
export const BRAND_MODULE_CONFIG: Record<ProductModuleId, BrandModuleConfig> = {
  save: {
    id: 'save',
    displayName: 'VC Save',
    shortLabel: 'Save',
    status: 'MVP',
    purposeSummary:
      'Savings records, external payment and remittance tracking, receipts and logs. No in-app money movement; records only.',
    allowedUISurfaces: ['nav', 'dashboard', 'section_header', 'onboarding'],
    iconTokenPlaceholder: 'vc-save-icon',
    colorTokenAlias: 'save',
    legalWordingNotes:
      'Do not imply the platform holds funds, executes payments, or provides remittance execution. Wording: "recorded", "tracking", "receipt/log of external transaction".',
  },
  hub: {
    id: 'hub',
    displayName: 'VC Hub',
    shortLabel: 'Hub',
    status: 'MVP',
    purposeSummary:
      'Groups, governance, meetings, voting, share-out workflows. Software-only recordkeeping and workflow.',
    allowedUISurfaces: ['nav', 'dashboard', 'section_header', 'onboarding'],
    iconTokenPlaceholder: 'vc-hub-icon',
    colorTokenAlias: 'hub',
    legalWordingNotes:
      'Module name describes product area only. Legal obligations (e.g. group rules) refer to the group or legal entity, not "VC Hub" as a separate legal person.',
  },
  grow: {
    id: 'grow',
    displayName: 'VC Grow',
    shortLabel: 'Grow',
    status: 'MVP',
    purposeSummary:
      'Loan records, approvals, repayment tracking, credit history records. No regulated lending by the platform; group-managed loans only.',
    allowedUISurfaces: ['nav', 'dashboard', 'section_header', 'onboarding'],
    iconTokenPlaceholder: 'vc-grow-icon',
    colorTokenAlias: 'grow',
    legalWordingNotes:
      'Do not imply the platform is a lender or executes disbursements. Wording: "loan application/record", "repayment recorded", "tracking". Credit history = records only.',
  },
  pay: {
    id: 'pay',
    displayName: 'VC Pay',
    shortLabel: 'Pay',
    status: 'LATER',
    purposeSummary:
      'Merchant QR, POS, collections, invoices. Placeholder for later release.',
    allowedUISurfaces: ['roadmap', 'coming_soon'],
    iconTokenPlaceholder: 'vc-pay-icon',
    colorTokenAlias: 'pay',
    legalWordingNotes:
      'Not in MVP. When launched: ensure wording distinguishes platform role (e.g. recordkeeping vs payment execution) per jurisdiction.',
  },
  learn: {
    id: 'learn',
    displayName: 'VC Learn',
    shortLabel: 'Learn',
    status: 'LATER',
    purposeSummary:
      'Short courses: money, business, agri, digital safety. Placeholder for later release.',
    allowedUISurfaces: ['roadmap', 'coming_soon'],
    iconTokenPlaceholder: 'vc-learn-icon',
    colorTokenAlias: 'learn',
    legalWordingNotes:
      'Not in MVP. When launched: ensure educational content is clearly non-advice unless otherwise regulated.',
  },
};

export const MVP_MODULE_IDS: ProductModuleId[] = ['save', 'hub', 'grow'];
export const LATER_MODULE_IDS: ProductModuleId[] = ['pay', 'learn'];

export function getBrandModuleConfig(id: ProductModuleId): BrandModuleConfig {
  return BRAND_MODULE_CONFIG[id];
}

export function isModuleAllowedOnSurface(
  moduleId: ProductModuleId,
  surface: AllowedUISurface
): boolean {
  return BRAND_MODULE_CONFIG[moduleId].allowedUISurfaces.includes(surface);
}

/** LATER modules are visible only on roadmap/coming_soon unless feature-flagged */
export function isLaterModuleVisibleOnSurface(
  moduleId: ProductModuleId,
  surface: AllowedUISurface,
  featureFlagShowLaterModules?: boolean
): boolean {
  const config = BRAND_MODULE_CONFIG[moduleId];
  if (config.status !== 'LATER') return true;
  if (featureFlagShowLaterModules && (surface === 'roadmap' || surface === 'coming_soon'))
    return true;
  return config.allowedUISurfaces.includes(surface);
}
