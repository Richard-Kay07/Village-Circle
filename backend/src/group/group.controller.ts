import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GroupService, CreateGroupDto, UpdateGroupDto } from './group.service';
import { MemberGuard } from '../member/member.guard';

@ApiTags('groups')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a group (actorId in body for pilot)' })
  create(
    @Body() dto: CreateGroupDto & { actorId: string },
  ): Promise<{ id: string }> {
    return this.groupService.create(dto, dto.actorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by id' })
  findOne(@Param('id') id: string) {
    return this.groupService.getOrThrow(id);
  }

  @Patch(':id')
  @UseGuards(MemberGuard)
  @ApiOperation({ summary: 'Update group (admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto & { actorMemberId: string },
  ): Promise<{ id: string }> {
    return this.groupService.update(id, dto, dto.actorMemberId);
  }
}
