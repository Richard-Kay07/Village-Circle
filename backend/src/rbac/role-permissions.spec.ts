import {
  getPermissionsForRole,
  roleHasPermission,
  requiresDualControl,
  ROLE_PERMISSIONS,
} from './role-permissions';
import { UserRole } from '../domain/enums';
import { Permission } from '../domain/enums';

describe('role-permissions', () => {
  describe('getPermissionsForRole', () => {
    it('returns permissions for each role', () => {
      expect(getPermissionsForRole(UserRole.PLATFORM_ADMIN)).toContain(Permission.ADMIN_SUPPORT_ACCESS);
      expect(getPermissionsForRole(UserRole.GROUP_CHAIR)).toContain(Permission.LOAN_APPROVE);
      expect(getPermissionsForRole(UserRole.MEMBER)).toContain(Permission.CONTRIBUTION_RECORD);
      expect(getPermissionsForRole(UserRole.GROUP_AUDITOR)).toContain(Permission.AUDIT_READ);
      expect(getPermissionsForRole(UserRole.GROUP_AUDITOR)).not.toContain(Permission.LOAN_APPROVE);
    });

    it('PLATFORM_ADMIN has all permissions', () => {
      const all = Object.values(Permission);
      const perms = getPermissionsForRole(UserRole.PLATFORM_ADMIN);
      all.forEach((p) => expect(perms).toContain(p));
    });
  });

  describe('roleHasPermission', () => {
    it('PLATFORM_ADMIN has every permission', () => {
      expect(roleHasPermission(UserRole.PLATFORM_ADMIN, Permission.ADMIN_SUPPORT_ACCESS)).toBe(true);
      expect(roleHasPermission(UserRole.PLATFORM_ADMIN, Permission.CONTRIBUTION_REVERSE)).toBe(true);
    });

    it('MEMBER has contribution.record but not contribution.reverse', () => {
      expect(roleHasPermission(UserRole.MEMBER, Permission.CONTRIBUTION_RECORD)).toBe(true);
      expect(roleHasPermission(UserRole.MEMBER, Permission.CONTRIBUTION_REVERSE)).toBe(false);
    });

    it('GROUP_TREASURER has loan.repayment.record and ledger.adjust', () => {
      expect(roleHasPermission(UserRole.GROUP_TREASURER, Permission.LOAN_REPAYMENT_RECORD)).toBe(true);
      expect(roleHasPermission(UserRole.GROUP_TREASURER, Permission.LEDGER_ADJUST)).toBe(true);
    });
  });

  describe('requiresDualControl', () => {
    it('returns true for high-risk actions', () => {
      expect(requiresDualControl(Permission.LOAN_APPROVE)).toBe(true);
      expect(requiresDualControl(Permission.CONTRIBUTION_REVERSE)).toBe(true);
      expect(requiresDualControl(Permission.LOAN_WAIVE)).toBe(true);
      expect(requiresDualControl(Permission.LEDGER_ADJUST)).toBe(true);
    });

    it('returns false for low-risk actions', () => {
      expect(requiresDualControl(Permission.CONTRIBUTION_RECORD)).toBe(false);
      expect(requiresDualControl(Permission.AUDIT_READ)).toBe(false);
    });
  });

  it('ROLE_PERMISSIONS has entry for every UserRole', () => {
    const roles = Object.values(UserRole);
    roles.forEach((r) => {
      expect(ROLE_PERMISSIONS[r]).toBeDefined();
      expect(Array.isArray(ROLE_PERMISSIONS[r])).toBe(true);
    });
  });
});
