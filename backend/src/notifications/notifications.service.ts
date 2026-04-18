import { Injectable } from '@nestjs/common';
import { INotificationsService } from './notifications.interface';

/**
 * Notifications service skeleton. Stub implementation.
 */
@Injectable()
export class NotificationsService implements INotificationsService {
  async sendSms(phone: string, message: string): Promise<void> {
    if (!phone) return;
    // Stub: log only. Integrate with SMS provider (e.g. Twilio) for production.
    // eslint-disable-next-line no-console
    console.log('[SMS stub]', { to: phone, message });
  }
}
