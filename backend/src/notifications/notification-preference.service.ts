import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupRulesService } from '../group-rules/group-rules.service';
import type { INotificationPreferenceService } from './notification-preference.interface';
import type { NotificationChannel } from './notification.types';

/** Template keys that are "receipt confirmation" and gated by tenant smsReceiptConfirmationEnabled. */
export const RECEIPT_CONFIRMATION_TEMPLATE_KEYS = ['receipt_confirmation', 'contribution_receipt', 'repayment_receipt'] as const;

@Injectable()
export class NotificationPreferenceService implements INotificationPreferenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupRules: GroupRulesService,
  ) {}

  /**
   * For SMS: checks tenant smsNotificationsEnabled, receipt-confirmation tenant flag, and member smsOptOut.
   * For other channels (MVP): allow all.
   */
  async isChannelAllowed(
    tenantGroupId: string,
    recipientUserId: string | null,
    recipientMemberId: string | null,
    channel: NotificationChannel,
    context?: { templateKey?: string },
  ): Promise<boolean> {
    if (channel !== 'SMS') {
      return true;
    }

    const snapshot = await this.groupRules.getSnapshotForLoan(tenantGroupId, new Date());
    if (!snapshot?.smsNotificationsEnabled) {
      return false;
    }

    const templateKey = context?.templateKey;
    if (templateKey && (RECEIPT_CONFIRMATION_TEMPLATE_KEYS as readonly string[]).includes(templateKey)) {
      if (!snapshot.smsReceiptConfirmationEnabled) {
        return false;
      }
    }

    const memberId = recipientMemberId ?? (recipientUserId ? await this.resolveMemberId(tenantGroupId, recipientUserId) : null);
    if (memberId) {
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
        select: { smsOptOut: true },
      });
      if (member?.smsOptOut) {
        return false;
      }
    }

    return true;
  }

  private async resolveMemberId(tenantGroupId: string, userId: string): Promise<string | null> {
    const m = await this.prisma.member.findFirst({
      where: { groupId: tenantGroupId, userId },
      select: { id: true },
    });
    return m?.id ?? null;
  }
}
