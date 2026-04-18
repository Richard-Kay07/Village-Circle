import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { LedgerPostingService } from '../ledger/ledger-posting.service';
import { FundBucket } from '../domain/enums';
import { Permission } from '../domain/enums';
import { AuditChannel } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import type { RecordRepaymentDto, RepaymentAllocation } from './loan.types';

/**
 * MVP allocation order: penalty first, then interest, then principal.
 * Outstanding per item = due - paid. Applied in installment order.
 */
export function allocateRepayment(
  amountMinor: number,
  scheduleItems: { installmentNo: number; principalDueMinor: number; interestDueMinor: number; penaltyDueMinor: number; paidPrincipalMinor: number; paidInterestMinor: number; paidPenaltyMinor: number; status: string }[],
): RepaymentAllocation & { applied: number } {
  const dueItems = scheduleItems
    .filter((s) => s.status === 'DUE' || s.status === 'PART_PAID')
    .sort((a, b) => a.installmentNo - b.installmentNo);
  let remaining = amountMinor;
  let principalMinor = 0;
  let interestMinor = 0;
  let penaltyMinor = 0;
  for (const item of dueItems) {
    if (remaining <= 0) break;
    const outPenalty = item.penaltyDueMinor - item.paidPenaltyMinor;
    const toPenalty = Math.min(remaining, outPenalty);
    remaining -= toPenalty;
    penaltyMinor += toPenalty;
    const outInterest = item.interestDueMinor - item.paidInterestMinor;
    const toInterest = Math.min(remaining, outInterest);
    remaining -= toInterest;
    interestMinor += toInterest;
    const outPrincipal = item.principalDueMinor - item.paidPrincipalMinor;
    const toPrincipal = Math.min(remaining, outPrincipal);
    remaining -= toPrincipal;
    principalMinor += toPrincipal;
  }
  return { principalMinor, interestMinor, penaltyMinor, applied: principalMinor + interestMinor + penaltyMinor };
}

