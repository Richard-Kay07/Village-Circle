import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('GroupService', () => {
  let service: GroupService;
  let prisma: {
    group: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    member: { findFirst: jest.Mock };
  };
  let audit: { emit: jest.Mock };

  beforeEach(async () => {
    audit = { emit: jest.fn().mockResolvedValue('audit-id') };
    prisma = {
      group: {
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'g1',
            name: args.data.name,
            groupType: args.data.groupType,
            loanInterestRate: args.data.loanInterestRate ?? new Decimal(0),
          }),
        ),
        findUnique: jest.fn().mockResolvedValue({
          id: 'g1',
          name: 'Circle 1',
          currency: 'GBP',
          groupType: 'CASH',
          loanInterestRate: new Decimal(0.05),
          status: 'ACTIVE',
          createdAt: new Date(),
        }),
        update: jest.fn().mockImplementation((args) => Promise.resolve({ id: args.where.id, ...args.data })),
      },
      member: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'm1',
          groupId: 'g1',
          role: 'ADMIN',
          status: 'ACTIVE',
        }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();
    service = module.get<GroupService>(GroupService);
  });

  it('should create group and emit audit', async () => {
    const result = await service.create(
      { name: 'Circle 1', groupType: 'CASH', loanInterestRate: 0.05 },
      'system',
    );
    expect(result.id).toBe('g1');
    expect(audit.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'GROUP',
        action: 'CREATED',
        payload: expect.objectContaining({ name: 'Circle 1', groupType: 'CASH' }),
      }),
    );
  });

  it('getOrThrow throws when group not found', async () => {
    prisma.group.findUnique.mockResolvedValue(null);
    await expect(service.getOrThrow('missing')).rejects.toThrow(NotFoundException);
  });

  it('assertAdmin throws when member not admin', async () => {
    prisma.member.findFirst.mockResolvedValue({ role: 'MEMBER', status: 'ACTIVE' });
    await expect(service.assertAdmin('g1', 'm1')).rejects.toThrow(ForbiddenException);
  });

  it('assertAdmin throws when member not found', async () => {
    prisma.member.findFirst.mockResolvedValue(null);
    await expect(service.assertAdmin('g1', 'm1')).rejects.toThrow(ForbiddenException);
  });

  it('assertActiveMember passes for active member', async () => {
    await expect(service.assertActiveMember('g1', 'm1')).resolves.toBeUndefined();
  });
});
