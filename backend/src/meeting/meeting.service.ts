import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { RbacService } from '../rbac/rbac.service';
import { Permission } from '../domain/enums';
import { CreateMeetingDto } from './meeting.dto';

@Injectable()
export class MeetingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly rbac: RbacService,
  ) {}

  async listByGroup(groupId: string, actorUserId: string | null): Promise<{ id: string; groupId: string; heldAt: Date; name: string | null }[]> {
    await this.rbac.requirePermission(groupId, actorUserId, Permission.MEETING_RECORD, {}, undefined);
    await this.groupService.getOrThrow(groupId);
    return this.prisma.meeting.findMany({
      where: { groupId },
      orderBy: { heldAt: 'desc' },
      take: 100,
      select: { id: true, groupId: true, heldAt: true, name: true },
    });
  }

  async create(dto: CreateMeetingDto, actorUserId?: string | null): Promise<{ id: string }> {
    const actor = dto.createdByUserId ?? actorUserId ?? null;
    await this.rbac.requirePermission(dto.tenantGroupId, actor, Permission.MEETING_RECORD, {}, undefined);
    await this.groupService.getOrThrow(dto.tenantGroupId);
    const meeting = await this.prisma.meeting.create({
      data: {
        groupId: dto.tenantGroupId,
        heldAt: new Date(dto.heldAt),
        name: dto.name ?? undefined,
      },
    });
    return { id: meeting.id };
  }
}
