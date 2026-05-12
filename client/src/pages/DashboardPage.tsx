import { useAuth } from '../context';
import { SuperAdminDashboard } from './dashboard/SuperAdminDashboard';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { HodDashboard } from './dashboard/HodDashboard';
import { FacultyDashboard } from './dashboard/FacultyDashboard';
import { AlumniDashboard } from './dashboard/AlumniDashboard';

/**
 * Routes to role-specific dashboard based on primary role.
 * Supports multi-role users: shows highest-priority dashboard; sidebar includes nav from all roles.
 */
export function DashboardPage() {
  const { user } = useAuth();
  const primaryRole = user?.role ?? 'alumni';

  switch (primaryRole) {
    case 'superadmin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'hod':
      return <HodDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'alumni':
    case 'guest':
    default:
      return <AlumniDashboard />;
  }
}
