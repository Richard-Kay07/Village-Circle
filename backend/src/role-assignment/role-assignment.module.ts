import { Module } from '@nestjs/common';
import { RoleAssignmentService } from './role-assignment.service';
import { RoleAssignmentController } from './role-assignment.controller';
import { RbacModule } from '../rbac/rbac.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [RbacModule, AuditModule],
  controllers: [RoleAssignmentController],
  providers: [RoleAssignmentService],
  exports: [RoleAssignmentService],
})
export class RoleAssignmentModule {}
