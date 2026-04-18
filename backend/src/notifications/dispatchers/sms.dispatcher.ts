import { Inject, Injectable } from '@nestjs/common';
import type { ISmsProviderAdapter } from '../sms/sms-provider.interface';
import { SMS_PROVIDER_ADAPTER } from '../sms/sms.constants';
import type { SmsWebhookParseResult } from '../notification.types';
import type { ISmsDispatcher } from '../notification-dispatcher.interface';
import type { SmsDispatchTarget } from '../notification-dispatcher.interface';
import type { RenderedNotification } from '../notification.types';
import type { DispatchResult } from '../notification.types';

/**
 * SMS dispatcher: provider-agnostic wrapper. Uses ISmsProviderAdapter for send and webhook parsing.
 */
export class SmsDispatcher implements ISmsDispatcher {
  constructor(@Inject(SMS_PROVIDER_ADAPTER) private readonly adapter: ISmsProviderAdapter) {}

  async dispatch(
    target: SmsDispatchTarget,
    rendered: RenderedNotification,
    notificationId: string,
  ): Promise<DispatchResult> {
    if (!target.phone?.trim()) {
      return { success: false, errorCode: 'NO_PHONE', errorMessage: 'No phone number' };
    }
    const result = await this.adapter.send(target.phone, rendered.body, { notificationId });
    return {
      success: result.success,
      providerMessageId: result.providerMessageId,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
    };
  }

  async parseWebhook(payload: unknown, headers?: Record<string, string>): Promise<SmsWebhookParseResult> {
    const result = await this.adapter.parseWebhook(payload, headers);
    return {
      valid: result.valid,
      signatureInvalid: result.signatureInvalid,
      payload: result.payload ?? undefined,
    };
  }
}
