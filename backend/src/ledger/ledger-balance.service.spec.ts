import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerBalanceService } from './ledger-balance.service';
import { FundBucket } from '../domain/enums';

describe('LedgerBalanceService', () => {
  let service: LedgerBalanceService;
  let prisma: {
    ledgerLine: { groupBy: jest.Mock; aggregate: jest.Mock };
  };

  const groupId = 'g1';

  beforeEach(async () => {
    prisma = {
      ledgerLine: {
        groupBy: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _sum: { amountMinor: 0 } }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerBalanceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(LedgerBalanceService);
  });

  describe('getGroupTotalsByBucket', () => {
    it('returns SAVINGS and SOCIAL_FUND as separate buckets', async () => {
      prisma.ledgerLine.groupBy.mockResolvedValue([
        { fundBucket: 'SAVINGS', currencyCode: 'GBP', _sum: { amountMinor: 5000 } },
        { fundBucket: 'SOCIAL_FUND', currencyCode: 'GBP', _sum: { amountMinor: 1200 } },
      ]);
      const result = await service.getGroupTotalsByBucket(groupId);
      expect(result).toHaveLength(2);
      const savings = result.find((r) => r.fundBucket === 'SAVINGS');
      const social = result.find((r) => r.fundBucket === 'SOCIAL_FUND');
      expect(savings).toEqual({ fundBucket: 'SAVINGS', totalMinor: 5000, currencyCode: 'GBP' });
      expect(social).toEqual({ fundBucket: 'SOCIAL_FUND', totalMinor: 1200, currencyCode: 'GBP' });
    });

    it('filters by bucket when provided', async () => {
      prisma.ledgerLine.groupBy.mockResolvedValue([
        { fundBucket: 'SOCIAL_FUND', currencyCode: 'GBP', _sum: { amountMinor: 1200 } },
      ]);
      const result = await service.getGroupTotalsByBucket(groupId, FundBucket.SOCIAL_FUND);
      expect(result).toHaveLength(1);
      expect(result[0].fundBucket).toBe('SOCIAL_FUND');
      expect(prisma.ledgerLine.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantGroupId: groupId, fundBucket: 'SOCIAL_FUND' },
        }),
      );
    });
  });

  describe('getMemberBalancesByBucket', () => {
    it('returns member balances per bucket with SOCIAL_FUND separate', async () => {
      prisma.ledgerLine.groupBy.mockResolvedValue([
        { memberId: 'm1', fundBucket: 'SAVINGS', currencyCode: 'GBP', _sum: { amountMinor: 3000 } },
        { memberId: 'm1', fundBucket: 'SOCIAL_FUND', currencyCode: 'GBP', _sum: { amountMinor: 500 } },
      ]);
      const result = await service.getMemberBalancesByBucket(groupId);
      expect(result).toHaveLength(2);
      expect(result.find((r) => r.fundBucket === 'SAVINGS')?.balanceMinor).toBe(3000);
      expect(result.find((r) => r.fundBucket === 'SOCIAL_FUND')?.balanceMinor).toBe(500);
    });
  });

  describe('getGroupTotal', () => {
    it('returns sum for single bucket', async () => {
      prisma.ledgerLine.aggregate.mockResolvedValue({ _sum: { amountMinor: 10000 } });
      const total = await service.getGroupTotal(groupId, FundBucket.SAVINGS);
      expect(total).toBe(10000);
    });
  });
});
