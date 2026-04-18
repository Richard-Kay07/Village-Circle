import { AuditChannel } from '../domain/enums';

/** Prisma audit entity type (from schema). */
export type AuditEntityTypeName =
  | 'GROUP'
  | 'MEMBER'
  | 'CONTRIBUTION'
  | 'LOAN'
  | 'LOAN_REPAYMENT'
  | 'SOCIAL_FUND_BUCKET'
  | 'SOCIAL_FUND_ENTRY';

export interface CreateAuditEventInput {
  groupId: string;
  entityType: AuditEntityTypeName;
  entityId: string;
  action: string;
  actorId: string;
  payload?: Record<string, unknown>;
  /** Channel through which the action was performed (from request context). */
  channel?: AuditChannel;
}
