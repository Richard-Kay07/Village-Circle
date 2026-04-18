/**
 * VillageCircle360 "do not say" list – risky or misleading wording to avoid in UX copy.
 * MVP is software-only recordkeeping; no fund holding, payment execution, or regulated lending.
 *
 * Use this list for copy review, lint rules, or automated checks.
 *
 * @see docs/BRAND_MVP_MODULE_COPY.md
 * @see docs/BRAND_NAMING_RULES.md
 */

export interface DoNotSayEntry {
  /** Pattern or phrase to avoid (regex or literal) */
  pattern: string;
  /** Why it is risky */
  reason: string;
  /** Preferred alternative */
  useInstead: string;
  /** Optional: which module or context this applies to */
  context?: string;
}

/** Phrases and patterns that must not appear in user-facing copy (MVP) */
export const DO_NOT_SAY_LIST: DoNotSayEntry[] = [
  {
    pattern: 'bank transfer sent by VC|transfer sent by VillageCircle|payment sent by (VC|VillageCircle)',
    reason: 'Implies the platform executes payments. MVP only records external transactions.',
    useInstead: 'Record bank transfer / Payment recorded (external)',
    context: 'VC Save',
  },
  {
    pattern: 'VC (holds|holds your|holds the) funds|VillageCircle holds funds',
    reason: 'Platform does not hold funds in MVP.',
    useInstead: 'Amounts are recorded in the system. The app does not hold funds.',
    context: 'VC Save',
  },
  {
    pattern: 'we (pay|sent|transfer)|(pay|sent|transfer) (money|funds) (for you|to)',
    reason: 'Implies platform executes payments.',
    useInstead: 'Record payment / Payment recorded (made outside the app)',
    context: 'VC Save',
  },
  {
    pattern: '\\bbank account\\b|\\bwallet\\b',
    reason: 'Not implemented in MVP; implies holding funds or account.',
    useInstead: 'Record of amount / Savings total (recorded) unless feature exists',
    context: 'VC Save',
  },
  {
    pattern: 'lend(ing)? (by|from) (VC|VillageCircle|the platform)|platform (is|acts as) (a )?lender',
    reason: 'Platform does not perform regulated lending in MVP.',
    useInstead: 'Loan record / Group-managed loan / Application recorded',
    context: 'VC Grow',
  },
  {
    pattern: 'guarantee|guaranteed (return|approval|payout)',
    reason: 'No guaranteed outcomes; avoid financial promise wording.',
    useInstead: 'Rephrase without guarantee (e.g. "subject to group rules")',
  },
  {
    pattern: 'invest(ment)? (through|via|on) (VC|VillageCircle)',
    reason: 'MVP does not offer investment products.',
    useInstead: 'Savings record / Contribution record',
    context: 'VC Save',
  },
  {
    pattern: 'e-money|emoney|electronic money (issued by|from)',
    reason: 'MVP does not issue e-money.',
    useInstead: 'Record of amount / Recorded balance',
  },
  {
    pattern: 'FCA (authorised|regulated|registered) (lender|payment)',
    reason: 'Do not imply regulatory status unless true and approved for use.',
    useInstead: 'Use only if factually correct and legally approved.',
  },
  {
    pattern: 'VC Pay (is available|is live|you can use)',
    reason: 'VC Pay is LATER; not available in MVP.',
    useInstead: 'VC Pay – Coming in a later release',
    context: 'VC Pay',
  },
  {
    pattern: 'VC Learn (is available|is live|you can use)',
    reason: 'VC Learn is LATER; not available in MVP.',
    useInstead: 'VC Learn – Coming in a later release',
    context: 'VC Learn',
  },
  {
    pattern: 'edit (payment|transfer|contribution|repayment)\\b|\\b(change|amend) (payment|transfer|contribution|repayment) ',
    reason: 'MVP uses reversal + new record; no in-place edit of financial records.',
    useInstead: 'Reverse record and create a new one with correct details',
    context: 'VC Save / VC Grow',
  },
  {
    pattern: 'update (your )?(payment|transfer|contribution) (amount|details)',
    reason: 'Implies editing record in place. Use reversal wording.',
    useInstead: 'Reverse this record and record again with correct details',
    context: 'VC Save',
  },
];

/** Check if a string contains any do-not-say pattern (case-insensitive). Returns first match or null. */
export function findDoNotSayViolation(text: string): DoNotSayEntry | null {
  const lower = text.toLowerCase();
  for (const entry of DO_NOT_SAY_LIST) {
    try {
      const re = new RegExp(entry.pattern, 'i');
      if (re.test(text)) return entry;
    } catch {
      if (lower.includes(entry.pattern.toLowerCase())) return entry;
    }
  }
  return null;
}
