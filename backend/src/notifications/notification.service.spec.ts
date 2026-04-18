import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { GroupRulesService } from '../group-rules/group-rules.service';
import { NotificationService } from './notification.service';
import { InAppDispatcher } from './dispatchers/in-app.dispatcher';
import { EmailDispatcher } from './dispatchers/email.dispatcher';
import { SmsDispatcher } from './dispatchers/sms.dispatcher';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationChannel } from './notification.types';
import { MockSmsAdapter } from './sms/adapters/mock-sms.adapter';
import { SMS_PROVIDER_ADAPTER } from './sms/sms.constants';

const tenantGroupId = 'g1';
const userId = 'u1';
const memberId = 'm1';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;
  let auditLog: { append: jest.Mock };
  let groupRules: { getSnapshotForLoan: jest.Mock };

  beforeEach(async () => {
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    prisma = {
      notification: {
        create: jest.fn().mockResolvedValue({
          id: 'n1',
          tenantGroupId,
          recipientUserId: userId,
          recipientMemberId: null,
          channel: 'IN_APP',
          templateKey: 'test_template',
          status: 'QUEUED',
        }),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      notificationTemplate: {
        findFirst: jest.fn(),
      },
      member: {
        findUnique: jest.fn().mockResolvedValue({ smsOptOut: false }),
        findFirst: jest.fn().mockResolvedValue({ id: memberId }),
      },
    };
    groupRules = {
      getSnapshotForLoan: jest.fn().mockResolvedValue({ smsNotificationsEnabled: true, smsReceiptConfirmationEnabled: true }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: GroupRulesService, useValue: groupRules },
        InAppDispatcher,
        EmailDispatcher,
        { provide: SMS_PROVIDER_ADAPTER, useClass: MockSmsAdapter },
        SmsDispatcher,
        NotificationPreferenceService,
      ],
    }).compile();
    service = module.get(NotificationService);
  });

  describe('queue', () => {
    it('queues notification and returns QUEUED when sendImmediately is false', async () => {
      const result = await service.queue({
        tenantGroupId,
        recipientUserId: userId,
        channel: NotificationChannel.IN_APP,
        templateKey: 'welcome',
      });
      expect(result.id).toBe('n1');
      expect(result.status).toBe('QUEUED');
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantGroupId,
            recipientUserId: userId,
            channel: 'IN_APP',
            templateKey: 'welcome',
            status: 'QUEUED',
          }),
        }),
      );
    });

    it('throws when neither recipientUserId nor recipientMemberId provided', async () => {
      await expect(
        service.queue({
          tenantGroupId,
          channel: NotificationChannel.IN_APP,
          templateKey: 'welcome',
        }),
      ).rejects.toThrow('Either recipientUserId or recipientMemberId is required');
    });
  });

  describe('send', () => {
    it('transitions QUEUED to SENT when template exists and dispatch succeeds', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 'n1',
        tenantGroupId,
        recipientUserId: userId,
        recipientMemberId: null,
        channel: 'IN_APP',
        templateKey: 'welcome',
        payload: { name: 'Alice' },
        status: 'QUEUED',
        retryCount: 0,
        recipientUser: { id: userId },
        recipientMember: null,
      });
      prisma.notificationTemplate.findFirst
        .mockResolvedValueOnce({ subject: null, bodyTemplate: 'Hi {{name}}!' })
        .mockResolvedValueOnce(null);
      const result = await service.send('n1');
      expect(result.status).toBe('SENT');
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1' },
          data: expect.objectContaining({ status: 'SENT', sentAt: expect.any(Date) }),
        }),
      );
    });

    it('transitions to FAILED when template not found', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 'n1',
        tenantGroupId,
        recipientUserId: userId,
        channel: 'IN_APP',
        templateKey: 'missing',
        status: 'QUEUED',
        retryCount: 0,
        recipientUser: { id: userId },
        recipientMember: null,
      });
      prisma.notificationTemplate.findFirst.mockResolvedValue(null);
      const result = await service.send('n1');
      expect(result.status).toBe('FAILED');
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1' },
          data: expect.objectContaining({ status: 'FAILED', errorCode: 'TEMPLATE_NOT_FOUND' }),
        }),
      );
    });

    it('cancels SMS when tenant has smsNotificationsEnabled false', async () => {
      groupRules.getSnapshotForLoan.mockResolvedValue({ smsNotificationsEnabled: false, smsReceiptConfirmationEnabled: false });
      prisma.notification.findUnique.mockResolvedValue({
        id: 'n1',
        tenantGroupId,
        recipientUserId: userId,
        recipientMemberId: memberId,
        channel: 'SMS',
        templateKey: 'meeting_reminder',
        payload: {},
        status: 'QUEUED',
        retryCount: 0,
        mandatory: false,
        recipientUser: { id: userId },
        recipientMember: { id: memberId, phone: '+447700900000' },
      });
      prisma.notificationTemplate.findFirst.mockResolvedValue({ subject: null, bodyTemplate: 'Meeting at {{time}}' });

      const result = await service.send('n1');

      expect(result.status).toBe('CANCELLED');
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1' },
          data: { status: 'CANCELLED' },
        }),
      );
    });

    it('cancels non-critical SMS when member has smsOptOut true', async () => {
      prisma.member.findUnique.mockResolvedValue({ smsOptOut: true });
      prisma.notification.findUnique.mockResolvedValue({
        id: 'n1',
        tenantGroupId,
        recipientUserId: userId,
        recipientMemberId: memberId,
        channel: 'SMS',
        templateKey: 'contribution_due_reminder',
        payload: {},
        status: 'QUEUED',
        retryCount: 0,
        mandatory: false,
        recipientUser: { id: userId },
        recipientMember: { id: memberId, phone: '+447700900000' },
      });
      prisma.notificationTemplate.findFirst.mockResolvedValue({ subject: null, bodyTemplate: 'Contribution due' });

      const result = await service.send('n1');

      expect(result.status).toBe('CANCELLED');
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1' },
          data: { status: 'CANCELLED' },
        }),
      );
    });
  });

  describe('retry', () => {
    it('resets FAILED to QUEUED and sends again (retry path)', async () => {
      prisma.notification.findUnique
        .mockResolvedValueOnce({
          id: 'n1',
          tenantGroupId,
          status: 'FAILED',
          retryCount: 1,
        })
        .mockResolvedValueOnce({
          id: 'n1',
          tenantGroupId,
          recipientUserId: userId,
          recipientMemberId: null,
          channel: 'IN_APP',
          templateKey: 'welcome',
          payload: {},
          status: 'QUEUED',
          retryCount: 0,
          recipientUser: { id: userId },
          recipientMember: null,
        });
      prisma.notificationTemplate.findFirst.mockResolvedValue({ subject: null, bodyTemplate: 'Hi' });
      const result = await service.retry('n1', 'admin-user');
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1' },
          data: { status: 'QUEUED', errorCode: null, errorMessage: null },
        }),
      );
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'NOTIFICATION_RETRY_REQUESTED', entityId: 'n1' }),
      );
      expect(result.status).toBe('SENT');
    });

    it('throws when notification is not FAILED', async () => {
      prisma.notification.findUnique.mockResolvedValue({ id: 'n1', status: 'SENT', retryCount: 0 });
      await expect(service.retry('n1')).rejects.toThrow('Only FAILED notifications can be retried');
    });
  });

  describe('send retry path for failed dispatch', () => {
    it('sets FAILED and stores error when dispatch fails and retryCount reaches max', async () => {
      const failingDispatcher = { dispatch: jest.fn().mockResolvedValue({ success: false, errorCode: 'PROVIDER_ERROR', errorMessage: 'Send failed' }) };
      const module2 = await Test.createTestingModule({
        providers: [
          NotificationService,
          { provide: PrismaService, useValue: prisma },
          { provide: AuditLogService, useValue: auditLog },
          { provide: GroupRulesService, useValue: groupRules },
          { provide: InAppDispatcher, useValue: failingDispatcher },
          EmailDispatcher,
          { provide: SMS_PROVIDER_ADAPTER, useClass: MockSmsAdapter },
          SmsDispatcher,
          NotificationPreferenceService,
        ],
      }).compile();
      const svc = module2.get(NotificationService);
      prisma.notification.findUnique.mockResolvedValue({
        id: 'n1',
        tenantGroupId,
        recipientUserId: userId,
        recipientMemberId: null,
        channel: 'IN_APP',
        templateKey: 'welcome',
        payload: {},
        status: 'QUEUED',
        retryCount: 2,
        recipientUser: { id: userId },
        recipientMember: null,
      });
      prisma.notificationTemplate.findFirst.mockResolvedValue({ subject: null, bodyTemplate: 'Hi' });
      const result = await svc.send('n1');
      expect(result.status).toBe('FAILED');
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1' },
          data: expect.objectContaining({
            status: 'FAILED',
            errorCode: 'PROVIDER_ERROR',
            errorMessage: 'Send failed',
            retryCount: 3,
          }),
        }),
      );
    });
  });
});
