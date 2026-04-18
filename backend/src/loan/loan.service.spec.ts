import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { GroupRulesService } from '../group-rules/group-rules.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { LedgerPostingService } from '../ledger/ledger-posting.service';
import { LoanApplicationService } from './loan-application.service';
import { LoanApprovalService } from './loan-approval.service';
import { NotificationTriggerService } from '../notifications/notification-trigger.service';
import { LoanDisbursementService } from './loan-disbursement.service';
import { LoanRepaymentService } from './loan-repayment.service';
import { LoanWaiverService } from './loan-waiver.service';
import { LoanRescheduleService } from './loan-reschedule.service';
import { LoanWriteOffService } from './loan-writeoff.service';
import { allocateRepayment } from './loan-repayment.service';
import { generateSchedule } from './loan-schedule.service';

const groupId = 'g1';
const memberId = 'm1';
const userId = 'u1';

describe('LoanScheduleService', () => {
  it('generates zero-interest schedule when interest disabled', () => {
    const snapshot = {
      ruleVersionId: 'rv1',
      groupId,
      effectiveFrom: new Date(),
      loanInterestEnabled: false,
      loanInterestRateBps: 500,
      loanInterestBasis: 'FLAT' as const,
      penaltyEnabled: false,
      penaltyRule: null,
      socialFundEnabled: true,
      smsNotificationsEnabled: false,
    };
    const lines = generateSchedule(10000, 2, snapshot, new Date('2025-03-01'));
    expect(lines).toHaveLength(2);
    expect(lines[0].interestDueMinor).toBe(0);
    expect(lines[1].interestDueMinor).toBe(0);
    expect(lines[0].principalDueMinor + lines[1].principalDueMinor).toBe(10000);
  });

  it('generates interest schedule when interest enabled', () => {
    const snapshot = {
      ruleVersionId: 'rv1',
      groupId,
      effectiveFrom: new Date(),
      loanInterestEnabled: true,
      loanInterestRateBps: 500,
      loanInterestBasis: 'FLAT' as const,
      penaltyEnabled: false,
      penaltyRule: null,
      socialFundEnabled: true,
      smsNotificationsEnabled: false,
    };
    const lines = generateSchedule(10000, 2, snapshot, new Date('2025-03-01'));
    expect(lines).toHaveLength(2);
    expect(lines[0].interestDueMinor + lines[1].interestDueMinor).toBeGreaterThan(0);
    expect(lines[0].principalDueMinor + lines[1].principalDueMinor).toBe(10000);
  });
});

describe('allocateRepayment', () => {
  it('allocates penalty then interest then principal', () => {
    const items = [
      { installmentNo: 1, principalDueMinor: 5000, interestDueMinor: 100, penaltyDueMinor: 50, paidPrincipalMinor: 0, paidInterestMinor: 0, paidPenaltyMinor: 0, status: 'DUE' },
    ];
    const result = allocateRepayment(200, items);
    expect(result.penaltyMinor).toBe(50);
    expect(result.interestMinor).toBe(100);
    expect(result.principalMinor).toBe(50);
    expect(result.applied).toBe(200);
  });
});

describe('LoanApplicationService', () => {
  let service: LoanApplicationService;
  let prisma: { loanApplication: { create: jest.Mock }; member: { findFirst: jest.Mock } };
  let auditLog: { append: jest.Mock };
  let rbac: { requirePermission: jest.Mock };
  let notificationTriggers: { approvalRequired: jest.Mock };

  beforeEach(async () => {
    prisma = {
      loanApplication: { create: jest.fn().mockResolvedValue({ id: 'app-1' }) },
      member: { findFirst: jest.fn().mockResolvedValue({ id: memberId, groupId, displayName: 'Jane Doe' }) },
    };
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    rbac = { requirePermission: jest.fn().mockResolvedValue(undefined) };
    notificationTriggers = { approvalRequired: jest.fn().mockResolvedValue(undefined) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanApplicationService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroupService, useValue: { getOrThrow: jest.fn().mockResolvedValue({ id: groupId }) } },
        { provide: RbacService, useValue: rbac },
        { provide: AuditLogService, useValue: auditLog },
        { provide: NotificationTriggerService, useValue: notificationTriggers },
      ],
    }).compile();
    service = module.get(LoanApplicationService);
  });

  it('submits application and emits audit', async () => {
    const result = await service.submit({
      tenantGroupId: groupId,
      memberProfileId: memberId,
      requestedAmountMinor: 10000,
      requestedTermPeriods: 12,
      submittedByUserId: userId,
    });
    expect(result.id).toBe('app-1');
    expect(rbac.requirePermission).toHaveBeenCalledWith(groupId, null, 'loan.apply', {}, undefined);
    expect(auditLog.append).toHaveBeenCalledWith(expect.objectContaining({ action: 'LOAN_APPLICATION_SUBMITTED' }));
  });

  it('triggers approval-required notification for approvers', async () => {
    await service.submit({
      tenantGroupId: groupId,
      memberProfileId: memberId,
      requestedAmountMinor: 10000,
      requestedTermPeriods: 12,
      submittedByUserId: userId,
    });
    expect(notificationTriggers.approvalRequired).toHaveBeenCalledWith({
      tenantGroupId: groupId,
      applicationId: 'app-1',
      memberDisplayName: 'Jane Doe',
      requestedAmountMinor: 10000,
    });
  });
});

