import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';
import { MemberGuard } from '../member/member.guard';
import { RequirePermissionGuard } from '../rbac/require-permission.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { Permission } from '../domain/enums';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Get('group/:groupId')
  @UseGuards(MemberGuard)
  @ApiOperation({ summary: 'List audit events for a group' })
  async listByGroup(
    @Param('groupId') groupId: string,
    @Query('actorMemberId') actorMemberId: string,
    @Query('limit') limit?: string,
  ) {
    const take = Math.min(Number(limit) || 100, 500);
    const events = await this.prisma.auditEvent.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      take,
    });
    return events.map((e) => ({
      id: e.id,
      entityType: e.entityType,
      entityId: e.entityId,
      action: e.action,
      actorId: e.actorId,
      payload: e.payload,
      createdAt: e.createdAt,
    }));
  }

  @Get('log/group/:groupId')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.AUDIT_READ)
  @ApiOperation({ summary: 'List audit log for a group (requires audit.read)' })
  async listLogByGroup(
    @Param('groupId') groupId: string,
    @Query('actorUserId') actorUserId: string | undefined,
    @Query('actorMemberId') actorMemberId: string | undefined,
    @Query('limit') limit?: string,
  ) {
    const take = Math.min(Number(limit) || 100, 500);
    const events = await this.prisma.auditLog.findMany({
      where: { tenantGroupId: groupId },
      orderBy: { sequenceNo: 'desc' },
      take,
    });
    return events.map((e) => ({
      id: e.id,
      tenantGroupId: e.tenantGroupId,
      actorUserId: e.actorUserId,
      channel: e.channel,
      action: e.action,
      entityType: e.entityType,
      entityId: e.entityId,
      reasonCode: e.reasonCode,
      sequenceNo: e.sequenceNo,
      createdAt: e.createdAt,
    }));
  }

  @Post('support-access')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.ADMIN_SUPPORT_ACCESS)
  @ApiOperation({ summary: 'Log support access (requires reason code and case id)' })
  async logSupportAccess(
    @Body()
    body: {
      supportCaseOrIncidentId: string;
      reasonCode: string;
      actorUserId: string;
      tenantGroupId: string;
      channel?: string;
    },
  ) {
    const id = await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId: body.supportCaseOrIncidentId,
      reasonCode: body.reasonCode,
      actorUserId: body.actorUserId,
      tenantGroupId: body.tenantGroupId,
      channel: (body.channel as any) ?? 'ADMIN_PORTAL',
    });
    return { id };
  }
}
