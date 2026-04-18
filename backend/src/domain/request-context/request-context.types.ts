import { AuditChannel } from '../enums';

/**
 * Request-scoped context for actor, tenant, channel and request metadata.
 * Captured per request and available to services for audit and RBAC.
 */
export interface RequestContext {
  /** Authenticated user id (null if unauthenticated). */
  actorUserId: string | null;
  /** Tenant group id for the request (null if platform-level). */
  tenantGroupId: string | null;
  /** Channel through which the request was made. */
  channel: AuditChannel;
  /** Unique request id for tracing (e.g. UUID). */
  requestId: string;
  /** Client IP when available. */
  ip?: string;
  /** User-Agent when available. */
  userAgent?: string;
}

export const REQUEST_CONTEXT_KEY = 'REQUEST_CONTEXT';
