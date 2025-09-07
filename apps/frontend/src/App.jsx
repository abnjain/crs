// src/App.jsx (snippet)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootProviders } from '@/providers/RootProviders';
import Login from '@/pages/auth/Login';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import StudentDashboard from '@/pages/dashboard/StudentDashboard';
import TeacherDashboard from '@/pages/dashboard/TeacherDashboard';
import StaffDashboard from '@/pages/dashboard/StaffDashboard';
import SuperAdminDashboard from '@/pages/dashboard/SuperAdminDashboard';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import Register from './pages/auth/Register';
import RequireAuth from './contexts/RequiredAuth';
import Forbidden from './pages/errors/Forbidden';
import NotFound from './pages/errors/NotFound';
import RoleBasedDashboardRedirect from './pages/dashboard/RoleBasedDashboardRedirect';

function App() {
  
debugger
  return (
    <RootProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/superadmin"
            element={
              <ProtectedRoute allowedRoles={["SuperAdmin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Student', 'SuperAdmin', 'Teacher', 'Staff']}>
                <RoleBasedDashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route path="/forbidden" element={<Forbidden />} />

          <Route path="*" element={<NotFound />} />   {/* Catch all 404 */}

        </Routes>

      </BrowserRouter>
    </RootProviders>
  );
}

export default App;
