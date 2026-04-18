import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EvidenceService, RegisterEvidenceFileDto, EvidenceSupportAccessDto } from './evidence.service';
import { MemberGuard } from '../member/member.guard';
import { RequirePermissionGuard } from '../rbac/require-permission.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { Permission } from '../domain/enums';

@ApiTags('evidence')
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @UseGuards(MemberGuard)
  @ApiOperation({ summary: 'Register evidence file (path after upload)' })
  register(@Body() dto: RegisterEvidenceFileDto): Promise<{ id: string }> {
    return this.evidenceService.register(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evidence file metadata' })
  getById(
    @Param('id') id: string,
    @Query('actorMemberId') actorMemberId: string,
  ) {
    return this.evidenceService.getById(id, actorMemberId);
  }

  @Get(':id/support')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.ADMIN_SUPPORT_ACCESS)
  @ApiOperation({ summary: 'Support view evidence (requires reason code and case id; logs audit)' })
  getByIdForSupport(
    @Param('id') id: string,
    @Query('reasonCode') reasonCode: string,
    @Query('supportCaseOrIncidentId') supportCaseOrIncidentId: string,
    @Query('actorUserId') actorUserId: string,
    @Query('tenantGroupId') tenantGroupId: string,
  ) {
    return this.evidenceService.getByIdForSupport(id, {
      reasonCode,
      supportCaseOrIncidentId,
      actorUserId,
      tenantGroupId,
    });
  }
}
