import type { NotificationChannel } from './notification.types';

export interface NotificationPreferenceContext {
  templateKey?: string;
}

/**
 * Determines if a notification is allowed for the given channel (tenant + user/member preferences).
 */
export interface INotificationPreferenceService {
  isChannelAllowed(
    tenantGroupId: string,
    recipientUserId: string | null,
    recipientMemberId: string | null,
    channel: NotificationChannel,
    context?: NotificationPreferenceContext,
  ): Promise<boolean>;
}
