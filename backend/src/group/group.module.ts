import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { MemberGuard } from '../member/member.guard';

@Module({
  controllers: [GroupController],
  providers: [GroupService, MemberGuard],
  exports: [GroupService, MemberGuard],
})
export class GroupModule {}
