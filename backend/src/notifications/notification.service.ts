import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditChannel } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import type {
  NotificationChannel,
  NotificationStatus,
  QueueNotificationInput,
  DispatchResult,
  RenderedNotification,
} from './notification.types';
import { renderNotification } from './notification-template.service';
import { InAppDispatcher } from './dispatchers/in-app.dispatcher';
import { EmailDispatcher } from './dispatchers/email.dispatcher';
import { SmsDispatcher } from './dispatchers/sms.dispatcher';
import { NotificationPreferenceService } from './notification-preference.service';

const MAX_RETRIES = 3;

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly inAppDispatcher: InAppDispatcher,
    private readonly emailDispatcher: EmailDispatcher,
    private readonly smsDispatcher: SmsDispatcher,
    private readonly preferenceService: NotificationPreferenceService,
  ) {}

  /**
   * Queue a notification (status QUEUED). Optionally send immediately.
   * Tenant scoping enforced; for non-mandatory messages, preference check is applied.
   */
  async queue(
    input: QueueNotificationInput,
    options?: { sendImmediately?: boolean; actorUserId?: string | null; auditAction?: string },
  ): Promise<{ id: string; status: NotificationStatus }> {
    if (!input.recipientUserId && !input.recipientMemberId) {
      throw new ValidationError('Either recipientUserId or recipientMemberId is required');
    }

    const notification = await this.prisma.notification.create({
      data: {
        tenantGroupId: input.tenantGroupId,
        recipientUserId: input.recipientUserId ?? undefined,
        recipientMemberId: input.recipientMemberId ?? undefined,
        channel: input.channel,
        templateKey: input.templateKey,
        payload: input.payload ?? undefined,
        status: 'QUEUED',
        mandatory: input.mandatory ?? false,
      },
    });

    if (options?.auditAction && options?.actorUserId) {
      await this.auditLog.append({
        tenantGroupId: input.tenantGroupId,
        actorUserId: options.actorUserId,
        channel: AuditChannel.WEB,
        action: options.auditAction,
        entityType: 'NOTIFICATION',
        entityId: notification.id,
        afterSnapshot: { templateKey: input.templateKey, channel: input.channel },
      });
    }

    if (options?.sendImmediately) {
      await this.send(notification.id);
      const updated = await this.prisma.notification.findUnique({ where: { id: notification.id } });
      return { id: notification.id, status: (updated?.status ?? notification.status) as NotificationStatus };
    }
    return { id: notification.id, status: 'QUEUED' };
  }

  /**
   * Send a queued notification: load template, render, check preferences (unless mandatory), dispatch, update status.
   */
  async send(notificationId: string): Promise<{ status: NotificationStatus }> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { recipientUser: true, recipientMember: true },
    });
    if (!notification) throw new ValidationError('Notification not found', { notificationId });
    if (notification.status !== 'QUEUED' && notification.status !== 'FAILED') {
      return { status: notification.status as NotificationStatus };
    }

    const template = await this.resolveTemplate(
      notification.tenantGroupId,
      notification.templateKey,
      notification.channel as NotificationChannel,
    );
    if (!template) {
      await this.markFailed(notificationId, 'TEMPLATE_NOT_FOUND', 'Template not found');
      return { status: 'FAILED' };
    }

    const payload = (notification.payload as Record<string, string | number | boolean>) ?? {};
    let rendered: RenderedNotification;
    try {
      rendered = renderNotification(template.subject, template.bodyTemplate, payload);
    } catch {
      await this.markFailed(notificationId, 'RENDER_ERROR', 'Template render failed');
      return { status: 'FAILED' };
    }

    const mandatory = Boolean(notification.mandatory);
    if (!mandatory) {
      const allowed = await this.preferenceService.isChannelAllowed(
        notification.tenantGroupId,
        notification.recipientUserId,
        notification.recipientMemberId,
        notification.channel as NotificationChannel,
        { templateKey: notification.templateKey },
      );
      if (!allowed) {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'CANCELLED' },
        });
        return { status: 'CANCELLED' };
      }
    }

    const result = await this.dispatch(notification, rendered);
    if (result.success) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          providerMessageId: result.providerMessageId ?? undefined,
          errorCode: null,
          errorMessage: null,
        },
      });
      return { status: 'SENT' };
    }

    const retryCount = notification.retryCount + 1;
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: retryCount >= MAX_RETRIES ? 'FAILED' : 'QUEUED',
        errorCode: result.errorCode ?? undefined,
        errorMessage: result.errorMessage ?? undefined,
        retryCount,
      },
    });
    return { status: retryCount >= MAX_RETRIES ? 'FAILED' : 'QUEUED' };
  }

  async markDelivered(notificationId: string, providerMessageId?: string | null): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, status: 'SENT' },
      data: { status: 'DELIVERED', deliveredAt: new Date(), providerMessageId: providerMessageId ?? undefined },
    });
  }

  /**
   * Retry path for failed notifications (status FAILED, retryCount < MAX_RETRIES).
   * Resets status to QUEUED and clears error so send() can run again.
   * When actorUserId is provided (privileged manual resend), callers must enforce NOTIFICATION_RESEND capability and audit is logged.
   */
  async retry(notificationId: string, actorUserId?: string | null): Promise<{ status: NotificationStatus }> {
    const n = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!n) throw new ValidationError('Notification not found', { notificationId });
    if (n.status !== 'FAILED') throw new ValidationError('Only FAILED notifications can be retried', { status: n.status });
    if (n.retryCount >= MAX_RETRIES) throw new ValidationError('Max retries exceeded');

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'QUEUED', errorCode: null, errorMessage: null },
    });

    if (actorUserId) {
      await this.auditLog.append({
        tenantGroupId: n.tenantGroupId,
        actorUserId,
        channel: AuditChannel.ADMIN_PORTAL,
        action: 'NOTIFICATION_RETRY_REQUESTED',
        entityType: 'NOTIFICATION',
        entityId: notificationId,
        afterSnapshot: { previousStatus: 'FAILED', retryCount: n.retryCount },
      });
    }

    return this.send(notificationId);
  }

  private async resolveTemplate(
    tenantGroupId: string,
    templateKey: string,
    channel: NotificationChannel,
  ): Promise<{ subject: string | null; bodyTemplate: string } | null> {
    const groupSpecific = await this.prisma.notificationTemplate.findFirst({
      where: { groupId: tenantGroupId, templateKey, channel },
    });
    if (groupSpecific) return { subject: groupSpecific.subject, bodyTemplate: groupSpecific.bodyTemplate };
    const globalTemplate = await this.prisma.notificationTemplate.findFirst({
      where: { groupId: null, templateKey, channel },
    });
    return globalTemplate ? { subject: globalTemplate.subject, bodyTemplate: globalTemplate.bodyTemplate } : null;
  }

  private async dispatch(
    notification: { id: string; channel: string; recipientUserId: string | null; recipientMemberId: string | null; recipientUser?: { id: string } | null; recipientMember?: { id: string; phone: string | null } | null; tenantGroupId: string },
    rendered: RenderedNotification,
  ): Promise<DispatchResult> {
    const channel = notification.channel as NotificationChannel;
    if (channel === 'IN_APP') {
      const userId = notification.recipientUserId ?? notification.recipientUser?.id;
      if (!userId) return { success: false, errorCode: 'NO_USER', errorMessage: 'In-app requires recipientUserId' };
      return this.inAppDispatcher.dispatch(
        { userId, tenantGroupId: notification.tenantGroupId },
        rendered,
        notification.id,
      );
    }
    if (channel === 'EMAIL') {
      const email = notification.recipientUser?.email ?? null;
      if (!email) return { success: false, errorCode: 'NO_EMAIL', errorMessage: 'Email channel requires user email' };
      return this.emailDispatcher.dispatch({ email }, rendered, notification.id);
    }
    if (channel === 'SMS') {
      const phone = notification.recipientMember?.phone ?? null;
      if (!phone) return { success: false, errorCode: 'NO_PHONE', errorMessage: 'SMS requires member phone' };
      return this.smsDispatcher.dispatch({ phone }, rendered, notification.id);
    }
    return { success: false, errorCode: 'UNKNOWN_CHANNEL', errorMessage: `Unknown channel: ${channel}` };
  }

  private async markFailed(notificationId: string, errorCode: string, errorMessage: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'FAILED', errorCode, errorMessage },
    });
  }
}
