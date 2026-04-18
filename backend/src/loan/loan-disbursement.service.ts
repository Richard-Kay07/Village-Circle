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
import type { RecordDisbursementDto } from './loan.types';

@Injectable()
export class LoanDisbursementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly rbac: RbacService,
    private readonly auditLog: AuditLogService,
    private readonly ledgerPosting: LedgerPostingService,
  ) {}

  async recordDisbursement(
    dto: RecordDisbursementDto,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
    actorMemberId?: string,
  ): Promise<{ id: string }> {
    await this.rbac.requirePermission(
      dto.tenantGroupId,
      actorUserId ?? null,
      Permission.LOAN_DISBURSEMENT_RECORD,
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
    if (loan.state !== 'APPROVED') throw new ValidationError('Loan is not in APPROVED state', { state: loan.state });

    if (dto.evidenceAttachmentId) {
      const file = await this.prisma.evidenceFile.findFirst({
        where: { id: dto.evidenceAttachmentId, groupId: dto.tenantGroupId },
      });
      if (!file) throw new ValidationError('Evidence file not found or wrong group', { evidenceAttachmentId: dto.evidenceAttachmentId });
    }

    const principalMinor = loan.principalAmountMinor;
    const idempotencyKey = `loan-disbursement:${dto.loanId}`;
    const ledgerResult = await this.ledgerPosting.post(
      {
        tenantGroupId: dto.tenantGroupId,
        sourceEventType: 'LOAN_DISBURSEMENT_RECORDED',
        sourceEventId: dto.loanId,
        transactionMode: dto.transactionMode,
        eventTimestamp: new Date(),
        recordedByUserId: dto.recordedByUserId,
        idempotencyKey,
        lines: [
          { fundBucket: FundBucket.LOAN_PRINCIPAL, memberId: loan.borrowerId, amountMinor: principalMinor },
          { fundBucket: FundBucket.LOAN_PRINCIPAL, memberId: null, amountMinor: -principalMinor },
        ],
        metadata: {
          loanId: dto.loanId,
          principalMinor,
          externalReferenceText: dto.externalReferenceText ?? null,
          evidenceAttachmentId: dto.evidenceAttachmentId ?? null,
        },
      },
      channel,
    );

    const now = new Date();
    await this.prisma.loan.update({
      where: { id: dto.loanId },
      data: {
        disbursementRecordedAt: now,
        state: 'ACTIVE',
        disbursedAt: now,
      },
    });

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: dto.recordedByUserId,
      channel,
      action: 'LOAN_DISBURSEMENT_RECORDED',
      entityType: 'LOAN',
      entityId: dto.loanId,
      afterSnapshot: {
        loanId: dto.loanId,
        principalMinor,
        transactionMode: dto.transactionMode,
        ledgerEventId: ledgerResult.ledgerEventId,
      },
    });

    return { id: dto.loanId };
  }
}
