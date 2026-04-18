/**
 * MVP-safe module positioning copy and example UI snippets.
 * Use for nav labels, dashboard cards, onboarding, and legal/footer.
 *
 * VC Save / VC Hub / VC Grow = recordkeeping only; no fund holding or payment execution.
 *
 * @see docs/BRAND_MVP_MODULE_COPY.md
 * @see lib/brand/architecture.ts
 */

import type { ProductModuleId } from './architecture';

export interface ModulePositioningCopy {
  /** One-line MVP-safe description */
  tagline: string;
  /** Short for cards or nav */
  shortDescription: string;
  /** Onboarding / first-run description */
  onboardingDescription: string;
  /** Legal wording note (for reference in UI tooling or checks) */
  legalNote: string;
}

export const MVP_MODULE_POSITIONING: Record<'save' | 'hub' | 'grow', ModulePositioningCopy> = {
  save: {
    tagline: 'Savings, payments, remittances',
    shortDescription:
      'Record savings and track external payments and remittances. Receipts and logs only; no in-app money movement.',
    onboardingDescription:
      'VC Save helps your group record savings and track payments made outside the app. You can view statements and contribution records. The app does not hold or move funds.',
    legalNote:
      'Do not imply the platform holds funds, executes payments, or provides remittance execution.',
  },
  hub: {
    tagline: 'Groups, governance, share-out, voting',
    shortDescription:
      'Groups, meetings, governance, voting and share-out workflows. Software-only recordkeeping.',
    onboardingDescription:
      'VC Hub supports your group’s governance, meetings, voting and share-out. All activity is recorded in the app; the app does not execute financial transactions.',
    legalNote:
      'Module name describes product area only. Legal obligations refer to the group or legal entity.',
  },
  grow: {
    tagline: 'Micro-loans, asset finance, credit building',
    shortDescription:
      'Loan records, approvals and repayment tracking. Credit history records only. No regulated lending by the platform.',
    onboardingDescription:
      'VC Grow helps your group manage loan applications and repayment records. The platform records approvals and repayments; it does not provide or execute lending.',
    legalNote:
      'Do not imply the platform is a lender or executes disbursements. Use "record", "tracking".',
  },
};

/** Example nav labels (aligned with current nav; use COPY_KEYS in production where applicable) */
export const EXAMPLE_NAV_LABELS = {
  member: {
    dashboard: 'Dashboard',
    statements: 'My statements',
    loans: 'My loans',
    notifications: 'Notifications',
    profile: 'Profile',
    support: 'Support',
  },
  treasurer: {
    dashboard: 'Dashboard',
    contributions: 'Contributions',
    meetings: 'Meetings',
    loans: 'Loans',
    reports: 'Reports',
    audit: 'Audit',
  },
  admin: {
    home: 'Support home',
    auditLog: 'Audit log',
    smsFailures: 'SMS failures',
    traces: 'Entity traces',
  },
} as const;

/** Example dashboard module card titles and one-line copy */
export const EXAMPLE_DASHBOARD_MODULE_CARDS: Record<
  'save' | 'hub' | 'grow',
  { title: string; subtitle: string }
> = {
  save: {
    title: 'VC Save',
    subtitle: 'Savings & statements. Records and receipts only.',
  },
  hub: {
    title: 'VC Hub',
    subtitle: 'Meetings, governance & share-out.',
  },
  grow: {
    title: 'VC Grow',
    subtitle: 'Loans & repayments. Records only; no lending by platform.',
  },
};

/** Example onboarding module descriptions (one per MVP module) */
export const EXAMPLE_ONBOARDING_MODULE_DESCRIPTIONS: Record<
  'save' | 'hub' | 'grow',
  { heading: string; body: string }
> = {
  save: {
    heading: 'VC Save',
    body: 'Record savings and track payments made outside the app. View statements and contribution history. The app does not hold or move funds.',
  },
  hub: {
    heading: 'VC Hub',
    body: 'Manage your group’s meetings, governance and share-out. All activity is recorded here; the app does not execute transactions.',
  },
  grow: {
    heading: 'VC Grow',
    body: 'Apply for and track group loans. The platform records applications and repayments; it does not provide or execute lending.',
  },
};

/** Example legal page brand usage (do not replace with module names) */
export const EXAMPLE_LEGAL_BRAND_USAGE = {
  termsTitle: 'VillageCircle360 Terms of Use',
  privacyTitle: 'VillageCircle360 Privacy Policy',
  footer: '© VillageCircle360. All rights reserved.',
  productReference:
    'The VillageCircle360 platform provides recordkeeping and workflow tools for groups. It does not hold funds or execute payments.',
} as const;

export function getModulePositioningCopy(
  moduleId: ProductModuleId
): ModulePositioningCopy | undefined {
  if (moduleId === 'save' || moduleId === 'hub' || moduleId === 'grow') {
    return MVP_MODULE_POSITIONING[moduleId];
  }
  return undefined;
}
