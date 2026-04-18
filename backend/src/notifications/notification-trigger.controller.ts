import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { NotificationTriggerService } from './notification-trigger.service';
import { RequirePermissionGuard } from '../rbac/require-permission.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { Permission } from '../domain/enums';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditChannel } from '../domain/enums';

export class OverdueReminderTriggerDto {
  @ApiPropertyOptional({ description: 'Tenant group (required for RBAC)' })
  @IsOptional()
  @IsUUID()
  tenantGroupId?: string;

  @ApiPropertyOptional({ description: 'Limit to one loan' })
  @IsOptional()
  @IsUUID()
  loanId?: string;

  @ApiPropertyOptional({ description: 'Actor for audit' })
  @IsOptional()
  @IsUUID()
  actorUserId?: string;
}

export class MeetingReminderTriggerDto {
  @ApiPropertyOptional({ description: 'Specific meeting' })
  @IsOptional()
  @IsUUID()
  meetingId?: string;

  @ApiPropertyOptional({ description: 'Tenant group (required for RBAC when no meetingId)' })
  @IsOptional()
  @IsUUID()
  tenantGroupId?: string;

  @ApiPropertyOptional({ description: 'For scheduler: meetings in next N hours', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  withinHours?: number;

  @ApiPropertyOptional({ description: 'Actor for audit' })
  @IsOptional()
  @IsUUID()
  actorUserId?: string;
}

@ApiTags('notifications')
@Controller('notifications/triggers')
export class NotificationTriggerController {
  constructor(
    private readonly triggerService: NotificationTriggerService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Post('overdue-reminder')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.NOTIFICATION_RESEND)
  @ApiOperation({ summary: 'Manually trigger overdue repayment reminders (scheduler-ready)' })
  async triggerOverdueReminder(@Body() dto: OverdueReminderTriggerDto) {
    const result = await this.triggerService.enqueueOverdueReminders({
      tenantGroupId: dto.tenantGroupId,
      loanId: dto.loanId,
    });
    if (dto.actorUserId) {
      await this.auditLog.append({
        tenantGroupId: dto.tenantGroupId ?? null,
        actorUserId: dto.actorUserId,
        channel: AuditChannel.ADMIN_PORTAL,
        action: 'NOTIFICATION_TRIGGER_MANUAL',
        entityType: 'NOTIFICATION_TRIGGER',
        entityId: 'overdue-reminder',
        afterSnapshot: { trigger: 'overdue_repayment_reminder', enqueued: result.enqueued, options: { tenantGroupId: dto.tenantGroupId, loanId: dto.loanId } },
      });
    }
    return result;
  }

  @Post('meeting-reminder')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.NOTIFICATION_RESEND)
  @ApiOperation({ summary: 'Manually trigger meeting reminders (scheduler-ready)' })
  async triggerMeetingReminder(@Body() dto: MeetingReminderTriggerDto) {
    const result = await this.triggerService.enqueueMeetingReminders({
      meetingId: dto.meetingId,
      tenantGroupId: dto.tenantGroupId,
      withinHours: dto.withinHours,
    });
    if (dto.actorUserId) {
      await this.auditLog.append({
        tenantGroupId: dto.tenantGroupId ?? null,
        actorUserId: dto.actorUserId,
        channel: AuditChannel.ADMIN_PORTAL,
        action: 'NOTIFICATION_TRIGGER_MANUAL',
        entityType: 'NOTIFICATION_TRIGGER',
        entityId: 'meeting-reminder',
        afterSnapshot: { trigger: 'meeting_reminder', enqueued: result.enqueued, options: { meetingId: dto.meetingId, tenantGroupId: dto.tenantGroupId, withinHours: dto.withinHours } },
      });
    }
    return result;
  }
}
