import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditChannel } from '../domain/enums';
import {
  ContributionQueryFilters,
  ContributionRowRead,
  EvidencePresence,
  MeetingContributionSummary,
  MemberContributionHistoryResult,
  UnreconciledBankTransferItem,
  CashTotalsByMeetingOrDate,
  GroupContributionListResult,
} from './contribution-read.types';

@Injectable()
export class ContributionReadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Meeting contribution summary: totals by mode and bucket, plus contribution rows.
   * Tenant-isolated; filters by meeting and optional date/mode/bucket.
   */
  async getMeetingSummary(
    tenantGroupId: string,
    meetingId: string,
    filters: ContributionQueryFilters = {},
    options: { includeSensitiveFields?: boolean; actorUserId?: string | null } = {},
  ): Promise<MeetingContributionSummary | null> {
    await this.groupService.getOrThrow(tenantGroupId);
    const meeting = await this.prisma.meeting.findFirst({
      where: { id: meetingId, groupId: tenantGroupId },
    });
    if (!meeting) return null;

    const where = this.buildWhere(tenantGroupId, { ...filters, meetingId });
    const contributions = await this.prisma.contribution.findMany({
      where,
      include: { evidenceFile: true },
      orderBy: { recordedAt: 'asc' },
    });

    let totalSavingsMinor = 0;
    let totalSocialFundMinor = 0;
    const byMode = {
      CASH: { count: 0, savingsMinor: 0, socialFundMinor: 0 },
      BANK_TRANSFER: { count: 0, savingsMinor: 0, socialFundMinor: 0 },
    };

    const rows: ContributionRowRead[] = contributions.map((c) => {
      const savings = c.savingsAmountMinor ?? 0;
      const social = c.socialFundAmountMinor ?? 0;
      const total = c.totalAmountMinor ?? savings + social;
      totalSavingsMinor += savings;
      totalSocialFundMinor += social;
      const mode = (c.transactionMode as 'CASH' | 'BANK_TRANSFER') || 'CASH';
      byMode[mode].count += 1;
      byMode[mode].savingsMinor += savings;
      byMode[mode].socialFundMinor += social;
      return this.toContributionRow(c, options.includeSensitiveFields);
    });

    return {
      meetingId: meeting.id,
      tenantGroupId: meeting.groupId,
      heldAt: meeting.heldAt,
      meetingName: meeting.name,
      totalSavingsMinor,
      totalSocialFundMinor,
      totalAmountMinor: totalSavingsMinor + totalSocialFundMinor,
      byMode,
      contributions: rows,
    };
  }

  /**
   * Member contribution history with optional filters.
   */
  async getMemberHistory(
    tenantGroupId: string,
    memberProfileId: string,
    filters: ContributionQueryFilters = {},
    options: { includeSensitiveFields?: boolean } = {},
  ): Promise<MemberContributionHistoryResult | null> {
    await this.groupService.getOrThrow(tenantGroupId);
    const member = await this.prisma.member.findFirst({
      where: { id: memberProfileId, groupId: tenantGroupId },
    });
    if (!member) return null;

    const where = this.buildWhere(tenantGroupId, { ...filters }, memberProfileId);
    const contributions = await this.prisma.contribution.findMany({
      where,
      include: { evidenceFile: true },
      orderBy: { recordedAt: 'desc' },
      take: 500,
    });

    let totalSavingsMinor = 0;
    let totalSocialFundMinor = 0;
    const rows: ContributionRowRead[] = contributions.map((c) => {
      const savings = c.savingsAmountMinor ?? 0;
      const social = c.socialFundAmountMinor ?? 0;
      totalSavingsMinor += savings;
      totalSocialFundMinor += social;
      return this.toContributionRow(c, options.includeSensitiveFields);
    });

    return {
      memberProfileId,
      tenantGroupId,
      contributions: rows,
      totalSavingsMinor,
      totalSocialFundMinor,
      totalAmountMinor: totalSavingsMinor + totalSocialFundMinor,
    };
  }

  /**
   * List contributions for a group with optional filters. Returns rows and totals by bucket and mode.
   */
  async listByGroupWithFilters(
    tenantGroupId: string,
    filters: ContributionQueryFilters = {},
    options: { includeSensitiveFields?: boolean; actorUserId?: string | null } = {},
  ): Promise<GroupContributionListResult> {
    await this.groupService.getOrThrow(tenantGroupId);
    const where = this.buildWhere(tenantGroupId, { ...filters });
    const contributions = await this.prisma.contribution.findMany({
      where,
      include: { evidenceFile: true },
      orderBy: { recordedAt: 'desc' },
      take: 500,
    });

    let totalSavingsMinor = 0;
    let totalSocialFundMinor = 0;
    const byMode = {
      CASH: { count: 0, savingsMinor: 0, socialFundMinor: 0 },
      BANK_TRANSFER: { count: 0, savingsMinor: 0, socialFundMinor: 0 },
    };

    const rows: ContributionRowRead[] = contributions.map((c) => {
      const savings = c.savingsAmountMinor ?? 0;
      const social = c.socialFundAmountMinor ?? 0;
      const mode = (c.transactionMode as 'CASH' | 'BANK_TRANSFER') || 'CASH';
      totalSavingsMinor += savings;
      totalSocialFundMinor += social;
      byMode[mode].count += 1;
      byMode[mode].savingsMinor += savings;
      byMode[mode].socialFundMinor += social;
      return this.toContributionRow(c, options.includeSensitiveFields);
    });

    return {
      contributions: rows,
      totalSavingsMinor,
      totalSocialFundMinor,
      totalAmountMinor: totalSavingsMinor + totalSocialFundMinor,
      byMode,
    };
  }

  /**
   * Unreconciled bank-transfer contributions (query-ready for reconciliation).
   * RECORDED only; optional date/member filters. Emits audit when export-style read.
   */
  async getUnreconciledBankTransfers(
    tenantGroupId: string,
    filters: ContributionQueryFilters = {},
    options: { includeSensitiveFields?: boolean; actorUserId?: string | null; auditExport?: boolean } = {},
  ): Promise<UnreconciledBankTransferItem[]> {
    await this.groupService.getOrThrow(tenantGroupId);
    const where = this.buildWhere(tenantGroupId, {
      ...filters,
      transactionMode: 'BANK_TRANSFER',
      status: 'RECORDED',
    });
    const list = await this.prisma.contribution.findMany({
      where,
      include: { evidenceFile: true },
      orderBy: [{ recordedAt: 'asc' }, { createdAt: 'asc' }],
    });

    if (options.auditExport && options.actorUserId) {
      await this.auditLog.append({
        tenantGroupId,
        actorUserId: options.actorUserId,
        channel: AuditChannel.WEB,
        action: 'CONTRIBUTION_REPORT_READ',
        entityType: 'CONTRIBUTION_REPORT',
        entityId: `unreconciled-bank:${tenantGroupId}`,
        afterSnapshot: { reportType: 'unreconciled_bank_transfers', count: list.length },
        metadata: { filters },
      });
    }

    return list.map((c) => ({
      id: c.id,
      tenantGroupId: c.groupId,
      meetingId: c.meetingId,
      memberProfileId: c.memberId,
      savingsAmountMinor: c.savingsAmountMinor ?? 0,
      socialFundAmountMinor: c.socialFundAmountMinor ?? 0,
      totalAmountMinor: c.totalAmountMinor ?? 0,
      ...(options.includeSensitiveFields && { externalReferenceText: c.externalReferenceText }),
      evidencePresence: this.evidencePresence(c),
      ledgerEventId: c.ledgerEventId,
      recordedAt: c.recordedAt,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Cash contribution totals grouped by meeting or by date.
   * SOCIAL_FUND and SAVINGS reported separately.
   */
  async getCashTotalsByMeetingOrDate(
    tenantGroupId: string,
    groupBy: 'meeting' | 'date',
    filters: ContributionQueryFilters = {},
  ): Promise<CashTotalsByMeetingOrDate[]> {
    await this.groupService.getOrThrow(tenantGroupId);
    const where = this.buildWhere(tenantGroupId, {
      ...filters,
      transactionMode: 'CASH',
      status: 'RECORDED',
    });
    const contributions = await this.prisma.contribution.findMany({
      where,
      include: { meeting: true },
      orderBy: { recordedAt: 'asc' },
    });

    const map = new Map<string, { count: number; savings: number; social: number; meetingId: string | null; date: string; meetingName?: string | null }>();

    for (const c of contributions) {
      const savings = c.savingsAmountMinor ?? 0;
      const social = c.socialFundAmountMinor ?? 0;
      const key = groupBy === 'meeting' && c.meetingId
        ? c.meetingId
        : (c.recordedAt ?? c.createdAt).toISOString().slice(0, 10);
      const existing = map.get(key);
      const date = (c.recordedAt ?? c.createdAt).toISOString().slice(0, 10);
      if (existing) {
        existing.count += 1;
        existing.savings += savings;
        existing.social += social;
      } else {
        map.set(key, {
          count: 1,
          savings,
          social,
          meetingId: c.meetingId,
          date,
          meetingName: c.meeting?.name ?? undefined,
        });
      }
    }

    return Array.from(map.entries()).map(([groupKey, agg]) => ({
      groupKey,
      isMeeting: groupBy === 'meeting' && !!agg.meetingId,
      meetingId: agg.meetingId,
      date: agg.date,
      meetingName: agg.meetingName,
      count: agg.count,
      totalSavingsMinor: agg.savings,
      totalSocialFundMinor: agg.social,
      totalAmountMinor: agg.savings + agg.social,
    }));
  }

  private buildWhere(
    tenantGroupId: string,
    filters: ContributionQueryFilters,
    memberId?: string,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {
      groupId: tenantGroupId,
    };
    const byMember = memberId ?? filters.memberId;
    if (byMember) where.memberId = byMember;
    if (filters.meetingId) where.meetingId = filters.meetingId;
    if (filters.transactionMode) where.transactionMode = filters.transactionMode;
    if (filters.status) where.status = filters.status;

    const dateConditions: { recordedAt?: { gte?: Date; lte?: Date } } = {};
    if (filters.dateFrom) {
      dateConditions.recordedAt = { ...(dateConditions.recordedAt ?? {}), gte: new Date(filters.dateFrom + 'T00:00:00.000Z') };
    }
    if (filters.dateTo) {
      dateConditions.recordedAt = { ...(dateConditions.recordedAt ?? {}), lte: new Date(filters.dateTo + 'T23:59:59.999Z') };
    }
    if (Object.keys(dateConditions).length) {
      where.recordedAt = dateConditions.recordedAt;
    }

    if (filters.fundBucket) {
      if (filters.fundBucket === 'SAVINGS') {
        where.savingsAmountMinor = { gt: 0 };
      } else {
        where.socialFundAmountMinor = { gt: 0 };
      }
    }

    return where;
  }

  private toContributionRow(c: {
    id: string;
    groupId: string;
    meetingId: string | null;
    memberId: string;
    transactionMode: string | null;
    savingsAmountMinor: number | null;
    socialFundAmountMinor: number | null;
    totalAmountMinor: number | null;
    externalReferenceText: string | null;
    evidenceFileId: string | null;
    ledgerEventId: string | null;
    status: string;
    recordedAt: Date | null;
    createdAt: Date;
  }, includeSensitive?: boolean): ContributionRowRead {
    const savings = c.savingsAmountMinor ?? 0;
    const social = c.socialFundAmountMinor ?? 0;
    return {
      id: c.id,
      tenantGroupId: c.groupId,
      meetingId: c.meetingId,
      memberProfileId: c.memberId,
      transactionMode: c.transactionMode,
      savingsAmountMinor: savings,
      socialFundAmountMinor: social,
      totalAmountMinor: c.totalAmountMinor ?? savings + social,
      ...(includeSensitive && { externalReferenceText: c.externalReferenceText }),
      evidencePresence: this.evidencePresence(c),
      ledgerEventId: c.ledgerEventId,
      status: c.status,
      recordedAt: c.recordedAt,
      createdAt: c.createdAt,
    };
  }

  private evidencePresence(c: { externalReferenceText: string | null; evidenceFileId: string | null }): EvidencePresence {
    return {
      hasText: !!c.externalReferenceText?.trim(),
      hasImage: !!c.evidenceFileId,
      evidenceAttachmentId: c.evidenceFileId,
    };
  }
}
