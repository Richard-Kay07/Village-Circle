import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type EntityType = 'CONTRIBUTION' | 'LOAN';

export interface ContributionTrace {
  entityType: 'CONTRIBUTION';
  entity: Record<string, unknown>;
  auditEvents: Array<{ id: string; action: string; entityType: string; entityId: string; sequenceNo: number; createdAt: Date }>;
  ledgerEvents: Array<{ id: string; sourceEventType: string; sourceEventId: string; eventTimestamp: Date }>;
  ledgerLines: Array<{ ledgerEventId: string; fundBucket: string; memberId: string | null; amountMinor: number }>;
  evidenceMetadata: Array<{ id: string; storedPath: string; mimeType: string; sizeBytes: number }>;
  notifications: Array<{ id: string; channel: string; templateKey: string; status: string; createdAt: Date }>;
}

export interface LoanTrace {
  entityType: 'LOAN';
  entity: Record<string, unknown>;
  scheduleItems: Array<Record<string, unknown>>;
  repayments: Array<Record<string, unknown>>;
  auditEvents: Array<{ id: string; action: string; entityType: string; entityId: string; sequenceNo: number; createdAt: Date }>;
  ledgerEvents: Array<{ id: string; sourceEventType: string; sourceEventId: string; eventTimestamp: Date }>;
  ledgerLines: Array<{ ledgerEventId: string; fundBucket: string; memberId: string | null; amountMinor: number }>;
  evidenceMetadata: Array<{ id: string; storedPath: string; mimeType: string; sizeBytes: number }>;
  notifications: Array<{ id: string; channel: string; templateKey: string; status: string; createdAt: Date }>;
}

export type EntityTrace = ContributionTrace | LoanTrace;

const MAX_AUDIT = 100;
const MAX_NOTIFICATIONS = 50;

@Injectable()
export class EntityTraceService {
  constructor(private readonly prisma: PrismaService) {}

  async getContributionTrace(contributionId: string, tenantGroupId: string): Promise<ContributionTrace> {
    const contribution = await this.prisma.contribution.findFirst({
      where: { id: contributionId, groupId: tenantGroupId },
      include: { evidenceFile: true },
    });
    if (!contribution) throw new NotFoundException('Contribution not found');

    const entity = this.sanitizeContribution(contribution);

    const auditEvents = await this.prisma.auditLog.findMany({
      where: { tenantGroupId, entityType: 'CONTRIBUTION', entityId: contributionId },
      orderBy: { sequenceNo: 'asc' },
      take: MAX_AUDIT,
      select: { id: true, action: true, entityType: true, entityId: true, sequenceNo: true, createdAt: true },
    });

    let ledgerEvents: Array<{ id: string; sourceEventType: string; sourceEventId: string; eventTimestamp: Date }> = [];
    let ledgerLines: Array<{ ledgerEventId: string; fundBucket: string; memberId: string | null; amountMinor: number }> = [];
    if (contribution.ledgerEventId) {
      const ev = await this.prisma.ledgerEvent.findUnique({
        where: { id: contribution.ledgerEventId },
        include: { lines: true },
      });
      if (ev) {
        ledgerEvents = [{ id: ev.id, sourceEventType: ev.sourceEventType, sourceEventId: ev.sourceEventId, eventTimestamp: ev.eventTimestamp }];
        ledgerLines = ev.lines.map((l) => ({
          ledgerEventId: l.ledgerEventId,
          fundBucket: l.fundBucket,
          memberId: l.memberId,
          amountMinor: l.amountMinor,
        }));
      }
    }

    const reversalEventIds = await this.prisma.auditLog.findMany({
      where: { tenantGroupId, action: 'CONTRIBUTION_REVERSED', entityId: contributionId },
      select: { afterSnapshot: true },
    }).then((rows) => rows.map((r) => (r.afterSnapshot as { reversalLedgerEventId?: string })?.reversalLedgerEventId).filter(Boolean) as string[]);
    if (reversalEventIds.length > 0) {
      const revEvents = await this.prisma.ledgerEvent.findMany({
        where: { id: { in: reversalEventIds } },
        include: { lines: true },
      });
      ledgerEvents.push(...revEvents.map((e) => ({ id: e.id, sourceEventType: e.sourceEventType, sourceEventId: e.sourceEventId, eventTimestamp: e.eventTimestamp })));
      revEvents.forEach((e) => e.lines.forEach((l) => ledgerLines.push({ ledgerEventId: l.ledgerEventId, fundBucket: l.fundBucket, memberId: l.memberId, amountMinor: l.amountMinor })));
    }

    const evidenceMetadata = contribution.evidenceFile
      ? [{ id: contribution.evidenceFile.id, storedPath: contribution.evidenceFile.storedPath, mimeType: contribution.evidenceFile.mimeType, sizeBytes: contribution.evidenceFile.sizeBytes }]
      : [];

    const notifications = await this.prisma.notification.findMany({
      where: {
        tenantGroupId,
        recipientMemberId: contribution.memberId,
        templateKey: 'receipt_confirmation',
      },
      orderBy: { createdAt: 'desc' },
      take: MAX_NOTIFICATIONS,
      select: { id: true, channel: true, templateKey: true, status: true, createdAt: true },
    });

    return {
      entityType: 'CONTRIBUTION',
      entity,
      auditEvents,
      ledgerEvents,
      ledgerLines,
      evidenceMetadata,
      notifications,
    };
  }

