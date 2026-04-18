/**
 * Integration tests for VillageCircle360 UK MVP: RBAC, audit, evidence, contributions,
 * social fund ledger, loan engine, SMS notifications, rule immutability, admin support access.
 * Requires DATABASE_URL (or DATABASE_URL_TEST). Run: npm run test:e2e
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ContributionService } from '../src/contribution/contribution.service';
import { LoanService } from '../src/loan/loan.service';
import { GroupRulesService } from '../src/group-rules/group-rules.service';
import { EvidenceService } from '../src/evidence/evidence.service';
import { NotificationTriggerService } from '../src/notifications/notification-trigger.service';
import { SmsWebhookService } from '../src/notifications/sms/sms-webhook.service';
import { SupportController } from '../src/support/support.controller';
import { TestDataFactory } from './test-data.factory';
import { AuditChannel } from '../src/domain/enums';
import { SupportAccessReasonRequiredError } from '../src/audit/audit-log.service';

describe('MVP Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let contributionService: ContributionService;
  let loanService: LoanService;
  let groupRulesService: GroupRulesService;
  let evidenceService: EvidenceService;
  let notificationTriggerService: NotificationTriggerService;
  let smsWebhookService: SmsWebhookService;
  let supportController: SupportController;
  let factory: TestDataFactory;
  let ids: Awaited<ReturnType<TestDataFactory['create']>>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    contributionService = moduleFixture.get(ContributionService);
    loanService = moduleFixture.get(LoanService);
    groupRulesService = moduleFixture.get(GroupRulesService);
    evidenceService = moduleFixture.get(EvidenceService);
    notificationTriggerService = moduleFixture.get(NotificationTriggerService);
    smsWebhookService = moduleFixture.get(SmsWebhookService);
    supportController = moduleFixture.get(SupportController);
    factory = new TestDataFactory(prisma);
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    ids = await factory.create({
      loanInterestEnabled: false,
      smsNotificationsEnabled: true,
      smsReceiptConfirmationEnabled: true,
    });
  });

  afterEach(async () => {
    await factory.teardown();
  });

  describe('1. Treasurer records mixed-mode meeting contributions', () => {
    it('member A cash savings only; member B bank transfer + social fund with text ref and image evidence; ledger, audit, notification intent', async () => {
      const treasurerUserId = ids.userIds.treasurer;
      const meetingId = ids.meetingId;
      const groupId = ids.groupId;

      const contribA = await contributionService.record(
        {
          tenantGroupId: groupId,
          meetingId,
          memberProfileId: ids.memberIds.memberA,
          transactionMode: 'CASH',
          savingsAmountMinor: 5000,
          socialFundAmountMinor: 0,
          idempotencyKey: 'e2e-meeting-memberA-cash',
          recordedByUserId: treasurerUserId,
        },
        AuditChannel.WEB,
        treasurerUserId,
      );
      factory.trackContribution(contribA.id);

      const contribB = await contributionService.record(
        {
          tenantGroupId: groupId,
          meetingId,
          memberProfileId: ids.memberIds.memberB,
          transactionMode: 'BANK_TRANSFER',
          savingsAmountMinor: 3000,
          socialFundAmountMinor: 500,
          externalReferenceText: 'Ref BACs 01/03',
          evidenceAttachmentId: ids.evidenceFileId,
          idempotencyKey: 'e2e-meeting-memberB-bank',
          recordedByUserId: treasurerUserId,
        },
        AuditChannel.WEB,
        treasurerUserId,
      );
      factory.trackContribution(contribB.id);

      const contribARecord = await prisma.contribution.findUnique({ where: { id: contribA.id }, include: { evidenceFile: true } });
      const contribBRecord = await prisma.contribution.findUnique({ where: { id: contribB.id }, include: { evidenceFile: true } });
      expect(contribARecord?.ledgerEventId).toBeDefined();
      expect(contribBRecord?.ledgerEventId).toBeDefined();
      expect(contribBRecord?.evidenceFileId).toBe(ids.evidenceFileId);
      expect(contribBRecord?.externalReferenceText).toBe('Ref BACs 01/03');

      const linesA = await prisma.ledgerLine.findMany({ where: { ledgerEventId: contribARecord!.ledgerEventId! } });
      const linesB = await prisma.ledgerLine.findMany({ where: { ledgerEventId: contribBRecord!.ledgerEventId! } });
      expect(linesA.some((l) => l.fundBucket === 'SAVINGS' && l.memberId === ids.memberIds.memberA)).toBe(true);
      expect(linesB.some((l) => l.fundBucket === 'SAVINGS' && l.memberId === ids.memberIds.memberB)).toBe(true);
      expect(linesB.some((l) => l.fundBucket === 'SOCIAL_FUND' && l.memberId === ids.memberIds.memberB)).toBe(true);

      const auditEvents = await prisma.auditLog.findMany({
        where: { tenantGroupId: groupId },
        orderBy: { sequenceNo: 'asc' },
      });
      expect(auditEvents.some((e) => e.action === 'CONTRIBUTION_RECORDED' && e.entityType === 'CONTRIBUTION')).toBe(true);

      const notifications = await prisma.notification.findMany({
        where: { tenantGroupId: groupId, templateKey: 'receipt_confirmation' },
      });
      expect(notifications.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('2. Chair/Treasurer role enforcement', () => {
    it('unauthorized member tries contribution reversal and is blocked', async () => {
      const treasurerUserId = ids.userIds.treasurer;
      const memberUserId = ids.userIds.member;
      const groupId = ids.groupId;

      const contrib = await contributionService.record(
        {
          tenantGroupId: groupId,
          memberProfileId: ids.memberIds.memberA,
          transactionMode: 'CASH',
          savingsAmountMinor: 1000,
          socialFundAmountMinor: 0,
          idempotencyKey: 'e2e-reversal-target',
          recordedByUserId: treasurerUserId,
        },
        AuditChannel.WEB,
        treasurerUserId,
      );
      factory.trackContribution(contrib.id);

      await request(app.getHttpServer())
        .post('/contributions/reversal')
        .send({
          tenantGroupId: groupId,
          contributionId: contrib.id,
          reversalReason: 'Error',
          reversedByUserId: memberUserId,
          actorUserId: memberUserId,
        })
        .expect(403);
    });

    it('authorized reversal succeeds and creates reversing ledger event + audit event', async () => {
      const treasurerUserId = ids.userIds.treasurer;
      const groupId = ids.groupId;

      const contrib = await contributionService.record(
        {
          tenantGroupId: groupId,
          memberProfileId: ids.memberIds.memberA,
          transactionMode: 'CASH',
          savingsAmountMinor: 2000,
          socialFundAmountMinor: 0,
          idempotencyKey: 'e2e-reversal-ok',
          recordedByUserId: treasurerUserId,
        },
        AuditChannel.WEB,
        treasurerUserId,
      );
      factory.trackContribution(contrib.id);

      const beforeLedgerCount = await prisma.ledgerEvent.count({ where: { tenantGroupId: groupId } });

      const result = await contributionService.reversal(
        {
          tenantGroupId: groupId,
          contributionId: contrib.id,
          reversalReason: 'Duplicate entry',
          reversedByUserId: treasurerUserId,
        },
        AuditChannel.WEB,
        treasurerUserId,
      );
      expect(result.id).toBe(contrib.id);

      const updated = await prisma.contribution.findUnique({ where: { id: contrib.id } });
      expect(updated?.status).toBe('REVERSED');
      const afterLedgerCount = await prisma.ledgerEvent.count({ where: { tenantGroupId: groupId } });
      expect(afterLedgerCount).toBe(beforeLedgerCount + 1);

      const auditReversed = await prisma.auditLog.findFirst({
        where: { tenantGroupId: groupId, action: 'CONTRIBUTION_REVERSED' },
      });
      expect(auditReversed).toBeDefined();
    });
  });

  describe('3. Loan with interest disabled', () => {
    it('apply, approve, disburse, repay; verify zero-interest schedule and ledger postings', async () => {
      const chairUserId = ids.userIds.chair;
      const treasurerUserId = ids.userIds.treasurer;
      const groupId = ids.groupId;

      const appResult = await loanService.submitApplication(
        {
          tenantGroupId: groupId,
          memberProfileId: ids.memberIds.memberA,
          requestedAmountMinor: 10000,
          requestedTermPeriods: 2,
          submittedByUserId: treasurerUserId,
        },
        treasurerUserId,
        ids.memberIds.treasurer,
      );
      factory.trackLoanApplication(appResult.id);

      const approveResult = await loanService.approveApplication(
        {
          applicationId: appResult.id,
          tenantGroupId: groupId,
          approvedByUserId: chairUserId,
        },
        chairUserId,
        ids.memberIds.chair,
      );
      factory.trackLoan(approveResult.loanId);

      const loan = await prisma.loan.findUnique({
        where: { id: approveResult.loanId },
        include: { scheduleItems: true },
      });
      expect(loan?.interestEnabledSnapshot).toBe(false);
      expect(loan?.scheduleItems.every((s) => s.interestDueMinor === 0)).toBe(true);
      expect(loan?.scheduleItems.reduce((sum, s) => sum + s.principalDueMinor, 0)).toBe(10000);

      await loanService.recordDisbursement(
        {
          loanId: approveResult.loanId,
          tenantGroupId: groupId,
          transactionMode: 'CASH',
          externalReferenceText: 'Cash out',
          recordedByUserId: treasurerUserId,
        },
        treasurerUserId,
        ids.memberIds.treasurer,
      );

      const scheduleItems = await prisma.loanScheduleItem.findMany({
        where: { loanId: approveResult.loanId },
        orderBy: { installmentNo: 'asc' },
      });
      const firstInstallment = scheduleItems[0];
      await loanService.recordRepayment(
        {
          loanId: approveResult.loanId,
          tenantGroupId: groupId,
          amountMinor: firstInstallment.totalDueMinor,
          transactionMode: 'CASH',
          externalReferenceText: 'Repay 1',
          recordedByUserId: treasurerUserId,
          idempotencyKey: 'e2e-repay-1',
        },
        treasurerUserId,
        ids.memberIds.treasurer,
      );

      const ledgerEvents = await prisma.ledgerEvent.findMany({
        where: { tenantGroupId: groupId },
        include: { lines: true },
      });
      expect(ledgerEvents.some((e) => e.sourceEventType === 'LOAN_DISBURSEMENT_RECORDED')).toBe(true);
      expect(ledgerEvents.some((e) => e.sourceEventType === 'LOAN_REPAYMENT_RECORDED')).toBe(true);
    });
  });

  describe('4. Loan with interest enabled', () => {
    it('apply, approve, disburse, repay with bank transfer evidence; verify principal/interest split', async () => {
      await factory.teardown();
      ids = await factory.create({
        loanInterestEnabled: true,
        loanInterestRateBps: 500,
      });

      const chairUserId = ids.userIds.chair;
      const treasurerUserId = ids.userIds.treasurer;
      const groupId = ids.groupId;

      const appResult = await loanService.submitApplication(
        {
          tenantGroupId: groupId,
          memberProfileId: ids.memberIds.memberB,
          requestedAmountMinor: 10000,
          requestedTermPeriods: 2,
          submittedByUserId: chairUserId,
        },
        chairUserId,
        ids.memberIds.chair,
      );
      factory.trackLoanApplication(appResult.id);

      const approveResult = await loanService.approveApplication(
        {
          applicationId: appResult.id,
          tenantGroupId: groupId,
          approvedByUserId: chairUserId,
        },
        chairUserId,
        ids.memberIds.chair,
      );
      factory.trackLoan(approveResult.loanId);

      const loan = await prisma.loan.findUnique({
        where: { id: approveResult.loanId },
        include: { scheduleItems: true },
      });
      expect(loan?.interestEnabledSnapshot).toBe(true);
      const totalInterest = loan!.scheduleItems.reduce((s, i) => s + i.interestDueMinor, 0);
      expect(totalInterest).toBeGreaterThan(0);
      const totalPrincipal = loan!.scheduleItems.reduce((s, i) => s + i.principalDueMinor, 0);
      expect(totalPrincipal).toBe(10000);

      await loanService.recordDisbursement(
        {
          loanId: approveResult.loanId,
          tenantGroupId: groupId,
          transactionMode: 'BANK_TRANSFER',
          externalReferenceText: 'BACS ref',
          recordedByUserId: treasurerUserId,
        },
        treasurerUserId,
        ids.memberIds.treasurer,
      );

      const scheduleItems = await prisma.loanScheduleItem.findMany({
        where: { loanId: approveResult.loanId },
        orderBy: { installmentNo: 'asc' },
      });
      await loanService.recordRepayment(
        {
          loanId: approveResult.loanId,
          tenantGroupId: groupId,
          amountMinor: scheduleItems[0].totalDueMinor,
          transactionMode: 'BANK_TRANSFER',
          externalReferenceText: 'BACS repay',
          recordedByUserId: treasurerUserId,
          idempotencyKey: 'e2e-repay-interest-1',
        },
        treasurerUserId,
        ids.memberIds.treasurer,
      );

      const repayment = await prisma.loanRepayment.findFirst({
        where: { loanId: approveResult.loanId },
      });
      expect(repayment?.principalMinor).toBeGreaterThan(0);
      expect(repayment?.interestMinor).toBeGreaterThanOrEqual(0);
    });
  });

  describe('5. Rule version immutability', () => {
    it('change group interest rule after loan approval; existing loan schedule unchanged', async () => {
      const chairUserId = ids.userIds.chair;
      const treasurerUserId = ids.userIds.treasurer;
      const groupId = ids.groupId;

      const appResult = await loanService.submitApplication(
        {
          tenantGroupId: groupId,
          memberProfileId: ids.memberIds.memberA,
          requestedAmountMinor: 5000,
          requestedTermPeriods: 2,
          submittedByUserId: treasurerUserId,
        },
        treasurerUserId,
        ids.memberIds.treasurer,
      );
      factory.trackLoanApplication(appResult.id);

      const approveResult = await loanService.approveApplication(
        {
          applicationId: appResult.id,
          tenantGroupId: groupId,
          approvedByUserId: chairUserId,
        },
        chairUserId,
        ids.memberIds.chair,
      );
      factory.trackLoan(approveResult.loanId);

      const loanBefore = await prisma.loan.findUnique({
        where: { id: approveResult.loanId },
        include: { scheduleItems: true },
      });
      const scheduleBefore = loanBefore!.scheduleItems.map((s) => ({ installmentNo: s.installmentNo, interestDueMinor: s.interestDueMinor }));

      const updateResult = await groupRulesService.update(
        {
          tenantGroupId: groupId,
          loanInterestRateBps: 1000,
          updatedByUserId: chairUserId,
        },
        AuditChannel.WEB,
      );
      factory.trackRuleVersion(updateResult.id);

      const loanAfter = await prisma.loan.findUnique({
        where: { id: approveResult.loanId },
        include: { scheduleItems: true },
      });
      const scheduleAfter = loanAfter!.scheduleItems.map((s) => ({ installmentNo: s.installmentNo, interestDueMinor: s.interestDueMinor }));
      expect(scheduleAfter).toEqual(scheduleBefore);
    });
  });

  describe('6. SMS operational behavior', () => {
    it('send meeting reminder; webhook marks delivery; disabled tenant SMS blocks non-critical sends', async () => {
      const { enqueued } = await notificationTriggerService.enqueueMeetingReminders({
        meetingId: ids.meetingId,
        withinHours: 48,
      });
      expect(enqueued).toBeGreaterThanOrEqual(1);

      const notifications = await prisma.notification.findMany({
        where: { tenantGroupId: ids.groupId, templateKey: 'meeting_reminder' },
      });
      const oneNotification = notifications[0];
      if (oneNotification?.providerMessageId) {
        const webhookResult = await smsWebhookService.processWebhook(
          {
            providerMessageId: oneNotification.providerMessageId,
            status: 'DELIVERED',
          },
          {},
        );
        expect(webhookResult.accepted).toBe(true);
        const updated = await prisma.notification.findUnique({ where: { id: oneNotification.id } });
        expect(updated?.status).toBe('DELIVERED');
      }

      await factory.teardown();
      ids = await factory.create({
        smsNotificationsEnabled: false,
        smsReceiptConfirmationEnabled: false,
      });
      const contribResult = await contributionService.record(
        {
          tenantGroupId: ids.groupId,
          memberProfileId: ids.memberIds.memberA,
          transactionMode: 'CASH',
          savingsAmountMinor: 100,
          socialFundAmountMinor: 0,
          idempotencyKey: 'e2e-sms-disabled',
          recordedByUserId: ids.userIds.treasurer,
        },
        AuditChannel.WEB,
        ids.userIds.treasurer,
      );
      factory.trackContribution(contribResult.id);
      const receiptNotifications = await prisma.notification.findMany({
        where: { tenantGroupId: ids.groupId, templateKey: 'receipt_confirmation', channel: 'SMS' },
      });
      const sentOrQueuedSms = receiptNotifications.filter((n) => n.status === 'SENT' || n.status === 'QUEUED');
      expect(sentOrQueuedSms.length).toBe(0);
    });
  });

  describe('7. Admin/support access control', () => {
    it('evidence view without reason code is blocked', async () => {
      await expect(
        evidenceService.getByIdForSupport(ids.evidenceFileId!, {
          reasonCode: '',
          supportCaseOrIncidentId: 'case-1',
          actorUserId: ids.userIds.chair,
          tenantGroupId: ids.groupId,
        }),
      ).rejects.toThrow('Support access requires reasonCode');
    });

    it('evidence view with reason code succeeds and logs audit', async () => {
      const result = await evidenceService.getByIdForSupport(ids.evidenceFileId!, {
        reasonCode: 'CUSTOMER_REQUEST',
        supportCaseOrIncidentId: 'case-123',
        actorUserId: ids.userIds.chair,
        tenantGroupId: ids.groupId,
      });
      expect(result.id).toBe(ids.evidenceFileId);
      expect(result.groupId).toBe(ids.groupId);

      const auditEntry = await prisma.auditLog.findFirst({
        where: {
          tenantGroupId: ids.groupId,
          action: 'EVIDENCE_VIEW',
          reasonCode: 'CUSTOMER_REQUEST',
        },
      });
      expect(auditEntry).toBeDefined();
      expect((auditEntry?.metadata as { evidenceFileId?: string })?.evidenceFileId).toBe(ids.evidenceFileId);
    });

    it('support trace without reason code is blocked', async () => {
      const contrib = await contributionService.record(
        {
          tenantGroupId: ids.groupId,
          meetingId: ids.meetingId,
          memberProfileId: ids.memberIds.memberA,
          transactionMode: 'CASH',
          savingsAmountMinor: 1000,
          socialFundAmountMinor: 0,
          idempotencyKey: 'e2e-trace-reason-block',
          recordedByUserId: ids.userIds.treasurer,
        },
        AuditChannel.WEB,
        ids.userIds.treasurer,
      );
      factory.trackContribution(contrib.id);
      await expect(
        supportController.getContributionTrace(
          contrib.id,
          '',
          'case-1',
          ids.userIds.chair,
          ids.groupId,
        ),
      ).rejects.toThrow(SupportAccessReasonRequiredError);
    });

    it('support trace with reason code returns linked records and emits audit', async () => {
      const contrib = await contributionService.record(
        {
          tenantGroupId: ids.groupId,
          meetingId: ids.meetingId,
          memberProfileId: ids.memberIds.memberA,
          transactionMode: 'CASH',
          savingsAmountMinor: 2000,
          socialFundAmountMinor: 0,
          idempotencyKey: 'e2e-trace-audit',
          recordedByUserId: ids.userIds.treasurer,
        },
        AuditChannel.WEB,
        ids.userIds.treasurer,
      );
      factory.trackContribution(contrib.id);
      const trace = await supportController.getContributionTrace(
        contrib.id,
        'CUSTOMER_REQUEST',
        'case-trace-1',
        ids.userIds.chair,
        ids.groupId,
      );
      expect(trace.entityType).toBe('CONTRIBUTION');
      expect((trace.entity as Record<string, unknown>).id).toBe(contrib.id);
      expect(Array.isArray(trace.auditEvents)).toBe(true);
      expect(Array.isArray(trace.ledgerEvents)).toBe(true);
      expect(Array.isArray(trace.ledgerLines)).toBe(true);
      expect(Array.isArray(trace.evidenceMetadata)).toBe(true);
      expect(Array.isArray(trace.notifications)).toBe(true);

      const traceReadAudit = await prisma.auditLog.findFirst({
        where: {
          tenantGroupId: ids.groupId,
          action: 'TRACE_READ',
          reasonCode: 'CUSTOMER_REQUEST',
        },
      });
      expect(traceReadAudit).toBeDefined();
      expect((traceReadAudit?.metadata as { entityType?: string; entityId?: string })?.entityId).toBe(contrib.id);
    });
  });
});
