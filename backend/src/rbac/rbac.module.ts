import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { RequirePermissionGuard } from './require-permission.guard';

@Module({
  controllers: [RbacController],
  providers: [RbacService, RequirePermissionGuard],
  exports: [RbacService, RequirePermissionGuard],
})
export class RbacModule {}
