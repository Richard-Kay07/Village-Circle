import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContributionService } from './contribution.service';
import { ContributionReadService } from './contribution-read.service';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { RequirePermissionGuard } from '../rbac/require-permission.guard';
import { RbacService } from '../rbac/rbac.service';
import { Permission } from '../domain/enums';
import {
  RecordContributionDto,
  BulkRecordContributionsDto,
  ReversalContributionDto,
} from './contribution.dto';
import { ContributionQueryFiltersDto } from './contribution-query.dto';

@ApiTags('contributions')
@Controller('contributions')
export class ContributionController {
  constructor(
    private readonly contributionService: ContributionService,
    private readonly readService: ContributionReadService,
    private readonly rbac: RbacService,
  ) {}

  @Post()
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.CONTRIBUTION_RECORD)
  @ApiOperation({ summary: 'Record a single contribution (idempotent)' })
  record(@Body() dto: RecordContributionDto) {
    return this.contributionService.record(dto);
  }

  @Post('bulk')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.CONTRIBUTION_RECORD)
  @ApiOperation({ summary: 'Bulk record contributions for a meeting' })
  recordBulk(@Body() dto: BulkRecordContributionsDto) {
    return this.contributionService.recordBulk(dto);
  }

  @Post('reversal')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.CONTRIBUTION_REVERSE)
  @ApiOperation({ summary: 'Reverse a contribution (no destructive edit)' })
  reversal(@Body() dto: ReversalContributionDto) {
    return this.contributionService.reversal(dto);
  }

  @Get('group/:groupId/history')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.CONTRIBUTION_RECORD)
  @ApiOperation({ summary: 'List contributions for a group with filters and totals' })
  async listByGroupHistory(
    @Param('groupId') groupId: string,
    @Query('tenantGroupId') tenantGroupId: string,
    @Query() filters: ContributionQueryFiltersDto,
    @Query('actorUserId') actorUserId: string | undefined,
    @Query('actorMemberId') actorMemberId: string | undefined,
  ) {
    const gid = tenantGroupId || groupId;
    const includeSensitive = await this.canIncludeSensitiveFields(gid, actorUserId, actorMemberId);
    return this.readService.listByGroupWithFilters(
      gid,
      filters as import('./contribution-read.types').ContributionQueryFilters,
      { includeSensitiveFields: includeSensitive, actorUserId: actorUserId ?? null },
    );
  }

  @Get('group/:groupId')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.CONTRIBUTION_RECORD)
  @ApiOperation({ summary: 'List contributions for a group (legacy)' })
  listByGroup(
    @Param('groupId') groupId: string,
    @Query('actorMemberId') actorMemberId: string,
  ) {
    return this.contributionService.listByGroup(groupId, actorMemberId);
  }

  @Get('meeting/:meetingId/summary')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.CONTRIBUTION_RECORD)
  @ApiOperation({ summary: 'Meeting contribution summary' })
  async getMeetingSummary(
    @Param('meetingId') meetingId: string,
    @Query('tenantGroupId') tenantGroupId: string,
    @Query() filters: ContributionQueryFiltersDto,
    @Query('actorUserId') actorUserId: string | undefined,
    @Query('actorMemberId') actorMemberId: string | undefined,
  ) {
    const includeSensitive = await this.canIncludeSensitiveFields(tenantGroupId, actorUserId, actorMemberId);
    return this.readService.getMeetingSummary(
      tenantGroupId,
      meetingId,
      filters as import('./contribution-read.types').ContributionQueryFilters,
      { includeSensitiveFields: includeSensitive, actorUserId: actorUserId ?? null },
    );
  }

  @Get('member/:memberId/history')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.CONTRIBUTION_RECORD)
  @ApiOperation({ summary: 'Member contribution history' })
  async getMemberHistory(
    @Param('memberId') memberId: string,
    @Query('tenantGroupId') tenantGroupId: string,
    @Query() filters: ContributionQueryFiltersDto,
    @Query('actorUserId') actorUserId: string | undefined,
    @Query('actorMemberId') actorMemberId: string | undefined,
  ) {
    const includeSensitive = await this.canIncludeSensitiveFields(tenantGroupId, actorUserId, actorMemberId);
    return this.readService.getMemberHistory(
      tenantGroupId,
      memberId,
      filters as import('./contribution-read.types').ContributionQueryFilters,
      { includeSensitiveFields: includeSensitive },
    );
  }

  @Get('reports/unreconciled-bank-transfers')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.REPORT_EXPORT)
  @ApiOperation({ summary: 'Unreconciled bank-transfer contributions (reconciliation-ready)' })
  async getUnreconciledBankTransfers(
    @Query('tenantGroupId') tenantGroupId: string,
    @Query() filters: ContributionQueryFiltersDto,
    @Query('actorUserId') actorUserId: string | undefined,
    @Query('actorMemberId') actorMemberId: string | undefined,
  ) {
    const includeSensitive = await this.canIncludeSensitiveFields(tenantGroupId, actorUserId, actorMemberId);
    return this.readService.getUnreconciledBankTransfers(
      tenantGroupId,
      filters as import('./contribution-read.types').ContributionQueryFilters,
      {
        includeSensitiveFields: includeSensitive,
        actorUserId: actorUserId ?? null,
        auditExport: true,
      },
    );
  }

  @Get('reports/cash-totals')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.CONTRIBUTION_RECORD)
  @ApiOperation({ summary: 'Cash contribution totals by meeting or date' })
  getCashTotals(
    @Query('tenantGroupId') tenantGroupId: string,
    @Query('groupBy') groupBy: 'meeting' | 'date',
    @Query() filters: ContributionQueryFiltersDto,
  ) {
    return this.readService.getCashTotalsByMeetingOrDate(
      tenantGroupId,
      groupBy ?? 'date',
      filters as import('./contribution-read.types').ContributionQueryFilters,
    );
  }

  @Get(':contributionId')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.CONTRIBUTION_RECORD)
  @ApiOperation({ summary: 'Get contribution detail with evidence metadata' })
  getById(
    @Param('contributionId') contributionId: string,
    @Query('tenantGroupId') tenantGroupId: string,
  ) {
    return this.contributionService.getById(contributionId, tenantGroupId);
  }

  private async canIncludeSensitiveFields(
    tenantGroupId: string,
    actorUserId: string | undefined,
    actorMemberId: string | undefined,
  ): Promise<boolean> {
    const hasExport = await this.rbac.hasPermission(
      tenantGroupId,
      actorUserId ?? null,
      Permission.REPORT_EXPORT,
      actorMemberId,
    );
    const hasAudit = await this.rbac.hasPermission(
      tenantGroupId,
      actorUserId ?? null,
      Permission.AUDIT_READ,
      actorMemberId,
    );
    return hasExport || hasAudit;
  }
}
