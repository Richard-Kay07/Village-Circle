import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { LedgerPostingService } from './ledger-posting.service';
import { LedgerBalanceService } from './ledger-balance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [LedgerController],
  providers: [LedgerService, LedgerPostingService, LedgerBalanceService],
  exports: [LedgerService, LedgerPostingService, LedgerBalanceService],
})
export class LedgerModule {}
