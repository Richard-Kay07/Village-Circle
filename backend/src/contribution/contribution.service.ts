import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { LedgerPostingService } from '../ledger/ledger-posting.service';
import { NotificationTriggerService } from '../notifications/notification-trigger.service';
import { FundBucket } from '../domain/enums';
import { AuditChannel } from '../domain/enums';
import { Permission } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import {
  RecordContributionDto,
  BulkRecordContributionsDto,
  ReversalContributionDto,
  TransactionMode,
} from './contribution.dto';
import {
  ContributionNotFoundError,
  ContributionAlreadyReversedError,
  EvidenceNotFoundOrWrongGroupError,
} from './contribution.errors';
import { tenantRequiresEvidenceForBankTransfer } from './contribution-policy';

export interface ContributionDetailResult {
  id: string;
  tenantGroupId: string;
  meetingId: string | null;
  memberProfileId: string;
  transactionMode: string | null;
  savingsAmountMinor: number;
  socialFundAmountMinor: number;
  totalAmountMinor: number;
  externalReferenceText: string | null;
  evidenceAttachmentId: string | null;
  status: string;
  recordedByUserId: string | null;
  recordedAt: Date | null;
  reversedByUserId: string | null;
  reversedAt: Date | null;
  reversalReason: string | null;
  ledgerEventId: string | null;
  idempotencyKey: string | null;
  createdAt: Date;
}

