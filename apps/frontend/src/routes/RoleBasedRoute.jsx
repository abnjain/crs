import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProviders.jsx";

export default function RoleBasedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.roles)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
