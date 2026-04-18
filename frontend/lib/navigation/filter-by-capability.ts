import type { Capabilities } from '@/lib/types/permissions';
import { hasCapability } from '@/lib/types/permissions';
import type { NavArea, NavItem } from './nav-maps';

/**
 * Filter nav items to those the user has permission to see.
 * Items without a permission are shown when in that area.
 */
export function filterNavItemsByCapability(items: NavItem[], capabilities: Capabilities): NavItem[] {
  return items.filter((item) => {
    if (!item.permission) return true;
    return hasCapability(capabilities, item.permission);
  });
}

/**
 * Return a nav area with items filtered by capabilities.
 */
export function getNavForArea(area: NavArea, capabilities: Capabilities): NavArea {
  return {
    ...area,
    items: filterNavItemsByCapability(area.items, capabilities),
  };
}

/**
 * Check if the user has access to an area (has at least one nav item).
 */
export function hasAccessToArea(area: NavArea, capabilities: Capabilities): boolean {
  return filterNavItemsByCapability(area.items, capabilities).length > 0;
}
