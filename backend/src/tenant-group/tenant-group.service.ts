import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditChannel } from '../domain/enums';
import { NotFoundError } from '../domain/errors';
import { toDecimal } from '../common/decimal';

export interface CreateTenantGroupInput {
  name: string;
  currency?: string;
  groupType: 'CASH' | 'BANK_TRANSFER';
  loanInterestRate?: number;
  actorUserId: string | null;
  channel: AuditChannel;
}

export interface UpdateTenantGroupInput {
  name?: string;
  status?: 'ACTIVE' | 'CLOSED';
  actorUserId: string | null;
  channel: AuditChannel;
}

export interface TenantGroupDto {
  id: string;
  name: string;
  currency: string;
  groupType: string;
  status: string;
  loanInterestRate: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TenantGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(input: CreateTenantGroupInput): Promise<{ id: string }> {
    const group = await this.prisma.group.create({
      data: {
        name: input.name,
        currency: input.currency ?? 'GBP',
        groupType: input.groupType,
        loanInterestRate: input.loanInterestRate != null ? toDecimal(input.loanInterestRate) : undefined,
      },
    });
    await this.auditLog.append({
      tenantGroupId: group.id,
      actorUserId: input.actorUserId,
      channel: input.channel,
      action: 'CREATED',
      entityType: 'TENANT_GROUP',
      entityId: group.id,
      afterSnapshot: {
        name: group.name,
        groupType: group.groupType,
        status: group.status,
      },
    });
    return { id: group.id };
  }

  async findOne(id: string): Promise<TenantGroupDto | null> {
    const group = await this.prisma.group.findUnique({
      where: { id },
    });
    if (!group) return null;
    return {
      id: group.id,
      name: group.name,
      currency: group.currency,
      groupType: group.groupType,
      status: group.status,
      loanInterestRate: group.loanInterestRate.toNumber(),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  async getOrThrow(id: string): Promise<TenantGroupDto> {
    const g = await this.findOne(id);
    if (!g) throw new NotFoundError(`Tenant group not found: ${id}`, { tenantGroupId: id });
    return g;
  }

  async update(id: string, input: UpdateTenantGroupInput): Promise<{ id: string }> {
    const existing = await this.prisma.group.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundError(`Tenant group not found: ${id}`, { tenantGroupId: id });

    const beforeSnapshot = {
      name: existing.name,
      status: existing.status,
    };
    const group = await this.prisma.group.update({
      where: { id },
      data: {
        ...(input.name != null && { name: input.name }),
        ...(input.status != null && { status: input.status }),
      },
    });

    await this.auditLog.append({
      tenantGroupId: group.id,
      actorUserId: input.actorUserId,
      channel: input.channel,
      action: 'UPDATED',
      entityType: 'TENANT_GROUP',
      entityId: group.id,
      beforeSnapshot,
      afterSnapshot: {
        name: group.name,
        status: group.status,
      },
    });
    return { id: group.id };
  }
}
