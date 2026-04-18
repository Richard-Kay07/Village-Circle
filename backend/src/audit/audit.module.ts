import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLogService } from './audit-log.service';
import { AuditEmitterService } from './audit-emitter.service';
import { AuditController } from './audit.controller';
import { GroupModule } from '../group/group.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [GroupModule, RbacModule],
  controllers: [AuditController],
  providers: [AuditService, AuditLogService, AuditEmitterService],
  exports: [AuditService, AuditLogService, AuditEmitterService],
})
export class AuditModule {}
