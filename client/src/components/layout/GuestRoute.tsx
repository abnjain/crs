import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Guards public/auth routes from authenticated users.
 * Redirects authenticated users to /dashboard.
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
        <div className="loading-spinner" aria-label="Loading" />
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
