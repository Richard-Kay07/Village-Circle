import { GroupRole as PrismaGroupRole, MemberRole as PrismaMemberRole } from '@prisma/client';
import { UserRole } from '../domain/enums';

/** Map Prisma GroupRole to domain UserRole. */
export function groupRoleToUserRole(gr: PrismaGroupRole): UserRole {
  const map: Record<PrismaGroupRole, UserRole> = {
    GROUP_CHAIR: UserRole.GROUP_CHAIR,
    GROUP_TREASURER: UserRole.GROUP_TREASURER,
    GROUP_SECRETARY: UserRole.GROUP_SECRETARY,
    GROUP_AUDITOR: UserRole.GROUP_AUDITOR,
    MEMBER: UserRole.MEMBER,
  };
  return map[gr];
}

/** Map legacy MemberRole to UserRole when groupRole is not set. */
export function memberRoleToUserRole(mr: PrismaMemberRole): UserRole {
  return mr === 'ADMIN' ? UserRole.GROUP_CHAIR : UserRole.MEMBER;
}
