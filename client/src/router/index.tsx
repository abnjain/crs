import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UserManagementPage } from '../pages/dashboard/UserManagementPage';
import { EventsListingPage } from '../pages/dashboard/EventsListingPage';
import { AuditLogsPage } from '../pages/dashboard/AuditLogsPage';
import { SystemConfigPage } from '../pages/dashboard/SystemConfigPage';
import { ReportsPage } from '../pages/dashboard/ReportsPage';
import { MessagesPage } from '../pages/dashboard/MessagesPage';
import { AdminMessagingPage } from '../pages/dashboard/AdminMessagingPage';
import { DocumentsListingPage } from '../pages/dashboard/DocumentsListingPage';
import { LibraryDashboardPage } from '../pages/dashboard/LibraryDashboardPage';
import { NotificationsPage } from '../pages/dashboard/NotificationsPage';
import { MeProfilePage } from '../pages/dashboard/MeProfilePage';
import { HealthPage } from '../pages/HealthPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { RoleRoute } from '../components/layout/RoleRoute';
import { GuestRoute } from '../components/layout/GuestRoute';

const ProfileDetailsPage = lazy(() =>
  import('../pages/dashboard/ProfileDetailsPage').then((m) => ({ default: m.ProfileDetailsPage }))
);
const EventDetailPage = lazy(() =>
  import('../pages/dashboard/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);

function ProfileRouteFallback() {
  return (
    <div className="container section" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
      <div className="loading-spinner" aria-label="Loading" />
    </div>
  );
}

const ADMIN_HOD_ROLES = ['superadmin', 'admin', 'hod'] as const;
const ADMIN_SUPER_ROLES = ['superadmin', 'admin'] as const;
const SUPERADMIN_ONLY = ['superadmin'] as const;

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <GuestRoute>
        <LandingPage />
      </GuestRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/health',
    element: <HealthPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/me',
    element: (
      <ProtectedRoute>
        <MeProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/users',
    element: (
      <RoleRoute allowedRoles={[...ADMIN_HOD_ROLES]}>
        <UserManagementPage />
      </RoleRoute>
    ),
  },
  {
    path: '/dashboard/profile/:kind/:entityId',
    element: (
      <RoleRoute allowedRoles={[...ADMIN_HOD_ROLES]}>
        <Suspense fallback={<ProfileRouteFallback />}>
          <ProfileDetailsPage />
        </Suspense>
      </RoleRoute>
    ),
  },
  {
    path: '/dashboard/events/:eventId',
    element: (
      <RoleRoute allowedRoles={['superadmin', 'admin', 'hod', 'faculty', 'alumni']}>
        <Suspense fallback={<ProfileRouteFallback />}>
          <EventDetailPage />
        </Suspense>
      </RoleRoute>
    ),
  },
  {
    path: '/dashboard/events',
    element: (
      <RoleRoute allowedRoles={['superadmin', 'admin', 'hod', 'faculty', 'alumni']}>
        <EventsListingPage />
      </RoleRoute>
    ),
  },
  {
    path: '/dashboard/audit-logs',
    element: (
      <RoleRoute allowedRoles={[...ADMIN_SUPER_ROLES]}>
        <AuditLogsPage />
      </RoleRoute>
    ),
  },
  {
    path: '/dashboard/system',
    element: (
      <RoleRoute allowedRoles={[...SUPERADMIN_ONLY]}>
        <SystemConfigPage />
      </RoleRoute>
    ),
  },
  {
    path: '/dashboard/reports',
    element: (
      <RoleRoute allowedRoles={[...ADMIN_HOD_ROLES]}>
        <ReportsPage />
      </RoleRoute>
    ),
  },
  {
    path: '/dashboard/documents',
    element: (
      <RoleRoute allowedRoles={['superadmin', 'admin', 'hod', 'faculty', 'alumni']}>
        <DocumentsListingPage />
      </RoleRoute>
    ),
  },
  {
    path: '/dashboard/library',
    element: (
      <RoleRoute allowedRoles={['superadmin', 'admin']}>
        <LibraryDashboardPage />
      </RoleRoute>
    ),
  },
  {
    path: '/dashboard/messages',
    element: (
      <ProtectedRoute>
        <MessagesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/notifications',
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/messages/:conversationId',
    element: (
      <ProtectedRoute>
        <MessagesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/admin/messaging',
    element: (
      <RoleRoute allowedRoles={[...ADMIN_HOD_ROLES]}>
        <AdminMessagingPage />
      </RoleRoute>
    ),
  },
  {
    path: '/events',
    element: <div className="container section">Events Page (TODO)</div>,
  },
  {
    path: '/library',
    element: <div className="container section">Library Page (TODO)</div>,
  },
  {
    path: '/faculty',
    element: <div className="container section">Faculty Page (TODO)</div>,
  },
  {
    path: '/alumni',
    element: <div className="container section">Alumni Page (TODO)</div>,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
