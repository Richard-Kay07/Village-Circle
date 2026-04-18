import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DomainModule } from './domain/domain.module';
import { RequestContextMiddleware } from './domain/request-context';
import { AuthModule } from './auth/auth.module';
import { TenancyModule } from './tenancy/tenancy.module';
import { RbacModule } from './rbac/rbac.module';
import { AuditModule } from './audit/audit.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { LedgerModule } from './ledger/ledger.module';
import { GroupModule } from './group/group.module';
import { GroupRulesModule } from './group-rules/group-rules.module';
import { MemberModule } from './member/member.module';
import { ContributionModule } from './contribution/contribution.module';
import { LoanModule } from './loan/loan.module';
import { SocialFundModule } from './social-fund/social-fund.module';
import { EvidenceModule } from './evidence/evidence.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TenantGroupModule } from './tenant-group/tenant-group.module';
import { RoleAssignmentModule } from './role-assignment/role-assignment.module';
import { SupportModule } from './support/support.module';
import { MeetingModule } from './meeting/meeting.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    DomainModule,
    AuthModule,
    TenancyModule,
    RbacModule,
    AuditModule,
    AttachmentsModule,
    LedgerModule,
    TenantGroupModule,
    RoleAssignmentModule,
    GroupModule,
    GroupRulesModule,
    MemberModule,
    MeetingModule,
    ContributionModule,
    LoanModule,
    SocialFundModule,
    EvidenceModule,
    NotificationsModule,
    SupportModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
