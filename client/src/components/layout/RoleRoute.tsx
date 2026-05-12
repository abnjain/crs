import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context';
import type { UserRole } from '../../context/AuthContext';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * Protects routes for specific roles.
 * Redirects to 403 if user lacks any of the allowed roles.
 */
export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
        <div className="loading-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = user.roles?.length ? user.roles : [user.role];
  const hasAccess = userRoles.some((r) => allowedRoles.includes(r));

  if (!hasAccess) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
