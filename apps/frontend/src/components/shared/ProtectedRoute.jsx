// src/components/shared/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Forbidden from '@/pages/errors/Forbidden';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  } 

  if (allowedRoles && !allowedRoles.includes(user?.roles)) {
    return <Forbidden />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // normalize roles: both user.roles and allowedRoles might be string or array
  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.roles].filter(Boolean);
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // If no allowedRoles specified, allow any authenticated user
  if (!allowed || allowed.length === 0) return children;

  const intersection = userRoles.filter((r) => allowed.includes(r));
  if (intersection.length === 0) {
    // optional: go to a "Not authorized" page instead
    return <Navigate to="/login" replace />;
  }

  return children;
}
