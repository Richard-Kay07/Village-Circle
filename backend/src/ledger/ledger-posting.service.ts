import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { FundBucket, FUND_BUCKET_VALUES, AuditChannel } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import {
  LedgerPostingCommand,
  LedgerReversalCommand,
  LedgerSourceEventType,
} from './ledger.types';
import {
  LedgerNotBalancedError,
  LedgerEventNotFoundError,
  LedgerEventAlreadyReversedError,
} from './ledger.errors';
import { LedgerFundBucket } from '@prisma/client';

const BUCKET_MAP: Record<FundBucket, LedgerFundBucket> = {
  SAVINGS: 'SAVINGS',
  SOCIAL_FUND: 'SOCIAL_FUND',
  LOAN_PRINCIPAL: 'LOAN_PRINCIPAL',
  LOAN_INTEREST: 'LOAN_INTEREST',
  PENALTY: 'PENALTY',
  WAIVER_ADJUSTMENT: 'WAIVER_ADJUSTMENT',
};

/**
 * Append-only ledger posting service. Validates bucket, non-zero lines, balance, idempotency.
 * Emits audit events for each post and reversal.
 */
@Injectable()
export class LedgerPostingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Post a ledger event (append-only). Idempotent when idempotencyKey is provided.
   * Returns existing event id when key was already used with same payload.
   */
  async post(
    command: LedgerPostingCommand,
    channel: AuditChannel = AuditChannel.SYSTEM,
  ): Promise<{ ledgerEventId: string }> {
    this.validateCommand(command);

    if (command.idempotencyKey) {
      const existing = await this.prisma.ledgerEvent.findUnique({
        where: { idempotencyKey: command.idempotencyKey },
        include: { lines: true },
      });
      if (existing) {
        if (existing.tenantGroupId !== command.tenantGroupId) {
          throw new ValidationError('Idempotency key already used for another tenant', {
            idempotencyKey: command.idempotencyKey,
          });
        }
        return { ledgerEventId: existing.id };
      }
    }

    const event = await this.prisma.ledgerEvent.create({
      data: {
        tenantGroupId: command.tenantGroupId,
        sourceEventType: command.sourceEventType,
        sourceEventId: command.sourceEventId,
        transactionMode: command.transactionMode ?? undefined,
        eventTimestamp: command.eventTimestamp,
        recordedByUserId: command.recordedByUserId,
        idempotencyKey: command.idempotencyKey ?? undefined,
        metadata: command.metadata ?? undefined,
        lines: {
          create: command.lines.map((line) => ({
            tenantGroupId: command.tenantGroupId,
            memberId: line.memberId ?? undefined,
            fundBucket: BUCKET_MAP[line.fundBucket as FundBucket] ?? line.fundBucket,
            amountMinor: line.amountMinor,
            currencyCode: line.currencyCode ?? 'GBP',
          })),
        },
      },
      include: { lines: true },
    });

    await this.auditLog.append({
      tenantGroupId: command.tenantGroupId,
      actorUserId: command.recordedByUserId,
      channel,
      action: 'LEDGER_POSTED',
      entityType: 'LEDGER_EVENT',
      entityId: event.id,
      afterSnapshot: {
        sourceEventType: event.sourceEventType,
        sourceEventId: event.sourceEventId,
        lineCount: event.lines.length,
        idempotencyKey: event.idempotencyKey,
      },
      metadata: command.metadata ?? undefined,
    });

    return { ledgerEventId: event.id };
  }

  /**
   * Reversal: creates a new LedgerEvent linked to the original (reversalOfLedgerEventId).
   * Does not mutate the original. New lines are opposite sign of original lines.
   */
  async reversal(
    command: LedgerReversalCommand,
    channel: AuditChannel = AuditChannel.SYSTEM,
  ): Promise<{ ledgerEventId: string }> {
    const original = await this.prisma.ledgerEvent.findUnique({
      where: { id: command.ledgerEventId },
      include: { lines: true },
    });
    if (!original) throw new LedgerEventNotFoundError(command.ledgerEventId);
    if (original.tenantGroupId !== command.tenantGroupId) {
      throw new ValidationError('Ledger event does not belong to tenant', {
        ledgerEventId: command.ledgerEventId,
        tenantGroupId: command.tenantGroupId,
      });
    }
    const alreadyReversed = await this.prisma.ledgerEvent.findFirst({
      where: { reversalOfLedgerEventId: command.ledgerEventId },
    });
    if (alreadyReversed) throw new LedgerEventAlreadyReversedError(command.ledgerEventId);

    const reversalEvent = await this.prisma.ledgerEvent.create({
      data: {
        tenantGroupId: command.tenantGroupId,
        sourceEventType: 'REVERSAL',
        sourceEventId: command.sourceEventId,
        transactionMode: original.transactionMode,
        eventTimestamp: new Date(),
        recordedByUserId: command.recordedByUserId,
        reversalOfLedgerEventId: original.id,
        metadata: command.metadata ?? undefined,
        lines: {
          create: original.lines.map((line) => ({
            tenantGroupId: command.tenantGroupId,
            memberId: line.memberId,
            fundBucket: line.fundBucket,
            amountMinor: -line.amountMinor,
            currencyCode: line.currencyCode,
          })),
        },
      },
      include: { lines: true },
    });

    await this.auditLog.append({
      tenantGroupId: command.tenantGroupId,
      actorUserId: command.recordedByUserId,
      channel,
      action: 'LEDGER_REVERSED',
      entityType: 'LEDGER_EVENT',
      entityId: reversalEvent.id,
      beforeSnapshot: { originalLedgerEventId: original.id },
      afterSnapshot: { reversalLedgerEventId: reversalEvent.id },
      metadata: command.metadata ?? undefined,
    });

    return { ledgerEventId: reversalEvent.id };
  }

  private validateCommand(command: LedgerPostingCommand): void {
    if (!command.tenantGroupId?.trim() || !command.sourceEventId?.trim()) {
      throw new ValidationError('tenantGroupId and sourceEventId are required');
    }
    if (!command.lines?.length) {
      throw new ValidationError('At least one ledger line is required');
    }
    const sum = command.lines.reduce((s, l) => s + l.amountMinor, 0);
    if (sum !== 0) {
      throw new LedgerNotBalancedError(sum);
    }
    for (const line of command.lines) {
      if (line.amountMinor === 0) {
        throw new ValidationError('Ledger line amountMinor must be non-zero');
      }
      if (!FUND_BUCKET_VALUES.includes(line.fundBucket as string)) {
        throw new ValidationError(`Invalid fundBucket: ${line.fundBucket}`, {
          allowed: FUND_BUCKET_VALUES,
        });
      }
    }
  }
}
