/**
 * Provider-agnostic SMS adapter. Implement for Twilio, SNS, etc.
 * Domain services depend on this interface only.
 */

export interface SmsSendMetadata {
  /** Internal notification id for correlation with webhooks. */
  notificationId?: string;
  [key: string]: string | undefined;
}

export interface SmsSendResult {
  success: boolean;
  providerMessageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

/** Provider delivery status (e.g. delivered, failed, undeliverable). */
export type SmsWebhookDeliveryStatus = 'SENT' | 'ACCEPTED' | 'DELIVERED' | 'FAILED' | 'UNDELIVERABLE';

export interface SmsWebhookPayload {
  /** Provider message/sid to correlate with Notification.providerMessageId. */
  providerMessageId: string;
  status: SmsWebhookDeliveryStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface SmsWebhookParseResult {
  valid: boolean;
  /** If signature validation is implemented and fails. */
  signatureInvalid?: boolean;
  payload?: SmsWebhookPayload | null;
}

export interface ISmsProviderAdapter {
  /**
   * Send SMS. to = E.164 recommended.
   */
  send(to: string, message: string, metadata?: SmsSendMetadata): Promise<SmsSendResult>;

  /**
   * Parse and validate webhook body/headers. Returns parsed payload and validation result.
   * Adapter may validate provider signature; if so, set signatureInvalid on failure.
   */
  parseWebhook(payload: unknown, headers?: Record<string, string>): Promise<SmsWebhookParseResult>;
}
