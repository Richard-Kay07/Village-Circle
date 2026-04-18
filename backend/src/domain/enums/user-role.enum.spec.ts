import {
  parseUserRole,
  isUserRole,
  UserRole,
  USER_ROLE_VALUES,
} from './user-role.enum';

describe('UserRole', () => {
  describe('parseUserRole', () => {
    it('parses valid string (case-insensitive)', () => {
      expect(parseUserRole('platform_admin')).toBe(UserRole.PLATFORM_ADMIN);
      expect(parseUserRole('MEMBER')).toBe(UserRole.MEMBER);
      expect(parseUserRole('Group_Chair')).toBe(UserRole.GROUP_CHAIR);
    });

    it('throws for invalid value', () => {
      expect(() => parseUserRole('INVALID')).toThrow('Invalid UserRole');
      expect(() => parseUserRole('')).toThrow();
    });

    it('throws for non-string', () => {
      expect(() => parseUserRole(123)).toThrow('expected string');
      expect(() => parseUserRole(null)).toThrow();
    });
  });

  describe('isUserRole', () => {
    it('returns true for valid roles', () => {
      expect(isUserRole('MEMBER')).toBe(true);
      expect(isUserRole(UserRole.GROUP_TREASURER)).toBe(true);
    });

    it('returns false for invalid', () => {
      expect(isUserRole('OTHER')).toBe(false);
      expect(isUserRole(1)).toBe(false);
    });
  });

  it('USER_ROLE_VALUES contains all enum values', () => {
    expect(USER_ROLE_VALUES).toContain('PLATFORM_ADMIN');
    expect(USER_ROLE_VALUES.length).toBe(6);
  });
});
