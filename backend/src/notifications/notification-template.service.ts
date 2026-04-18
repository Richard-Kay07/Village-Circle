import type { NotificationChannel } from './notification.types';
import type { RenderedNotification } from './notification.types';
import type { DispatchResult } from './notification.types';

/**
 * Renders a template string with simple {{variable}} interpolation.
 * Replaces {{key}} with payload[key]; leaves unknown keys as-is (or empty if strictMode false).
 */
export function renderTemplate(
  bodyTemplate: string,
  payload: Record<string, string | number | boolean> | null | undefined,
): string {
  const vars = payload ?? {};
  return bodyTemplate.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      return String(vars[key]);
    }
    return '';
  });
}

/**
 * Renders subject and body for a template. Subject uses same interpolation.
 */
export function renderNotification(
  subject: string | null | undefined,
  bodyTemplate: string,
  payload: Record<string, string | number | boolean> | null | undefined,
): RenderedNotification {
  return {
    subject: subject != null && subject !== '' ? renderTemplate(subject, payload) : null,
    body: renderTemplate(bodyTemplate, payload),
  };
}

export type { NotificationChannel, RenderedNotification, DispatchResult };
