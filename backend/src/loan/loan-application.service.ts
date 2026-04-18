import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationTriggerService } from '../notifications/notification-trigger.service';
import { Permission } from '../domain/enums';
import { AuditChannel } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import type { SubmitApplicationDto } from './loan.types';

@Injectable()
export class LoanApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly rbac: RbacService,
    private readonly auditLog: AuditLogService,
    private readonly notificationTriggers: NotificationTriggerService,
  ) {}

  async submit(
    dto: SubmitApplicationDto,
    channel: AuditChannel = AuditChannel.WEB,
    actorUserId?: string | null,
    actorMemberId?: string,
  ): Promise<{ id: string }> {
    await this.rbac.requirePermission(
      dto.tenantGroupId,
      actorUserId ?? null,
      Permission.LOAN_APPLY,
      {},
      actorMemberId,
    );
    await this.groupService.getOrThrow(dto.tenantGroupId);
    const member = await this.prisma.member.findFirst({
      where: { id: dto.memberProfileId, groupId: dto.tenantGroupId, status: 'ACTIVE' },
    });
    if (!member) throw new ValidationError('Member not found or not active', { memberProfileId: dto.memberProfileId });

    if (dto.requestedAmountMinor <= 0 || dto.requestedTermPeriods <= 0) {
      throw new ValidationError('requestedAmountMinor and requestedTermPeriods must be positive');
    }

    const app = await this.prisma.loanApplication.create({
      data: {
        groupId: dto.tenantGroupId,
        memberId: dto.memberProfileId,
        requestedAmountMinor: dto.requestedAmountMinor,
        requestedTermPeriods: dto.requestedTermPeriods,
        purpose: dto.purpose ?? undefined,
        status: 'SUBMITTED',
        submittedByUserId: dto.submittedByUserId,
      },
    });

    await this.auditLog.append({
      tenantGroupId: dto.tenantGroupId,
      actorUserId: dto.submittedByUserId,
      channel,
      action: 'LOAN_APPLICATION_SUBMITTED',
      entityType: 'LOAN_APPLICATION',
      entityId: app.id,
      afterSnapshot: {
        applicationId: app.id,
        memberProfileId: dto.memberProfileId,
        requestedAmountMinor: dto.requestedAmountMinor,
        requestedTermPeriods: dto.requestedTermPeriods,
      },
    });

    void this.notificationTriggers
      .approvalRequired({
        tenantGroupId: dto.tenantGroupId,
        applicationId: app.id,
        memberDisplayName: member.displayName,
        requestedAmountMinor: dto.requestedAmountMinor,
      })
      .catch(() => {});

    return { id: app.id };
  }
}