describe('LoanApprovalService', () => {
  let service: LoanApprovalService;
  let prisma: { loanApplication: { findUnique: jest.Mock; update: jest.Mock }; loan: { create: jest.Mock } };
  let groupRules: { getSnapshotForLoan: jest.Mock };
  let auditLog: { append: jest.Mock };
  let rbac: { requirePermission: jest.Mock };
  let notificationTriggers: { approvalDecision: jest.Mock };

  beforeEach(async () => {
    const snapshot = {
      ruleVersionId: 'rv1',
      groupId,
      effectiveFrom: new Date(),
      loanInterestEnabled: true,
      loanInterestRateBps: 500,
      loanInterestBasis: 'FLAT' as const,
      penaltyEnabled: false,
      penaltyRule: null,
      socialFundEnabled: true,
      smsNotificationsEnabled: false,
    };
    groupRules = { getSnapshotForLoan: jest.fn().mockResolvedValue(snapshot) };
    prisma = {
      loanApplication: {
        findUnique: jest.fn().mockResolvedValue({ id: 'app-1', groupId, memberId, requestedAmountMinor: 10000, requestedTermPeriods: 2, status: 'SUBMITTED' }),
        update: jest.fn().mockResolvedValue({}),
      },
      loan: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({
          id: 'loan-1',
          ...args.data,
          scheduleItems: args.data.scheduleItems?.create ?? [],
        })),
      },
    };
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    rbac = { requirePermission: jest.fn().mockResolvedValue(undefined) };
    notificationTriggers = { approvalDecision: jest.fn().mockResolvedValue(undefined) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanApprovalService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroupService, useValue: { getOrThrow: jest.fn().mockResolvedValue({ id: groupId }) } },
        { provide: GroupRulesService, useValue: groupRules },
        { provide: RbacService, useValue: rbac },
        { provide: AuditLogService, useValue: auditLog },
        { provide: NotificationTriggerService, useValue: notificationTriggers },
      ],
    }).compile();
    service = module.get(LoanApprovalService);
  });

  it('approves and creates loan with rule snapshot and schedule', async () => {
    const result = await service.approve({
      applicationId: 'app-1',
      tenantGroupId: groupId,
      approvedByUserId: userId,
    });
    expect(result.loanId).toBe('loan-1');
    expect(groupRules.getSnapshotForLoan).toHaveBeenCalledWith(groupId, expect.any(Date));
    expect(prisma.loan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          interestEnabledSnapshot: true,
          interestRateBpsSnapshot: 500,
          ruleVersionIdSnapshot: 'rv1',
          scheduleItems: expect.objectContaining({
            create: expect.any(Array),
          }),
        }),
      }),
    );
    expect(auditLog.append).toHaveBeenCalledWith(expect.objectContaining({ action: 'LOAN_APPLICATION_APPROVED' }));
    expect(notificationTriggers.approvalDecision).toHaveBeenCalledWith({
      tenantGroupId: groupId,
      memberId,
      applicationId: 'app-1',
      approved: true,
    });
  });

  it('returns loanId when notification trigger fails (no rollback)', async () => {
    notificationTriggers.approvalDecision.mockRejectedValueOnce(new Error('Notification failed'));
    const result = await service.approve({
      applicationId: 'app-1',
      tenantGroupId: groupId,
      approvedByUserId: userId,
    });
    expect(result.loanId).toBe('loan-1');
    expect(prisma.loan.create).toHaveBeenCalled();
  });

  it('reject triggers approval-decision notification with approved false', async () => {
    await service.reject('app-1', groupId, userId);
    expect(prisma.loanApplication.update).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: { status: 'REJECTED' },
    });
    expect(notificationTriggers.approvalDecision).toHaveBeenCalledWith({
      tenantGroupId: groupId,
      memberId,
      applicationId: 'app-1',
      approved: false,
    });
  });

  it('generates zero-interest schedule when snapshot has interest disabled', async () => {
    groupRules.getSnapshotForLoan.mockResolvedValue({
      ruleVersionId: 'rv1',
      groupId,
      effectiveFrom: new Date(),
      loanInterestEnabled: false,
      loanInterestRateBps: 0,
      loanInterestBasis: 'FLAT' as const,
      penaltyEnabled: false,
      penaltyRule: null,
      socialFundEnabled: true,
      smsNotificationsEnabled: false,
    });
    await service.approve({ applicationId: 'app-1', tenantGroupId: groupId, approvedByUserId: userId });
    const createCall = prisma.loan.create.mock.calls[0][0];
    const scheduleCreate = createCall.data.scheduleItems.create;
    expect(scheduleCreate.every((s: { interestDueMinor: number }) => s.interestDueMinor === 0)).toBe(true);
  });
});

