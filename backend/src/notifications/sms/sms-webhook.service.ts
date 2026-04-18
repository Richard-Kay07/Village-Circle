import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditChannel } from '../../domain/enums';
import { SmsDispatcher } from '../dispatchers/sms.dispatcher';
import type { NotificationStatus } from '../notification.types';
import type { SmsWebhookDeliveryStatus } from './sms-provider.interface';

export interface SmsWebhookProcessResult {
  accepted: boolean;
  signatureInvalid?: boolean;
  notificationId?: string | null;
  previousStatus?: string | null;
  newStatus?: NotificationStatus | null;
}

const CHANNEL_SMS_WEBHOOK = AuditChannel.SMS_WEBHOOK;

/** Map provider delivery status to internal NotificationStatus. */
function mapToInternalStatus(providerStatus: SmsWebhookDeliveryStatus): NotificationStatus {
  switch (providerStatus) {
    case 'DELIVERED':
      return 'DELIVERED';
    case 'SENT':
    case 'ACCEPTED':
      return 'SENT';
    case 'FAILED':
    case 'UNDELIVERABLE':
      return 'FAILED';
    default:
      return 'SENT';
  }
}

@Injectable()
export class SmsWebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly smsDispatcher: SmsDispatcher,
  ) {}

  /**
   * Process incoming SMS delivery webhook. Validates via adapter (signature if implemented),
   * maps to internal status, updates notification, and emits audit with channel SMS_WEBHOOK.
   */
  async processWebhook(
    payload: unknown,
    headers?: Record<string, string>,
  ): Promise<SmsWebhookProcessResult> {
    const parsed = await this.smsDispatcher.parseWebhook(payload, headers);
    if (!parsed.valid) {
      return { accepted: false, signatureInvalid: parsed.signatureInvalid };
    }
    if (!parsed.payload?.providerMessageId) {
      return { accepted: false };
    }

    const notification = await this.prisma.notification.findFirst({
      where: { providerMessageId: parsed.payload.providerMessageId, channel: 'SMS' },
    });
    if (!notification) {
      return { accepted: true, notificationId: null };
    }

    const previousStatus = notification.status;
    const newStatus = mapToInternalStatus(parsed.payload.status);

    const updateData: { status: NotificationStatus; deliveredAt?: Date; errorCode?: string | null; errorMessage?: string | null } = {
      status: newStatus,
      errorCode: parsed.payload.errorCode ?? undefined,
      errorMessage: parsed.payload.errorMessage ?? undefined,
    };
    if (newStatus === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: updateData,
    });

    await this.auditLog.append({
      tenantGroupId: notification.tenantGroupId,
      actorUserId: null,
      channel: CHANNEL_SMS_WEBHOOK,
      action: 'SMS_WEBHOOK_DELIVERY_STATUS',
      entityType: 'NOTIFICATION',
      entityId: notification.id,
      afterSnapshot: {
        providerMessageId: parsed.payload.providerMessageId,
        providerStatus: parsed.payload.status,
        previousStatus,
        newStatus,
        errorCode: parsed.payload.errorCode ?? null,
        errorMessage: parsed.payload.errorMessage ?? null,
      },
    });

    return {
      accepted: true,
      notificationId: notification.id,
      previousStatus,
      newStatus,
    };
  }
}
