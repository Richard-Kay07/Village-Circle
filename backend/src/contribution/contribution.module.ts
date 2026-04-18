import { Module } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionReadService } from './contribution-read.service';
import { ContributionController } from './contribution.controller';
import { GroupModule } from '../group/group.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuditModule } from '../audit/audit.module';
import { LedgerModule } from '../ledger/ledger.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [GroupModule, RbacModule, AuditModule, LedgerModule, NotificationsModule],
  controllers: [ContributionController],
  providers: [ContributionService, ContributionReadService],
  exports: [ContributionService, ContributionReadService],
})
export class ContributionModule {}
