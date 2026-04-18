import type { IInAppDispatcher } from './notification-dispatcher.interface';
import type { InAppDispatchTarget } from './notification-dispatcher.interface';
import type { RenderedNotification } from './notification.types';
import type { DispatchResult } from './notification.types';

/**
 * In-app dispatcher: stores notification for in-app feed (persistence is the Notification record itself).
 * MVP: marking as SENT is sufficient; optional push to real-time feed can be added later.
 */
export class InAppDispatcher implements IInAppDispatcher {
  async dispatch(
    _target: InAppDispatchTarget,
    _rendered: RenderedNotification,
    _notificationId: string,
  ): Promise<DispatchResult> {
    return { success: true };
  }
}
