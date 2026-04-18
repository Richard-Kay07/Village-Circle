import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { RequirePermissionGuard } from '../rbac/require-permission.guard';
import { Permission } from '../domain/enums';
import {
  SubmitApplicationDto,
  ApproveApplicationDto,
  RecordDisbursementDto,
  RecordRepaymentDto,
  RecordWaiverDto,
  RecordRescheduleDto,
  RecordWriteOffDto,
} from './loan.dto';

@ApiTags('loans')
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post('applications')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_APPLY)
  @ApiOperation({ summary: 'Submit loan application' })
  submitApplication(@Body() dto: SubmitApplicationDto) {
    return this.loanService.submitApplication(
      dto,
      dto.actorUserId ?? undefined,
      dto.actorMemberId ?? undefined,
    );
  }

  @Post('applications/approve')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_APPROVE)
  @ApiOperation({ summary: 'Approve application (creates loan + schedule)' })
  approveApplication(@Body() dto: ApproveApplicationDto) {
    return this.loanService.approveApplication(
      dto,
      dto.actorUserId ?? undefined,
      dto.actorMemberId ?? undefined,
    );
  }

  @Post('applications/:applicationId/reject')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_APPROVE)
  @ApiOperation({ summary: 'Reject application' })
  rejectApplication(
    @Param('applicationId') applicationId: string,
    @Query('tenantGroupId') tenantGroupId: string,
    @Query('rejectedByUserId') rejectedByUserId: string,
    @Query('actorUserId') actorUserId: string | undefined,
    @Query('actorMemberId') actorMemberId: string | undefined,
  ) {
    return this.loanService.rejectApplication(applicationId, tenantGroupId, rejectedByUserId, actorUserId, actorMemberId);
  }

  @Post('disbursements')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_DISBURSEMENT_RECORD)
  @ApiOperation({ summary: 'Record disbursement (evidence + ledger)' })
  recordDisbursement(@Body() dto: RecordDisbursementDto) {
    return this.loanService.recordDisbursement(
      dto,
      dto.actorUserId ?? undefined,
      dto.actorMemberId ?? undefined,
    );
  }

  @Post('repayments')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_REPAYMENT_RECORD)
  @ApiOperation({ summary: 'Record repayment (idempotent)' })
  recordRepayment(@Body() dto: RecordRepaymentDto) {
    return this.loanService.recordRepayment(
      dto,
      dto.actorUserId ?? undefined,
      dto.actorMemberId ?? undefined,
    );
  }

  @Post('waivers')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_WAIVE)
  @ApiOperation({ summary: 'Record waiver event (reason + approver required)' })
  recordWaiver(@Body() dto: RecordWaiverDto) {
    return this.loanService.recordWaiver(
      dto,
      dto.actorUserId ?? undefined,
      dto.actorMemberId ?? undefined,
    );
  }

  @Post('reschedules')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_RESCHEDULE)
  @ApiOperation({ summary: 'Record reschedule (prior schedule marked superseded)' })
  recordReschedule(@Body() dto: RecordRescheduleDto) {
    return this.loanService.recordReschedule(
      dto,
      dto.actorUserId ?? undefined,
      dto.actorMemberId ?? undefined,
    );
  }

  @Post('write-offs')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_WRITEOFF)
  @ApiOperation({ summary: 'Record write-off (skeleton: blocked with domain error until implemented)' })
  recordWriteOff(@Body() dto: RecordWriteOffDto) {
    return this.loanService.recordWriteOff(
      dto,
      dto.actorUserId ?? undefined,
      dto.actorMemberId ?? undefined,
    );
  }

  @Get('applications/group/:groupId')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_APPROVE)
  @ApiOperation({ summary: 'List loan applications for group (Treasurer/Chair)' })
  listApplicationsByGroup(
    @Param('groupId') groupId: string,
    @Query('status') status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | undefined,
    @Query('actorUserId') actorUserId: string | undefined,
    @Query('actorMemberId') actorMemberId: string | undefined,
  ) {
    return this.loanService.listApplicationsByGroup(groupId, status, actorUserId, actorMemberId);
  }

  @Get('applications/:applicationId')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_APPROVE)
  @ApiOperation({ summary: 'Get application detail with rule snapshot for approval panel' })
  getApplicationDetail(
    @Param('applicationId') applicationId: string,
    @Query('tenantGroupId') tenantGroupId: string,
    @Query('actorUserId') actorUserId: string | undefined,
    @Query('actorMemberId') actorMemberId: string | undefined,
  ) {
    return this.loanService.getApplicationDetail(applicationId, tenantGroupId, actorUserId, actorMemberId);
  }

  @Get('group/:groupId')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_APPLY)
  @ApiOperation({ summary: 'List loans for group' })
  listByGroup(
    @Param('groupId') groupId: string,
    @Query('actorMemberId') actorMemberId: string,
  ) {
    return this.loanService.listByGroup(groupId, actorMemberId);
  }

  @Get(':loanId')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_APPLY)
  @ApiOperation({ summary: 'Get loan detail' })
  getLoan(
    @Param('loanId') loanId: string,
    @Query('actorMemberId') actorMemberId: string,
  ) {
    return this.loanService.getLoan(loanId, actorMemberId);
  }
}
