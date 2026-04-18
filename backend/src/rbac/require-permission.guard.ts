import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../domain/enums';
import { RbacService } from './rbac.service';

@Injectable()
export class RequirePermissionGuard implements CanActivate {
  constructor(
    private readonly rbac: RbacService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<Permission | undefined>(
      'requirePermission',
      context.getHandler(),
    );
    if (!permission) return true;

    const request = context.switchToHttp().getRequest<{
      params: Record<string, string>;
      body: Record<string, unknown>;
      query: Record<string, unknown>;
    }>();
    const tenantGroupId =
      (request.params?.groupId as string) ??
      (request.params?.tenantGroupId as string) ??
      (request.body?.tenantGroupId as string) ??
      (request.body?.groupId as string) ??
      (request.query?.tenantGroupId as string);
    const actorUserId =
      (request.body?.actorUserId as string) ??
      (request.query?.actorUserId as string) ??
      null;
    const memberIdFallback =
      (request.body?.actorMemberId as string) ??
      (request.query?.actorMemberId as string);

    if (!tenantGroupId) {
      throw new ForbiddenException('tenantGroupId required for permission check');
    }

    try {
      await this.rbac.requirePermission(
        tenantGroupId,
        actorUserId,
        permission,
        {},
        memberIdFallback,
      );
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'getStatus' in err) {
        throw err;
      }
      throw new ForbiddenException(
        err instanceof Error ? err.message : 'Forbidden',
      );
    }
    return true;
  }
}
