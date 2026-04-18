import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditEntityType } from '@prisma/client';

export interface CreateMemberDto {
  groupId: string;
  displayName: string;
  phone?: string;
  role?: 'ADMIN' | 'MEMBER';
  createdByMemberId?: string; // optional: who added (admin); if not set, self-join
}

export interface UpdateMemberDto {
  displayName?: string;
  phone?: string;
  role?: 'ADMIN' | 'MEMBER';
}

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateMemberDto): Promise<{ id: string }> {
    const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
    if (!group) throw new NotFoundException('Group not found');
    const member = await this.prisma.member.create({
      data: {
        groupId: dto.groupId,
        displayName: dto.displayName,
        phone: dto.phone ?? null,
        role: dto.role ?? 'MEMBER',
      },
    });
    await this.audit.emit({
      groupId: dto.groupId,
      entityType: AuditEntityType.MEMBER,
      entityId: member.id,
      action: 'CREATED',
      actorId: dto.createdByMemberId ?? member.id,
      payload: { displayName: member.displayName, role: member.role },
    });
    return { id: member.id };
  }

  async findOne(memberId: string): Promise<{
    id: string;
    groupId: string;
    displayName: string;
    phone: string | null;
    role: string;
    status: string;
    joinedAt: Date;
  } | null> {
    const m = await this.prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!m) return null;
    return {
      id: m.id,
      groupId: m.groupId,
      displayName: m.displayName,
      phone: m.phone,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
    };
  }

  async getOrThrow(memberId: string): Promise<{
    id: string;
    groupId: string;
    displayName: string;
    phone: string | null;
    role: string;
    status: string;
    joinedAt: Date;
  }> {
    const m = await this.findOne(memberId);
    if (!m) throw new NotFoundException('Member not found');
    return m;
  }

  async listByGroup(groupId: string): Promise<Array<{
    id: string;
    displayName: string;
    phone: string | null;
    role: string;
    status: string;
    joinedAt: Date;
  }>> {
    const members = await this.prisma.member.findMany({
      where: { groupId },
      orderBy: { joinedAt: 'asc' },
    });
    return members.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      phone: m.phone,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
    }));
  }

  async update(
    memberId: string,
    dto: UpdateMemberDto,
    actorMemberId: string,
  ): Promise<{ id: string }> {
    const member = await this.getOrThrow(memberId);
    await this.prisma.member.update({
      where: { id: memberId },
      data: {
        ...(dto.displayName != null && { displayName: dto.displayName }),
        ...(dto.phone !== undefined && { phone: dto.phone ?? null }),
        ...(dto.role != null && { role: dto.role }),
      },
    });
    await this.audit.emit({
      groupId: member.groupId,
      entityType: AuditEntityType.MEMBER,
      entityId: memberId,
      action: 'UPDATED',
      actorId: actorMemberId,
      payload: dto,
    });
    return { id: memberId };
  }

  async leave(memberId: string, actorMemberId: string): Promise<{ id: string }> {
    const member = await this.getOrThrow(memberId);
    const now = new Date();
    await this.prisma.member.update({
      where: { id: memberId },
      data: { status: 'LEFT', leftAt: now },
    });
    await this.audit.emit({
      groupId: member.groupId,
      entityType: AuditEntityType.MEMBER,
      entityId: memberId,
      action: 'LEFT',
      actorId: actorMemberId,
      payload: { leftAt: now.toISOString() },
    });
    return { id: memberId };
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
