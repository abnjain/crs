import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protects routes for admin only.
 * Redirects to 403 if user is not admin.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
        <div className="loading-spinner" aria-label="Loading" />
      </div>
    );
  }

  const hasAdminRole = user?.roles?.some((r) => r === 'admin' || r === 'superadmin') ?? (user?.role === 'admin' || user?.role === 'superadmin');
  if (!isAuthenticated || !hasAdminRole) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
