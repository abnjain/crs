import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route } from "react-router-dom";
import { Home, BookOpen,Users, Calendar, Briefcase, FileText, Bell, Settings, LogOut, Moon, Sun, Menu, X, Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/Dashboards/AdminDashboard.jsx";
import TeacherDashboard from "./pages/Dashboards/TeacherDashboard.jsx";
import StudentDashboard from "./pages/Dashboards/StudentDashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoutes.jsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.jsx";
import Sidebar from './components/main/Sidebar.jsx';
import Header from './components/main/Header.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleBasedRoute roles={["Admin", "SuperAdmin"]}>
              <AdminDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher"
        element={
          <ProtectedRoute>
            <RoleBasedRoute roles={["Teacher"]}>
              <TeacherDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleBasedRoute roles={["Student"]}>
              <StudentDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}




export default App;