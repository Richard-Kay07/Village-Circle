/**
 * Notification domain types and channel/status enums.
 */

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum NotificationStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface NotificationTemplateRecord {
  id: string;
  templateKey: string;
  channel: NotificationChannel;
  subject: string | null;
  bodyTemplate: string;
}

export interface QueueNotificationInput {
  tenantGroupId: string;
  recipientUserId?: string | null;
  recipientMemberId?: string | null;
  channel: NotificationChannel;
  templateKey: string;
  payload?: Record<string, string | number | boolean> | null;
  /** If true, skip user preference check (e.g. mandatory system messages). */
  mandatory?: boolean;
}

export interface DispatchResult {
  success: boolean;
  providerMessageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface RenderedNotification {
  subject: string | null;
  body: string;
}

/** SMS webhook parse result from provider adapter. */
export interface SmsWebhookParseResult {
  valid: boolean;
  signatureInvalid?: boolean;
  payload?: {
    providerMessageId: string;
    status: 'SENT' | 'ACCEPTED' | 'DELIVERED' | 'FAILED' | 'UNDELIVERABLE';
    errorCode?: string | null;
    errorMessage?: string | null;
  } | null;
}
