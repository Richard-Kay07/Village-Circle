import type { RenderedNotification } from './notification.types';
import type { DispatchResult } from './notification.types';
import type { SmsWebhookParseResult } from './notification.types';

/** Target for IN_APP: userId (and optional tenantGroupId for context). */
export interface InAppDispatchTarget {
  userId: string;
  tenantGroupId?: string;
}

/** Target for EMAIL: email address. */
export interface EmailDispatchTarget {
  email: string;
}

/** Target for SMS: phone number (E.164 recommended). */
export interface SmsDispatchTarget {
  phone: string;
}

export interface IInAppDispatcher {
  dispatch(target: InAppDispatchTarget, rendered: RenderedNotification, notificationId: string): Promise<DispatchResult>;
}

export interface IEmailDispatcher {
  dispatch(target: EmailDispatchTarget, rendered: RenderedNotification, notificationId: string): Promise<DispatchResult>;
}

export interface ISmsDispatcher {
  dispatch(target: SmsDispatchTarget, rendered: RenderedNotification, notificationId: string): Promise<DispatchResult>;
  /** Parse provider webhook payload and headers; validates signature in adapter. */
  parseWebhook(payload: unknown, headers?: Record<string, string>): Promise<SmsWebhookParseResult>;
}
