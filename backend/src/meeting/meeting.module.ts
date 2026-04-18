import { Module } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { GroupModule } from '../group/group.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [GroupModule, RbacModule],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [MeetingService],
})
export class MeetingModule {}
