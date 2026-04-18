import { FundBucket } from '../domain/enums';

/**
 * Ledger module interfaces (skeleton). No business logic in Phase 1.1.
 */

export interface ILedgerService {
  /** Get balance for a bucket in a group (stub). */
  getBalance(tenantGroupId: string, bucket: FundBucket): Promise<number>;
  /** Append a ledger entry (stub). */
  append(params: AppendEntryParams): Promise<{ id: string }>;
}

export interface AppendEntryParams {
  tenantGroupId: string;
  bucket: FundBucket;
  amount: number;
  referenceType: string;
  referenceId: string;
  idempotencyKey?: string;
}