describe('LoanDisbursementService', () => {
  let service: LoanDisbursementService;
  let ledgerPosting: { post: jest.Mock };
  let auditLog: { append: jest.Mock };

  beforeEach(async () => {
    ledgerPosting = { post: jest.fn().mockResolvedValue({ ledgerEventId: 'lev-1' }) };
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    const loanFind = { id: 'loan-1', groupId, borrowerId: memberId, principalAmountMinor: 10000, state: 'APPROVED' };
    const prisma = {
      loan: {
        findUnique: jest.fn().mockResolvedValue(loanFind),
        update: jest.fn().mockResolvedValue({}),
      },
      evidenceFile: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanDisbursementService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroupService, useValue: { getOrThrow: jest.fn() } },
        { provide: RbacService, useValue: { requirePermission: jest.fn().mockResolvedValue(undefined) } },
        { provide: AuditLogService, useValue: auditLog },
        { provide: LedgerPostingService, useValue: ledgerPosting },
      ],
    }).compile();
    service = module.get(LoanDisbursementService);
  });

  it('records cash disbursement with text reference and posts ledger', async () => {
    const result = await service.recordDisbursement({
      loanId: 'loan-1',
      tenantGroupId: groupId,
      transactionMode: 'CASH',
      externalReferenceText: 'Cash ref',
      recordedByUserId: userId,
    });
    expect(result.id).toBe('loan-1');
    expect(ledgerPosting.post).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceEventType: 'LOAN_DISBURSEMENT_RECORDED',
        transactionMode: 'CASH',
        lines: expect.arrayContaining([
          expect.objectContaining({ fundBucket: 'LOAN_PRINCIPAL', memberId, amountMinor: 10000 }),
          expect.objectContaining({ fundBucket: 'LOAN_PRINCIPAL', memberId: null, amountMinor: -10000 }),
        ]),
        metadata: expect.objectContaining({ externalReferenceText: 'Cash ref' }),
      }),
      undefined,
    );
    expect(auditLog.append).toHaveBeenCalledWith(expect.objectContaining({ action: 'LOAN_DISBURSEMENT_RECORDED' }));
  });
});

