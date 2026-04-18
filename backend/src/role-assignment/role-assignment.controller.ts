import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoleAssignmentService, AssignRoleInput, RevokeRoleInput, ChangeRoleInput } from './role-assignment.service';
import { RequirePermissionGuard } from '../rbac/require-permission.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { Permission } from '../domain/enums';

@ApiTags('role-assignments')
@Controller('role-assignments')
export class RoleAssignmentController {
  constructor(private readonly roleAssignment: RoleAssignmentService) {}

  @Post('assign')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.GROUP_MANAGE_ROLES)
  @ApiOperation({ summary: 'Assign role to user in tenant (GROUP_CHAIR or PLATFORM_ADMIN)' })
  assign(@Body() body: AssignRoleInput): Promise<{ id: string }> {
    return this.roleAssignment.assign(body);
  }

  @Post('revoke')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.GROUP_MANAGE_ROLES)
  @ApiOperation({ summary: 'Revoke role from user in tenant' })
  revoke(@Body() body: RevokeRoleInput): Promise<{ id: string }> {
    return this.roleAssignment.revoke(body);
  }

  @Post('change')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.GROUP_MANAGE_ROLES)
  @ApiOperation({ summary: 'Change user role (revoke fromRole, assign toRole)' })
  change(@Body() body: ChangeRoleInput): Promise<{ revokeId: string; assignId: string }> {
    return this.roleAssignment.change(body);
  }

  @Get('tenant/:tenantGroupId')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.AUDIT_READ)
  @ApiOperation({ summary: 'List tenant users and roles' })
  listByTenant(
    @Param('tenantGroupId') tenantGroupId: string,
    @Query('actorUserId') actorUserId: string,
    @Query('actorMemberId') actorMemberId?: string,
  ) {
    return this.roleAssignment.listByTenant(tenantGroupId, actorUserId, actorMemberId);
  }
}