@Injectable()
export class LoanRepaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly rbac: RbacService,
    private readonly auditLog: AuditLogService,
    private readonly ledgerPosting: LedgerPostingService,
  ) {}

  async recordRepayment(
    dto: RecordRepaymentDto,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
    actorMemberId?: string,
  ): Promise<{ id: string; createdAt: Date }> {
    await this.rbac.requirePermission(
      dto.tenantGroupId,
      actorUserId ?? null,
      Permission.LOAN_REPAYMENT_RECORD,
      {},
      actorMemberId,
    );
    await this.groupService.getOrThrow(dto.tenantGroupId);

    const loan = await this.prisma.loan.findUnique({
      where: { id: dto.loanId },
      include: { scheduleItems: true, borrower: true },
    });
    if (!loan) throw new ValidationError('Loan not found', { loanId: dto.loanId });
    if (loan.groupId !== dto.tenantGroupId) throw new ValidationError('Loan does not belong to tenant');
    if (loan.state !== 'ACTIVE') throw new ValidationError('Loan is not active', { state: loan.state });

    if (dto.amountMinor <= 0) throw new ValidationError('amountMinor must be positive');

    if (dto.evidenceAttachmentId) {
      const file = await this.prisma.evidenceFile.findFirst({
        where: { id: dto.evidenceAttachmentId, groupId: dto.tenantGroupId },
      });
      if (!file) throw new ValidationError('Evidence file not found or wrong group');
      const alreadyLinkedContribution = await this.prisma.contribution.findFirst({
        where: { evidenceFileId: dto.evidenceAttachmentId },
        select: { id: true },
      });
      if (alreadyLinkedContribution) throw new ValidationError('Evidence file is already linked to a contribution');
      const alreadyLinkedRepayment = await this.prisma.loanRepayment.findFirst({
        where: { evidenceFileId: dto.evidenceAttachmentId },
        select: { id: true },
      });
      if (alreadyLinkedRepayment) throw new ValidationError('Evidence file is already linked to another repayment');
    }

    const existing = await this.prisma.loanRepayment.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      if (existing.groupId !== dto.tenantGroupId) throw new ValidationError('Idempotency key used for another tenant');
      return { id: existing.id, createdAt: existing.createdAt };
    }

    const allocation = allocateRepayment(dto.amountMinor, loan.scheduleItems.filter((s) => s.supersededByRescheduleEventId == null));
    if (allocation.applied === 0) throw new ValidationError('No outstanding amount to apply repayment to');
    if (allocation.applied < dto.amountMinor) {
      throw new ValidationError('Repayment amount exceeds outstanding', {
        amountMinor: dto.amountMinor,
        applied: allocation.applied,
      });
    }

    const idempotencyKey = `loan-repayment:${dto.idempotencyKey}`;
    const lines: { fundBucket: FundBucket; memberId: string | null; amountMinor: number }[] = [];
    if (allocation.principalMinor > 0) {
      lines.push({ fundBucket: FundBucket.LOAN_PRINCIPAL, memberId: loan.borrowerId, amountMinor: -allocation.principalMinor });
      lines.push({ fundBucket: FundBucket.LOAN_PRINCIPAL, memberId: null, amountMinor: allocation.principalMinor });
    }
    if (allocation.interestMinor > 0) {
      lines.push({ fundBucket: FundBucket.LOAN_INTEREST, memberId: loan.borrowerId, amountMinor: -allocation.interestMinor });
      lines.push({ fundBucket: FundBucket.LOAN_INTEREST, memberId: null, amountMinor: allocation.interestMinor });
    }
    if (allocation.penaltyMinor > 0) {
      lines.push({ fundBucket: FundBucket.PENALTY, memberId: loan.borrowerId, amountMinor: -allocation.penaltyMinor });
      lines.push({ fundBucket: FundBucket.PENALTY, memberId: null, amountMinor: allocation.penaltyMinor });
    }
    if (lines.length === 0) throw new ValidationError('Allocation produced no ledger lines');

    const ledgerResult = await this.ledgerPosting.post(
      {
        tenantGroupId: dto.tenantGroupId,
        sourceEventType: 'LOAN_REPAYMENT_RECORDED',
        sourceEventId: dto.idempotencyKey,
        transactionMode: dto.transactionMode,
        eventTimestamp: new Date(),
        recordedByUserId: dto.recordedByUserId,
        idempotencyKey,
        lines,
        metadata: {
          loanId: dto.loanId,
          amountMinor: dto.amountMinor,
          principalMinor: allocation.principalMinor,
          interestMinor: allocation.interestMinor,
          penaltyMinor: allocation.penaltyMinor,
          externalReferenceText: dto.externalReferenceText ?? null,
          evidenceAttachmentId: dto.evidenceAttachmentId ?? null,
        },
      },
      channel,
    );

    const repayment = await this.prisma.loanRepayment.create({
      data: {
        loanId: dto.loanId,
        groupId: dto.tenantGroupId,
        transactionMode: dto.transactionMode,
        amountMinor: dto.amountMinor,
        principalMinor: allocation.principalMinor,
        interestMinor: allocation.interestMinor,
        penaltyMinor: allocation.penaltyMinor,
        externalReferenceText: dto.externalReferenceText ?? undefined,
        evidenceFileId: dto.evidenceAttachmentId ?? undefined,
        recordedByUserId: dto.recordedByUserId,
        idempotencyKey: dto.idempotencyKey,
        ledgerEventId: ledgerResult.ledgerEventId,
      },
    });

    await this.updateScheduleItemsFromAllocation(loan.id, allocation);

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: dto.recordedByUserId,
      channel,
      action: 'LOAN_REPAYMENT_RECORDED',
      entityType: 'LOAN_REPAYMENT',
      entityId: repayment.id,
      afterSnapshot: {
        repaymentId: repayment.id,
        loanId: dto.loanId,
        amountMinor: dto.amountMinor,
        allocation: { principalMinor: allocation.principalMinor, interestMinor: allocation.interestMinor, penaltyMinor: allocation.penaltyMinor },
        ledgerEventId: ledgerResult.ledgerEventId,
      },
    });

    return { id: repayment.id, createdAt: repayment.createdAt };
  }

  private async updateScheduleItemsFromAllocation(loanId: string, allocation: RepaymentAllocation): Promise<void> {
    const items = await this.prisma.loanScheduleItem.findMany({
      where: { loanId, status: { in: ['DUE', 'PART_PAID'] }, supersededByRescheduleEventId: null },
      orderBy: { installmentNo: 'asc' },
    });
    let pRem = allocation.principalMinor;
    let iRem = allocation.interestMinor;
    let penRem = allocation.penaltyMinor;
    for (const item of items) {
      if (pRem <= 0 && iRem <= 0 && penRem <= 0) break;
      const toPen = Math.min(penRem, item.penaltyDueMinor - item.paidPenaltyMinor);
      const toInt = Math.min(iRem, item.interestDueMinor - item.paidInterestMinor);
      const toPrin = Math.min(pRem, item.principalDueMinor - item.paidPrincipalMinor);
      penRem -= toPen;
      iRem -= toInt;
      pRem -= toPrin;
      const newPaidPenalty = item.paidPenaltyMinor + toPen;
      const newPaidInterest = item.paidInterestMinor + toInt;
      const newPaidPrincipal = item.paidPrincipalMinor + toPrin;
      const totalPaid = newPaidPenalty + newPaidInterest + newPaidPrincipal;
      const newStatus = totalPaid >= item.totalDueMinor ? 'PAID' : 'PART_PAID';
      await this.prisma.loanScheduleItem.update({
        where: { id: item.id },
        data: {
          status: newStatus,
          paidPenaltyMinor: newPaidPenalty,
          paidInterestMinor: newPaidInterest,
          paidPrincipalMinor: newPaidPrincipal,
        },
      });
    }
    const allPaid = await this.prisma.loanScheduleItem.count({ where: { loanId, status: { not: 'PAID' }, supersededByRescheduleEventId: null } });
    if (allPaid === 0) {
      await this.prisma.loan.update({ where: { id: loanId }, data: { state: 'COMPLETED' } });
    }
  }
}
