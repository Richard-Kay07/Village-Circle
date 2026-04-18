/**
 * User roles for RBAC. Platform-level and group-level.
 */
export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  GROUP_CHAIR = 'GROUP_CHAIR',
  GROUP_TREASURER = 'GROUP_TREASURER',
  GROUP_SECRETARY = 'GROUP_SECRETARY',
  GROUP_AUDITOR = 'GROUP_AUDITOR',
  MEMBER = 'MEMBER',
}

export const USER_ROLE_VALUES: readonly string[] = Object.values(UserRole) as string[];

export function parseUserRole(value: unknown): UserRole {
  if (typeof value !== 'string') {
    throw new Error(`Invalid UserRole: expected string, got ${typeof value}`);
  }
  const upper = value.toUpperCase();
  if (!USER_ROLE_VALUES.includes(upper)) {
    throw new Error(`Invalid UserRole: ${value}. Allowed: ${USER_ROLE_VALUES.join(', ')}`);
  }
  return upper as UserRole;
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLE_VALUES.includes(value);
}
