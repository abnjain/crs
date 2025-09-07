// src/pages/dashboard/StaffDashboard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function StaffDashboard() {
  const { user } = useAuth();

  const tasks = [
    { id: 1, title: 'Approve library purchase request' },
    { id: 2, title: 'Maintenance request - AC in Lab 5' },
  ];

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
          <p className="text-sm text-secondText">Welcome back, {user?.name || 'Staff'}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Open Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {tasks.map((t) => (
                <li key={t.id}>{t.title}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}


// import React, { useEffect, useState } from "react";
// import DashboardCards from "@/components/shared/DashboardCards";
// import api from "@/config/api";

// const StaffDashboard = () => {
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

// export default StaffDashboard;
