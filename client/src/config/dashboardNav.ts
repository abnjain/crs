/**
 * Dashboard navigation config — role-based sidebar and header items
 * Roles: superadmin | admin | hod | faculty | alumni
 */

import type { UserRole } from '../context/AuthContext';

export interface NavItem {
  id: string;
  label: string;
  roles: UserRole[];
  badge?: number;
  href?: string;
}

export const SIDEBAR_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', roles: ['superadmin', 'admin', 'faculty', 'hod', 'alumni'], href: '/dashboard' },
  { id: 'notifications', label: 'Notifications', roles: ['superadmin', 'admin', 'faculty', 'hod', 'alumni'], badge: 4 },
  { id: 'users', label: 'User Management', roles: ['superadmin', 'admin'], href: '/dashboard/users' },
  { id: 'systemlogs', label: 'Audit Logs', roles: ['superadmin', 'admin'], href: '/dashboard/audit-logs' },
  { id: 'system', label: 'System Config', roles: ['superadmin'], href: '/dashboard/system' },
  { id: 'reports', label: 'Reports', roles: ['superadmin', 'admin', 'faculty', 'hod'], href: '/dashboard/reports' },
  { id: 'documents', label: 'Documents', roles: ['superadmin', 'admin', 'faculty', 'hod', 'alumni'], href: '/dashboard/documents' },
  { id: 'library', label: 'Library', roles: ['superadmin', 'admin', 'faculty', 'hod', 'alumni'], href: '/dashboard/library' },
  { id: 'alumni', label: 'Alumni', roles: ['superadmin', 'admin', 'faculty', 'hod', 'alumni'], href: '/dashboard/alumni' },
  { id: 'events', label: 'Events', roles: ['superadmin', 'admin', 'faculty', 'hod', 'alumni'], href: '/dashboard/events' },
  { id: 'messages', label: 'Messages', roles: ['superadmin', 'admin', 'faculty', 'hod', 'alumni'], href: '/dashboard/messages' },
  { id: 'admin-messaging', label: 'Messaging admin', roles: ['superadmin', 'admin', 'hod'], href: '/dashboard/admin/messaging' },
];

/** Sections for sidebar grouping */
export const SIDEBAR_SECTIONS: { label: string; itemIds: string[] }[] = [
  { label: 'Overview', itemIds: ['dashboard', 'notifications'] },
  { label: 'Administration', itemIds: ['users', 'systemlogs', 'system', 'reports', 'admin-messaging'] },
  { label: 'Academics', itemIds: ['documents', 'library'] },
  { label: 'Community', itemIds: ['alumni', 'events', 'messages'] },
];

export function getSidebarItemsForRole(role: UserRole): NavItem[] {
  return SIDEBAR_NAV.filter((item) => item.roles.includes(role));
}

/** Merge nav items from all user roles (multi-role support) */
export function getSidebarItemsForRoles(roles: UserRole[]): NavItem[] {
  const seen = new Set<string>();
  const result: NavItem[] = [];
  for (const role of roles) {
    for (const item of getSidebarItemsForRole(role)) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }
  }
  return result;
}

export function getSectionsForRole(role: UserRole) {
  const allowedIds = new Set(getSidebarItemsForRole(role).map((i) => i.id));
  return SIDEBAR_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.itemIds
      .map((id) => SIDEBAR_NAV.find((n) => n.id === id))
      .filter((n): n is NavItem => !!n && allowedIds.has(n.id)),
  })).filter((sec) => sec.items.length > 0);
}

/** Merge sidebar sections from all user roles */
export function getSectionsForRoles(roles: UserRole[]) {
  const allowedIds = new Set(getSidebarItemsForRoles(roles).map((i) => i.id));
  return SIDEBAR_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.itemIds
      .map((id) => SIDEBAR_NAV.find((n) => n.id === id))
      .filter((n): n is NavItem => !!n && allowedIds.has(n.id)),
  })).filter((sec) => sec.items.length > 0);
}
