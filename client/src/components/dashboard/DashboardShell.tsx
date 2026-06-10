import { useMemo, useState, useEffect, useRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useTheme, useMessaging, useNotifications } from '../../context';
import {
  MenuIcon,
  PanelLeftIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ShieldIcon,
} from '../common/svgs';
import { DashboardSidebar } from '../common/DashboardSidebar';
import { MainLayout } from '../layout/MainLayout';
import { getSectionsForRoles } from '../../config/dashboardNav';
import { navigateToExternalUrl } from '../../utils/navigation';
import type { UserRole } from '../../context/AuthContext';

type DashboardShellProps = {
  children: ReactNode;
  pageTitle?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

export function DashboardShell({
  children,
  pageTitle = 'Dashboard',
  className,
  ...shellRest
}: DashboardShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { cycleTheme, isDark } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 900px)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    if (!mq.matches) return;
    const frame = requestAnimationFrame(() => setCollapsed(true));
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  const roles = useMemo(
    () => user?.roles ?? (user?.role ? [user.role] : ['alumni']),
    [user]
  );
  const role = (user?.role ?? 'alumni') as UserRole;
  const { totalUnread } = useMessaging();
  const { unreadCount, recent, refreshRecent, markAllRead, markRead } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifWrapRef = useRef<HTMLDivElement>(null);
  const notifPanelId = useId();

  const sections = useMemo(() => {
    const raw = getSectionsForRoles(roles);
    return raw.map((sec) => ({
      ...sec,
      items: sec.items.map((item) => {
        if (item.id === 'messages') {
          return {
            ...item,
            badge: totalUnread > 0 ? totalUnread : undefined,
          };
        }
        if (item.id === 'notifications') {
          return {
            ...item,
            badge: unreadCount > 0 ? unreadCount : undefined,
          };
        }
        return item;
      }),
    }));
  }, [roles, totalUnread, unreadCount]);

  useEffect(() => {
    if (!notifOpen) return;
    void (async () => {
      await markAllRead();
      await refreshRecent(8);
    })();
  }, [notifOpen, refreshRecent, markAllRead]);

  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && notifWrapRef.current?.contains(target)) return;
      setNotifOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [notifOpen]);

  function formatTime(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
  }

  function handleNotificationClick(link?: string, id?: string, wasUnread?: boolean) {
    if (id) void markRead(id, wasUnread);
    if (link) {
      if (link.startsWith('/')) {
        navigate(link);
      } else {
        navigateToExternalUrl(link);
      }
      setNotifOpen(false);
    }
  }

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?';

  const sidebar = (
    <DashboardSidebar sections={sections} role={role} user={user} initials={initials} />
  );

  const shellClassName = [[collapsed ? 'collapsed' : null], className].flat().filter(Boolean).join(' ');

  return (
    <MainLayout
      variant="dashboard"
      sidebar={sidebar}
      shellClassName={shellClassName}
      appShellProps={shellRest}
    >
      <>
        <header className="topbar">
          <button
            type="button"
            className="topbar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftIcon size={20} /> : <MenuIcon size={20} />}
          </button>
          <h1 className="topbar-title">{pageTitle}</h1>

          <div className="topbar-actions">
            {['admin', 'superadmin'].includes(role) && (
              <Link to="/health" className="icon-btn" aria-label="Server Health" title="Server Health">
                <ShieldIcon size={19} />
              </Link>
            )}
            <div ref={notifWrapRef} className={`notif-menu ${notifOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="icon-btn"
                aria-label="Notifications"
                title="Notifications"
                aria-expanded={notifOpen}
                aria-controls={notifPanelId}
                onClick={() => setNotifOpen((prev) => !prev)}
              >
                <BellIcon size={19} />
                {unreadCount > 0 && (
                  <span className="notif-badge" aria-label={`${unreadCount} unread notifications`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div id={notifPanelId} className="notif-panel" role="dialog" aria-label="Notifications">
                  <div className="notif-panel-header">
                    <div className="notif-panel-title">Notifications</div>
                    <Link to="/dashboard/notifications" className="notif-panel-link" onClick={() => setNotifOpen(false)}>
                      View all
                    </Link>
                  </div>
                  <div className="notif-panel-body">
                    {recent.length === 0 ? (
                      <div className="notif-empty">No notifications yet.</div>
                    ) : (
                      recent.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`notif-item ${item.readAt ? '' : 'unread'}`}
                          onClick={() => handleNotificationClick(item.link, item.id, !item.readAt)}
                        >
                          <div className="notif-item-title">{item.title}</div>
                          <div className="notif-item-message">{item.message}</div>
                          <div className="notif-item-meta">
                            <span className="notif-item-type">{item.type}</span>
                            <span className="notif-item-time">{formatTime(item.createdAt)}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={cycleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isDark ? <MoonIcon size={19} /> : <SunIcon size={19} />}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                logout();
                navigate('/', { replace: true });
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </>
    </MainLayout>
  );
}