describe('LoanRepaymentService', () => {
  let service: LoanRepaymentService;
  let prisma: any;
  let ledgerPosting: { post: jest.Mock };
  let auditLog: { append: jest.Mock };

  beforeEach(async () => {
    ledgerPosting = { post: jest.fn().mockResolvedValue({ ledgerEventId: 'lev-1' }) };
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    prisma = {
      loan: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'loan-1',
          groupId,
          borrowerId: memberId,
          state: 'ACTIVE',
          scheduleItems: [
            { id: 'si1', installmentNo: 1, principalDueMinor: 5000, interestDueMinor: 100, penaltyDueMinor: 0, paidPrincipalMinor: 0, paidInterestMinor: 0, paidPenaltyMinor: 0, status: 'DUE', totalDueMinor: 5100 },
          ],
          borrower: { id: memberId },
        }),
      },
      loanRepayment: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 'rep-1', createdAt: new Date() }) },
      loanScheduleItem: { findMany: jest.fn().mockResolvedValue([{ id: 'si1', installmentNo: 1, principalDueMinor: 5000, interestDueMinor: 100, penaltyDueMinor: 0, paidPrincipalMinor: 0, paidInterestMinor: 0, paidPenaltyMinor: 0, status: 'DUE', totalDueMinor: 5100 }]), update: jest.fn().mockResolvedValue({}) },
      evidenceFile: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanRepaymentService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroupService, useValue: { getOrThrow: jest.fn() } },
        { provide: RbacService, useValue: { requirePermission: jest.fn().mockResolvedValue(undefined) } },
        { provide: AuditLogService, useValue: auditLog },
        { provide: LedgerPostingService, useValue: ledgerPosting },
      ],
    }).compile();
    service = module.get(LoanRepaymentService);
  });

  it('records repayment and posts ledger with principal and interest split', async () => {
    const result = await service.recordRepayment({
      loanId: 'loan-1',
      tenantGroupId: groupId,
      transactionMode: 'BANK_TRANSFER',
      amountMinor: 5100,
      evidenceAttachmentId: 'ev-1',
      recordedByUserId: userId,
      idempotencyKey: 'rep-1',
    });
    expect(result.id).toBe('rep-1');
    expect(ledgerPosting.post).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceEventType: 'LOAN_REPAYMENT_RECORDED',
        lines: expect.any(Array),
        metadata: expect.objectContaining({
          principalMinor: expect.any(Number),
          interestMinor: expect.any(Number),
        }),
      }),
      undefined,
    );
    expect(auditLog.append).toHaveBeenCalledWith(expect.objectContaining({ action: 'LOAN_REPAYMENT_RECORDED' }));
  });

  it('duplicate idempotencyKey returns existing and does not double-post', async () => {
    prisma.loanRepayment.findUnique.mockResolvedValue({ id: 'rep-existing', groupId, createdAt: new Date() });
    const result = await service.recordRepayment({
      loanId: 'loan-1',
      tenantGroupId: groupId,
      transactionMode: 'CASH',
      amountMinor: 5100,
      recordedByUserId: userId,
      idempotencyKey: 'rep-dup',
    });
    expect(result.id).toBe('rep-existing');
    expect(ledgerPosting.post).not.toHaveBeenCalled();
    expect(prisma.loanRepayment.create).not.toHaveBeenCalled();
  });
});

describe('LoanWaiverService', () => {
  let service: LoanWaiverService;
  let prisma: any;
  let auditLog: { append: jest.Mock };
  let rbac: { requirePermission: jest.Mock };

  beforeEach(async () => {
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    rbac = { requirePermission: jest.fn().mockResolvedValue(undefined) };
    prisma = {
      loan: { findUnique: jest.fn().mockResolvedValue({ id: 'loan-1', groupId, state: 'ACTIVE', scheduleItems: [{ id: 'si1', supersededByRescheduleEventId: null }] }) },
      loanWaiverEvent: { create: jest.fn().mockResolvedValue({ id: 'waiver-1' }) },
      loanScheduleItem: { update: jest.fn().mockResolvedValue({}) },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanWaiverService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroupService, useValue: { getOrThrow: jest.fn() } },
        { provide: RbacService, useValue: rbac },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(LoanWaiverService);
  });

  it('records waiver and emits audit', async () => {
    const result = await service.recordWaiver({
      loanId: 'loan-1',
      tenantGroupId: groupId,
      reason: 'Goodwill waiver',
      approvedByUserId: userId,
      amountMinorWaived: 100,
    });
    expect(result.id).toBe('waiver-1');
    expect(rbac.requirePermission).toHaveBeenCalledWith(groupId, null, 'loan.waive', {}, undefined);
    expect(auditLog.append).toHaveBeenCalledWith(expect.objectContaining({ action: 'LOAN_WAIVER_RECORDED', entityType: 'LOAN_WAIVER_EVENT' }));
  });

  it('unauthorized waiver is blocked', async () => {
    rbac.requirePermission.mockRejectedValue(new Error('Forbidden'));
    await expect(
      service.recordWaiver({
        loanId: 'loan-1',
        tenantGroupId: groupId,
        reason: 'R',
        approvedByUserId: userId,
        amountMinorWaived: 0,
      }),
    ).rejects.toThrow('Forbidden');
    expect(prisma.loanWaiverEvent.create).not.toHaveBeenCalled();
  });
});

