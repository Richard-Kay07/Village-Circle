/**
 * Immutable rule snapshot for loan approval and schedule generation.
 * Loan/schedule modules must consume this object, not live RuleVersion rows.
 * Historical loans keep the snapshot they were approved with; rule edits do not change them.
 */
export interface LoanRuleSnapshot {
  ruleVersionId: string;
  groupId: string;
  effectiveFrom: Date;
  loanInterestEnabled: boolean;
  /** Interest rate in basis points (100 bps = 1%). */
  loanInterestRateBps: number;
  loanInterestBasis: 'FLAT' | 'SIMPLE_DECLINING';
  penaltyEnabled: boolean;
  /** Placeholder; structure TBD when penalty is implemented. */
  penaltyRule: Record<string, unknown> | null;
  socialFundEnabled: boolean;
  smsNotificationsEnabled: boolean;
  /** Tenant cost control: allow receipt confirmation SMS. */
  smsReceiptConfirmationEnabled: boolean;
}

export type LoanInterestBasis = 'FLAT' | 'SIMPLE_DECLINING';

export const LOAN_INTEREST_BASIS_VALUES: readonly LoanInterestBasis[] = ['FLAT', 'SIMPLE_DECLINING'];

/** DTO for creating the first or a new rule version. */
export interface CreateRuleVersionDto {
  tenantGroupId: string;
  loanInterestEnabled: boolean;
  /** Interest rate in basis points (e.g. 500 = 5%). */
  loanInterestRateBps: number;
  loanInterestBasis: LoanInterestBasis;
  penaltyEnabled: boolean;
  /** Optional placeholder object. */
  penaltyRule?: Record<string, unknown> | null;
  socialFundEnabled: boolean;
  smsNotificationsEnabled: boolean;
  smsReceiptConfirmationEnabled: boolean;
  createdByUserId: string;
}

/** DTO for updating rules: creates a new version (effectiveFrom = now). */
export interface UpdateRuleVersionDto {
  tenantGroupId: string;
  loanInterestEnabled?: boolean;
  loanInterestRateBps?: number;
  loanInterestBasis?: LoanInterestBasis;
  penaltyEnabled?: boolean;
  penaltyRule?: Record<string, unknown> | null;
  socialFundEnabled?: boolean;
  smsNotificationsEnabled?: boolean;
  smsReceiptConfirmationEnabled?: boolean;
  updatedByUserId: string;
}
