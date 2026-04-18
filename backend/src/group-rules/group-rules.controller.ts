import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GroupRulesService } from './group-rules.service';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { RequirePermissionGuard } from '../rbac/require-permission.guard';
import { Permission } from '../domain/enums';
import { CreateRuleVersionDto, UpdateRuleVersionDto } from './group-rules.dto';

@ApiTags('group-rules')
@Controller('group-rules')
export class GroupRulesController {
  constructor(private readonly groupRulesService: GroupRulesService) {}

  @Post()
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.GROUP_MANAGE_RULES)
  @ApiOperation({ summary: 'Create rule version (first or new)' })
  create(@Body() dto: CreateRuleVersionDto) {
    return this.groupRulesService.createVersion(dto);
  }

  @Put()
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.GROUP_MANAGE_RULES)
  @ApiOperation({ summary: 'Update rules (creates new version)' })
  update(@Body() dto: UpdateRuleVersionDto) {
    return this.groupRulesService.update(dto);
  }

  @Get('group/:groupId/effective')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.GROUP_MANAGE_RULES)
  @ApiOperation({ summary: 'Get effective rule version at date' })
  getEffectiveAt(
    @Param('groupId') groupId: string,
    @Query('at') at: string,
  ) {
    const atDate = at ? new Date(at) : new Date();
    return this.groupRulesService.getEffectiveAt(groupId, atDate);
  }

  @Get('group/:groupId/snapshot')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.GROUP_MANAGE_RULES)
  @ApiOperation({ summary: 'Get rule snapshot for loan (at date)' })
  getSnapshot(
    @Param('groupId') groupId: string,
    @Query('at') at: string,
  ) {
    const atDate = at ? new Date(at) : new Date();
    return this.groupRulesService.getSnapshotForLoan(groupId, atDate);
  }

  @Get('group/:groupId/loan-hints')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.LOAN_APPLY)
  @ApiOperation({ summary: 'Get loan policy hints for members (interest etc.)' })
  async getLoanHints(
    @Param('groupId') groupId: string,
    @Query('at') at: string,
  ) {
    const atDate = at ? new Date(at) : new Date();
    const snapshot = await this.groupRulesService.getSnapshotForLoan(groupId, atDate);
    if (!snapshot) return { loanInterestEnabled: false, loanInterestRateBps: 0 };
    return {
      loanInterestEnabled: snapshot.loanInterestEnabled,
      loanInterestRateBps: snapshot.loanInterestRateBps,
    };
  }

  @Get('group/:groupId/versions')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.GROUP_MANAGE_RULES)
  @ApiOperation({ summary: 'List rule versions' })
  listVersions(@Param('groupId') groupId: string) {
    return this.groupRulesService.listVersions(groupId);
  }
}
