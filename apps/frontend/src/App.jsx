// src/App.jsx (snippet)
import { RootProviders } from "@/providers/RootProviders";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import Logout from "@/pages/auth/Logout";
import Forbidden from "@/pages/errors/Forbidden";
import NotFound from "@/pages/errors/NotFound";
import RoleBasedDashboardRedirect from "@/pages/dashboard/RoleBasedDashboardRedirect";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { routesConfig } from "@/routes/config";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <RootProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected routes (looped from config) */}
          {routesConfig.map(({ path, element, roles }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute allowedRoles={roles}>
                  {element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* Common dashboard redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Student", "SuperAdmin", "Teacher", "Staff"]}>
                <RoleBasedDashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Error Pages */}
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </RootProviders>
  );
}

export default App;
