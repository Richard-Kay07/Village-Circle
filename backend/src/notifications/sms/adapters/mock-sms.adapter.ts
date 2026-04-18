import type {
  ISmsProviderAdapter,
  SmsSendMetadata,
  SmsSendResult,
  SmsWebhookParseResult,
  SmsWebhookPayload,
  SmsWebhookDeliveryStatus,
} from '../sms-provider.interface';

/**
 * Example mock adapter for tests and local dev.
 * In production, replace with TwilioSmsAdapter / SnsSmsAdapter etc.
 */
export class MockSmsAdapter implements ISmsProviderAdapter {
  private readonly failNext: boolean;
  private readonly signatureValid: boolean;
  /** Last sent for test assertions. */
  public lastSend: { to: string; message: string; metadata?: SmsSendMetadata } | null = null;

  constructor(options?: { failNext?: boolean; signatureValid?: boolean }) {
    this.failNext = options?.failNext ?? false;
    this.signatureValid = options?.signatureValid ?? true;
  }

  async send(to: string, message: string, metadata?: SmsSendMetadata): Promise<SmsSendResult> {
    this.lastSend = { to, message, metadata };
    if (!to?.trim()) {
      return { success: false, errorCode: 'NO_TO', errorMessage: 'Missing to' };
    }
    if (this.failNext) {
      return { success: false, errorCode: 'MOCK_FAIL', errorMessage: 'Mock adapter failure' };
    }
    const providerMessageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return { success: true, providerMessageId };
  }

  async parseWebhook(payload: unknown, headers?: Record<string, string>): Promise<SmsWebhookParseResult> {
    if (headers?.['x-mock-signature'] === 'invalid') {
      return { valid: false, signatureInvalid: true };
    }
    if (payload == null || typeof payload !== 'object') {
      return { valid: false };
    }
    const p = payload as Record<string, unknown>;
    const providerMessageId = typeof p.providerMessageId === 'string' ? p.providerMessageId : undefined;
    const status = this.normalizeStatus(p.status);
    if (!providerMessageId || !status) {
      return { valid: false };
    }
    const result: SmsWebhookPayload = {
      providerMessageId,
      status,
      errorCode: typeof p.errorCode === 'string' ? p.errorCode : undefined,
      errorMessage: typeof p.errorMessage === 'string' ? p.errorMessage : undefined,
    };
    return { valid: true, payload: result };
  }

  private normalizeStatus(s: unknown): SmsWebhookDeliveryStatus | null {
    const v = typeof s === 'string' ? s.toUpperCase() : '';
    if (['SENT', 'ACCEPTED', 'DELIVERED', 'FAILED', 'UNDELIVERABLE'].includes(v)) {
      return v as SmsWebhookDeliveryStatus;
    }
    return null;
  }
}
