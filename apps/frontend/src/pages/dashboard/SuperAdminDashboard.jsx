// src/pages/dashboard/SuperAdminDashboard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  // high level system metrics (placeholders)
  const metrics = [
    { label: 'API Uptime', value: '99.98%' },
    { label: 'DB Size', value: '12.4 GB' },
    { label: 'Active Sessions', value: 84 },
  ];

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">SuperAdmin Dashboard</h1>
          <p className="text-sm text-secondText">System overview for {user?.name || 'SuperAdmin'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardHeader>
                <CardTitle>{m.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}


// import React, { useEffect, useState } from "react";
// import DashboardCards from "@/components/shared/DashboardCards";
// import api from "@/config/api";

// const SuperAdminDashboard = () => {
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

// export default SuperAdminDashboard;
