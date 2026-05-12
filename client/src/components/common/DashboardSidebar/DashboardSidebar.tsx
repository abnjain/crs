import { Link, useLocation } from 'react-router-dom';
import {
  DashboardIcon,
  BellIcon,
  AlumniIcon,
  UserPlusIcon,
  BarChartIcon,
  DocumentIcon,
  BookIcon,
  CalendarIcon,
  MessageIcon,
  ShieldIcon,
  SearchIcon,
  InfoIcon,
} from '../svgs';
import type { User, UserRole } from '../../../context/AuthContext';
import type { ReactNode } from 'react';

export type DashboardNavSection = ReturnType<
  typeof import('../../../config/dashboardNav').getSectionsForRoles
>[number];

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  dashboard: DashboardIcon,
  notifications: BellIcon,
  users: UserPlusIcon,
  systemlogs: SearchIcon,
  system: InfoIcon,
  reports: BarChartIcon,
  documents: DocumentIcon,
  library: BookIcon,
  alumni: AlumniIcon,
  events: CalendarIcon,
  messages: MessageIcon,
  'admin-messaging': ShieldIcon,
};

function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    superadmin: 'Super Administrator',
    admin: 'Administrator',
    hod: 'HOD / Sr. Faculty',
    faculty: 'Faculty',
    alumni: 'Alumni',
    guest: 'Guest',
  };
  return map[role] ?? role;
}

export interface DashboardSidebarProps {
  sections: DashboardNavSection[];
  role: UserRole;
  user: User | null;
  initials: string;
}

export function DashboardSidebar({ sections, role, user, initials }: DashboardSidebarProps) {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Link
          to="/"
          className="sidebar-home-link"
          aria-label="CRS Portal home"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <div className="sidebar-logo">
            <img src="/SCSIT_logo.svg" alt="" width={30} height={30} />
          </div>
          <div className="sidebar-brand">
            <div className="sidebar-brand-name">CRS Portal</div>
            <div className="sidebar-brand-sub">SCSIT DAVV</div>
          </div>
        </Link>
      </div>

      <div className="sidebar-role-badge">
        <span className="sidebar-role-dot" />
        <span className="sidebar-role-text">{roleLabel(role)}</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {sections.map((sec) => (
          <div key={sec.label} className="nav-section">
            <div className="nav-section-label">{sec.label}</div>
            {sec.items.map((item) => {
              const Icon = ICON_MAP[item.id];
              const isActive =
                (item.href && location.pathname === item.href) ||
                (item.id === 'dashboard' && location.pathname === '/dashboard') ||
                (item.id === 'notifications' && location.pathname.startsWith('/dashboard/notifications')) ||
                (item.id === 'messages' &&
                  (location.pathname.startsWith('/dashboard/messages'))) ||
                (item.id === 'admin-messaging' &&
                  location.pathname.startsWith('/dashboard/admin/messaging'));

              const content: ReactNode = (
                <>
                  {Icon && (
                    <span className="nav-icon">
                      <Icon size={18} />
                    </span>
                  )}
                  <span className="nav-label">{item.label}</span>
                  {item.badge != null && <span className="nav-badge">{item.badge}</span>}
                </>
              );

              return item.href ? (
                <Link key={item.id} to={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                  {content}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {}}
                >
                  {content}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/me" className="sidebar-user" title={`${user?.name ?? 'User'} · ${roleLabel(role)}`}>
          <div className="avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name ?? 'User'}</div>
            <div className="sidebar-user-role">{roleLabel(role)}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