  async getLoanTrace(loanId: string, tenantGroupId: string): Promise<LoanTrace> {
    const loan = await this.prisma.loan.findFirst({
      where: { id: loanId, groupId: tenantGroupId },
      include: { scheduleItems: true, repayments: true, application: true },
    });
    if (!loan) throw new NotFoundException('Loan not found');

    const entity = this.sanitizeLoan(loan);
    const scheduleItems = loan.scheduleItems.map((s) => ({
      id: s.id,
      installmentNo: s.installmentNo,
      dueDate: s.dueDate,
      principalDueMinor: s.principalDueMinor,
      interestDueMinor: s.interestDueMinor,
      totalDueMinor: s.totalDueMinor,
      status: s.status,
    }));
    const repayments = loan.repayments.map((r) => ({
      id: r.id,
      amountMinor: r.amountMinor,
      principalMinor: r.principalMinor,
      interestMinor: r.interestMinor,
      recordedAt: r.recordedAt,
      ledgerEventId: r.ledgerEventId,
    }));

    const auditEvents = await this.prisma.auditLog.findMany({
      where: {
        tenantGroupId,
        entityType: { in: ['LOAN', 'LOAN_APPLICATION'] },
        entityId: { in: [loanId, loan.applicationId ?? ''] },
      },
      orderBy: { sequenceNo: 'asc' },
      take: MAX_AUDIT,
      select: { id: true, action: true, entityType: true, entityId: true, sequenceNo: true, createdAt: true },
    });

    const disbursementEvent = await this.prisma.ledgerEvent.findFirst({
      where: { tenantGroupId, sourceEventType: 'LOAN_DISBURSEMENT_RECORDED', sourceEventId: loanId },
      include: { lines: true },
    });
    const repaymentLedgerIds = loan.repayments.map((r) => r.ledgerEventId).filter(Boolean) as string[];
    const repaymentEvents = repaymentLedgerIds.length > 0
      ? await this.prisma.ledgerEvent.findMany({
          where: { id: { in: repaymentLedgerIds } },
          include: { lines: true },
        })
      : [];
    const ledgerEvents = [disbursementEvent, ...repaymentEvents].filter(Boolean) as Array<{ id: string; sourceEventType: string; sourceEventId: string; eventTimestamp: Date; lines: Array<{ ledgerEventId: string; fundBucket: string; memberId: string | null; amountMinor: number }> }>;
    ledgerEvents.sort((a, b) => a.eventTimestamp.getTime() - b.eventTimestamp.getTime());

    const evidenceFileIds = loan.repayments.map((r) => r.evidenceFileId).filter(Boolean) as string[];
    const evidenceMetadata =
      evidenceFileIds.length > 0
        ? await this.prisma.evidenceFile.findMany({
            where: { id: { in: evidenceFileIds } },
            select: { id: true, storedPath: true, mimeType: true, sizeBytes: true },
          })
        : [];

    const notifications = await this.prisma.notification.findMany({
      where: {
        tenantGroupId,
        recipientMemberId: loan.borrowerId,
        templateKey: { in: ['approval_decision', 'overdue_repayment_reminder', 'approval_required'] },
      },
      orderBy: { createdAt: 'desc' },
      take: MAX_NOTIFICATIONS,
      select: { id: true, channel: true, templateKey: true, status: true, createdAt: true },
    });

    return {
      entityType: 'LOAN',
      entity,
      scheduleItems,
      repayments,
      auditEvents,
      ledgerEvents: ledgerEvents.map((e) => ({ id: e.id, sourceEventType: e.sourceEventType, sourceEventId: e.sourceEventId, eventTimestamp: e.eventTimestamp })),
      ledgerLines: ledgerEvents.flatMap((e) => e.lines.map((l) => ({ ledgerEventId: l.ledgerEventId, fundBucket: l.fundBucket, memberId: l.memberId, amountMinor: l.amountMinor }))),
      evidenceMetadata,
      notifications,
    };
  }

  async getTrace(entityType: EntityType, entityId: string, tenantGroupId: string): Promise<EntityTrace> {
    if (entityType === 'CONTRIBUTION') return this.getContributionTrace(entityId, tenantGroupId);
    return this.getLoanTrace(entityId, tenantGroupId);
  }

  private sanitizeContribution(c: { id: string; groupId: string; memberId: string; meetingId: string | null; status: string; totalAmountMinor: number | null; ledgerEventId: string | null; createdAt: Date }): Record<string, unknown> {
    return {
      id: c.id,
      groupId: c.groupId,
      memberId: c.memberId,
      meetingId: c.meetingId,
      status: c.status,
      totalAmountMinor: c.totalAmountMinor,
      ledgerEventId: c.ledgerEventId,
      createdAt: c.createdAt,
    };
  }

  private sanitizeLoan(loan: { id: string; groupId: string; borrowerId: string; principalAmountMinor: number; state: string; approvedAt: Date; disbursementRecordedAt: Date | null }): Record<string, unknown> {
    return {
      id: loan.id,
      groupId: loan.groupId,
      borrowerId: loan.borrowerId,
      principalAmountMinor: loan.principalAmountMinor,
      state: loan.state,
      approvedAt: loan.approvedAt,
      disbursementRecordedAt: loan.disbursementRecordedAt,
    };
  }
}
