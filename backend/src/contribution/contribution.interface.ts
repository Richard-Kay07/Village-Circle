/**
 * Contributions module interfaces. Mixed-mode (CASH/BANK_TRANSFER) with savings + social fund buckets.
 */

export interface ContributionListItem {
  id: string;
  memberId: string;
  amount: number;
  type: string;
  idempotencyKey: string | null;
  createdAt: Date;
}
