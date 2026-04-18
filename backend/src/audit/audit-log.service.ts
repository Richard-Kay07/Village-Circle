import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditChannel } from '../domain/enums';

/** Single write input for append-only audit log. */
export interface AuditLogInput {
  tenantGroupId: string | null;
  actorUserId: string | null;
  actingOnBehalfOfUserId?: string | null;
  channel: AuditChannel;
  action: string;
  entityType: string;
  entityId: string;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  reasonCode?: string | null;
}

/** Support access log: requires reason code and case/incident id. */
export interface SupportAccessLogInput {
  supportCaseOrIncidentId: string;
  reasonCode: string;
  actorUserId: string;
  tenantGroupId: string;
  channel: AuditChannel;
  action?: string;
  metadata?: Record<string, unknown> | null;
}

/** Thrown when support access is attempted without required reason code. */
export class SupportAccessReasonRequiredError extends Error {
  constructor() {
    super('Support access requires reasonCode and supportCaseOrIncidentId');
    this.name = 'SupportAccessReasonRequiredError';
  }
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append an audit event. Immutable; no update/delete.
   * sequenceNo is monotonic per tenant (per tenantGroupId; null tenant = global sequence).
   */
  async append(input: AuditLogInput): Promise<string> {
    const sequenceNo = await this.nextSequence(input.tenantGroupId);
    const row = await this.prisma.auditLog.create({
      data: {
        tenantGroupId: input.tenantGroupId,
        actorUserId: input.actorUserId,
        actingOnBehalfOfUserId: input.actingOnBehalfOfUserId ?? undefined,
        channel: input.channel,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        beforeSnapshot: input.beforeSnapshot ?? undefined,
        afterSnapshot: input.afterSnapshot ?? undefined,
        metadata: input.metadata ?? undefined,
        reasonCode: input.reasonCode ?? undefined,
        sequenceNo,
      },
    });
    return row.id;
  }

  /** Get next monotonic sequence number for the tenant (or global). Uses atomic upsert. */
  private async nextSequence(tenantGroupId: string | null): Promise<number> {
    const result = await this.prisma.$queryRaw<[{ nextValue: number }]>`
      INSERT INTO "AuditSequence" (id, "tenantGroupId", "nextValue")
      VALUES (gen_random_uuid(), ${tenantGroupId}, 1)
      ON CONFLICT ("tenantGroupId") DO UPDATE SET "nextValue" = "AuditSequence"."nextValue" + 1
      RETURNING "nextValue"
    `;
    return Number(result[0]?.nextValue ?? 1);
  }

  /**
   * Log support/admin access. Rejects if reasonCode or supportCaseOrIncidentId is missing.
   */
  async logSupportAccess(input: SupportAccessLogInput): Promise<string> {
    if (!input.reasonCode?.trim() || !input.supportCaseOrIncidentId?.trim()) {
      throw new SupportAccessReasonRequiredError();
    }
    return this.append({
      tenantGroupId: input.tenantGroupId,
      actorUserId: input.actorUserId,
      channel: input.channel,
      action: input.action ?? 'SUPPORT_ACCESS',
      entityType: 'SUPPORT_ACCESS',
      entityId: input.supportCaseOrIncidentId,
      metadata: {
        ...(input.metadata ?? {}),
        supportCaseOrIncidentId: input.supportCaseOrIncidentId,
      },
      reasonCode: input.reasonCode,
    });
  }
}
