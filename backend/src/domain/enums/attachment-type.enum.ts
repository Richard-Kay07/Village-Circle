/**
 * Type of attachment for classification.
 */
export enum AttachmentType {
  TRANSACTION_EVIDENCE = 'TRANSACTION_EVIDENCE',
  MEETING_MINUTES = 'MEETING_MINUTES',
  OTHER = 'OTHER',
}

export const ATTACHMENT_TYPE_VALUES: readonly string[] = Object.values(AttachmentType) as string[];

export function parseAttachmentType(value: unknown): AttachmentType {
  if (typeof value !== 'string') {
    throw new Error(`Invalid AttachmentType: expected string, got ${typeof value}`);
  }
  const upper = value.toUpperCase().replace(/-/g, '_');
  if (!ATTACHMENT_TYPE_VALUES.includes(upper)) {
    throw new Error(`Invalid AttachmentType: ${value}. Allowed: ${ATTACHMENT_TYPE_VALUES.join(', ')}`);
  }
  return upper as AttachmentType;
}

export function isAttachmentType(value: unknown): value is AttachmentType {
  return typeof value === 'string' && ATTACHMENT_TYPE_VALUES.includes(value);
}
