import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RbacModule } from '../rbac/rbac.module';
import { SupportController } from './support.controller';
import { SupportReadService } from './support-read.service';
import { EntityTraceService } from './entity-trace.service';

@Module({
  imports: [AuditModule, NotificationsModule, RbacModule],
  controllers: [SupportController],
  providers: [SupportReadService, EntityTraceService],
  exports: [EntityTraceService, SupportReadService],
})
export class SupportModule {}
