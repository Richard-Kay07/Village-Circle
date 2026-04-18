import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditEntityType } from '@prisma/client';
import { CreateAuditEventInput } from './audit.interface';

const ENTITY_TYPE_MAP: Record<string, AuditEntityType> = {
  GROUP: 'GROUP',
  MEMBER: 'MEMBER',
  CONTRIBUTION: 'CONTRIBUTION',
  LOAN: 'LOAN',
  LOAN_REPAYMENT: 'LOAN_REPAYMENT',
  SOCIAL_FUND_BUCKET: 'SOCIAL_FUND_BUCKET',
  SOCIAL_FUND_ENTRY: 'SOCIAL_FUND_ENTRY',
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async emit(input: CreateAuditEventInput): Promise<string> {
    const payload = input.payload ?? {};
    if (input.channel != null) {
      (payload as Record<string, unknown>).channel = input.channel;
    }
    const entityType = ENTITY_TYPE_MAP[input.entityType] ?? input.entityType;
    const event = await this.prisma.auditEvent.create({
      data: {
        groupId: input.groupId,
        entityType: entityType as AuditEntityType,
        entityId: input.entityId,
        action: input.action,
        actorId: input.actorId,
        payload: Object.keys(payload).length > 0 ? payload : undefined,
      },
    });
    return event.id;
  }
}
