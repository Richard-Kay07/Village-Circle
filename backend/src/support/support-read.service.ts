import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

export interface AuditLogEntry {
  id: string;
  tenantGroupId: string | null;
  actorUserId: string | null;
  channel: string;
  action: string;
  entityType: string;
  entityId: string;
  reasonCode: string | null;
  sequenceNo: number;
  createdAt: Date;
}

export interface AuditLogFilteredResult {
  items: AuditLogEntry[];
  nextCursor: string | null;
}

export interface SmsFailureEntry {
  id: string;
  tenantGroupId: string;
  recipientMemberId: string | null;
  templateKey: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: Date;
}

export interface SmsFailuresResult {
  items: SmsFailureEntry[];
  nextCursor: string | null;
}

export interface EvidenceAccessEntry {
  id: string;
  tenantGroupId: string | null;
  actorUserId: string | null;
  action: string;
  entityId: string;
  reasonCode: string | null;
  sequenceNo: number;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface EvidenceAccessResult {
  items: EvidenceAccessEntry[];
  nextCursor: string | null;
}

@Injectable()
export class SupportReadService {
  constructor(private readonly prisma: PrismaService) {}

  async listAuditLogFiltered(params: {
    tenantGroupId: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    cursor?: string; // sequenceNo as string
  }): Promise<AuditLogFilteredResult> {
    const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const where: Record<string, unknown> = { tenantGroupId: params.tenantGroupId };
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.action) where.action = params.action;
    if (params.fromDate || params.toDate) {
      where.createdAt = {};
      if (params.fromDate) (where.createdAt as Record<string, Date>).gte = params.fromDate;
      if (params.toDate) (where.createdAt as Record<string, Date>).lte = params.toDate;
    }
    const cursorCond = params.cursor ? { sequenceNo: { lt: Number(params.cursor) } } : {};
    const items = await this.prisma.auditLog.findMany({
      where: { ...where, ...cursorCond },
      orderBy: { sequenceNo: 'desc' },
      take: limit + 1,
      select: {
        id: true,
        tenantGroupId: true,
        actorUserId: true,
        channel: true,
        action: true,
        entityType: true,
        entityId: true,
        reasonCode: true,
        sequenceNo: true,
        createdAt: true,
      },
    });
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? String(page[page.length - 1].sequenceNo) : null;
    return {
      items: page.map((e) => ({
        id: e.id,
        tenantGroupId: e.tenantGroupId,
        actorUserId: e.actorUserId,
        channel: e.channel,
        action: e.action,
        entityType: e.entityType,
        entityId: e.entityId,
        reasonCode: e.reasonCode,
        sequenceNo: e.sequenceNo,
        createdAt: e.createdAt,
      })),
      nextCursor,
    };
  }

  async listSmsFailures(params: {
    tenantGroupId?: string;
    limit?: number;
    cursor?: string; // notification id
  }): Promise<SmsFailuresResult> {
    const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const where: Record<string, unknown> = { channel: 'SMS', status: 'FAILED' };
    if (params.tenantGroupId) where.tenantGroupId = params.tenantGroupId;
    const cursorCond = params.cursor ? { id: { lt: params.cursor } } : {};
    const items = await this.prisma.notification.findMany({
      where: { ...where, ...cursorCond },
      orderBy: { id: 'desc' },
      take: limit + 1,
      select: {
        id: true,
        tenantGroupId: true,
        recipientMemberId: true,
        templateKey: true,
        status: true,
        errorCode: true,
        errorMessage: true,
        retryCount: true,
        createdAt: true,
      },
    });
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? page[page.length - 1].id : null;
    return {
      items: page.map((e) => ({
        id: e.id,
        tenantGroupId: e.tenantGroupId,
        recipientMemberId: e.recipientMemberId,
        templateKey: e.templateKey,
        status: e.status,
        errorCode: e.errorCode,
        errorMessage: e.errorMessage,
        retryCount: e.retryCount,
        createdAt: e.createdAt,
      })),
      nextCursor,
    };
  }

  async listEvidenceAccessHistory(params: {
    tenantGroupId: string;
    evidenceFileId?: string;
    limit?: number;
    cursor?: string;
  }): Promise<EvidenceAccessResult> {
    const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const where: Prisma.AuditLogWhereInput = { tenantGroupId: params.tenantGroupId, action: 'EVIDENCE_VIEW' };
    if (params.evidenceFileId) {
      where.metadata = { path: ['evidenceFileId'], equals: params.evidenceFileId };
    }
    const cursorCond = params.cursor ? { sequenceNo: { lt: Number(params.cursor) } } : {};
    const items = await this.prisma.auditLog.findMany({
      where: { ...where, ...cursorCond },
      orderBy: { sequenceNo: 'desc' },
      take: limit + 1,
      select: {
        id: true,
        tenantGroupId: true,
        actorUserId: true,
        action: true,
        entityId: true,
        reasonCode: true,
        sequenceNo: true,
        createdAt: true,
        metadata: true,
      },
    });
    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? String(page[page.length - 1].sequenceNo) : null;
    return {
      items: page.map((e) => ({
        id: e.id,
        tenantGroupId: e.tenantGroupId,
        actorUserId: e.actorUserId,
        action: e.action,
        entityId: e.entityId,
        reasonCode: e.reasonCode,
        sequenceNo: e.sequenceNo,
        createdAt: e.createdAt,
        metadata: e.metadata as Record<string, unknown> | undefined,
      })),
      nextCursor,
    };
  }
}
