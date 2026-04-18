import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditChannel } from '../domain/enums';
import { RequirePermissionGuard } from '../rbac/require-permission.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { Permission } from '../domain/enums';
import { RbacService } from '../rbac/rbac.service';
import { NotificationService } from '../notifications/notification.service';
import {
  AuditLogFilterDto,
  SmsFailuresFilterDto,
  EvidenceAccessFilterDto,
  SupportAccessDto,
} from './support.dto';
import { SupportReadService } from './support-read.service';
import { EntityTraceService } from './entity-trace.service';

@ApiTags('support')
@Controller('support')
@UseGuards(RequirePermissionGuard)
@RequirePermission(Permission.ADMIN_SUPPORT_ACCESS)
export class SupportController {
  constructor(
    private readonly auditLog: AuditLogService,
    private readonly supportRead: SupportReadService,
    private readonly entityTrace: EntityTraceService,
    private readonly rbac: RbacService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('audit-log')
  @ApiOperation({ summary: 'Filtered audit log (support); requires reason code and case id' })
  async listAuditLog(@Body() dto: AuditLogFilterDto) {
    await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId: dto.supportCaseOrIncidentId,
      reasonCode: dto.reasonCode,
      actorUserId: dto.actorUserId,
      tenantGroupId: dto.tenantGroupId,
      channel: AuditChannel.ADMIN_PORTAL,
      action: 'AUDIT_LOG_READ',
    });
    const fromDate = dto.fromDate ? new Date(dto.fromDate) : undefined;
    const toDate = dto.toDate ? new Date(dto.toDate) : undefined;
    return this.supportRead.listAuditLogFiltered({
      tenantGroupId: dto.tenantGroupId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      action: dto.action,
      fromDate,
      toDate,
      limit: dto.limit,
      cursor: dto.cursor,
    });
  }

  @Post('sms-failures')
  @ApiOperation({ summary: 'SMS delivery failures list (support); requires reason code and case id' })
  async listSmsFailures(@Body() dto: SmsFailuresFilterDto) {
    await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId: dto.supportCaseOrIncidentId,
      reasonCode: dto.reasonCode,
      actorUserId: dto.actorUserId,
      tenantGroupId: dto.tenantGroupId,
      channel: AuditChannel.ADMIN_PORTAL,
      action: 'SMS_FAILURES_READ',
    });
    return this.supportRead.listSmsFailures({
      tenantGroupId: dto.tenantGroupId,
      limit: dto.limit,
      cursor: dto.cursor,
    });
  }

  @Post('evidence-access-history')
  @ApiOperation({ summary: 'Evidence access log history (support); requires reason code and case id' })
  async listEvidenceAccessHistory(@Body() dto: EvidenceAccessFilterDto) {
    await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId: dto.supportCaseOrIncidentId,
      reasonCode: dto.reasonCode,
      actorUserId: dto.actorUserId,
      tenantGroupId: dto.tenantGroupId,
      channel: AuditChannel.ADMIN_PORTAL,
      action: 'EVIDENCE_ACCESS_HISTORY_READ',
    });
    return this.supportRead.listEvidenceAccessHistory({
      tenantGroupId: dto.tenantGroupId,
      evidenceFileId: dto.evidenceFileId,
      limit: dto.limit,
      cursor: dto.cursor,
    });
  }

  @Get('trace/contribution/:id')
  @ApiOperation({ summary: 'Entity trace for one contribution (support); requires reason code and case id' })
  async getContributionTrace(
    @Param('id') id: string,
    @Query('reasonCode') reasonCode: string,
    @Query('supportCaseOrIncidentId') supportCaseOrIncidentId: string,
    @Query('actorUserId') actorUserId: string,
    @Query('tenantGroupId') tenantGroupId: string,
  ) {
    await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId,
      reasonCode,
      actorUserId,
      tenantGroupId,
      channel: AuditChannel.ADMIN_PORTAL,
      action: 'TRACE_READ',
      metadata: { entityType: 'CONTRIBUTION', entityId: id },
    });
    return this.entityTrace.getTrace('CONTRIBUTION', id, tenantGroupId);
  }

  @Get('trace/loan/:id')
  @ApiOperation({ summary: 'Entity trace for one loan (support); requires reason code and case id' })
  async getLoanTrace(
    @Param('id') id: string,
    @Query('reasonCode') reasonCode: string,
    @Query('supportCaseOrIncidentId') supportCaseOrIncidentId: string,
    @Query('actorUserId') actorUserId: string,
    @Query('tenantGroupId') tenantGroupId: string,
  ) {
    await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId,
      reasonCode,
      actorUserId,
      tenantGroupId,
      channel: AuditChannel.ADMIN_PORTAL,
      action: 'TRACE_READ',
      metadata: { entityType: 'LOAN', entityId: id },
    });
    return this.entityTrace.getTrace('LOAN', id, tenantGroupId);
  }

  @Get('trace/contribution/:id/export')
  @ApiOperation({ summary: 'Export debug trace for one contribution (admin-only, audited)' })
  async exportContributionTrace(
    @Param('id') id: string,
    @Query('reasonCode') reasonCode: string,
    @Query('supportCaseOrIncidentId') supportCaseOrIncidentId: string,
    @Query('actorUserId') actorUserId: string,
    @Query('tenantGroupId') tenantGroupId: string,
  ) {
    await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId,
      reasonCode,
      actorUserId,
      tenantGroupId,
      channel: AuditChannel.ADMIN_PORTAL,
      action: 'TRACE_EXPORT',
      metadata: { entityType: 'CONTRIBUTION', entityId: id },
    });
    return this.entityTrace.getTrace('CONTRIBUTION', id, tenantGroupId);
  }

  @Get('trace/loan/:id/export')
  @ApiOperation({ summary: 'Export debug trace for one loan (admin-only, audited)' })
  async exportLoanTrace(
    @Param('id') id: string,
    @Query('reasonCode') reasonCode: string,
    @Query('supportCaseOrIncidentId') supportCaseOrIncidentId: string,
    @Query('actorUserId') actorUserId: string,
    @Query('tenantGroupId') tenantGroupId: string,
  ) {
    await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId,
      reasonCode,
      actorUserId,
      tenantGroupId,
      channel: AuditChannel.ADMIN_PORTAL,
      action: 'TRACE_EXPORT',
      metadata: { entityType: 'LOAN', entityId: id },
    });
    return this.entityTrace.getTrace('LOAN', id, tenantGroupId);
  }

  @Post('notifications/:id/retry')
  @RequirePermission(Permission.NOTIFICATION_RESEND)
  @ApiOperation({ summary: 'Retry a failed notification (support context + NOTIFICATION_RESEND)' })
  async retryNotification(@Param('id') id: string, @Body() dto: SupportAccessDto) {
    await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId: dto.supportCaseOrIncidentId,
      reasonCode: dto.reasonCode,
      actorUserId: dto.actorUserId,
      tenantGroupId: dto.tenantGroupId,
      channel: AuditChannel.ADMIN_PORTAL,
      action: 'NOTIFICATION_RETRY',
      metadata: { notificationId: id },
    });
    await this.rbac.requirePermission(
      dto.tenantGroupId,
      dto.actorUserId,
      Permission.NOTIFICATION_RESEND,
      {},
      undefined,
    );
    return this.notificationService.retry(id, dto.actorUserId);
  }
}
