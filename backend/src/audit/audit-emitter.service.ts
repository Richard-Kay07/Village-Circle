import { Injectable } from '@nestjs/common';
import { AuditChannel } from '../domain/enums';
import { AuditLogService, AuditLogInput } from './audit-log.service';

/**
 * Audit event emitter for domain modules. Single write (append) + typed helpers.
 * All events are append-only; no update/delete.
 */
@Injectable()
export class AuditService {
  constructor(private readonly auditLog: AuditLogService) {}

  /**
   * Single write method. Use typed helpers when possible.
   */
  async append(input: AuditLogInput): Promise<string> {
    return this.auditLog.append(input);
  }

  /**
   * Helper: entity created.
   */
  async entityCreated(params: {
    tenantGroupId: string | null;
    entityType: string;
    entityId: string;
    actorUserId: string | null;
    channel: AuditChannel;
    afterSnapshot?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
    actingOnBehalfOfUserId?: string | null;
  }): Promise<string> {
    return this.auditLog.append({
      tenantGroupId: params.tenantGroupId,
      actorUserId: params.actorUserId,
      actingOnBehalfOfUserId: params.actingOnBehalfOfUserId ?? undefined,
      channel: params.channel,
      action: 'CREATED',
      entityType: params.entityType,
      entityId: params.entityId,
      afterSnapshot: params.afterSnapshot ?? undefined,
      metadata: params.metadata ?? undefined,
    });
  }

  /**
   * Helper: entity updated (before/after snapshots).
   */
  async entityUpdated(params: {
    tenantGroupId: string | null;
    entityType: string;
    entityId: string;
    actorUserId: string | null;
    channel: AuditChannel;
    beforeSnapshot?: Record<string, unknown> | null;
    afterSnapshot?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<string> {
    return this.auditLog.append({
      tenantGroupId: params.tenantGroupId,
      actorUserId: params.actorUserId,
      channel: params.channel,
      action: 'UPDATED',
      entityType: params.entityType,
      entityId: params.entityId,
      beforeSnapshot: params.beforeSnapshot ?? undefined,
      afterSnapshot: params.afterSnapshot ?? undefined,
      metadata: params.metadata ?? undefined,
    });
  }

  /**
   * Helper: reversal or adjustment (append-only correction).
   */
  async entityReversed(params: {
    tenantGroupId: string | null;
    entityType: string;
    entityId: string;
    actorUserId: string | null;
    channel: AuditChannel;
    reasonCode?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<string> {
    return this.auditLog.append({
      tenantGroupId: params.tenantGroupId,
      actorUserId: params.actorUserId,
      channel: params.channel,
      action: 'REVERSED',
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata ?? undefined,
      reasonCode: params.reasonCode ?? undefined,
    });
  }

  /** Re-export support access (requires reason code). */
  async logSupportAccess(
    input: Parameters<AuditLogService['logSupportAccess']>[0],
  ): Promise<string> {
    return this.auditLog.logSupportAccess(input);
  }
}
