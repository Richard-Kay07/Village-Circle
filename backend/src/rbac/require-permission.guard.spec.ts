import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequirePermissionGuard } from './require-permission.guard';
import { RbacService } from './rbac.service';
import { Permission } from '../domain/enums';
import { PrismaService } from '../prisma/prisma.service';

describe('RequirePermissionGuard (integration)', () => {
  let guard: RequirePermissionGuard;
  let rbac: RbacService;
  const mockPrisma = {
    member: { findFirst: jest.fn().mockResolvedValue(null) },
  };

  const createMockContext = (params: Record<string, string>, body: Record<string, unknown> = {}, query: Record<string, unknown> = {}, permission: Permission | null = Permission.AUDIT_READ): ExecutionContext => {
    const handler = function mockHandler() {};
    if (permission != null) {
      Reflect.defineMetadata('requirePermission', permission, handler);
    }
    return {
      switchToHttp: () => ({
        getRequest: () => ({ params, body, query }),
      }),
      getHandler: () => handler,
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequirePermissionGuard,
        RbacService,
        { provide: PrismaService, useValue: mockPrisma },
        Reflector,
      ],
    }).compile();
    guard = module.get(RequirePermissionGuard);
    rbac = module.get(RbacService);
  });

  it('rejects when tenantGroupId is missing', async () => {
    const ctx = createMockContext({}, {}, {});
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('rejects when user has no permission (no member found)', async () => {
    const ctx = createMockContext(
      { groupId: 'g1' },
      {},
      { actorMemberId: 'm1', actorUserId: 'u1' },
    );
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('allows when RbacService.requirePermission passes', async () => {
    mockPrisma.member.findFirst.mockResolvedValue({
      userId: 'u1',
      groupId: 'g1',
      role: 'ADMIN',
      groupRole: null,
      user: { platformRole: null },
    });
    const ctx = createMockContext(
      { groupId: 'g1' },
      { actorUserId: 'u1' },
      {},
    );
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('allows when no permission metadata (skips check)', async () => {
    const ctx = createMockContext({}, {}, {}, null!);
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });
});
