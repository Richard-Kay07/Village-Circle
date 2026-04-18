/**
 * Channel through which an action was performed (for audit).
 */
export enum AuditChannel {
  WEB = 'WEB',
  MOBILE_APP = 'MOBILE_APP',
  ADMIN_PORTAL = 'ADMIN_PORTAL',
  SYSTEM = 'SYSTEM',
  SMS_WEBHOOK = 'SMS_WEBHOOK',
}

export const AUDIT_CHANNEL_VALUES: readonly string[] = Object.values(AuditChannel) as string[];

export function parseAuditChannel(value: unknown): AuditChannel {
  if (typeof value !== 'string') {
    throw new Error(`Invalid AuditChannel: expected string, got ${typeof value}`);
  }
  const upper = value.toUpperCase().replace(/-/g, '_');
  if (!AUDIT_CHANNEL_VALUES.includes(upper)) {
    throw new Error(`Invalid AuditChannel: ${value}. Allowed: ${AUDIT_CHANNEL_VALUES.join(', ')}`);
  }
  return upper as AuditChannel;
}

export function isAuditChannel(value: unknown): value is AuditChannel {
  return typeof value === 'string' && AUDIT_CHANNEL_VALUES.includes(value);
}
