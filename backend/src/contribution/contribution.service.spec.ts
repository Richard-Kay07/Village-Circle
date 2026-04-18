import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { LedgerPostingService } from '../ledger/ledger-posting.service';
import { NotificationTriggerService } from '../notifications/notification-trigger.service';
import { ContributionService } from './contribution.service';
import { AuditChannel } from '../domain/enums';
import {
  ContributionNotFoundError,
  ContributionAlreadyReversedError,
  EvidenceNotFoundOrWrongGroupError,
} from './contribution.errors';
import { ValidationError } from '../domain/errors';

describe('ContributionService', () => {
  let service: ContributionService;
  let notificationTriggers: { contributionReceipt: jest.Mock };
  let prisma: {
    contribution: { findUnique: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; findMany: jest.Mock };
    member: { findFirst: jest.Mock };
    meeting: { findUnique: jest.Mock; findFirst: jest.Mock };
    evidenceFile: { findFirst: jest.Mock };
    loanRepayment: { findFirst: jest.Mock };
  };
  let ledgerPosting: { post: jest.Mock; reversal: jest.Mock };
  let auditLog: { append: jest.Mock };
  let rbac: { requirePermission: jest.Mock };
  const groupId = 'g1';
  const memberId = 'm1';
  const meetingId = 'mtg1';

  beforeEach(async () => {
    ledgerPosting = { post: jest.fn().mockResolvedValue({ ledgerEventId: 'lev-1' }), reversal: jest.fn().mockResolvedValue({ ledgerEventId: 'lev-rev-1' }) };
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    rbac = { requirePermission: jest.fn().mockResolvedValue(undefined) };
    prisma = {
      contribution: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => Promise.resolve({
          id: 'c1',
          createdAt: new Date(),
          ...args.data,
        })),
        update: jest.fn().mockImplementation((args) => Promise.resolve({ id: args.where.id, status: 'REVERSED' })),
        findMany: jest.fn().mockResolvedValue([]),
      },
      member: { findFirst: jest.fn().mockResolvedValue({ id: memberId, groupId, status: 'ACTIVE' }) },
      meeting: { findUnique: jest.fn().mockResolvedValue({ id: meetingId, groupId }), findFirst: jest.fn().mockResolvedValue({ id: meetingId, groupId }) },
      evidenceFile: { findFirst: jest.fn().mockResolvedValue(null) },
      loanRepayment: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const groupService = { getOrThrow: jest.fn().mockResolvedValue({ id: groupId }) };
    notificationTriggers = {
      contributionReceipt: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributionService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroupService, useValue: groupService },
        { provide: RbacService, useValue: rbac },
        { provide: AuditLogService, useValue: auditLog },
        { provide: LedgerPostingService, useValue: ledgerPosting },
        { provide: NotificationTriggerService, useValue: notificationTriggers },
      ],
    }).compile();
    service = module.get(ContributionService);
  });

  describe('record', () => {
    it('records cash contribution (savings only) and posts ledger + audit', async () => {
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'CASH' as const,
        savingsAmountMinor: 1000,
        socialFundAmountMinor: 0,
        idempotencyKey: 'idem-1',
        recordedByUserId: 'u1',
      };
      const result = await service.record(dto, AuditChannel.WEB);
      expect(result.id).toBe('c1');
      expect(ledgerPosting.post).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantGroupId: groupId,
          sourceEventType: 'CONTRIBUTION_RECORDED',
          transactionMode: 'CASH',
          idempotencyKey: 'contribution:idem-1',
          lines: expect.arrayContaining([
            expect.objectContaining({ fundBucket: 'SAVINGS', memberId, amountMinor: 1000 }),
            expect.objectContaining({ fundBucket: 'SAVINGS', memberId: null, amountMinor: -1000 }),
          ]),
        }),
        AuditChannel.WEB,
      );
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CONTRIBUTION_RECORDED', entityType: 'CONTRIBUTION' }),
      );
      expect(notificationTriggers.contributionReceipt).toHaveBeenCalledWith({
        tenantGroupId: groupId,
        memberId,
        contributionId: 'c1',
        recordType: 'contribution',
      });
    });

    it('returns success when notification trigger fails (no rollback)', async () => {
      notificationTriggers.contributionReceipt.mockRejectedValueOnce(new Error('Notification failed'));
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'CASH' as const,
        savingsAmountMinor: 500,
        socialFundAmountMinor: 0,
        idempotencyKey: 'idem-no-rollback',
        recordedByUserId: 'u1',
      };
      const result = await service.record(dto, AuditChannel.WEB);
      expect(result.id).toBe('c1');
      expect(prisma.contribution.create).toHaveBeenCalled();
      expect(notificationTriggers.contributionReceipt).toHaveBeenCalled();
    });

    it('records bank-transfer contribution (savings + social fund)', async () => {
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'BANK_TRANSFER' as const,
        savingsAmountMinor: 2000,
        socialFundAmountMinor: 500,
        idempotencyKey: 'idem-2',
        recordedByUserId: 'u1',
      };
      await service.record(dto);
      expect(ledgerPosting.post).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionMode: 'BANK_TRANSFER',
          lines: expect.arrayContaining([
            expect.objectContaining({ fundBucket: 'SAVINGS', amountMinor: 2000 }),
            expect.objectContaining({ fundBucket: 'SAVINGS', amountMinor: -2000 }),
            expect.objectContaining({ fundBucket: 'SOCIAL_FUND', amountMinor: 500 }),
            expect.objectContaining({ fundBucket: 'SOCIAL_FUND', amountMinor: -500 }),
          ]),
        }),
        expect.anything(),
      );
    });

    it('records contribution with text ref only', async () => {
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'CASH' as const,
        savingsAmountMinor: 500,
        socialFundAmountMinor: 0,
        externalReferenceText: 'Chq 123',
        idempotencyKey: 'idem-3',
      };
      await service.record(dto);
      expect(prisma.contribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ externalReferenceText: 'Chq 123' }),
        }),
      );
      expect(ledgerPosting.post).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ externalReferenceText: 'Chq 123' }),
        }),
        expect.anything(),
      );
    });

    it('records contribution with image evidence only', async () => {
      prisma.evidenceFile.findFirst.mockResolvedValue({ id: 'ev-1', groupId });
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'CASH' as const,
        savingsAmountMinor: 500,
        socialFundAmountMinor: 0,
        evidenceAttachmentId: 'ev-1',
        idempotencyKey: 'idem-4',
      };
      await service.record(dto);
      expect(prisma.contribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ evidenceFileId: 'ev-1' }),
        }),
      );
    });

    it('records contribution with both text ref and image', async () => {
      prisma.evidenceFile.findFirst.mockResolvedValue({ id: 'ev-2', groupId });
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'BANK_TRANSFER' as const,
        savingsAmountMinor: 100,
        socialFundAmountMinor: 50,
        externalReferenceText: 'Ref 456',
        evidenceAttachmentId: 'ev-2',
        idempotencyKey: 'idem-5',
      };
      await service.record(dto);
      expect(prisma.contribution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            externalReferenceText: 'Ref 456',
            evidenceFileId: 'ev-2',
          }),
        }),
      );
    });

    it('duplicate idempotencyKey returns existing and does not double-post', async () => {
      prisma.contribution.findUnique.mockResolvedValue({ id: 'c-existing', groupId, createdAt: new Date() });
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'CASH' as const,
        savingsAmountMinor: 100,
        socialFundAmountMinor: 0,
        idempotencyKey: 'idem-dup',
      };
      const result = await service.record(dto);
      expect(result.id).toBe('c-existing');
      expect(ledgerPosting.post).not.toHaveBeenCalled();
      expect(prisma.contribution.create).not.toHaveBeenCalled();
    });

    it('rejects when at least one of savings or social fund must be > 0', async () => {
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'CASH' as const,
        savingsAmountMinor: 0,
        socialFundAmountMinor: 0,
        idempotencyKey: 'idem-0',
      };
      await expect(service.record(dto)).rejects.toThrow(ValidationError);
      expect(ledgerPosting.post).not.toHaveBeenCalled();
    });

    it('throws when evidence file not found or wrong group', async () => {
      prisma.evidenceFile.findFirst.mockResolvedValue(null);
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'CASH' as const,
        savingsAmountMinor: 100,
        socialFundAmountMinor: 0,
        evidenceAttachmentId: 'ev-bad',
        idempotencyKey: 'idem-ev',
      };
      await expect(service.record(dto)).rejects.toThrow(EvidenceNotFoundOrWrongGroupError);
    });

    it('throws when evidence file is already linked to another contribution', async () => {
      prisma.evidenceFile.findFirst.mockResolvedValue({ id: 'ev-1', groupId });
      prisma.contribution.findFirst.mockResolvedValue({ id: 'other-contribution' });
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'BANK_TRANSFER' as const,
        savingsAmountMinor: 100,
        socialFundAmountMinor: 0,
        evidenceAttachmentId: 'ev-1',
        idempotencyKey: 'idem-relink',
      };
      await expect(service.record(dto)).rejects.toThrow(ValidationError);
      await expect(service.record(dto)).rejects.toThrow(/already linked to another contribution/);
    });

    it('calls requirePermission for CONTRIBUTION_RECORD when recording', async () => {
      const dto = {
        tenantGroupId: groupId,
        memberProfileId: memberId,
        transactionMode: 'CASH' as const,
        savingsAmountMinor: 100,
        socialFundAmountMinor: 0,
        idempotencyKey: 'idem-rbac',
        actorUserId: 'u1',
      };
      await service.record(dto);
      expect(rbac.requirePermission).toHaveBeenCalledWith(groupId, 'u1', 'contribution.record', {}, undefined);
    });
  });

  describe('recordBulk', () => {
    it('bulk mixed-mode entry posts correct ledger lines', async () => {
      prisma.meeting.findUnique.mockResolvedValue({ id: meetingId, groupId });
      const dto = {
        tenantGroupId: groupId,
        meetingId,
        contributions: [
          { memberProfileId: memberId, transactionMode: 'CASH' as const, savingsAmountMinor: 100, socialFundAmountMinor: 0, idempotencyKey: 'b1' },
          { memberProfileId: 'm2', transactionMode: 'BANK_TRANSFER' as const, savingsAmountMinor: 200, socialFundAmountMinor: 50, idempotencyKey: 'b2' },
        ],
        recordedByUserId: 'u1',
      };
      prisma.member.findFirst.mockResolvedValueOnce({ id: memberId, groupId, status: 'ACTIVE' }).mockResolvedValueOnce({ id: 'm2', groupId, status: 'ACTIVE' });
      const result = await service.recordBulk(dto);
      expect(result.recorded).toBe(2);
      expect(result.ids).toHaveLength(2);
      expect(ledgerPosting.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('reversal', () => {
    it('calls requirePermission for CONTRIBUTION_REVERSE', async () => {
      const contrib = { id: 'c1', groupId, status: 'RECORDED', ledgerEventId: 'lev-1' };
      prisma.contribution.findUnique.mockResolvedValue(contrib);
      const dto = {
        tenantGroupId: groupId,
        contributionId: 'c1',
        actorUserId: 'u1',
      };
      await service.reversal(dto);
      expect(rbac.requirePermission).toHaveBeenCalledWith(groupId, 'u1', 'contribution.reverse', {}, undefined);
    });

    it('creates reversing ledger event and audit event', async () => {
      const contrib = {
        id: 'c1',
        groupId,
        status: 'RECORDED',
        ledgerEventId: 'lev-1',
      };
      prisma.contribution.findUnique.mockResolvedValue(contrib);
      const dto = {
        tenantGroupId: groupId,
        contributionId: 'c1',
        reversalReason: 'Duplicate entry',
        reversedByUserId: 'u1',
      };
      const result = await service.reversal(dto);
      expect(result.id).toBe('c1');
      expect(ledgerPosting.reversal).toHaveBeenCalledWith(
        expect.objectContaining({
          ledgerEventId: 'lev-1',
          tenantGroupId: groupId,
          sourceEventId: 'reversal:c1',
        }),
        expect.anything(),
      );
      expect(prisma.contribution.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c1' },
          data: expect.objectContaining({ status: 'REVERSED', reversalReason: 'Duplicate entry' }),
        }),
      );
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CONTRIBUTION_REVERSED', entityType: 'CONTRIBUTION' }),
      );
    });

    it('throws when contribution not found', async () => {
      prisma.contribution.findUnique.mockResolvedValue(null);
      await expect(
        service.reversal({ tenantGroupId: groupId, contributionId: 'missing', reversedByUserId: 'u1' }),
      ).rejects.toThrow(ContributionNotFoundError);
    });

    it('throws when contribution already reversed', async () => {
      prisma.contribution.findUnique.mockResolvedValue({ id: 'c1', groupId, status: 'REVERSED', ledgerEventId: 'lev-1' });
      await expect(
        service.reversal({ tenantGroupId: groupId, contributionId: 'c1', reversedByUserId: 'u1' }),
      ).rejects.toThrow(ContributionAlreadyReversedError);
    });
  });

  describe('getById', () => {
    it('returns detail with evidence metadata', async () => {
      prisma.contribution.findFirst.mockResolvedValue({
        id: 'c1',
        groupId,
        memberId,
        meetingId,
        transactionMode: 'CASH',
        savingsAmountMinor: 1000,
        socialFundAmountMinor: 0,
        totalAmountMinor: 1000,
        externalReferenceText: 'Ref',
        evidenceFileId: 'ev-1',
        status: 'RECORDED',
        recordedByUserId: 'u1',
        recordedAt: new Date(),
        reversedByUserId: null,
        reversedAt: null,
        reversalReason: null,
        ledgerEventId: 'lev-1',
        idempotencyKey: 'idem-1',
        createdAt: new Date(),
      });
      const result = await service.getById('c1', groupId);
      expect(result).not.toBeNull();
      expect(result!.evidenceAttachmentId).toBe('ev-1');
      expect(result!.externalReferenceText).toBe('Ref');
    });
  });
});
