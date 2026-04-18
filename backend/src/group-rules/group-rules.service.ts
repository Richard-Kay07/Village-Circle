import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditChannel } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import type { LoanRuleSnapshot } from './group-rules.types';
import type { CreateRuleVersionDto, UpdateRuleVersionDto } from './group-rules.types';

@Injectable()
export class GroupRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Create the first or a new rule version. EffectiveFrom = now; previous current version gets effectiveTo = now.
   */
  async createVersion(
    dto: CreateRuleVersionDto,
    channel: AuditChannel = AuditChannel.WEB,
  ): Promise<{ id: string; effectiveFrom: Date }> {
    await this.groupService.getOrThrow(dto.tenantGroupId);
    this.validateRateBps(dto.loanInterestRateBps, dto.loanInterestEnabled);

    const now = new Date();
    const current = await this.getCurrentVersion(dto.tenantGroupId);
    if (current) {
      await this.prisma.ruleVersion.update({
        where: { id: current.id },
        data: { effectiveTo: now },
      });
    }

    const version = await this.prisma.ruleVersion.create({
      data: {
        groupId: dto.tenantGroupId,
        effectiveFrom: now,
        loanInterestEnabled: dto.loanInterestEnabled,
        loanInterestRateBps: dto.loanInterestRateBps,
        loanInterestBasis: dto.loanInterestBasis,
        penaltyEnabled: dto.penaltyEnabled,
        penaltyRule: dto.penaltyRule ?? undefined,
        socialFundEnabled: dto.socialFundEnabled,
        smsNotificationsEnabled: dto.smsNotificationsEnabled,
        smsReceiptConfirmationEnabled: dto.smsReceiptConfirmationEnabled ?? false,
        createdByUserId: dto.createdByUserId,
      },
    });

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: dto.createdByUserId,
      channel,
      action: 'RULE_VERSION_CREATED',
      entityType: 'RULE_VERSION',
      entityId: version.id,
      afterSnapshot: this.snapshotFromVersion(version),
      metadata: { groupId: dto.tenantGroupId },
    });

    return { id: version.id, effectiveFrom: version.effectiveFrom };
  }

  /**
   * Update rules by creating a new version (no overwrite). Previous version gets effectiveTo = now.
   */
  async update(
    dto: UpdateRuleVersionDto,
    channel: AuditChannel = AuditChannel.WEB,
  ): Promise<{ id: string; effectiveFrom: Date }> {
    await this.groupService.getOrThrow(dto.tenantGroupId);
    const current = await this.getCurrentVersion(dto.tenantGroupId);
    if (!current) {
      throw new ValidationError('No rule version exists for group; use create first', {
        tenantGroupId: dto.tenantGroupId,
      });
    }

    if (dto.loanInterestRateBps != null) {
      this.validateRateBps(dto.loanInterestRateBps, dto.loanInterestEnabled ?? current.loanInterestEnabled);
    }

    const now = new Date();
    await this.prisma.ruleVersion.update({
      where: { id: current.id },
      data: { effectiveTo: now },
    });

    const version = await this.prisma.ruleVersion.create({
      data: {
        groupId: dto.tenantGroupId,
        effectiveFrom: now,
        loanInterestEnabled: dto.loanInterestEnabled ?? current.loanInterestEnabled,
        loanInterestRateBps: dto.loanInterestRateBps ?? current.loanInterestRateBps,
        loanInterestBasis: dto.loanInterestBasis ?? current.loanInterestBasis,
        penaltyEnabled: dto.penaltyEnabled ?? current.penaltyEnabled,
        penaltyRule: dto.penaltyRule !== undefined ? dto.penaltyRule : (current.penaltyRule as object | null) ?? undefined,
        socialFundEnabled: dto.socialFundEnabled ?? current.socialFundEnabled,
        smsNotificationsEnabled: dto.smsNotificationsEnabled ?? current.smsNotificationsEnabled,
        smsReceiptConfirmationEnabled: dto.smsReceiptConfirmationEnabled ?? current.smsReceiptConfirmationEnabled,
        createdByUserId: dto.updatedByUserId,
      },
    });

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: dto.updatedByUserId,
      channel,
      action: 'RULE_VERSION_UPDATED',
      entityType: 'RULE_VERSION',
      entityId: version.id,
      beforeSnapshot: this.snapshotFromVersion(current),
      afterSnapshot: this.snapshotFromVersion(version),
      metadata: { groupId: dto.tenantGroupId, previousVersionId: current.id },
    });

    return { id: version.id, effectiveFrom: version.effectiveFrom };
  }

  /**
   * Get the rule version effective at a given date (for a group).
   */
  async getEffectiveAt(groupId: string, atDate: Date): Promise<{ id: string; effectiveFrom: Date; effectiveTo: Date | null } | null> {
    const version = await this.prisma.ruleVersion.findFirst({
      where: {
        groupId,
        effectiveFrom: { lte: atDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: atDate } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    return version ? { id: version.id, effectiveFrom: version.effectiveFrom, effectiveTo: version.effectiveTo } : null;
  }

  /**
   * Returns an immutable snapshot for use by loan approval and schedule generation.
   * Use atDate = approval/disbursement time so historical loans never change when rules are edited later.
   */
  async getSnapshotForLoan(groupId: string, atDate: Date): Promise<LoanRuleSnapshot | null> {
    const version = await this.prisma.ruleVersion.findFirst({
      where: {
        groupId,
        effectiveFrom: { lte: atDate },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: atDate } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    if (!version) return null;
    return this.snapshotFromVersion(version);
  }

  /**
   * Get snapshot by rule version id (e.g. when loan stores ruleVersionId).
   */
  async getSnapshotByVersionId(ruleVersionId: string, groupId: string): Promise<LoanRuleSnapshot | null> {
    const version = await this.prisma.ruleVersion.findFirst({
      where: { id: ruleVersionId, groupId },
    });
    if (!version) return null;
    return this.snapshotFromVersion(version);
  }

  /** List versions for a group (for admin UI). */
  async listVersions(groupId: string): Promise<{ id: string; effectiveFrom: Date; effectiveTo: Date | null }[]> {
    await this.groupService.getOrThrow(groupId);
    const list = await this.prisma.ruleVersion.findMany({
      where: { groupId },
      orderBy: { effectiveFrom: 'desc' },
      select: { id: true, effectiveFrom: true, effectiveTo: true },
    });
    return list;
  }

  private async getCurrentVersion(groupId: string) {
    return this.prisma.ruleVersion.findFirst({
      where: { groupId, effectiveTo: null },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  private snapshotFromVersion(v: {
    id: string;
    groupId: string;
    effectiveFrom: Date;
    loanInterestEnabled: boolean;
    loanInterestRateBps: number;
    loanInterestBasis: string;
    penaltyEnabled: boolean;
    penaltyRule: unknown;
    socialFundEnabled: boolean;
    smsNotificationsEnabled: boolean;
  }): LoanRuleSnapshot {
    return {
      ruleVersionId: v.id,
      groupId: v.groupId,
      effectiveFrom: v.effectiveFrom,
      loanInterestEnabled: v.loanInterestEnabled,
      loanInterestRateBps: v.loanInterestRateBps,
      loanInterestBasis: v.loanInterestBasis as 'FLAT' | 'SIMPLE_DECLINING',
      penaltyEnabled: v.penaltyEnabled,
      penaltyRule: v.penaltyRule != null && typeof v.penaltyRule === 'object' ? (v.penaltyRule as Record<string, unknown>) : null,
      socialFundEnabled: v.socialFundEnabled,
      smsNotificationsEnabled: v.smsNotificationsEnabled,
      smsReceiptConfirmationEnabled: (v as { smsReceiptConfirmationEnabled?: boolean }).smsReceiptConfirmationEnabled ?? false,
    };
  }

  private validateRateBps(rateBps: number, interestEnabled: boolean): void {
    if (rateBps < 0 || rateBps > 100_000) {
      throw new ValidationError('loanInterestRateBps must be between 0 and 100000 (0–1000%)', { loanInterestRateBps: rateBps });
    }
    if (interestEnabled && rateBps === 0) {
      // allow 0 if disabled; if enabled, 0 is allowed as "no interest" policy
    }
  }
}
