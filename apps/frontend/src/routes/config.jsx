// src/routes/config.js
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import StudentDashboard from "@/pages/dashboard/StudentDashboard";
import TeacherDashboard from "@/pages/dashboard/TeacherDashboard";
import StaffDashboard from "@/pages/dashboard/StaffDashboard";
import SuperAdminDashboard from "@/pages/dashboard/SuperAdminDashboard";

import ResearchUpload from "@/pages/dashboard/teacher/ResearchUpload";
import ExamMarksUpload from "@/pages/dashboard/teacher/ExamMarksUpload";
import TeacherProfile from "@/pages/dashboard/teacher/TeacherProfile";
import TeacherSubjects from "@/pages/dashboard/teacher/Subjects";
import TeacherAttendance from "@/pages/dashboard/teacher/AttendanceChart";

import StudentCourses from "@/pages/dashboard/student/Courses";
import StudentLibrary from "@/pages/dashboard/student/Library";
import StudentPlacement from "@/pages/dashboard/student/Placements";
import StudentNotices from "@/pages/dashboard/student/Notices";
import StudentIdCard from "@/pages/dashboard/student/StudentIdCard";

import Documents from "@/pages/dashboard/admin/Documents";

export const routesConfig = [
  // Admin
  { path: "/dashboard/admin", element: <AdminDashboard />, roles: ["Admin", "SuperAdmin"] },
  { path: "/dashboard/admin/docs", element: <Documents />, roles: ["Admin", "SuperAdmin"] },

  // Student
  { path: "/dashboard/student", element: <StudentDashboard />, roles: ["Student", "Admin", "SuperAdmin"] },
  { path: "/dashboard/student/courses", element: <StudentCourses />, roles: ["Student"] },
  { path: "/dashboard/student/library", element: <StudentLibrary />, roles: ["Student"] },
  { path: "/dashboard/student/placement", element: <StudentPlacement />, roles: ["Student"] },
  { path: "/dashboard/student/notices", element: <StudentNotices />, roles: ["Student"] },
  { path: "/dashboard/student/idcard", element: <StudentIdCard />, roles: ["Student", "Teacher", "Admin", "SuperAdmin"] },

  // Teacher
  { path: "/dashboard/teacher", element: <TeacherDashboard />, roles: ["Teacher", "Admin", "SuperAdmin"] },
  { path: "/dashboard/teacher/research", element: <ResearchUpload />, roles: ["Teacher", "Admin", "SuperAdmin"] },
  { path: "/dashboard/teacher/marks", element: <ExamMarksUpload />, roles: ["Teacher", "Admin", "SuperAdmin"] },
  { path: "/dashboard/teacher/profile", element: <TeacherProfile />, roles: ["Teacher", "Admin", "SuperAdmin"] },
  { path: "/dashboard/teacher/subjects", element: <TeacherSubjects />, roles: ["Teacher"] },
  { path: "/dashboard/teacher/attendance", element: <TeacherAttendance />, roles: ["Teacher"] },

  // Staff
  { path: "/dashboard/staff", element: <StaffDashboard />, roles: ["Staff", "Admin", "SuperAdmin"] },

  // SuperAdmin
  { path: "/dashboard/superadmin", element: <SuperAdminDashboard />, roles: ["SuperAdmin"] },
];
