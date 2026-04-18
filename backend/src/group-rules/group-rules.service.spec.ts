import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { AuditLogService } from '../audit/audit-log.service';
import { GroupRulesService } from './group-rules.service';

describe('GroupRulesService', () => {
  let service: GroupRulesService;
  let prisma: {
    ruleVersion: { findFirst: jest.Mock; findMany: jest.Mock; create: jest.Mock; update: jest.Mock };
  };
  let auditLog: { append: jest.Mock };
  const groupId = 'g1';
  const userId = 'u1';

  beforeEach(async () => {
    auditLog = { append: jest.fn().mockResolvedValue('audit-1') };
    prisma = {
      ruleVersion: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((args) => Promise.resolve({
          id: 'rv-1',
          groupId: args.data.groupId,
          effectiveFrom: args.data.effectiveFrom,
          effectiveTo: null,
          ...args.data,
        })),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const groupService = { getOrThrow: jest.fn().mockResolvedValue({ id: groupId }) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupRulesService,
        { provide: PrismaService, useValue: prisma },
        { provide: GroupService, useValue: groupService },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(GroupRulesService);
  });

  describe('createVersion', () => {
    it('creates rule version and emits audit', async () => {
      const dto = {
        tenantGroupId: groupId,
        loanInterestEnabled: true,
        loanInterestRateBps: 500,
        loanInterestBasis: 'FLAT' as const,
        penaltyEnabled: false,
        socialFundEnabled: true,
        smsNotificationsEnabled: false,
        createdByUserId: userId,
      };
      const result = await service.createVersion(dto);
      expect(result.id).toBe('rv-1');
      expect(result.effectiveFrom).toBeDefined();
      expect(prisma.ruleVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            groupId,
            loanInterestRateBps: 500,
            loanInterestBasis: 'FLAT',
            createdByUserId: userId,
          }),
        }),
      );
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'RULE_VERSION_CREATED',
          entityType: 'RULE_VERSION',
          entityId: 'rv-1',
          afterSnapshot: expect.objectContaining({ loanInterestRateBps: 500 }),
        }),
      );
    });
  });

  describe('update', () => {
    it('creates new version and does not overwrite', async () => {
      const current = {
        id: 'rv-old',
        groupId,
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null,
        loanInterestEnabled: true,
        loanInterestRateBps: 300,
        loanInterestBasis: 'FLAT',
        penaltyEnabled: false,
        penaltyRule: null,
        socialFundEnabled: true,
        smsNotificationsEnabled: false,
      };
      prisma.ruleVersion.findFirst.mockResolvedValue(current);
      prisma.ruleVersion.create.mockResolvedValue({
        id: 'rv-new',
        groupId,
        effectiveFrom: new Date(),
        effectiveTo: null,
        loanInterestEnabled: true,
        loanInterestRateBps: 600,
        loanInterestBasis: 'FLAT',
        penaltyEnabled: false,
        socialFundEnabled: true,
        smsNotificationsEnabled: false,
        createdByUserId: userId,
      });

      const dto = {
        tenantGroupId: groupId,
        loanInterestRateBps: 600,
        updatedByUserId: userId,
      };
      const result = await service.update(dto);
      expect(result.id).toBe('rv-new');
      expect(prisma.ruleVersion.update).toHaveBeenCalledWith({
        where: { id: 'rv-old' },
        data: { effectiveTo: expect.any(Date) },
      });
      expect(prisma.ruleVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            loanInterestRateBps: 600,
            loanInterestEnabled: true,
          }),
        }),
      );
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'RULE_VERSION_UPDATED',
          entityType: 'RULE_VERSION',
          entityId: 'rv-new',
          beforeSnapshot: expect.any(Object),
          afterSnapshot: expect.any(Object),
        }),
      );
    });

    it('throws when no version exists', async () => {
      prisma.ruleVersion.findFirst.mockResolvedValue(null);
      await expect(
        service.update({ tenantGroupId: groupId, updatedByUserId: userId }),
      ).rejects.toThrow('No rule version exists');
      expect(prisma.ruleVersion.create).not.toHaveBeenCalled();
    });
  });

  describe('getSnapshotForLoan', () => {
    it('returns correct snapshot for atDate', async () => {
      const version = {
        id: 'rv-1',
        groupId,
        effectiveFrom: new Date('2025-02-01'),
        effectiveTo: null,
        loanInterestEnabled: true,
        loanInterestRateBps: 500,
        loanInterestBasis: 'FLAT',
        penaltyEnabled: false,
        penaltyRule: null,
        socialFundEnabled: true,
        smsNotificationsEnabled: false,
      };
      prisma.ruleVersion.findFirst.mockResolvedValue(version);

      const snapshot = await service.getSnapshotForLoan(groupId, new Date('2025-03-15'));
      expect(snapshot).not.toBeNull();
      expect(snapshot!.ruleVersionId).toBe('rv-1');
      expect(snapshot!.loanInterestRateBps).toBe(500);
      expect(snapshot!.loanInterestBasis).toBe('FLAT');
      expect(snapshot!.socialFundEnabled).toBe(true);
    });

    it('returns null when no version effective at date', async () => {
      prisma.ruleVersion.findFirst.mockResolvedValue(null);
      const snapshot = await service.getSnapshotForLoan(groupId, new Date('2020-01-01'));
      expect(snapshot).toBeNull();
    });
  });

  describe('getEffectiveAt', () => {
    it('returns version effective at date', async () => {
      prisma.ruleVersion.findFirst.mockResolvedValue({
        id: 'rv-1',
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null,
      });
      const result = await service.getEffectiveAt(groupId, new Date('2025-06-01'));
      expect(result).toEqual({ id: 'rv-1', effectiveFrom: expect.any(Date), effectiveTo: null });
    });
  });
});
