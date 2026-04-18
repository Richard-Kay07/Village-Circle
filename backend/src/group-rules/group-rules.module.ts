import { Module } from '@nestjs/common';
import { GroupRulesService } from './group-rules.service';
import { GroupRulesController } from './group-rules.controller';
import { GroupModule } from '../group/group.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [GroupModule, RbacModule, AuditModule],
  controllers: [GroupRulesController],
  providers: [GroupRulesService],
  exports: [GroupRulesService],
})
export class GroupRulesModule {}
