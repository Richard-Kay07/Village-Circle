import type { Permission } from '@/lib/types/permissions';

/** Guardrail: only MVP modules (save, hub, grow) have nav entries. Do not add /pay or /learn routes until released. See docs/FUTURE_MODULES_VC_PAY_VC_LEARN.md and lib/brand/module-visibility.ts. */

export interface NavItem {
  href: string;
  label: string;
  /** Permission required to show this item; if absent, always show when in this area */
  permission?: Permission;
}

export interface NavArea {
  id: string;
  label: string;
  basePath: string;
  items: NavItem[];
}

/** Member app: dashboard, statements, loans, notifications, profile, support. */
export const MEMBER_NAV: NavArea = {
  id: 'member',
  label: 'My circle',
  basePath: '/member',
  items: [
    { href: '/member', label: 'Dashboard' },
    { href: '/member/statements', label: 'My Statements', permission: 'contribution.record' },
    { href: '/member/loans', label: 'My Loans', permission: 'loan.apply' },
    { href: '/member/notifications', label: 'Notifications' },
    { href: '/member/profile', label: 'Profile' },
    { href: '/member/support', label: 'Support' },
  ],
};

/** Treasurer/Chair: record contributions, meetings, loans, reports. */
export const TREASURER_NAV: NavArea = {
  id: 'treasurer',
  label: 'Operations',
  basePath: '/treasurer',
  items: [
    { href: '/treasurer', label: 'Dashboard' },
    { href: '/treasurer/contributions', label: 'Contributions', permission: 'contribution.record' },
    { href: '/treasurer/meetings', label: 'Meetings', permission: 'meeting.record' },
    { href: '/treasurer/loans', label: 'Loans', permission: 'loan.approve' },
    { href: '/treasurer/reports', label: 'Reports', permission: 'report.export' },
    { href: '/treasurer/audit', label: 'Audit', permission: 'audit.read' },
  ],
};

/** Admin support: support tools (reason-coded access). */
export const ADMIN_NAV: NavArea = {
  id: 'admin',
  label: 'Support',
  basePath: '/admin',
  items: [
    { href: '/admin', label: 'Support home' },
    { href: '/admin/audit-log', label: 'Audit log', permission: 'admin.support_access' },
    { href: '/admin/sms-failures', label: 'SMS failures', permission: 'admin.support_access' },
    { href: '/admin/traces', label: 'Entity traces', permission: 'admin.support_access' },
  ],
};

export const NAV_AREAS: readonly NavArea[] = [MEMBER_NAV, TREASURER_NAV, ADMIN_NAV];
