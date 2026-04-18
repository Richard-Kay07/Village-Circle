import { MEMBER_NAV } from '@/lib/navigation/nav-maps';

describe('MEMBER_NAV', () => {
  it('does not include treasurer or admin actions in navigation', () => {
    const memberHrefs = MEMBER_NAV.items.map((i) => i.href);
    expect(memberHrefs.some((href) => href.startsWith('/treasurer'))).toBe(false);
    expect(memberHrefs.some((href) => href.startsWith('/admin'))).toBe(false);
  });
});
