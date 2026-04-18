import { Test, TestingModule } from '@nestjs/testing';
import { RoleAssignmentService } from './role-assignment.service';
import { PrismaService } from '../prisma/prisma.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { ForbiddenError } from '../domain/errors';
import {
  DuplicateRoleAssignmentError,
  TenantGroupNotFoundError,
  UserNotFoundError,
  NoActiveRoleAssignmentError,
} from './role-assignment.errors';
import { GroupRole } from '@prisma/client';

describe('RoleAssignmentService', () => {
  let service: RoleAssignmentService;
  let prisma: {
    group: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock };
    roleAssignment: { findFirst: jest.Mock; create: jest.Mock; findMany: jest.Mock; update: jest.Mock };
  };
  let rbac: { requireRole: jest.Mock };
  let auditLog: { append: jest.Mock };

  const tenantGroupId = 'g1';
  const userId = 'u1';
  const actorUserId = 'chair1';
  const input = {
    tenantGroupId,
    userId,
    role: 'GROUP_TREASURER' as GroupRole,
    actorUserId,
    channel: 'WEB' as any,
  };

  beforeEach(async () => {
    rbac = { requireRole: jest.fn().mockResolvedValue(undefined) };
    auditLog = { append: jest.fn().mockResolvedValue('audit-id') };
    prisma = {
      group: { findUnique: jest.fn().mockResolvedValue({ id: tenantGroupId }) },
      user: { findUnique: jest.fn().mockResolvedValue({ id: userId }) },
      roleAssignment: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'ra1', createdAt: new Date() }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleAssignmentService,
        { provide: PrismaService, useValue: prisma },
        { provide: RbacService, useValue: rbac },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(RoleAssignmentService);
  });

  describe('assign', () => {
    it('succeeds and emits audit event', async () => {
      const result = await service.assign(input);
      expect(result.id).toBe('ra1');
      expect(rbac.requireRole).toHaveBeenCalledWith(
        tenantGroupId,
        actorUserId,
        expect.arrayContaining(['GROUP_CHAIR', 'PLATFORM_ADMIN']),
        undefined,
      );
      expect(prisma.roleAssignment.create).toHaveBeenCalled();
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ROLE_ASSIGNED',
          entityType: 'ROLE_ASSIGNMENT',
          afterSnapshot: expect.objectContaining({ userId, role: 'GROUP_TREASURER', status: 'ACTIVE' }),
        }),
      );
    });

    it('throws when unauthorized (GROUP_CHAIR or PLATFORM_ADMIN required)', async () => {
      rbac.requireRole.mockRejectedValue(new ForbiddenError('Required one of roles'));
      await expect(service.assign(input)).rejects.toThrow(ForbiddenError);
    });

    it('throws when tenant group not found', async () => {
      prisma.group.findUnique.mockResolvedValue(null);
      await expect(service.assign(input)).rejects.toThrow(TenantGroupNotFoundError);
    });

    it('throws when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.assign(input)).rejects.toThrow(UserNotFoundError);
    });

    it('throws when duplicate active assignment exists', async () => {
      prisma.roleAssignment.findFirst.mockResolvedValue({ id: 'ra-existing' });
      await expect(service.assign(input)).rejects.toThrow(DuplicateRoleAssignmentError);
    });

    it('throws ValidationError when tenantGroupId or userId missing', async () => {
      await expect(
        service.assign({ ...input, tenantGroupId: '', userId: 'u1' }),
      ).rejects.toThrow('tenantGroupId and userId are required');
    });
  });

  describe('revoke', () => {
    it('revokes and emits audit with before/after snapshots', async () => {
      const existing = {
        id: 'ra1',
        userId,
        role: 'GROUP_TREASURER',
        status: 'ACTIVE',
        createdAt: new Date(),
      };
      prisma.roleAssignment.findFirst.mockResolvedValue(existing);
      const result = await service.revoke({ ...input, role: 'GROUP_TREASURER' as GroupRole });
      expect(result.id).toBe('ra1');
      expect(prisma.roleAssignment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ra1' },
          data: expect.objectContaining({ status: 'REVOKED' }),
        }),
      );
      expect(auditLog.append).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ROLE_REVOKED',
          beforeSnapshot: expect.any(Object),
          afterSnapshot: expect.objectContaining({ status: 'REVOKED' }),
        }),
      );
    });

    it('throws when no active assignment to revoke', async () => {
      prisma.roleAssignment.findFirst.mockResolvedValue(null);
      await expect(service.revoke({ ...input, role: 'GROUP_TREASURER' as GroupRole })).rejects.toThrow(
        NoActiveRoleAssignmentError,
      );
    });
  });

  describe('change', () => {
    it('emits two audit events (revoke then assign)', async () => {
      prisma.roleAssignment.findFirst
        .mockResolvedValueOnce({ id: 'ra-old', userId, role: 'GROUP_SECRETARY', status: 'ACTIVE', createdAt: new Date() })
        .mockResolvedValueOnce(null);
      await service.change({
        tenantGroupId,
        userId,
        fromRole: 'GROUP_SECRETARY' as GroupRole,
        toRole: 'GROUP_TREASURER' as GroupRole,
        actorUserId,
        channel: 'WEB' as any,
      });
      expect(auditLog.append).toHaveBeenCalledTimes(2);
      expect(auditLog.append).toHaveBeenNthCalledWith(1, expect.objectContaining({ action: 'ROLE_REVOKED' }));
      expect(auditLog.append).toHaveBeenNthCalledWith(2, expect.objectContaining({ action: 'ROLE_ASSIGNED' }));
    });
  });

  describe('tenant isolation', () => {
    it('cannot mutate another tenant: assign with actor in different tenant throws', async () => {
      rbac.requireRole.mockRejectedValue(new ForbiddenError('Required one of roles'));
      await expect(
        service.assign({
          ...input,
          tenantGroupId: 'other-tenant',
          actorUserId: 'user-in-my-tenant',
        }),
      ).rejects.toThrow(ForbiddenError);
      expect(rbac.requireRole).toHaveBeenCalledWith(
        'other-tenant',
        'user-in-my-tenant',
        expect.any(Array),
        undefined,
      );
    });
  });
});
