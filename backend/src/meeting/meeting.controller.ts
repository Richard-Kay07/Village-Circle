import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MeetingService } from './meeting.service';
import { RequirePermissionGuard } from '../rbac/require-permission.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { Permission } from '../domain/enums';
import { CreateMeetingDto } from './meeting.dto';

@ApiTags('meetings')
@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Get('group/:groupId')
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.MEETING_RECORD)
  @ApiOperation({ summary: 'List meetings for a group' })
  listByGroup(@Param('groupId') groupId: string) {
    return this.meetingService.listByGroup(groupId, undefined);
  }

  @Post()
  @UseGuards(RequirePermissionGuard)
  @RequirePermission(Permission.MEETING_RECORD)
  @ApiOperation({ summary: 'Create a meeting' })
  create(@Body() dto: CreateMeetingDto) {
    return this.meetingService.create(dto, dto.createdByUserId ?? undefined);
  }
}
