import { filterNavItemsByCapability, getNavForArea, hasAccessToArea } from '@/lib/navigation/filter-by-capability';
import { MEMBER_NAV, TREASURER_NAV } from '@/lib/navigation/nav-maps';
import type { Capabilities } from '@/lib/types/permissions';

describe('filterNavItemsByCapability', () => {
  it('returns all items when no permission required', () => {
    const items = [{ href: '/x', label: 'X' }];
    const filtered = filterNavItemsByCapability(items, []);
    expect(filtered).toHaveLength(1);
  });

  it('filters out items when permission missing', () => {
    const items = [
      { href: '/a', label: 'A' },
      { href: '/b', label: 'B', permission: 'contribution.record' as const },
    ];
    const filtered = filterNavItemsByCapability(items, [] as Capabilities);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].href).toBe('/a');
  });

  it('includes items when permission present', () => {
    const items = [
      { href: '/b', label: 'B', permission: 'contribution.record' as const },
    ];
    const filtered = filterNavItemsByCapability(items, ['contribution.record'] as Capabilities);
    expect(filtered).toHaveLength(1);
  });
});

describe('getNavForArea', () => {
  it('returns area with filtered items by capability set', () => {
    const nav = getNavForArea(MEMBER_NAV, ['contribution.record', 'loan.apply'] as Capabilities);
    expect(nav.id).toBe('member');
    expect(nav.items.length).toBeGreaterThan(0);
    expect(nav.items.some((i) => i.label === 'My Statements')).toBe(true);
    expect(nav.items.some((i) => i.label === 'My Loans')).toBe(true);
  });

  it('returns only unpermissioned items when capabilities empty', () => {
    const nav = getNavForArea(TREASURER_NAV, [] as Capabilities);
    const onlyDashboard = TREASURER_NAV.items.filter((i) => !i.permission);
    expect(nav.items.length).toBe(onlyDashboard.length);
  });
});

describe('hasAccessToArea', () => {
  it('returns true when at least one item visible', () => {
    expect(hasAccessToArea(MEMBER_NAV, ['contribution.record'] as Capabilities)).toBe(true);
  });

  it('returns true when area has items without permission', () => {
    expect(hasAccessToArea(MEMBER_NAV, [] as Capabilities)).toBe(true);
  });

  it('returns false when all items require permission and user has none', () => {
    const area = { ...TREASURER_NAV, items: TREASURER_NAV.items.filter((i) => i.permission) };
    expect(hasAccessToArea(area, [] as Capabilities)).toBe(false);
  });
});
