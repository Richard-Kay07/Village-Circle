import type { IEmailDispatcher } from '../notification-dispatcher.interface';
import type { EmailDispatchTarget } from '../notification-dispatcher.interface';
import type { RenderedNotification } from '../notification.types';
import type { DispatchResult } from '../notification.types';

/**
 * Email dispatcher stub. Integrate with SendGrid/SES/etc. for production.
 */
export class EmailDispatcher implements IEmailDispatcher {
  async dispatch(
    target: EmailDispatchTarget,
    rendered: RenderedNotification,
    _notificationId: string,
  ): Promise<DispatchResult> {
    if (!target.email?.trim()) {
      return { success: false, errorCode: 'NO_EMAIL', errorMessage: 'No email address' };
    }
    return { success: true };
  }
}
