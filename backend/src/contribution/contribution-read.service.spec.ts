import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { AuditLogService } from '../audit/audit-log.service';
import { ContributionReadService } from './contribution-read.service';

describe('ContributionReadService', () => {
  let service: ContributionReadService;
  let prisma: {
    meeting: { findFirst: jest.Mock };
    contribution: { findMany: jest.Mock };
    member: { findFirst: jest.Mock };
  };
  let auditLog: { append: jest.Mock };
  const groupId = 'g1';
  const meetingId = 'mtg1';
  const memberId = 'm1';

  const mockContribution = (overrides: Partial<{
    id: string;
    groupId: string;
    meetingId: string | null;
    memberId: string;
    transactionMode: string | null;
    savingsAmountMinor: number | null;
    socialFundAmountMinor: number | null;
    totalAmountMinor: number | null;
    externalReferenceText: string | null;
    evidenceFileId: string | null;
    ledgerEventId: string | null;
    status: string;
    recordedAt: Date | null;
    createdAt: Date;
  }> = {}) => ({
    id: 'c1',
    groupId,
    meetingId,
    memberId,
    transactionMode: 'CASH',
    savingsAmountMinor: 1000,
    socialFundAmountMinor: 200,
    totalAmountMinor: 1200,
    externalReferenceText: 'Ref secret',
    evidenceFileId: null,
    ledgerEventId: 'lev-1',
    status: 'RECORDED',
    recordedAt: new Date('2025-03-01T12:00:00Z'),
    createdAt: new Date('2025-03-01T12:00:00Z'),
    meeting: { id: meetingId, name: 'March 2025', groupId, heldAt: new Date('2025-03-01') },
    evidenceFile: null,
    ...overrides,
  });

  beforeEach(async () => {
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    prisma = {
      meeting: { findFirst: jest.fn().mockResolvedValue({ id: meetingId, groupId, heldAt: new Date('2025-03-01'), name: 'March 2025' }) },
      contribution: { findMany: jest.fn().mockResolvedValue([]) },
      member: { findFirst: jest.fn().mockResolvedValue({ id: memberId, groupId, status: 'ACTIVE' }) },
    };
    const groupService = { getOrThrow: jest.fn().mockResolvedValue({ id: groupId }) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributionReadService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroupService, useValue: groupService },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(ContributionReadService);
  });

  describe('getMeetingSummary', () => {
    it('returns null when meeting not in tenant', async () => {
      prisma.meeting.findFirst.mockResolvedValue(null);
      const result = await service.getMeetingSummary(groupId, meetingId);
      expect(result).toBeNull();
      expect(prisma.contribution.findMany).not.toHaveBeenCalled();
    });

    it('returns summary with SOCIAL_FUND and SAVINGS totals separate', async () => {
      const c1 = mockContribution({ savingsAmountMinor: 1000, socialFundAmountMinor: 200 });
      const c2 = mockContribution({ id: 'c2', savingsAmountMinor: 500, socialFundAmountMinor: 0 });
      prisma.contribution.findMany.mockResolvedValue([c1, c2]);
      const result = await service.getMeetingSummary(groupId, meetingId);
      expect(result).not.toBeNull();
      expect(result!.totalSavingsMinor).toBe(1500);
      expect(result!.totalSocialFundMinor).toBe(200);
      expect(result!.totalAmountMinor).toBe(1700);
      expect(result!.byMode.CASH.count).toBe(2);
      expect(result!.contributions).toHaveLength(2);
    });

    it('filters by transactionMode when provided', async () => {
      await service.getMeetingSummary(groupId, meetingId, { transactionMode: 'BANK_TRANSFER' });
      expect(prisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ groupId, meetingId, transactionMode: 'BANK_TRANSFER' }),
        }),
      );
    });

    it('filters by fundBucket when provided', async () => {
      await service.getMeetingSummary(groupId, meetingId, { fundBucket: 'SOCIAL_FUND' });
      expect(prisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ socialFundAmountMinor: { gt: 0 } }),
        }),
      );
    });

    it('filters by dateFrom and dateTo', async () => {
      await service.getMeetingSummary(groupId, meetingId, { dateFrom: '2025-03-01', dateTo: '2025-03-31' });
      expect(prisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            recordedAt: {
              gte: new Date('2025-03-01T00:00:00.000Z'),
              lte: new Date('2025-03-31T23:59:59.999Z'),
            },
          }),
        }),
      );
    });

    it('hides externalReferenceText when includeSensitiveFields is false', async () => {
      prisma.contribution.findMany.mockResolvedValue([mockContribution()]);
      const result = await service.getMeetingSummary(groupId, meetingId, {}, { includeSensitiveFields: false });
      expect(result!.contributions[0].externalReferenceText).toBeUndefined();
    });

    it('includes externalReferenceText when includeSensitiveFields is true', async () => {
      prisma.contribution.findMany.mockResolvedValue([mockContribution()]);
      const result = await service.getMeetingSummary(groupId, meetingId, {}, { includeSensitiveFields: true });
      expect(result!.contributions[0].externalReferenceText).toBe('Ref secret');
    });

    it('includes evidence presence and ledger linkage', async () => {
      prisma.contribution.findMany.mockResolvedValue([
        mockContribution({ evidenceFileId: 'ev-1', externalReferenceText: 'Text' }),
      ]);
      const result = await service.getMeetingSummary(groupId, meetingId);
      expect(result!.contributions[0].evidencePresence).toEqual({
        hasText: true,
        hasImage: true,
        evidenceAttachmentId: 'ev-1',
      });
      expect(result!.contributions[0].ledgerEventId).toBe('lev-1');
    });
  });

  describe('getMemberHistory', () => {
    it('returns null when member not in tenant', async () => {
      prisma.member.findFirst.mockResolvedValue(null);
      const result = await service.getMemberHistory(groupId, memberId);
      expect(result).toBeNull();
    });

    it('returns history with SAVINGS and SOCIAL_FUND totals separate', async () => {
      prisma.contribution.findMany.mockResolvedValue([
        mockContribution({ savingsAmountMinor: 1000, socialFundAmountMinor: 100 }),
        mockContribution({ id: 'c2', savingsAmountMinor: 500, socialFundAmountMinor: 50 }),
      ]);
      const result = await service.getMemberHistory(groupId, memberId);
      expect(result).not.toBeNull();
      expect(result!.totalSavingsMinor).toBe(1500);
      expect(result!.totalSocialFundMinor).toBe(150);
    });

    it('enforces tenant isolation', async () => {
      await service.getMemberHistory(groupId, memberId);
      expect(prisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ groupId, memberId }),
        }),
      );
    });
  });

  describe('getUnreconciledBankTransfers', () => {
    it('returns only BANK_TRANSFER RECORDED contributions', async () => {
      await service.getUnreconciledBankTransfers(groupId);
      expect(prisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            groupId,
            transactionMode: 'BANK_TRANSFER',
            status: 'RECORDED',
          }),
        }),
      );
    });

    it('emits audit when auditExport is true', async () => {
      prisma.contribution.findMany.mockResolvedValue([mockContribution({ transactionMode: 'BANK_TRANSFER' })]);
      await service.getUnreconciledBankTransfers(groupId, {}, {
        actorUserId: 'u1',
        auditExport: true,
      });
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CONTRIBUTION_REPORT_READ',
          entityType: 'CONTRIBUTION_REPORT',
          afterSnapshot: expect.objectContaining({ reportType: 'unreconciled_bank_transfers', count: 1 }),
        }),
      );
    });
  });

  describe('getCashTotalsByMeetingOrDate', () => {
    it('groups by meeting and reports SAVINGS and SOCIAL_FUND separately', async () => {
      prisma.contribution.findMany.mockResolvedValue([
        mockContribution({ meetingId, savingsAmountMinor: 1000, socialFundAmountMinor: 100 }),
        mockContribution({ id: 'c2', meetingId, savingsAmountMinor: 500, socialFundAmountMinor: 0 }),
      ]);
      const result = await service.getCashTotalsByMeetingOrDate(groupId, 'meeting');
      expect(result).toHaveLength(1);
      expect(result[0].totalSavingsMinor).toBe(1500);
      expect(result[0].totalSocialFundMinor).toBe(100);
      expect(result[0].totalAmountMinor).toBe(1600);
      expect(result[0].isMeeting).toBe(true);
      expect(result[0].meetingId).toBe(meetingId);
    });

    it('filters by transaction mode (CASH only)', async () => {
      await service.getCashTotalsByMeetingOrDate(groupId, 'date', { transactionMode: 'CASH' });
      expect(prisma.contribution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ transactionMode: 'CASH', status: 'RECORDED' }),
        }),
      );
    });
  });
});
