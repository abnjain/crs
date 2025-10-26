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

// import StudentCourses from "@/pages/dashboard/student/Courses.jsx";
// import StudentLibrary from "@/pages/dashboard/student/Library.jsx";
// import StudentPlacement from "@/pages/dashboard/student/Placements.jsx";
// import StudentNotices from "@/pages/dashboard/student/Notices.jsx";
// import StudentIdCard from "@/pages/dashboard/student/StudentIdCard.jsx";

import Documents from "@/pages/dashboard/admin/Documents.jsx";

import ConfirmationPage from "@/pages/ConfirmationPage.jsx";

import LibraryDashboard from "@/pages/library/LibraryDashboard";

import AlumniProfile from "@/pages/alumni/AlumniProfile.jsx";
import AlumniList from "@/pages/alumni/AlumniList.jsx";
import AlumniDashboard from "@/pages/alumni/Dashboard";
import CompleteProfile from "@/pages/alumni/CompleteProfile";
import EditProfile from "@/pages/alumni/EditProfile";

import TeacherLibraryDashboard from '@/pages/library/TeacherLibraryDashboard.jsx';
import BookDetails from '@/pages/library/BookDetails.jsx';

export const routesConfig = [
  // Public
  { path: '/confirmation', element: <ConfirmationPage /> },

  // Alumni Routes
  { path: "/dashboard/alumni", element: <AlumniDashboard />, roles: ["Student", "Alumni", "Admin", "SuperAdmin"] },
  { path: "/dashboard/alumni/complete-profile", element: <CompleteProfile />, roles: ["Student", "Alumni", "Admin", "SuperAdmin"] },
  { path: "/dashboard/alumni/edit", element: <EditProfile />, roles: ["Student", "Alumni", "Admin", "SuperAdmin"] },
  
  // Alumni Mangement
  { path: "/alumni", element: <AlumniList />, roles: ["Student", "Alumni", "Teacher", "Admin", "SuperAdmin"] },
  { path: "/alumni/:id", element: <AlumniProfile />, roles: ["Student", "Alumni", "Teacher", "Admin", "SuperAdmin"] },

  // Library Routes
  { path: "/library", element: <LibraryDashboard />, roles: ["Student", "Teacher", "Staff", "Admin", "SuperAdmin", "Librarian"] },
  { path: "/library/books/:id", element: <BookDetails />, roles: ["Student", "Teacher", "Staff", "Admin", "SuperAdmin", "Librarian"] },
  { path: '/library/teacher', element: <TeacherLibraryDashboard />, },
  // { path: '/library/books/:id', element: <BookDetails />, },

  // Admin
  { path: "/dashboard/admin", element: <AdminDashboard />, roles: ["Admin", "SuperAdmin"] },
  { path: "/dashboard/admin/docs", element: <Documents />, roles: ["Admin", "SuperAdmin"] },

  // // Student
  // { path: "/dashboard/student", element: <StudentDashboard />, roles: ["Student", "Admin", "SuperAdmin"] },
  // { path: "/dashboard/student/courses", element: <StudentCourses />, roles: ["Student"] },
  // { path: "/dashboard/student/library", element: <StudentLibrary />, roles: ["Student"] },
  // { path: "/dashboard/student/placement", element: <StudentPlacement />, roles: ["Student"] },
  // { path: "/dashboard/student/notices", element: <StudentNotices />, roles: ["Student"] },
  // { path: "/dashboard/student/idcard", element: <StudentIdCard />, roles: ["Student", "Teacher", "Admin", "SuperAdmin"] },

  // Teacher Routes
  { path: "/dashboard/teacher", element: <TeacherDashboard />, roles: ["Teacher", "Admin", "SuperAdmin"] },
  { path: "/dashboard/teacher/research", element: <ResearchUpload />, roles: ["Teacher", "Admin", "SuperAdmin"] },
  { path: "/dashboard/teacher/marks", element: <ExamMarksUpload />, roles: ["Teacher", "Admin", "SuperAdmin"] },
  { path: "/dashboard/teacher/profile", element: <TeacherProfile />, roles: ["Teacher", "Admin", "SuperAdmin"] },
  { path: "/dashboard/teacher/subjects", element: <TeacherSubjects />, roles: ["Teacher"] },

  // Staff Routes
  { path: "/dashboard/staff", element: <StaffDashboard />, roles: ["Staff", "Admin", "SuperAdmin"] },

  // SuperAdmin Routes
  { path: "/dashboard/superadmin", element: <SuperAdminDashboard />, roles: ["SuperAdmin"] },
];
