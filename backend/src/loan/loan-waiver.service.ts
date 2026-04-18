import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { Permission } from '../domain/enums';
import { AuditChannel } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import type { RecordWaiverDto } from './loan.types';

@Injectable()
export class LoanWaiverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly rbac: RbacService,
    private readonly auditLog: AuditLogService,
  ) {}

  async recordWaiver(
    dto: RecordWaiverDto,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
    actorMemberId?: string,
  ): Promise<{ id: string }> {
    await this.rbac.requirePermission(
      dto.tenantGroupId,
      actorUserId ?? null,
      Permission.LOAN_WAIVE,
      {},
      actorMemberId,
    );
    await this.groupService.getOrThrow(dto.tenantGroupId);

    const loan = await this.prisma.loan.findUnique({
      where: { id: dto.loanId },
      include: { scheduleItems: true },
    });
    if (!loan) throw new ValidationError('Loan not found', { loanId: dto.loanId });
    if (loan.groupId !== dto.tenantGroupId) throw new ValidationError('Loan does not belong to tenant');
    if (loan.state !== 'ACTIVE') throw new ValidationError('Loan must be ACTIVE to waive', { state: loan.state });

    if (!dto.reason?.trim()) throw new ValidationError('Reason is required for waiver');
    if (!dto.approvedByUserId?.trim()) throw new ValidationError('Approver identity is required');

    const event = await this.prisma.loanWaiverEvent.create({
      data: {
        loanId: dto.loanId,
        groupId: dto.tenantGroupId,
        reason: dto.reason.trim(),
        approvedByUserId: dto.approvedByUserId,
        scheduleItemId: dto.scheduleItemId ?? undefined,
        amountMinorWaived: dto.amountMinorWaived ?? 0,
        waiverType: dto.waiverType ?? undefined,
      },
    });

    if (dto.scheduleItemId && dto.amountMinorWaived > 0) {
      const item = loan.scheduleItems.find((s) => s.id === dto.scheduleItemId);
      if (item && (item.supersededByRescheduleEventId ?? null) === null) {
        const addPenalty = Math.min(dto.amountMinorWaived, item.penaltyDueMinor - item.paidPenaltyMinor);
        let addInterest = 0;
        if (dto.amountMinorWaived > addPenalty) {
          addInterest = Math.min(dto.amountMinorWaived - addPenalty, item.interestDueMinor - item.paidInterestMinor);
        }
        const newPaidPenalty = item.paidPenaltyMinor + addPenalty;
        const newPaidInterest = item.paidInterestMinor + addInterest;
        const isFullyWaived =
          item.principalDueMinor <= item.paidPrincipalMinor &&
          newPaidPenalty >= item.penaltyDueMinor &&
          newPaidInterest >= item.interestDueMinor;
        await this.prisma.loanScheduleItem.update({
          where: { id: item.id },
          data: {
            paidPenaltyMinor: newPaidPenalty,
            paidInterestMinor: newPaidInterest,
            status: isFullyWaived ? 'WAIVED' : 'PART_PAID',
          },
        });
      }
    }

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: dto.approvedByUserId,
      channel,
      action: 'LOAN_WAIVER_RECORDED',
      entityType: 'LOAN_WAIVER_EVENT',
      entityId: event.id,
      afterSnapshot: {
        loanId: dto.loanId,
        eventId: event.id,
        reason: dto.reason,
        amountMinorWaived: dto.amountMinorWaived,
        scheduleItemId: dto.scheduleItemId ?? null,
      },
    });

    return { id: event.id };
  }
}
