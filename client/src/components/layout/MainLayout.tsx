import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';

interface MainLayoutProps {
  children: ReactNode;
  /** Hide header/footer for auth or error pages */
  fullPage?: boolean;
  /** `dashboard` renders `.app-shell`: fixed/absolute `sidebar` + `.app-shell-body` (topbar + main grid) */
  variant?: 'marketing' | 'dashboard';
  /** When `variant="dashboard"`, e.g. `<DashboardSidebar />` from `../common/DashboardSidebar` */
  sidebar?: ReactNode;
  /** Optional overlay (e.g. expanded-sidebar scrim), rendered inside `.app-shell` */
  backdrop?: ReactNode;
  /** Extra classes on `.app-shell` (e.g. `collapsed`) */
  shellClassName?: string;
  /** Attributes merged onto `.app-shell` (dashboard only; `className` is merged with shell + `shellClassName`) */
  appShellProps?: Omit<ComponentPropsWithoutRef<'div'>, 'children'>;
}

/**
 * Marketing: Header + `<main>` + Footer.
 * Dashboard: `.app-shell` with `sidebar` then `.app-shell-body` (grid: topbar + main only).
 */
export function MainLayout({
  children,
  fullPage = false,
  variant = 'marketing',
  sidebar,
  backdrop,
  shellClassName,
  appShellProps,
}: MainLayoutProps) {
  if (fullPage) {
    return <>{children}</>;
  }

  if (variant === 'dashboard' && sidebar != null) {
    const { className: apClass, ...shellRest } = appShellProps ?? {};
    const shellCls = ['app-shell', shellClassName, apClass].filter(Boolean).join(' ');
    return (
      <div className={shellCls} {...shellRest}>
        {sidebar}
        <div className="app-shell-body">{children}</div>
        {backdrop}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
