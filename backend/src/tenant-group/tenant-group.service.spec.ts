import { Test, TestingModule } from '@nestjs/testing';
import { TenantGroupService } from './tenant-group.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { NotFoundError } from '../domain/errors';

describe('TenantGroupService', () => {
  let service: TenantGroupService;
  const mockPrisma = {
    group: {
      create: jest.fn().mockResolvedValue({
        id: 'g1',
        name: 'Circle 1',
        groupType: 'CASH',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 'g1', name: 'Updated', status: 'ACTIVE' }),
    },
  };
  const mockAuditLog = { append: jest.fn().mockResolvedValue('audit-id') };

  beforeEach(async () => {
    mockPrisma.group.findUnique.mockResolvedValue({
      id: 'g1',
      name: 'Circle 1',
      currency: 'GBP',
      groupType: 'CASH',
      status: 'ACTIVE',
      loanInterestRate: { toNumber: () => 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGroupService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogService, useValue: mockAuditLog },
      ],
    }).compile();
    service = module.get(TenantGroupService);
  });

  it('create returns id and emits audit', async () => {
    const result = await service.create({
      name: 'Circle 1',
      groupType: 'CASH',
      actorUserId: 'u1',
      channel: 'WEB' as any,
    });
    expect(result.id).toBe('g1');
    expect(mockAuditLog.append).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATED', entityType: 'TENANT_GROUP' }),
    );
  });

  it('getOrThrow throws NotFoundError when group not found', async () => {
    mockPrisma.group.findUnique.mockResolvedValue(null);
    await expect(service.getOrThrow('missing')).rejects.toThrow(NotFoundError);
  });

  it('update emits audit with before/after', async () => {
    await service.update('g1', {
      status: 'CLOSED',
      actorUserId: 'u1',
      channel: 'WEB' as any,
    });
    expect(mockAuditLog.append).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATED',
        beforeSnapshot: expect.any(Object),
        afterSnapshot: expect.objectContaining({ status: 'CLOSED' }),
      }),
    );
  });
});
