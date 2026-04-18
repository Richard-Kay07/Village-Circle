import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditEntityType } from '@prisma/client';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: { auditEvent: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      auditEvent: {
        create: jest.fn().mockResolvedValue({
          id: 'audit-1',
          groupId: 'g1',
          entityType: AuditEntityType.CONTRIBUTION,
          entityId: 'e1',
          action: 'CREATED',
          actorId: 'm1',
          payload: {},
          createdAt: new Date(),
        }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<AuditService>(AuditService);
  });

import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditEntityType } from '@prisma/client';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: { auditEvent: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      auditEvent: {
        create: jest.fn().mockResolvedValue({
          id: 'audit-1',
          groupId: 'g1',
          entityType: AuditEntityType.CONTRIBUTION,
          entityId: 'e1',
          action: 'CREATED',
          actorId: 'm1',
          payload: {},
          createdAt: new Date(),
        }),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<AuditService>(AuditService);
  });

  it('should emit audit event and return id', async () => {
    const id = await service.emit({
      groupId: 'g1',
      entityType: 'CONTRIBUTION',
      entityId: 'c1',
      action: 'CREATED',
      actorId: 'm1',
      payload: { amount: 100 },
    });
    expect(id).toBe('audit-1');
    expect(prisma.auditEvent.create).toHaveBeenCalledWith({
      data: {
        groupId: 'g1',
        entityType: AuditEntityType.CONTRIBUTION,
        entityId: 'c1',
        action: 'CREATED',
        actorId: 'm1',
        payload: { amount: 100 },
      },
    });
  });

  it('should accept optional payload', async () => {
    await service.emit({
      groupId: 'g1',
      entityType: 'GROUP',
      entityId: 'g1',
      action: 'UPDATED',
      actorId: 'system',
    });
    expect(prisma.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ payload: undefined }),
    });
  });

  it('should include channel in payload when provided', async () => {
    await service.emit({
      groupId: 'g1',
      entityType: 'MEMBER',
      entityId: 'm1',
      action: 'CREATED',
      actorId: 'system',
      channel: 'WEB' as import('./audit.interface').CreateAuditEventInput['channel'],
    });
    expect(prisma.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        payload: { channel: 'WEB' },
      }),
    });
  });
});
