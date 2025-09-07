// src/pages/dashboard/AdminDashboard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function AdminDashboard() {
  const { user } = useAuth();

  // placeholder sample data (replace with API calls)
  const stats = [
    { title: 'Students', value: 1240 },
    { title: 'Teachers', value: 78 },
    { title: 'Books', value: 4200 },
    { title: 'Open Jobs', value: 12 },
  ];

  const recentUsers = [
    { id: 'S101', name: 'Ravi Kumar', role: 'Student', dept: 'CSE' },
    { id: 'T09', name: 'Dr. Meera', role: 'Teacher', dept: 'Maths' },
    { id: 'S102', name: 'Anita Verma', role: 'Student', dept: 'ECE' },
  ];

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-secondText">Welcome back, {user?.name || 'Admin'}.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <CardTitle className="text-sm">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.role}</TableCell>
                    <TableCell>{r.dept}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}


// import React, { useEffect, useState } from "react";
// import DashboardCards from "@/components/shared/DashboardCards";
// import api from "@/config/api";

// const AdminDashboard = () => {
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

// export default AdminDashboard;
