import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require authentication.
 * Redirects to 403 Forbidden if user is not logged in.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
        <div className="loading-spinner" aria-label="Loading" />
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
