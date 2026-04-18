import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MemberService, CreateMemberDto, UpdateMemberDto } from './member.service';
import { MemberGuard } from './member.guard';

@ApiTags('members')
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @ApiOperation({ summary: 'Add member to group (or self-join)' })
  create(@Body() dto: CreateMemberDto): Promise<{ id: string }> {
    return this.memberService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by id' })
  findOne(@Param('id') id: string) {
    return this.memberService.getOrThrow(id);
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'List members of a group' })
  listByGroup(@Param('groupId') groupId: string) {
    return this.memberService.listByGroup(groupId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update member (admin or self)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto & { actorMemberId: string },
  ): Promise<{ id: string }> {
    return this.memberService.update(id, dto, dto.actorMemberId);
  }

  @Patch(':id/leave')
  @ApiOperation({ summary: 'Mark member as left' })
  leave(
    @Param('id') id: string,
    @Body() body: { actorMemberId: string },
  ): Promise<{ id: string }> {
    return this.memberService.leave(id, body.actorMemberId);
  }
}
