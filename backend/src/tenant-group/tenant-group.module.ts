import { Module } from '@nestjs/common';
import { TenantGroupService } from './tenant-group.service';
import { TenantGroupController } from './tenant-group.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [TenantGroupController],
  providers: [TenantGroupService],
  exports: [TenantGroupService],
})
export class TenantGroupModule {}
