/**
 * Ledger bucket types for fund classification.
 */
export enum FundBucket {
  SAVINGS = 'SAVINGS',
  SOCIAL_FUND = 'SOCIAL_FUND',
  LOAN_PRINCIPAL = 'LOAN_PRINCIPAL',
  LOAN_INTEREST = 'LOAN_INTEREST',
  PENALTY = 'PENALTY',
  WAIVER_ADJUSTMENT = 'WAIVER_ADJUSTMENT',
}

export const FUND_BUCKET_VALUES: readonly string[] = Object.values(FundBucket) as string[];

export function parseFundBucket(value: unknown): FundBucket {
  if (typeof value !== 'string') {
    throw new Error(`Invalid FundBucket: expected string, got ${typeof value}`);
  }
  const upper = value.toUpperCase().replace(/-/g, '_');
  if (!FUND_BUCKET_VALUES.includes(upper)) {
    throw new Error(`Invalid FundBucket: ${value}. Allowed: ${FUND_BUCKET_VALUES.join(', ')}`);
  }
  return upper as FundBucket;
}

export function isFundBucket(value: unknown): value is FundBucket {
  return typeof value === 'string' && FUND_BUCKET_VALUES.includes(value);
}