describe('LoanRescheduleService', () => {
  let service: LoanRescheduleService;
  let prisma: any;
  let auditLog: { append: jest.Mock };
  let rbac: { requirePermission: jest.Mock };

  beforeEach(async () => {
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    rbac = { requirePermission: jest.fn().mockResolvedValue(undefined) };
    const scheduleItems = [
      { id: 'si1', installmentNo: 1, principalDueMinor: 5000, interestDueMinor: 100, penaltyDueMinor: 0, paidPrincipalMinor: 0, paidInterestMinor: 0, paidPenaltyMinor: 0, supersededByRescheduleEventId: null },
      { id: 'si2', installmentNo: 2, principalDueMinor: 5000, interestDueMinor: 100, penaltyDueMinor: 0, paidPrincipalMinor: 0, paidInterestMinor: 0, paidPenaltyMinor: 0, supersededByRescheduleEventId: null },
    ];
    prisma = {
      loan: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'loan-1',
          groupId,
          state: 'ACTIVE',
          termPeriods: 2,
          interestEnabledSnapshot: false,
          interestRateBpsSnapshot: 0,
          interestBasisSnapshot: 'FLAT',
          ruleVersionIdSnapshot: 'rv1',
          approvedAt: new Date(),
          scheduleItems,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      loanRescheduleEvent: { create: jest.fn().mockResolvedValue({ id: 'reschedule-1' }) },
      loanScheduleItem: { updateMany: jest.fn().mockResolvedValue({ count: 2 }), createMany: jest.fn().mockResolvedValue({ count: 2 }) },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanRescheduleService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroupService, useValue: { getOrThrow: jest.fn() } },
        { provide: RbacService, useValue: rbac },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(LoanRescheduleService);
  });

  it('records reschedule, marks prior schedule superseded, and emits audit', async () => {
    const result = await service.recordReschedule({
      loanId: 'loan-1',
      tenantGroupId: groupId,
      reason: 'Extension agreed',
      approvedByUserId: userId,
      newTermPeriods: 2,
      firstDueDate: new Date('2025-06-01'),
    });
    expect(result.id).toBe('reschedule-1');
    expect(rbac.requirePermission).toHaveBeenCalledWith(groupId, null, 'loan.reschedule', {}, undefined);
    expect(prisma.loanScheduleItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { loanId: 'loan-1', supersededByRescheduleEventId: null },
        data: { supersededByRescheduleEventId: 'reschedule-1' },
      }),
    );
    expect(auditLog.append).toHaveBeenCalledWith(expect.objectContaining({ action: 'LOAN_RESCHEDULE_RECORDED', entityType: 'LOAN_RESCHEDULE_EVENT' }));
  });

  it('unauthorized reschedule is blocked', async () => {
    rbac.requirePermission.mockRejectedValue(new Error('Forbidden'));
    await expect(
      service.recordReschedule({
        loanId: 'loan-1',
        tenantGroupId: groupId,
        reason: 'R',
        approvedByUserId: userId,
        newTermPeriods: 2,
        firstDueDate: new Date(),
      }),
    ).rejects.toThrow('Forbidden');
    expect(prisma.loanRescheduleEvent.create).not.toHaveBeenCalled();
  });
});

describe('LoanWriteOffService', () => {
  let service: LoanWriteOffService;
  let rbac: { requirePermission: jest.Mock };

  beforeEach(async () => {
    rbac = { requirePermission: jest.fn().mockResolvedValue(undefined) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanWriteOffService,
        { provide: GroupService, useValue: { getOrThrow: jest.fn() } },
        { provide: RbacService, useValue: rbac },
      ],
    }).compile();
    service = module.get(LoanWriteOffService);
  });

  it('write-off is blocked with domain error (skeleton)', async () => {
    const { LoanWriteOffNotImplementedError } = await import('./loan.errors');
    await expect(
      service.recordWriteOff({
        loanId: 'loan-1',
        tenantGroupId: groupId,
        reason: 'Bad debt',
        approvedByUserId: userId,
      }),
    ).rejects.toThrow(LoanWriteOffNotImplementedError);
    expect(rbac.requirePermission).toHaveBeenCalledWith(groupId, null, 'loan.writeoff', {}, undefined);
  });

  it('unauthorized write-off is blocked', async () => {
    rbac.requirePermission.mockRejectedValue(new Error('Forbidden'));
    await expect(
      service.recordWriteOff({
        loanId: 'loan-1',
        tenantGroupId: groupId,
        reason: 'R',
        approvedByUserId: userId,
      }),
    ).rejects.toThrow('Forbidden');
  });
});
