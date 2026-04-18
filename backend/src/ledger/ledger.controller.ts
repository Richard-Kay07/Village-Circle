import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { FundBucket } from '../domain/enums';

@ApiTags('ledger')
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('balance/:groupId/:bucket')
  getBalance(
    @Param('groupId') groupId: string,
    @Param('bucket') bucket: string,
  ): Promise<{ balance: number }> {
    const bucketEnum = Object.values(FundBucket).includes(bucket as FundBucket)
      ? (bucket as FundBucket)
      : FundBucket.SAVINGS;
    return this.ledgerService.getBalance(groupId, bucketEnum).then((balance) => ({ balance }));
  }

  @Post('entries')
  append(): Promise<{ id: string }> {
    return this.ledgerService.append({
      tenantGroupId: '',
      bucket: FundBucket.SAVINGS,
      amount: 0,
      referenceType: '',
      referenceId: '',
    });
  }
}
