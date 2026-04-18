import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { EntityTraceService } from './entity-trace.service';

describe('EntityTraceService', () => {
  let service: EntityTraceService;
  let prisma: {
    contribution: { findFirst: jest.Mock };
    auditLog: { findMany: jest.Mock };
    ledgerEvent: { findUnique: jest.Mock; findMany: jest.Mock };
    notification: { findMany: jest.Mock };
    loan: { findFirst: jest.Mock };
    evidenceFile: { findMany: jest.Mock };
  };

  const tenantGroupId = 'g1';
  const contributionId = 'c1';
  const loanId = 'loan1';

  beforeEach(async () => {
    const contributionRow = {
      id: contributionId,
      groupId: tenantGroupId,
      memberId: 'm1',
      meetingId: 'mtg1',
      status: 'RECORDED',
      totalAmountMinor: 5000,
      ledgerEventId: 'lev1',
      evidenceFileId: 'ev1',
      createdAt: new Date(),
      evidenceFile: { id: 'ev1', storedPath: '/path', mimeType: 'image/png', sizeBytes: 100 },
    };
    prisma = {
      contribution: { findFirst: jest.fn().mockResolvedValue(contributionRow) },
      auditLog: {
        findMany: jest.fn()
          .mockResolvedValueOnce([{ id: 'a1', action: 'CONTRIBUTION_RECORDED', entityType: 'CONTRIBUTION', entityId: contributionId, sequenceNo: 1, createdAt: new Date() }])
          .mockResolvedValueOnce([]),
      },
      ledgerEvent: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'lev1',
          sourceEventType: 'CONTRIBUTION_RECORDED',
          sourceEventId: contributionId,
          eventTimestamp: new Date(),
          lines: [{ ledgerEventId: 'lev1', fundBucket: 'SAVINGS', memberId: 'm1', amountMinor: 5000 }],
        }),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      notification: { findMany: jest.fn().mockResolvedValue([{ id: 'n1', channel: 'SMS', templateKey: 'receipt_confirmation', status: 'SENT', createdAt: new Date() }]) },
      loan: { findFirst: jest.fn().mockResolvedValue(null) },
      evidenceFile: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityTraceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(EntityTraceService);
  });

  describe('getContributionTrace', () => {
    it('returns linked records: entity, auditEvents, ledgerEvents, ledgerLines, evidenceMetadata, notifications', async () => {
      const trace = await service.getContributionTrace(contributionId, tenantGroupId);
      expect(trace.entityType).toBe('CONTRIBUTION');
      expect(trace.entity).toBeDefined();
      expect((trace.entity as Record<string, unknown>).id).toBe(contributionId);
      expect(trace.auditEvents).toHaveLength(1);
      expect(trace.auditEvents[0].action).toBe('CONTRIBUTION_RECORDED');
      expect(trace.ledgerEvents).toHaveLength(1);
      expect(trace.ledgerEvents[0].sourceEventId).toBe(contributionId);
      expect(trace.ledgerLines).toHaveLength(1);
      expect(trace.ledgerLines[0].amountMinor).toBe(5000);
      expect(trace.evidenceMetadata).toHaveLength(1);
      expect(trace.evidenceMetadata[0].storedPath).toBe('/path');
      expect(trace.notifications).toHaveLength(1);
      expect(trace.notifications[0].templateKey).toBe('receipt_confirmation');
    });

    it('throws NotFoundException when contribution not found', async () => {
      prisma.contribution.findFirst.mockResolvedValue(null);
      await expect(service.getContributionTrace(contributionId, tenantGroupId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLoanTrace', () => {
    beforeEach(() => {
      const loanRow = {
        id: loanId,
        groupId: tenantGroupId,
        borrowerId: 'm1',
        principalAmountMinor: 10000,
        state: 'DISBURSED',
        approvedAt: new Date(),
        disbursementRecordedAt: new Date(),
        applicationId: 'app1',
        scheduleItems: [{ id: 's1', installmentNo: 1, dueDate: new Date(), principalDueMinor: 1000, interestDueMinor: 0, totalDueMinor: 1000, status: 'PENDING' }],
        repayments: [{ id: 'r1', amountMinor: 1000, principalMinor: 1000, interestMinor: 0, recordedAt: new Date(), ledgerEventId: 'levR1', evidenceFileId: null }],
        application: {},
      };
      prisma.loan.findFirst.mockResolvedValue(loanRow);
      prisma.auditLog.findMany.mockResolvedValue([{ id: 'a1', action: 'LOAN_APPLICATION_SUBMITTED', entityType: 'LOAN_APPLICATION', entityId: 'app1', sequenceNo: 1, createdAt: new Date() }]);
      prisma.ledgerEvent.findFirst.mockResolvedValue({
        id: 'levD',
        sourceEventType: 'LOAN_DISBURSEMENT_RECORDED',
        sourceEventId: loanId,
        eventTimestamp: new Date(),
        lines: [],
      });
      prisma.ledgerEvent.findMany.mockResolvedValue([
        { id: 'levR1', sourceEventType: 'LOAN_REPAYMENT_RECORDED', sourceEventId: 'r1', eventTimestamp: new Date(), lines: [{ ledgerEventId: 'levR1', fundBucket: 'SAVINGS', memberId: 'm1', amountMinor: 1000 }] },
      ]);
      prisma.notification.findMany.mockResolvedValue([]);
    });

    it('returns linked records: entity, scheduleItems, repayments, auditEvents, ledgerEvents, ledgerLines, evidenceMetadata, notifications', async () => {
      const trace = await service.getLoanTrace(loanId, tenantGroupId);
      expect(trace.entityType).toBe('LOAN');
      expect(trace.entity).toBeDefined();
      expect((trace.entity as Record<string, unknown>).id).toBe(loanId);
      expect(trace.scheduleItems).toHaveLength(1);
      expect(trace.repayments).toHaveLength(1);
      expect(trace.auditEvents).toHaveLength(1);
      expect(trace.ledgerEvents.length).toBeGreaterThanOrEqual(1);
      expect(trace.ledgerLines).toBeDefined();
      expect(trace.evidenceMetadata).toBeDefined();
      expect(trace.notifications).toBeDefined();
    });

    it('throws NotFoundException when loan not found', async () => {
      prisma.loan.findFirst.mockResolvedValue(null);
      await expect(service.getLoanTrace(loanId, tenantGroupId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTrace', () => {
    it('delegates to getContributionTrace for CONTRIBUTION', async () => {
      const trace = await service.getTrace('CONTRIBUTION', contributionId, tenantGroupId);
      expect(trace.entityType).toBe('CONTRIBUTION');
    });

    it('delegates to getLoanTrace for LOAN', async () => {
      prisma.loan.findFirst.mockResolvedValue({
        id: loanId,
        groupId: tenantGroupId,
        borrowerId: 'm1',
        principalAmountMinor: 10000,
        state: 'APPROVED',
        approvedAt: new Date(),
        disbursementRecordedAt: null,
        applicationId: null,
        scheduleItems: [],
        repayments: [],
        application: null,
      });
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.ledgerEvent.findFirst.mockResolvedValue(null);
      prisma.ledgerEvent.findMany.mockResolvedValue([]);
      prisma.notification.findMany.mockResolvedValue([]);
      const trace = await service.getTrace('LOAN', loanId, tenantGroupId);
      expect(trace.entityType).toBe('LOAN');
    });
  });
});
