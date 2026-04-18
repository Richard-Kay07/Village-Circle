import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FundBucket } from '../domain/enums';
import { LedgerFundBucket } from '@prisma/client';

export interface MemberBalanceByBucket {
  memberId: string | null;
  fundBucket: LedgerFundBucket;
  balanceMinor: number;
  currencyCode: string;
}

export interface GroupTotalByBucket {
  fundBucket: LedgerFundBucket;
  totalMinor: number;
  currencyCode: string;
}

/**
 * Read model for ledger balances. SOCIAL_FUND is never merged with SAVINGS;
 * each bucket is reported separately. Amounts are signed sums (credit positive, debit negative).
 */
@Injectable()
export class LedgerBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Member balances by fund bucket for a tenant group.
   * Optional filter: pass a bucket to get only that bucket (e.g. SOCIAL_FUND).
   */
  async getMemberBalancesByBucket(
    tenantGroupId: string,
    bucketFilter?: FundBucket | LedgerFundBucket,
  ): Promise<MemberBalanceByBucket[]> {
    const where: { tenantGroupId: string; fundBucket?: LedgerFundBucket } = {
      tenantGroupId,
    };
    if (bucketFilter) {
      where.fundBucket = bucketFilter as LedgerFundBucket;
    }
    const rows = await this.prisma.ledgerLine.groupBy({
      by: ['memberId', 'fundBucket', 'currencyCode'],
      where,
      _sum: { amountMinor: true },
    });
    return rows.map((r) => ({
      memberId: r.memberId,
      fundBucket: r.fundBucket,
      balanceMinor: r._sum.amountMinor ?? 0,
      currencyCode: r.currencyCode,
    }));
  }

  /**
   * Balance for a single member and bucket.
   */
  async getMemberBalance(
    tenantGroupId: string,
    memberId: string,
    fundBucket: FundBucket | LedgerFundBucket,
  ): Promise<number> {
    const result = await this.prisma.ledgerLine.aggregate({
      where: {
        tenantGroupId,
        memberId,
        fundBucket: fundBucket as LedgerFundBucket,
      },
      _sum: { amountMinor: true },
    });
    return result._sum.amountMinor ?? 0;
  }

  /**
   * Group-level totals by fund bucket. SOCIAL_FUND and SAVINGS are always separate.
   * Optional bucket filter for reporting.
   */
  async getGroupTotalsByBucket(
    tenantGroupId: string,
    bucketFilter?: FundBucket | LedgerFundBucket,
  ): Promise<GroupTotalByBucket[]> {
    const where: { tenantGroupId: string; fundBucket?: LedgerFundBucket } = {
      tenantGroupId,
    };
    if (bucketFilter) {
      where.fundBucket = bucketFilter as LedgerFundBucket;
    }
    const rows = await this.prisma.ledgerLine.groupBy({
      by: ['fundBucket', 'currencyCode'],
      where,
      _sum: { amountMinor: true },
    });
    return rows.map((r) => ({
      fundBucket: r.fundBucket,
      totalMinor: r._sum.amountMinor ?? 0,
      currencyCode: r.currencyCode,
    }));
  }

  /**
   * Single bucket total for the group (convenience).
   */
  async getGroupTotal(
    tenantGroupId: string,
    fundBucket: FundBucket | LedgerFundBucket,
  ): Promise<number> {
    const result = await this.prisma.ledgerLine.aggregate({
      where: {
        tenantGroupId,
        fundBucket: fundBucket as LedgerFundBucket,
      },
      _sum: { amountMinor: true },
    });
    return result._sum.amountMinor ?? 0;
  }
}
