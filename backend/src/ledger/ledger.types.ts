import { FundBucket } from '../domain/enums';

/** Source event types for ledger (extensible). */
export type LedgerSourceEventType =
  | 'CONTRIBUTION_RECORDED'
  | 'REPAYMENT_RECORDED'
  | 'SOCIAL_FUND_CONTRIBUTION'
  | 'SOCIAL_FUND_DISBURSEMENT'
  | 'LOAN_DISBURSEMENT_RECORDED'
  | 'LOAN_REPAYMENT_RECORDED'
  | 'ADJUSTMENT'
  | 'REVERSAL';

/**
 * A single line in a posting: fund bucket, member (or group-level when null), signed amount in minor units.
 * Positive = credit, negative = debit (standard accounting convention for asset buckets).
 */
export interface LedgerLineCommand {
  fundBucket: FundBucket;
  memberId?: string | null;
  amountMinor: number; // signed: positive = credit, negative = debit
  currencyCode?: string;
}

/**
 * Typed posting command: append-only. All lines must balance (sum amountMinor = 0) for double-entry.
 */
export interface LedgerPostingCommand {
  tenantGroupId: string;
  sourceEventType: LedgerSourceEventType;
  sourceEventId: string;
  transactionMode?: 'CASH' | 'BANK_TRANSFER' | null;
  eventTimestamp: Date;
  recordedByUserId: string;
  idempotencyKey?: string | null;
  lines: LedgerLineCommand[];
  metadata?: Record<string, unknown> | null;
}

export interface LedgerReversalCommand {
  ledgerEventId: string;
  tenantGroupId: string;
  recordedByUserId: string;
  sourceEventId: string; // e.g. reversal reference
  metadata?: Record<string, unknown> | null;
}
