import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GroupService } from '../group/group.service';

export const REQUIRE_ADMIN = 'requireAdmin';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(
    private readonly groupService: GroupService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireAdmin = this.reflector.get<boolean>(REQUIRE_ADMIN, context.getHandler());
    const request = context.switchToHttp().getRequest<{
      params: { id?: string; groupId?: string };
      body: Record<string, unknown>;
      query: Record<string, unknown>;
    }>();
    const groupId = request.params?.id ?? request.params?.groupId ?? (request.body as Record<string, unknown>)?.groupId;
    const actorMemberId =
      (request.body as Record<string, unknown>)?.actorMemberId as string | undefined ??
      (request.query?.actorMemberId as string | undefined);
    if (!groupId || !actorMemberId) {
      throw new ForbiddenException('groupId and actorMemberId required (params/body or query for GET)');
    }
    if (requireAdmin) {
      await this.groupService.assertAdmin(groupId, actorMemberId);
    } else {
      await this.groupService.assertActiveMember(groupId, actorMemberId);
    }
    return true;
  }
}
