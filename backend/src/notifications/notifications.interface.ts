/**
 * Notifications module interfaces (skeleton).
 */

export interface INotificationsService {
  sendSms(phone: string, message: string): Promise<void>;
}
