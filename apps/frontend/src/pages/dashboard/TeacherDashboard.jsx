// src/pages/dashboard/TeacherDashboard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function TeacherDashboard() {
  const { user } = useAuth();

  // placeholders
  const classesToday = [
    { subject: 'Algorithms', time: '9:00 AM', section: 'CSE-A' },
    { subject: 'OS', time: '2:00 PM', section: 'CSE-B' },
  ];

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
          <p className="text-sm text-secondText">Welcome, {user?.name || 'Teacher'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {classesToday.map((c, i) => (
                  <li key={i} className="p-3 border rounded">
                    <div className="font-medium">{c.subject} • {c.section}</div>
                    <div className="text-sm text-secondText">{c.time}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>Enter Attendance • Post Materials • Grade Exams</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}


// import React, { useEffect, useState } from "react";
// import DashboardCards from "@/components/shared/DashboardCards";
// import api from "@/config/api";

// const TeacherDashboard = () => {
//   const [modules, setModules] = useState([]);

//   useEffect(() => {
//     // fetch analytics/modules if needed
//     setModules([
//       { title: "Library", path: "/library", icon: "📚" },
//       { title: "Attendance", path: "/attendance", icon: "📅" },
//       { title: "Exams", path: "/exams", icon: "📝" },
//       { title: "Users", path: "/users", icon: "👥" },
//     ]);
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//       <DashboardCards modules={modules} />
//     </div>
//   );
// };

// export default TeacherDashboard;
