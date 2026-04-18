import { Module } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { LoanApplicationService } from './loan-application.service';
import { LoanApprovalService } from './loan-approval.service';
import { LoanDisbursementService } from './loan-disbursement.service';
import { LoanRepaymentService } from './loan-repayment.service';
import { LoanWaiverService } from './loan-waiver.service';
import { LoanRescheduleService } from './loan-reschedule.service';
import { LoanWriteOffService } from './loan-writeoff.service';
import { GroupModule } from '../group/group.module';
import { GroupRulesModule } from '../group-rules/group-rules.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuditModule } from '../audit/audit.module';
import { LedgerModule } from '../ledger/ledger.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [GroupModule, GroupRulesModule, RbacModule, AuditModule, LedgerModule, NotificationsModule],
  controllers: [LoanController],
  providers: [
    LoanService,
    LoanApplicationService,
    LoanApprovalService,
    LoanDisbursementService,
    LoanRepaymentService,
    LoanWaiverService,
    LoanRescheduleService,
    LoanWriteOffService,
  ],
  exports: [LoanService],
})
export class LoanModule {}
