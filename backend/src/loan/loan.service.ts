import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { GroupRulesService } from '../group-rules/group-rules.service';
import { LoanApplicationService } from './loan-application.service';
import { LoanApprovalService } from './loan-approval.service';
import { LoanDisbursementService } from './loan-disbursement.service';
import { LoanRepaymentService } from './loan-repayment.service';
import { LoanWaiverService } from './loan-waiver.service';
import { LoanRescheduleService } from './loan-reschedule.service';
import { LoanWriteOffService } from './loan-writeoff.service';
import type { SubmitApplicationDto, ApproveApplicationDto, RecordDisbursementDto, RecordRepaymentDto, RecordWaiverDto, RecordRescheduleDto, RecordWriteOffDto } from './loan.types';

@Injectable()
export class LoanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly groupRules: GroupRulesService,
    private readonly applicationService: LoanApplicationService,
    private readonly approvalService: LoanApprovalService,
    private readonly disbursementService: LoanDisbursementService,
    private readonly repaymentService: LoanRepaymentService,
    private readonly waiverService: LoanWaiverService,
    private readonly rescheduleService: LoanRescheduleService,
    private readonly writeOffService: LoanWriteOffService,
  ) {}

  async submitApplication(
    dto: SubmitApplicationDto,
    actorUserId?: string | null,
    actorMemberId?: string,
  ) {
    return this.applicationService.submit(dto, undefined, actorUserId, actorMemberId);
  }

  async approveApplication(
    dto: ApproveApplicationDto,
    actorUserId?: string | null,
    actorMemberId?: string,
  ) {
    return this.approvalService.approve(dto, undefined, actorUserId, actorMemberId);
  }

  async rejectApplication(
    applicationId: string,
    tenantGroupId: string,
    rejectedByUserId: string,
    actorUserId?: string | null,
    actorMemberId?: string,
  ) {
    return this.approvalService.reject(applicationId, tenantGroupId, rejectedByUserId, undefined, actorUserId, actorMemberId);
  }

  async recordDisbursement(
    dto: RecordDisbursementDto,
    actorUserId?: string | null,
    actorMemberId?: string,
  ) {
    return this.disbursementService.recordDisbursement(dto, undefined, actorUserId, actorMemberId);
  }

  async recordRepayment(
    dto: RecordRepaymentDto,
    actorUserId?: string | null,
    actorMemberId?: string,
  ) {
    return this.repaymentService.recordRepayment(dto, undefined, actorUserId, actorMemberId);
  }

  async recordWaiver(
    dto: RecordWaiverDto,
    actorUserId?: string | null,
    actorMemberId?: string,
  ) {
    return this.waiverService.recordWaiver(dto, undefined, actorUserId, actorMemberId);
  }

  async recordReschedule(
    dto: RecordRescheduleDto,
    actorUserId?: string | null,
    actorMemberId?: string,
  ) {
    return this.rescheduleService.recordReschedule(dto, undefined, actorUserId, actorMemberId);
  }

  async recordWriteOff(
    dto: RecordWriteOffDto,
    actorUserId?: string | null,
    actorMemberId?: string,
  ): Promise<never> {
    return this.writeOffService.recordWriteOff(dto, actorUserId, actorMemberId);
  }

  async getLoan(loanId: string, actorMemberId: string): Promise<{
    id: string;
    groupId: string;
    borrowerId: string;
    principalAmountMinor: number;
    currencyCode: string;
    state: string;
    interestEnabledSnapshot: boolean;
    interestRateBpsSnapshot: number;
    interestBasisSnapshot: string;
    ruleVersionIdSnapshot: string | null;
    termPeriods: number;
    approvedAt: Date;
    disbursementRecordedAt: Date | null;
    scheduleItems: { installmentNo: number; dueDate: Date; principalDueMinor: number; interestDueMinor: number; penaltyDueMinor: number; totalDueMinor: number; paidPrincipalMinor: number; paidInterestMinor: number; paidPenaltyMinor: number; status: string }[];
    totalRepaidMinor: number;
    repayments: { id: string; amountMinor: number; principalMinor: number; interestMinor: number; penaltyMinor: number; transactionMode: string; externalReferenceText: string | null; evidencePresence: { hasText: boolean; hasImage: boolean }; recordedAt: Date; type: string }[];
    exceptionEvents: {
      waivers: { id: string; reason: string; approvedByUserId: string; approvedAt: Date; scheduleItemId: string | null; amountMinorWaived: number; waiverType: string | null }[];
      reschedules: { id: string; reason: string; approvedByUserId: string; approvedAt: Date; previousTermPeriods: number | null; newTermPeriods: number | null; firstDueDate: Date | null }[];
      writeOffs: { id: string; reason: string; approvedByUserId: string; approvedAt: Date; amountMinorWrittenOff: number | null }[];
    };
  } | null> {
    const loan = await this.prisma.loan.findFirst({
      where: { id: loanId },
      include: { scheduleItems: true, repayments: true, waiverEvents: true, rescheduleEvents: true, writeOffEvents: true },
    });
    if (!loan) return null;
    await this.groupService.assertActiveMember(loan.groupId, actorMemberId);
    const totalRepaidMinor = loan.repayments.reduce((s, r) => s + r.principalMinor + r.interestMinor + r.penaltyMinor, 0);
    const activeScheduleItems = loan.scheduleItems.filter((s) => s.supersededByRescheduleEventId == null);
    const repayments = loan.repayments.map((r) => ({
      id: r.id,
      amountMinor: r.amountMinor,
      principalMinor: r.principalMinor,
      interestMinor: r.interestMinor ?? 0,
      penaltyMinor: r.penaltyMinor ?? 0,
      transactionMode: r.transactionMode,
      externalReferenceText: r.externalReferenceText ?? null,
      evidencePresence: { hasText: !!r.externalReferenceText?.trim(), hasImage: !!r.evidenceFileId },
      recordedAt: r.recordedAt,
      type: r.type ?? 'REPAYMENT',
    }));
    const exceptionEvents = {
      waivers: loan.waiverEvents.map((w) => ({
        id: w.id,
        reason: w.reason,
        approvedByUserId: w.approvedByUserId,
        approvedAt: w.approvedAt,
        scheduleItemId: w.scheduleItemId ?? null,
        amountMinorWaived: w.amountMinorWaived,
        waiverType: w.waiverType ?? null,
      })),
      reschedules: loan.rescheduleEvents.map((r) => ({
        id: r.id,
        reason: r.reason,
        approvedByUserId: r.approvedByUserId,
        approvedAt: r.approvedAt,
        previousTermPeriods: r.previousTermPeriods ?? null,
        newTermPeriods: r.newTermPeriods ?? null,
        firstDueDate: r.firstDueDate ?? null,
      })),
      writeOffs: loan.writeOffEvents.map((w) => ({
        id: w.id,
        reason: w.reason,
        approvedByUserId: w.approvedByUserId,
        approvedAt: w.approvedAt,
        amountMinorWrittenOff: w.amountMinorWrittenOff ?? null,
      })),
    };
    return {
      id: loan.id,
      groupId: loan.groupId,
      borrowerId: loan.borrowerId,
      principalAmountMinor: loan.principalAmountMinor,
      currencyCode: loan.currencyCode,
      state: loan.state,
      interestEnabledSnapshot: loan.interestEnabledSnapshot,
      interestRateBpsSnapshot: loan.interestRateBpsSnapshot,
      interestBasisSnapshot: loan.interestBasisSnapshot ?? 'FLAT',
      ruleVersionIdSnapshot: loan.ruleVersionIdSnapshot ?? null,
      termPeriods: loan.termPeriods,
      approvedAt: loan.approvedAt,
      disbursementRecordedAt: loan.disbursementRecordedAt,
      scheduleItems: activeScheduleItems.map((s) => ({
        installmentNo: s.installmentNo,
        dueDate: s.dueDate,
        principalDueMinor: s.principalDueMinor,
        interestDueMinor: s.interestDueMinor,
        penaltyDueMinor: s.penaltyDueMinor ?? 0,
        totalDueMinor: s.totalDueMinor,
        paidPrincipalMinor: s.paidPrincipalMinor ?? 0,
        paidInterestMinor: s.paidInterestMinor ?? 0,
        paidPenaltyMinor: s.paidPenaltyMinor ?? 0,
        status: s.status,
      })),
      totalRepaidMinor,
      repayments,
      exceptionEvents,
    };
  }

  async listByGroup(groupId: string, _actorMemberId: string) {
    await this.groupService.getOrThrow(groupId);
    const loans = await this.prisma.loan.findMany({
      where: { groupId },
      include: { repayments: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return loans.map((loan) => {
      const totalRepaidMinor = loan.repayments.reduce((s, r) => s + r.principalMinor + r.interestMinor + r.penaltyMinor, 0);
      return {
        id: loan.id,
        borrowerId: loan.borrowerId,
        principalAmountMinor: loan.principalAmountMinor,
        state: loan.state,
        totalRepaidMinor,
      };
    });
  }

  /**
   * List applications for group (Treasurer/Chair). Optional status filter; default SUBMITTED.
   */
  async listApplicationsByGroup(
    groupId: string,
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | undefined,
    _actorUserId?: string | null,
    _actorMemberId?: string,
  ) {
    await this.groupService.getOrThrow(groupId);
    const where = { groupId, ...(status ? { status } : { status: 'SUBMITTED' }) };
    const apps = await this.prisma.loanApplication.findMany({
      where,
      include: { member: true },
      orderBy: { submittedAt: 'desc' },
      take: 100,
    });
    return apps.map((app) => ({
      id: app.id,
      memberId: app.memberId,
      memberDisplayName: app.member.displayName,
      requestedAmountMinor: app.requestedAmountMinor,
      requestedTermPeriods: app.requestedTermPeriods,
      purpose: app.purpose ?? null,
      status: app.status,
      submittedAt: app.submittedAt,
      eligibilityHint: null as string | null,
      riskFlags: null as string[] | null,
    }));
  }

  /**
   * Get application detail with member summary and current rule snapshot for approval panel.
   */
  async getApplicationDetail(
    applicationId: string,
    tenantGroupId: string,
    _actorUserId?: string | null,
    _actorMemberId?: string,
  ) {
    await this.groupService.getOrThrow(tenantGroupId);
    const app = await this.prisma.loanApplication.findFirst({
      where: { id: applicationId, groupId: tenantGroupId },
      include: { member: true },
    });
    if (!app) return null;
    const snapshot = await this.groupRules.getSnapshotForLoan(tenantGroupId, new Date());
    return {
      id: app.id,
      groupId: app.groupId,
      memberId: app.memberId,
      requestedAmountMinor: app.requestedAmountMinor,
      requestedTermPeriods: app.requestedTermPeriods,
      purpose: app.purpose ?? null,
      status: app.status,
      submittedAt: app.submittedAt,
      submittedByUserId: app.submittedByUserId,
      member: { id: app.member.id, displayName: app.member.displayName },
      ruleSnapshot: snapshot
        ? {
            loanInterestEnabled: snapshot.loanInterestEnabled,
            loanInterestRateBps: snapshot.loanInterestRateBps,
            loanInterestBasis: snapshot.loanInterestBasis,
          }
        : null,
    };
  }
}
