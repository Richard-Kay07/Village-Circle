import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantGroupService, CreateTenantGroupInput, UpdateTenantGroupInput } from './tenant-group.service';

@ApiTags('tenant-groups')
@Controller('tenant-groups')
export class TenantGroupController {
  constructor(private readonly tenantGroup: TenantGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create tenant group' })
  create(@Body() body: CreateTenantGroupInput): Promise<{ id: string }> {
    return this.tenantGroup.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant group by id' })
  findOne(@Param('id') id: string) {
    return this.tenantGroup.getOrThrow(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant group (e.g. name, active status)' })
  update(
    @Param('id') id: string,
    @Body() body: Omit<UpdateTenantGroupInput, 'actorUserId' | 'channel'> & { actorUserId?: string | null; channel?: string },
  ): Promise<{ id: string }> {
    return this.tenantGroup.update(id, {
      ...body,
      actorUserId: body.actorUserId ?? null,
      channel: (body.channel as any) ?? 'WEB',
    });
  }
}
