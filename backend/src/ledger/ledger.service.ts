import { Injectable } from '@nestjs/common';
import { FundBucket } from '../domain/enums';
import { ILedgerService, AppendEntryParams } from './ledger.interface';
import { LedgerPostingService } from './ledger-posting.service';
import { LedgerBalanceService } from './ledger-balance.service';
import { LedgerPostingCommand } from './ledger.types';

/**
 * Ledger facade: delegates to posting and balance services.
 * For direct double-entry postings use LedgerPostingService.post() with LedgerPostingCommand.
 */
@Injectable()
export class LedgerService implements ILedgerService {
  constructor(
    private readonly posting: LedgerPostingService,
    private readonly balance: LedgerBalanceService,
  ) {}

  async getBalance(tenantGroupId: string, bucket: FundBucket): Promise<number> {
    return this.balance.getGroupTotal(tenantGroupId, bucket);
  }

  /** Legacy append: creates a balanced two-line posting (one debit, one credit) for group bucket. */
  async append(params: AppendEntryParams): Promise<{ id: string }> {
    const amountMinor = Math.round(params.amount * 100);
    if (amountMinor === 0) return { id: '' };
    const command: LedgerPostingCommand = {
      tenantGroupId: params.tenantGroupId,
      sourceEventType: 'CONTRIBUTION_RECORDED',
      sourceEventId: params.referenceId,
      eventTimestamp: new Date(),
      recordedByUserId: 'system',
      idempotencyKey: params.idempotencyKey ?? undefined,
      lines: [
        { fundBucket: params.bucket, amountMinor },
        { fundBucket: params.bucket, amountMinor: -amountMinor },
      ],
    };
    const { ledgerEventId } = await this.posting.post(command);
    return { id: ledgerEventId };
  }
}
