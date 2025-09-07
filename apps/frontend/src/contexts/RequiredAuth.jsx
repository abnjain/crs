import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // adjust path

const RequireAuth = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // logged in but role not allowed → forbidden
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  // allowed → show page
  return children;
};

export default RequireAuth;
