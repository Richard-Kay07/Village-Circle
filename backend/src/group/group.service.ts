import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditEntityType } from '@prisma/client';
import { toDecimal } from '../common/decimal';

export interface CreateGroupDto {
  name: string;
  currency?: string;
  groupType: 'CASH' | 'BANK_TRANSFER';
  loanInterestRate?: number;
}

export interface UpdateGroupDto {
  name?: string;
  loanInterestRate?: number;
  status?: 'ACTIVE' | 'CLOSED';
}

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateGroupDto, actorId: string): Promise<{ id: string }> {
    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        currency: dto.currency ?? 'GBP',
        groupType: dto.groupType,
        loanInterestRate: dto.loanInterestRate != null ? toDecimal(dto.loanInterestRate) : undefined,
      },
    });
    await this.audit.emit({
      groupId: group.id,
      entityType: AuditEntityType.GROUP,
      entityId: group.id,
      action: 'CREATED',
      actorId,
      payload: { name: group.name, groupType: group.groupType },
    });
    return { id: group.id };
  }

  async findOne(id: string): Promise<{
    id: string;
    name: string;
    currency: string;
    groupType: string;
    loanInterestRate: number;
    status: string;
    createdAt: Date;
  } | null> {
    const group = await this.prisma.group.findUnique({
      where: { id },
    });
    if (!group) return null;
    return {
      id: group.id,
      name: group.name,
      currency: group.currency,
      groupType: group.groupType,
      loanInterestRate: group.loanInterestRate.toNumber(),
      status: group.status,
      createdAt: group.createdAt,
    };
  }

  async getOrThrow(id: string): Promise<{
    id: string;
    name: string;
    currency: string;
    groupType: string;
    loanInterestRate: number;
    status: string;
    createdAt: Date;
  }> {
    const g = await this.findOne(id);
    if (!g) throw new NotFoundException('Group not found');
    return g;
  }

  async update(
    id: string,
    dto: UpdateGroupDto,
    actorId: string,
  ): Promise<{ id: string }> {
    await this.getOrThrow(id);
    const group = await this.prisma.group.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.loanInterestRate != null && { loanInterestRate: toDecimal(dto.loanInterestRate) }),
        ...(dto.status != null && { status: dto.status }),
      },
    });
    await this.audit.emit({
      groupId: group.id,
      entityType: AuditEntityType.GROUP,
      entityId: group.id,
      action: 'UPDATED',
      actorId,
      payload: dto,
    });
    return { id: group.id };
  }

  /** RBAC: ensure actor is ADMIN of the group. */
  async assertAdmin(groupId: string, memberId: string): Promise<void> {
    const member = await this.prisma.member.findFirst({
      where: { groupId, id: memberId, status: 'ACTIVE' },
    });
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException('Only group admin can perform this action');
    }
  }

  /** RBAC: ensure actor is active member of the group. */
  async assertActiveMember(groupId: string, memberId: string): Promise<void> {
    const member = await this.prisma.member.findFirst({
      where: { groupId, id: memberId, status: 'ACTIVE' },
    });
    if (!member) {
      throw new ForbiddenException('Not an active member of this group');
    }
  }
}
