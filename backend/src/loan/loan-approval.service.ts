import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { GroupRulesService } from '../group-rules/group-rules.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationTriggerService } from '../notifications/notification-trigger.service';
import { Permission } from '../domain/enums';
import { AuditChannel } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import type { ApproveApplicationDto } from './loan.types';
import { generateSchedule } from './loan-schedule.service';

@Injectable()
export class LoanApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly groupRules: GroupRulesService,
    private readonly rbac: RbacService,
    private readonly auditLog: AuditLogService,
    private readonly notificationTriggers: NotificationTriggerService,
  ) {}

  async approve(
    dto: ApproveApplicationDto,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
    actorMemberId?: string,
  ): Promise<{ loanId: string }> {
    await this.rbac.requirePermission(
      dto.tenantGroupId,
      actorUserId ?? null,
      Permission.LOAN_APPROVE,
      {},
      actorMemberId,
    );
    await this.groupService.getOrThrow(dto.tenantGroupId);

    const app = await this.prisma.loanApplication.findUnique({
      where: { id: dto.applicationId },
    });
    if (!app) throw new ValidationError('Application not found', { applicationId: dto.applicationId });
    if (app.groupId !== dto.tenantGroupId) throw new ValidationError('Application does not belong to tenant');
    if (app.status !== 'SUBMITTED') throw new ValidationError('Application is not pending approval', { status: app.status });

    const snapshot = await this.groupRules.getSnapshotForLoan(dto.tenantGroupId, new Date());
    if (!snapshot) throw new ValidationError('No group rules in effect; create a rule version first');

    const interestEnabled = snapshot.loanInterestEnabled;
    const interestRateBps = interestEnabled ? snapshot.loanInterestRateBps : 0;
    const firstDueDate = new Date();
    firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    const scheduleLines = generateSchedule(
      app.requestedAmountMinor,
      app.requestedTermPeriods,
      snapshot,
      firstDueDate,
    );

    const loan = await this.prisma.loan.create({
      data: {
        groupId: dto.tenantGroupId,
        borrowerId: app.memberId,
        applicationId: app.id,
        principalAmountMinor: app.requestedAmountMinor,
        currencyCode: 'GBP',
        interestEnabledSnapshot: interestEnabled,
        interestRateBpsSnapshot: interestRateBps,
        interestBasisSnapshot: snapshot.loanInterestBasis,
        ruleVersionIdSnapshot: snapshot.ruleVersionId,
        termPeriods: app.requestedTermPeriods,
        approvedByUserId: dto.approvedByUserId,
        approvedAt: new Date(),
        state: 'APPROVED',
        scheduleItems: {
          create: scheduleLines.map((line) => ({
            installmentNo: line.installmentNo,
            dueDate: line.dueDate,
            principalDueMinor: line.principalDueMinor,
            interestDueMinor: line.interestDueMinor,
            penaltyDueMinor: line.penaltyDueMinor,
            totalDueMinor: line.totalDueMinor,
            status: 'DUE',
          })),
        },
      },
      include: { scheduleItems: true },
    });

    await this.prisma.loanApplication.update({
      where: { id: app.id },
      data: { status: 'APPROVED' },
    });

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: dto.approvedByUserId,
      channel,
      action: 'LOAN_APPLICATION_APPROVED',
      entityType: 'LOAN',
      entityId: loan.id,
      afterSnapshot: {
        loanId: loan.id,
        applicationId: app.id,
        principalAmountMinor: loan.principalAmountMinor,
        ruleVersionIdSnapshot: snapshot.ruleVersionId,
        scheduleItemCount: scheduleLines.length,
      },
    });

    void this.notificationTriggers
      .approvalDecision({
        tenantGroupId: dto.tenantGroupId,
        memberId: app.memberId,
        applicationId: app.id,
        approved: true,
      })
      .catch(() => {});

    return { loanId: loan.id };
  }

  async reject(
    applicationId: string,
    tenantGroupId: string,
    rejectedByUserId: string,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
    actorMemberId?: string,
  ): Promise<void> {
    await this.rbac.requirePermission(tenantGroupId, actorUserId ?? null, Permission.LOAN_APPROVE, {}, actorMemberId);
    const app = await this.prisma.loanApplication.findUnique({ where: { id: applicationId } });
    if (!app || app.groupId !== tenantGroupId) throw new ValidationError('Application not found');
    if (app.status !== 'SUBMITTED') throw new ValidationError('Application is not pending');

    await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
    });

    await this.auditLog.append({
      tenantGroupId,
      actorUserId: rejectedByUserId,
      channel,
      action: 'LOAN_APPLICATION_REJECTED',
      entityType: 'LOAN_APPLICATION',
      entityId: applicationId,
      afterSnapshot: { applicationId, status: 'REJECTED' },
    });

    void this.notificationTriggers
      .approvalDecision({
        tenantGroupId,
        memberId: app.memberId,
        applicationId,
        approved: false,
      })
      .catch(() => {});
  }
}
