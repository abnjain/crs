
import ConfirmationPage from "@/pages/ConfirmationPage.jsx";

import LibraryDashboard from "@/pages/library/LibraryDashboard";

import AlumniProfile from "@/pages/alumni/AlumniProfile.jsx";
import AlumniList from "@/pages/alumni/AlumniList.jsx";

import TeacherLibraryDashboard from '@/pages/library/TeacherLibraryDashboard.jsx';
import BookDetails from '@/pages/library/BookDetails.jsx';
import EventList from "@/pages/events/EventList";
import EventForm from "@/pages/events/EventForm";
import EventDetails from "@/pages/events/EventDetails";

export const routesConfig = [  // Public
    { path: '/confirmation', element: <ConfirmationPage /> },

    // Events Routes
    { path: "/events", element: <EventList />, roles: ["Student", "Teacher", "Staff", "Admin", "SuperAdmin"] },
    { path: "/events/create", element: <EventForm />, roles: ["Teacher", "Staff", "Admin", "SuperAdmin"] },
    { path: "/events/:id", element: <EventDetails />, roles: ["Student", "Teacher", "Staff", "Admin", "SuperAdmin"] },
    { path: "/events/:id/edit", element: <EventForm />, roles: ["Teacher", "Staff", "Admin", "SuperAdmin"] },

    // Alumni Mangement
    { path: "/alumni", element: <AlumniList />, roles: ["Student", "Alumni", "Teacher", "Admin", "SuperAdmin"] },
    { path: "/alumni/:id", element: <AlumniProfile />, roles: ["Student", "Alumni", "Teacher", "Admin", "SuperAdmin"] },

    // Library Routes
    { path: "/library", element: <LibraryDashboard />, roles: ["Student", "Teacher", "Staff", "Admin", "SuperAdmin", "Librarian"] },
    { path: "/library/books/:id", element: <BookDetails />, roles: ["Student", "Teacher", "Staff", "Admin", "SuperAdmin", "Librarian"] },
    { path: '/library/teacher', element: <TeacherLibraryDashboard />, },
    // { path: '/library/books/:id', element: <BookDetails />, },
]