@Injectable()
export class ContributionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly rbac: RbacService,
    private readonly auditLog: AuditLogService,
    private readonly ledgerPosting: LedgerPostingService,
    private readonly notificationTriggers: NotificationTriggerService,
  ) {}

  /**
   * Record a single contribution. Idempotent when idempotencyKey is reused (returns existing).
   */
  async record(
    dto: RecordContributionDto,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
  ): Promise<{ id: string; createdAt: Date }> {
    const actor = dto.actorUserId ?? dto.recordedByUserId ?? actorUserId ?? null;
    await this.rbac.requirePermission(dto.tenantGroupId, actor, Permission.CONTRIBUTION_RECORD, {}, undefined);
    const recordedBy = dto.recordedByUserId ?? actorUserId ?? 'system';
    this.validateAmounts(dto.savingsAmountMinor, dto.socialFundAmountMinor);
    await this.validateTenantMemberMeeting(dto.tenantGroupId, dto.memberProfileId, dto.meetingId);
    await this.validateEvidence(dto.tenantGroupId, dto.evidenceAttachmentId, dto.transactionMode, dto.externalReferenceText);

    const existing = await this.prisma.contribution.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      if (existing.groupId !== dto.tenantGroupId) {
        throw new ValidationError('Idempotency key already used for another tenant', {
          idempotencyKey: dto.idempotencyKey,
        });
      }
      return { id: existing.id, createdAt: existing.createdAt };
    }

    const totalMinor = dto.savingsAmountMinor + dto.socialFundAmountMinor;
    const lines: { fundBucket: FundBucket; memberId: string | null; amountMinor: number }[] = [];
    // Double-entry: credit member (positive), debit group-level (negative) per bucket
    if (dto.savingsAmountMinor > 0) {
      lines.push({ fundBucket: FundBucket.SAVINGS, memberId: dto.memberProfileId, amountMinor: dto.savingsAmountMinor });
      lines.push({ fundBucket: FundBucket.SAVINGS, memberId: null, amountMinor: -dto.savingsAmountMinor });
    }
    if (dto.socialFundAmountMinor > 0) {
      lines.push({ fundBucket: FundBucket.SOCIAL_FUND, memberId: dto.memberProfileId, amountMinor: dto.socialFundAmountMinor });
      lines.push({ fundBucket: FundBucket.SOCIAL_FUND, memberId: null, amountMinor: -dto.socialFundAmountMinor });
    }

    const ledgerResult = await this.ledgerPosting.post(
      {
        tenantGroupId: dto.tenantGroupId,
        sourceEventType: 'CONTRIBUTION_RECORDED',
        sourceEventId: dto.idempotencyKey,
        transactionMode: dto.transactionMode,
        eventTimestamp: new Date(),
        recordedByUserId: recordedBy,
        idempotencyKey: `contribution:${dto.idempotencyKey}`,
        lines,
        metadata: {
          contributionIdempotencyKey: dto.idempotencyKey,
          memberProfileId: dto.memberProfileId,
          meetingId: dto.meetingId ?? null,
          externalReferenceText: dto.externalReferenceText ?? null,
          evidenceAttachmentId: dto.evidenceAttachmentId ?? null,
        },
      },
      channel,
    );

    const contribution = await this.prisma.contribution.create({
      data: {
        groupId: dto.tenantGroupId,
        memberId: dto.memberProfileId,
        meetingId: dto.meetingId ?? undefined,
        transactionMode: dto.transactionMode,
        savingsAmountMinor: dto.savingsAmountMinor,
        socialFundAmountMinor: dto.socialFundAmountMinor,
        totalAmountMinor,
        externalReferenceText: dto.externalReferenceText ?? undefined,
        evidenceFileId: dto.evidenceAttachmentId ?? undefined,
        status: 'RECORDED',
        recordedByUserId: recordedBy,
        recordedAt: new Date(),
        ledgerEventId: ledgerResult.ledgerEventId,
        idempotencyKey: dto.idempotencyKey,
        amount: totalMinor / 100,
        type: 'CONTRIBUTION',
        createdByMemberId: recordedBy,
      },
    });

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: recordedBy,
      channel,
      action: 'CONTRIBUTION_RECORDED',
      entityType: 'CONTRIBUTION',
      entityId: contribution.id,
      afterSnapshot: {
        contributionId: contribution.id,
        memberProfileId: dto.memberProfileId,
        totalAmountMinor,
        transactionMode: dto.transactionMode,
        ledgerEventId: ledgerResult.ledgerEventId,
      },
      metadata: { idempotencyKey: dto.idempotencyKey },
    });

    void this.notificationTriggers
      .contributionReceipt({
        tenantGroupId: dto.tenantGroupId,
        memberId: dto.memberProfileId,
        contributionId: contribution.id,
        recordType: 'contribution',
      })
      .catch(() => {});

    return { id: contribution.id, createdAt: contribution.createdAt };
  }

  /**
   * Bulk record contributions for a meeting. Each item has its own idempotency key.
   */
  async recordBulk(
    dto: BulkRecordContributionsDto,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
  ): Promise<{ recorded: number; ids: string[] }> {
    const actor = dto.actorUserId ?? dto.recordedByUserId ?? actorUserId ?? null;
    await this.rbac.requirePermission(dto.tenantGroupId, actor, Permission.CONTRIBUTION_RECORD, {}, undefined);
    await this.validateTenantMemberMeeting(dto.tenantGroupId, null, dto.meetingId);
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: dto.meetingId },
    });
    if (!meeting || meeting.groupId !== dto.tenantGroupId) {
      throw new ValidationError('Meeting not found or does not belong to tenant', {
        meetingId: dto.meetingId,
        tenantGroupId: dto.tenantGroupId,
      });
    }

    const recordedBy = dto.recordedByUserId ?? actorUserId ?? 'system';
    const ids: string[] = [];

    for (const item of dto.contributions) {
      this.validateAmounts(item.savingsAmountMinor, item.socialFundAmountMinor);
      await this.validateTenantMemberMeeting(dto.tenantGroupId, item.memberProfileId, dto.meetingId);
      await this.validateEvidence(dto.tenantGroupId, item.evidenceAttachmentId, item.transactionMode, item.externalReferenceText);
    }

    for (const item of dto.contributions) {
      const single: RecordContributionDto = {
        tenantGroupId: dto.tenantGroupId,
        meetingId: dto.meetingId,
        memberProfileId: item.memberProfileId,
        transactionMode: item.transactionMode,
        savingsAmountMinor: item.savingsAmountMinor,
        socialFundAmountMinor: item.socialFundAmountMinor,
        externalReferenceText: item.externalReferenceText,
        evidenceAttachmentId: item.evidenceAttachmentId,
        idempotencyKey: item.idempotencyKey,
        recordedByUserId: recordedBy,
      };
      const result = await this.record(single, channel, actorUserId);
      ids.push(result.id);
    }

    return { recorded: ids.length, ids };
  }

  /**
   * Reversal: no destructive edit. Creates reversal state and reversing ledger event.
   */
  async reversal(
    dto: ReversalContributionDto,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
  ): Promise<{ id: string; createdAt: Date }> {
    const actor = dto.actorUserId ?? dto.reversedByUserId ?? actorUserId ?? null;
    await this.rbac.requirePermission(dto.tenantGroupId, actor, Permission.CONTRIBUTION_REVERSE, {}, undefined);
    const reversedBy = dto.reversedByUserId ?? actorUserId ?? 'system';
    const contribution = await this.prisma.contribution.findUnique({
      where: { id: dto.contributionId },
      include: { group: true },
    });
    if (!contribution) throw new ContributionNotFoundError(dto.contributionId);
    if (contribution.groupId !== dto.tenantGroupId) {
      throw new ValidationError('Contribution does not belong to tenant', {
        contributionId: dto.contributionId,
        tenantGroupId: dto.tenantGroupId,
      });
    }
    if (contribution.status === 'REVERSED') {
      throw new ContributionAlreadyReversedError(dto.contributionId);
    }
    if (!contribution.ledgerEventId) {
      throw new ValidationError('Contribution has no ledger event to reverse', {
        contributionId: dto.contributionId,
      });
    }

    const reversalLedger = await this.ledgerPosting.reversal(
      {
        ledgerEventId: contribution.ledgerEventId,
        tenantGroupId: dto.tenantGroupId,
        recordedByUserId: reversedBy,
        sourceEventId: `reversal:${dto.contributionId}`,
        metadata: { contributionId: dto.contributionId, reversalReason: dto.reversalReason },
      },
      channel,
    );

    await this.prisma.contribution.update({
      where: { id: dto.contributionId },
      data: {
        status: 'REVERSED',
        reversedByUserId: reversedBy,
        reversedAt: new Date(),
        reversalReason: dto.reversalReason ?? undefined,
      },
    });

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: reversedBy,
      channel,
      action: 'CONTRIBUTION_REVERSED',
      entityType: 'CONTRIBUTION',
      entityId: dto.contributionId,
      beforeSnapshot: { contributionId: dto.contributionId, ledgerEventId: contribution.ledgerEventId },
      afterSnapshot: { reversalLedgerEventId: reversalLedger.ledgerEventId },
      metadata: { reversalReason: dto.reversalReason },
    });

    return {
      id: dto.contributionId,
      createdAt: new Date(),
    };
  }

  /**
   * Get contribution detail with evidence metadata reference.
   */
  async getById(
    contributionId: string,
    tenantGroupId: string,
    _actorUserId?: string | null,
  ): Promise<ContributionDetailResult | null> {
    const c = await this.prisma.contribution.findFirst({
      where: { id: contributionId, groupId: tenantGroupId },
      include: { evidenceFile: true },
    });
    if (!c) return null;
    return {
      id: c.id,
      tenantGroupId: c.groupId,
      meetingId: c.meetingId,
      memberProfileId: c.memberId,
      transactionMode: c.transactionMode,
      savingsAmountMinor: c.savingsAmountMinor ?? 0,
      socialFundAmountMinor: c.socialFundAmountMinor ?? 0,
      totalAmountMinor: c.totalAmountMinor ?? 0,
      externalReferenceText: c.externalReferenceText,
      evidenceAttachmentId: c.evidenceFileId,
      status: c.status,
      recordedByUserId: c.recordedByUserId,
      recordedAt: c.recordedAt,
      reversedByUserId: c.reversedByUserId,
      reversedAt: c.reversedAt,
      reversalReason: c.reversalReason,
      ledgerEventId: c.ledgerEventId,
      idempotencyKey: c.idempotencyKey,
      createdAt: c.createdAt,
    };
  }

  async listByGroup(groupId: string, _actorMemberId: string): Promise<{ id: string; memberId: string; amount: number; type: string; idempotencyKey: string | null; createdAt: Date }[]> {
    const list = await this.prisma.contribution.findMany({
      where: { groupId, status: 'RECORDED' },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return list.map((c) => ({
      id: c.id,
      memberId: c.memberId,
      amount: (c.totalAmountMinor ?? Number(c.amount ?? 0) * 100) / 100,
      type: c.type,
      idempotencyKey: c.idempotencyKey,
      createdAt: c.createdAt,
    }));
  }

  private validateAmounts(savingsMinor: number, socialMinor: number): void {
    if (savingsMinor < 0 || socialMinor < 0) {
      throw new ValidationError('savingsAmountMinor and socialFundAmountMinor must be >= 0');
    }
    if (savingsMinor === 0 && socialMinor === 0) {
      throw new ValidationError('At least one of savingsAmountMinor or socialFundAmountMinor must be > 0');
    }
    if (savingsMinor % 1 !== 0 || socialMinor % 1 !== 0) {
      throw new ValidationError('Amounts must be integer minor units');
    }
  }

  private async validateTenantMemberMeeting(
    tenantGroupId: string,
    memberId: string | null,
    meetingId: string | undefined,
  ): Promise<void> {
    await this.groupService.getOrThrow(tenantGroupId);
    if (memberId) {
      const member = await this.prisma.member.findFirst({
        where: { id: memberId, groupId: tenantGroupId, status: 'ACTIVE' },
      });
      if (!member) {
        throw new ValidationError('Member not found or not active in group', { memberId, tenantGroupId });
      }
    }
    if (meetingId) {
      const meeting = await this.prisma.meeting.findFirst({
        where: { id: meetingId, groupId: tenantGroupId },
      });
      if (!meeting) {
        throw new ValidationError('Meeting not found or does not belong to group', { meetingId, tenantGroupId });
      }
    }
  }

  private async validateEvidence(
    tenantGroupId: string,
    evidenceAttachmentId: string | undefined,
    transactionMode: TransactionMode,
    externalReferenceText: string | undefined,
  ): Promise<void> {
    const hasText = !!externalReferenceText?.trim();
    const hasImage = !!evidenceAttachmentId?.trim();
    if (!hasText && !hasImage) {
      if (tenantRequiresEvidenceForBankTransfer(tenantGroupId) && transactionMode === 'BANK_TRANSFER') {
        throw new ValidationError('Evidence (text ref and/or image) required for BANK_TRANSFER in this group');
      }
      return;
    }
    if (evidenceAttachmentId) {
      const file = await this.prisma.evidenceFile.findFirst({
        where: { id: evidenceAttachmentId, groupId: tenantGroupId },
      });
      if (!file) {
        throw new EvidenceNotFoundOrWrongGroupError(evidenceAttachmentId, tenantGroupId);
      }
      const alreadyLinkedContribution = await this.prisma.contribution.findFirst({
        where: { evidenceFileId: evidenceAttachmentId },
        select: { id: true },
      });
      if (alreadyLinkedContribution) {
        throw new ValidationError('Evidence file is already linked to another contribution');
      }
      const alreadyLinkedRepayment = await this.prisma.loanRepayment.findFirst({
        where: { evidenceFileId: evidenceAttachmentId },
        select: { id: true },
      });
      if (alreadyLinkedRepayment) {
        throw new ValidationError('Evidence file is already linked to a repayment');
      }
    }
  }
}
