import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { SmsDispatcher } from '../../dispatchers/sms.dispatcher';
import { SmsWebhookService } from './sms-webhook.service';

describe('SmsWebhookService', () => {
  let service: SmsWebhookService;
  let prisma: { notification: { findFirst: jest.Mock; update: jest.Mock } };
  let auditLog: { append: jest.Mock };
  let smsDispatcher: { parseWebhook: jest.Mock };

  const tenantGroupId = 'g1';
  const notificationId = 'n1';
  const providerMessageId = 'sid_123';

  beforeEach(async () => {
    prisma = {
      notification: {
        findFirst: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    auditLog = { append: jest.fn().mockResolvedValue(undefined) };
    smsDispatcher = {
      parseWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsWebhookService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: SmsDispatcher, useValue: smsDispatcher },
      ],
    }).compile();

    service = module.get(SmsWebhookService);
  });

  it('rejects webhook when signature is invalid', async () => {
    smsDispatcher.parseWebhook.mockResolvedValue({ valid: false, signatureInvalid: true });

    const result = await service.processWebhook({}, { 'x-mock-signature': 'invalid' });

    expect(result.accepted).toBe(false);
    expect(result.signatureInvalid).toBe(true);
    expect(prisma.notification.findFirst).not.toHaveBeenCalled();
  });

  it('rejects when parseWebhook returns valid: false without payload', async () => {
    smsDispatcher.parseWebhook.mockResolvedValue({ valid: false });

    const result = await service.processWebhook({});

    expect(result.accepted).toBe(false);
    expect(prisma.notification.findFirst).not.toHaveBeenCalled();
  });

  it('accepts but does nothing when no notification found for providerMessageId', async () => {
    smsDispatcher.parseWebhook.mockResolvedValue({
      valid: true,
      payload: { providerMessageId, status: 'DELIVERED' },
    });
    prisma.notification.findFirst.mockResolvedValue(null);

    const result = await service.processWebhook({ providerMessageId, status: 'delivered' });

    expect(result.accepted).toBe(true);
    expect(result.notificationId).toBeNull();
    expect(prisma.notification.update).not.toHaveBeenCalled();
    expect(auditLog.append).not.toHaveBeenCalled();
  });

  it('maps DELIVERED to internal DELIVERED and updates notification and audit', async () => {
    smsDispatcher.parseWebhook.mockResolvedValue({
      valid: true,
      payload: { providerMessageId, status: 'DELIVERED' },
    });
    prisma.notification.findFirst.mockResolvedValue({
      id: notificationId,
      tenantGroupId,
      status: 'SENT',
    });

    const result = await service.processWebhook({ providerMessageId, status: 'DELIVERED' });

    expect(result.accepted).toBe(true);
    expect(result.notificationId).toBe(notificationId);
    expect(result.previousStatus).toBe('SENT');
    expect(result.newStatus).toBe('DELIVERED');
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: notificationId },
      data: expect.objectContaining({
        status: 'DELIVERED',
        deliveredAt: expect.any(Date),
      }),
    });
    expect(auditLog.append).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'SMS_WEBHOOK',
        action: 'SMS_WEBHOOK_DELIVERY_STATUS',
        entityType: 'NOTIFICATION',
        entityId: notificationId,
        afterSnapshot: expect.objectContaining({
          providerStatus: 'DELIVERED',
          previousStatus: 'SENT',
          newStatus: 'DELIVERED',
        }),
      }),
    );
  });

  it('maps SENT/ACCEPTED to internal SENT', async () => {
    smsDispatcher.parseWebhook.mockResolvedValue({
      valid: true,
      payload: { providerMessageId, status: 'SENT' },
    });
    prisma.notification.findFirst.mockResolvedValue({
      id: notificationId,
      tenantGroupId,
      status: 'QUEUED',
    });

    const result = await service.processWebhook({ providerMessageId, status: 'SENT' });

    expect(result.newStatus).toBe('SENT');
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: notificationId },
      data: expect.objectContaining({ status: 'SENT' }),
    });
  });

  it('maps FAILED/UNDELIVERABLE to internal FAILED and stores error', async () => {
    smsDispatcher.parseWebhook.mockResolvedValue({
      valid: true,
      payload: {
        providerMessageId,
        status: 'FAILED',
        errorCode: '30003',
        errorMessage: 'Unreachable',
      },
    });
    prisma.notification.findFirst.mockResolvedValue({
      id: notificationId,
      tenantGroupId,
      status: 'SENT',
    });

    const result = await service.processWebhook({
      providerMessageId,
      status: 'FAILED',
      errorCode: '30003',
      errorMessage: 'Unreachable',
    });

    expect(result.newStatus).toBe('FAILED');
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: notificationId },
      data: expect.objectContaining({
        status: 'FAILED',
        errorCode: '30003',
        errorMessage: 'Unreachable',
      }),
    });
  });
});
