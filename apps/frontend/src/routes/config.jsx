// src/routes/config.js
import AdminDashboard from "@/pages/dashboard/AdminDashboard.jsx";
import StudentDashboard from "@/pages/dashboard/StudentDashboard.jsx";
import TeacherDashboard from "@/pages/dashboard/TeacherDashboard.jsx";
import StaffDashboard from "@/pages/dashboard/StaffDashboard.jsx";
import SuperAdminDashboard from "@/pages/dashboard/SuperAdminDashboard.jsx";

import ResearchUpload from "@/pages/dashboard/teacher/ResearchUpload.jsx";
import ExamMarksUpload from "@/pages/dashboard/teacher/ExamMarksUpload.jsx";
import TeacherProfile from "@/pages/dashboard/teacher/TeacherProfile.jsx";
import TeacherSubjects from "@/pages/dashboard/teacher/Subjects.jsx";
import TeacherAttendance from "@/pages/dashboard/teacher/AttendanceChart.jsx";

import StudentCourses from "@/pages/dashboard/student/Courses.jsx";
import StudentLibrary from "@/pages/dashboard/student/Library.jsx";
import StudentPlacement from "@/pages/dashboard/student/Placements.jsx";
import StudentNotices from "@/pages/dashboard/student/Notices.jsx";
import StudentIdCard from "@/pages/dashboard/student/StudentIdCard.jsx";

import Documents from "@/pages/dashboard/admin/Documents.jsx";

import ConfirmationPage from "@/pages/ConfirmationPage.jsx";

import TeacherLibraryDashboard from '@/pages/library/TeacherLibraryDashboard.jsx';
import BookDetails from '@/pages/library/BookDetails.jsx';

export const routesConfig = [
  // Public
  { path: '/confirmation', element: <ConfirmationPage /> },

  // Library
  { path: '/library/teacher', element: <TeacherLibraryDashboard />, },
  { path: '/library/books/:id', element: <BookDetails />, },

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
