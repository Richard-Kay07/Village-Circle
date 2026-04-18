import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { LedgerPostingService } from './ledger-posting.service';
import { LedgerBalanceService } from './ledger-balance.service';
import { FundBucket } from '../domain/enums';
import { AuditChannel } from '../domain/enums';
import {
  LedgerNotBalancedError,
  LedgerEventNotFoundError,
  LedgerEventAlreadyReversedError,
} from './ledger.errors';
import type { LedgerPostingCommand, LedgerReversalCommand } from './ledger.types';

describe('LedgerPostingService', () => {
  let posting: LedgerPostingService;
  let balance: LedgerBalanceService;
  let prisma: {
    ledgerEvent: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
    ledgerLine: { groupBy: jest.Mock; aggregate: jest.Mock };
  };
  let auditLog: { append: jest.Mock };

  const groupId = 'g1';
  const userId = 'u1';
  const now = new Date('2025-03-01T12:00:00Z');

  function postingCommand(overrides: Partial<LedgerPostingCommand> = {}): LedgerPostingCommand {
    return {
      tenantGroupId: groupId,
      sourceEventType: 'CONTRIBUTION_RECORDED',
      sourceEventId: 'evt-1',
      eventTimestamp: now,
      recordedByUserId: userId,
      lines: [
        { fundBucket: FundBucket.SAVINGS, memberId: 'm1', amountMinor: 1000 },
        { fundBucket: FundBucket.SAVINGS, memberId: 'm1', amountMinor: -1000 },
      ],
      ...overrides,
    };
  }

  beforeEach(async () => {
    auditLog = { append: jest.fn().mockResolvedValue('audit-id') };
    const createMock = jest.fn().mockImplementation((args: { data: any }) => {
      const id = args.data.idempotencyKey ? `evt-${args.data.idempotencyKey}` : `evt-${Date.now()}`;
      return Promise.resolve({
        id,
        tenantGroupId: args.data.tenantGroupId,
        sourceEventType: args.data.sourceEventType,
        sourceEventId: args.data.sourceEventId,
        reversalOfLedgerEventId: args.data.reversalOfLedgerEventId ?? null,
        lines: (args.data.lines?.create ?? []).map((l: any, i: number) => ({
          id: `line-${id}-${i}`,
          amountMinor: l.amountMinor,
          fundBucket: l.fundBucket,
          memberId: l.memberId ?? null,
        })),
      });
    });
    prisma = {
      ledgerEvent: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        create: createMock,
      },
      ledgerLine: {
        groupBy: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _sum: { amountMinor: 0 } }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerPostingService,
        LedgerBalanceService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    posting = module.get(LedgerPostingService);
    balance = module.get(LedgerBalanceService);
  });

  describe('post', () => {
    it('posts savings ledger event and emits audit', async () => {
      const cmd = postingCommand({
        lines: [
          { fundBucket: FundBucket.SAVINGS, memberId: 'm1', amountMinor: 500 },
          { fundBucket: FundBucket.SAVINGS, memberId: 'm1', amountMinor: -500 },
        ],
      });
      const result = await posting.post(cmd, AuditChannel.WEB);
      expect(result.ledgerEventId).toBeDefined();
      expect(prisma.ledgerEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantGroupId: groupId,
            sourceEventType: 'CONTRIBUTION_RECORDED',
            sourceEventId: 'evt-1',
            lines: {
              create: expect.arrayContaining([
                expect.objectContaining({ fundBucket: 'SAVINGS', amountMinor: 500 }),
                expect.objectContaining({ fundBucket: 'SAVINGS', amountMinor: -500 }),
              ]),
            },
          }),
        }),
      );
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'LEDGER_POSTED',
          entityType: 'LEDGER_EVENT',
          entityId: result.ledgerEventId,
          afterSnapshot: expect.objectContaining({ sourceEventType: 'CONTRIBUTION_RECORDED' }),
        }),
      );
    });

    it('posts social fund ledger event', async () => {
      const cmd = postingCommand({
        sourceEventType: 'SOCIAL_FUND_CONTRIBUTION',
        sourceEventId: 'sf-1',
        lines: [
          { fundBucket: FundBucket.SOCIAL_FUND, amountMinor: 200 },
          { fundBucket: FundBucket.SOCIAL_FUND, amountMinor: -200 },
        ],
      });
      const result = await posting.post(cmd);
      expect(result.ledgerEventId).toBeDefined();
      expect(prisma.ledgerEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sourceEventType: 'SOCIAL_FUND_CONTRIBUTION',
            lines: {
              create: expect.arrayContaining([
                expect.objectContaining({ fundBucket: 'SOCIAL_FUND', amountMinor: 200 }),
                expect.objectContaining({ fundBucket: 'SOCIAL_FUND', amountMinor: -200 }),
              ]),
            },
          }),
        }),
      );
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'LEDGER_POSTED' }),
      );
    });

    it('idempotent duplicate posting returns existing result', async () => {
      const cmd = postingCommand({ idempotencyKey: 'idem-1' });
      prisma.ledgerEvent.findUnique.mockResolvedValueOnce({
        id: 'evt-existing',
        tenantGroupId: groupId,
        lines: [],
      });
      const first = await posting.post(cmd);
      const second = await posting.post(cmd);
      expect(first.ledgerEventId).toBe('evt-existing');
      expect(second.ledgerEventId).toBe('evt-existing');
      expect(prisma.ledgerEvent.create).not.toHaveBeenCalled();
      expect(auditLog.append).not.toHaveBeenCalled();
    });

    it('rejects unbalanced lines', async () => {
      const cmd = postingCommand({
        lines: [
          { fundBucket: FundBucket.SAVINGS, amountMinor: 100 },
          { fundBucket: FundBucket.SAVINGS, amountMinor: -50 },
        ],
      });
      await expect(posting.post(cmd)).rejects.toThrow(LedgerNotBalancedError);
      expect(prisma.ledgerEvent.create).not.toHaveBeenCalled();
    });

    it('rejects zero amount line', async () => {
      const cmd = postingCommand({
        lines: [
          { fundBucket: FundBucket.SAVINGS, amountMinor: 0 },
          { fundBucket: FundBucket.SAVINGS, amountMinor: 0 },
        ],
      });
      await expect(posting.post(cmd)).rejects.toThrow('non-zero');
      expect(prisma.ledgerEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('reversal', () => {
    it('creates new event linked to original and preserves original', async () => {
      const originalId = 'evt-original';
      const originalEvent = {
        id: originalId,
        tenantGroupId: groupId,
        sourceEventType: 'CONTRIBUTION_RECORDED',
        sourceEventId: 'evt-1',
        transactionMode: 'CASH',
        lines: [
          { id: 'l1', memberId: 'm1', fundBucket: 'SAVINGS', amountMinor: 1000, currencyCode: 'GBP' },
          { id: 'l2', memberId: null, fundBucket: 'SAVINGS', amountMinor: -1000, currencyCode: 'GBP' },
        ],
      };
      prisma.ledgerEvent.findUnique.mockResolvedValue(originalEvent);
      prisma.ledgerEvent.create.mockResolvedValueOnce({
        id: 'evt-reversal',
        reversalOfLedgerEventId: originalId,
        lines: [
          { amountMinor: -1000, fundBucket: 'SAVINGS', memberId: 'm1' },
          { amountMinor: 1000, fundBucket: 'SAVINGS', memberId: null },
        ],
      });

      const cmd: LedgerReversalCommand = {
        ledgerEventId: originalId,
        tenantGroupId: groupId,
        recordedByUserId: userId,
        sourceEventId: 'rev-1',
      };
      const result = await posting.reversal(cmd);
      expect(result.ledgerEventId).toBe('evt-reversal');
      expect(prisma.ledgerEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reversalOfLedgerEventId: originalId,
            sourceEventType: 'REVERSAL',
            lines: {
              create: [
                expect.objectContaining({ amountMinor: -1000, fundBucket: 'SAVINGS', memberId: 'm1' }),
                expect.objectContaining({ amountMinor: 1000, fundBucket: 'SAVINGS', memberId: null }),
              ],
            },
          }),
        }),
      );
      expect(prisma.ledgerEvent.findUnique).toHaveBeenCalledWith({
        where: { id: originalId },
        include: { lines: true },
      });
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'LEDGER_REVERSED',
          entityType: 'LEDGER_EVENT',
          entityId: 'evt-reversal',
          beforeSnapshot: { originalLedgerEventId: originalId },
        }),
      );
    });

    it('throws when event not found', async () => {
      prisma.ledgerEvent.findUnique.mockResolvedValue(null);
      await expect(
        posting.reversal({
          ledgerEventId: 'missing',
          tenantGroupId: groupId,
          recordedByUserId: userId,
          sourceEventId: 'rev-1',
        }),
      ).rejects.toThrow(LedgerEventNotFoundError);
    });

    it('throws when event already reversed', async () => {
      prisma.ledgerEvent.findUnique.mockResolvedValue({
        id: 'evt-1',
        tenantGroupId: groupId,
        lines: [],
      });
      prisma.ledgerEvent.findFirst.mockResolvedValue({ id: 'evt-rev-existing' });
      await expect(
        posting.reversal({
          ledgerEventId: 'evt-1',
          tenantGroupId: groupId,
          recordedByUserId: userId,
          sourceEventId: 'rev-1',
        }),
      ).rejects.toThrow(LedgerEventAlreadyReversedError);
    });
  });
});
