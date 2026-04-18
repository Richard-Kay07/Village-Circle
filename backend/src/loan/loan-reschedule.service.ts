import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { Permission } from '../domain/enums';
import { AuditChannel } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import type { RecordRescheduleDto } from './loan.types';
import { generateSchedule } from './loan-schedule.service';
import type { LoanRuleSnapshot } from '../group-rules/group-rules.types';

@Injectable()
export class LoanRescheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly rbac: RbacService,
    private readonly auditLog: AuditLogService,
  ) {}

  async recordReschedule(
    dto: RecordRescheduleDto,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
    actorMemberId?: string,
  ): Promise<{ id: string }> {
    await this.rbac.requirePermission(
      dto.tenantGroupId,
      actorUserId ?? null,
      Permission.LOAN_RESCHEDULE,
      {},
      actorMemberId,
    );
    await this.groupService.getOrThrow(dto.tenantGroupId);

    const loan = await this.prisma.loan.findUnique({
      where: { id: dto.loanId },
      include: { scheduleItems: { orderBy: { installmentNo: 'asc' } } },
    });
    if (!loan) throw new ValidationError('Loan not found', { loanId: dto.loanId });
    if (loan.groupId !== dto.tenantGroupId) throw new ValidationError('Loan does not belong to tenant');
    if (loan.state !== 'ACTIVE') throw new ValidationError('Loan must be ACTIVE to reschedule', { state: loan.state });

    if (!dto.reason?.trim()) throw new ValidationError('Reason is required for reschedule');
    if (!dto.approvedByUserId?.trim()) throw new ValidationError('Approver identity is required');
    if (dto.newTermPeriods < 1) throw new ValidationError('newTermPeriods must be at least 1');

    const activeItems = loan.scheduleItems.filter((s) => s.supersededByRescheduleEventId == null);
    const outstandingPrincipal = activeItems.reduce(
      (sum, s) => sum + s.principalDueMinor - s.paidPrincipalMinor,
      0,
    );
    if (outstandingPrincipal <= 0) throw new ValidationError('No outstanding principal to reschedule');

    const previousTermPeriods = activeItems.length;
    const firstDueDate = dto.firstDueDate instanceof Date ? dto.firstDueDate : new Date(dto.firstDueDate);

    const snapshot: LoanRuleSnapshot = {
      ruleVersionId: loan.ruleVersionIdSnapshot ?? '',
      groupId: loan.groupId,
      effectiveFrom: loan.approvedAt,
      loanInterestEnabled: loan.interestEnabledSnapshot,
      loanInterestRateBps: loan.interestRateBpsSnapshot,
      loanInterestBasis: loan.interestBasisSnapshot as 'FLAT' | 'SIMPLE_DECLINING',
      penaltyEnabled: false,
      penaltyRule: null,
      socialFundEnabled: true,
      smsNotificationsEnabled: false,
    };

    const newLines = generateSchedule(outstandingPrincipal, dto.newTermPeriods, snapshot, firstDueDate);

    const event = await this.prisma.loanRescheduleEvent.create({
      data: {
        loanId: dto.loanId,
        groupId: dto.tenantGroupId,
        reason: dto.reason.trim(),
        approvedByUserId: dto.approvedByUserId,
        previousTermPeriods,
        newTermPeriods: dto.newTermPeriods,
        firstDueDate,
      },
    });

    await this.prisma.loanScheduleItem.updateMany({
      where: { loanId: dto.loanId, supersededByRescheduleEventId: null },
      data: { supersededByRescheduleEventId: event.id },
    });

    const maxInstallmentNo = loan.scheduleItems.length === 0 ? 0 : Math.max(...loan.scheduleItems.map((s) => s.installmentNo));

    await this.prisma.loanScheduleItem.createMany({
      data: newLines.map((line) => ({
        loanId: dto.loanId,
        installmentNo: maxInstallmentNo + line.installmentNo,
        dueDate: line.dueDate,
        principalDueMinor: line.principalDueMinor,
        interestDueMinor: line.interestDueMinor,
        penaltyDueMinor: line.penaltyDueMinor,
        totalDueMinor: line.totalDueMinor,
        status: 'DUE',
      })),
    });

    await this.prisma.loan.update({
      where: { id: dto.loanId },
      data: { state: 'RESCHEDULED', termPeriods: loan.termPeriods + dto.newTermPeriods },
    });

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: dto.approvedByUserId,
      channel,
      action: 'LOAN_RESCHEDULE_RECORDED',
      entityType: 'LOAN_RESCHEDULE_EVENT',
      entityId: event.id,
      afterSnapshot: {
        loanId: dto.loanId,
        eventId: event.id,
        reason: dto.reason,
        previousTermPeriods,
        newTermPeriods: dto.newTermPeriods,
        firstDueDate: firstDueDate.toISOString(),
        supersededItemCount: activeItems.length,
        newItemCount: newLines.length,
      },
    });

    return { id: event.id };
  }
}
