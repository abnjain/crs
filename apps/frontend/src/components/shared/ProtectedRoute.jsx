// src/components/shared/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Forbidden from '@/pages/errors/Forbidden';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* Replace with your spinner */}
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // normalize roles: both user.roles and allowedRoles might be string or array
  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.roles].filter(Boolean);
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // If no restriction, allow
  if (!allowed || allowed.length === 0) return children;

  // Check if user has at least one of the allowed roles
  const isAllowed = userRoles.some((role) => allowed.includes(role));
  if (!isAllowed) {
    return <Forbidden />;
  }

  // Alternatively, you can use intersection logic
  const intersection = userRoles.filter((r) => allowed.includes(r));
  if (intersection.length === 0) {
    // optional: go to a "Not authorized" page instead
    return <Navigate to="/login" replace />;
  }

  return children;
}
