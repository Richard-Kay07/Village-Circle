import { Injectable } from '@nestjs/common';
import { GroupService } from '../group/group.service';
import { RbacService } from '../rbac/rbac.service';
import { Permission } from '../domain/enums';
import { ValidationError } from '../domain/errors';
import type { RecordWriteOffDto } from './loan.types';
import { LoanWriteOffNotImplementedError } from './loan.errors';

/**
 * Write-off service (MVP skeleton).
 * Endpoint and RBAC are present; execution is blocked with a clear domain error until fully implemented.
 * Do not fake completion: no event row is created, loan state is not changed.
 */
@Injectable()
export class LoanWriteOffService {
  constructor(
    private readonly groupService: GroupService,
    private readonly rbac: RbacService,
  ) {}

  async recordWriteOff(
    dto: RecordWriteOffDto,
    _actorUserId?: string | null,
    _actorMemberId?: string,
  ): Promise<never> {
    await this.rbac.requirePermission(
      dto.tenantGroupId,
      _actorUserId ?? null,
      Permission.LOAN_WRITEOFF,
      {},
      _actorMemberId,
    );
    await this.groupService.getOrThrow(dto.tenantGroupId);

    if (!dto.reason?.trim()) throw new ValidationError('Reason is required for write-off');
    if (!dto.approvedByUserId?.trim()) throw new ValidationError('Approver identity is required');

    throw new LoanWriteOffNotImplementedError();
  }
}
