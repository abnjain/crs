// src/pages/dashboard/TeacherDashboard.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AttendanceChart from './teacher/AttendanceChart.jsx';
import MarksChart from './teacher/MarksChart.jsx';
import UpcomingClasses from './teacher/UpcomingClasses.jsx';

export default function TeacherDashboard() {
  const { user } = useAuth();

  const classesToday = [
    { subject: 'Algorithms', time: '9:00 AM', section: 'CSE-A' },
    { subject: 'OS', time: '2:00 PM', section: 'CSE-B' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
          <p className="text-sm text-secondText">Welcome, {user?.name || 'Teacher'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Attendance Overview</CardTitle></CardHeader>
            <CardContent><AttendanceChart /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Marks Overview</CardTitle></CardHeader>
            <CardContent><MarksChart /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Today's Classes</CardTitle></CardHeader>
            <CardContent><UpcomingClasses /></CardContent>
          </Card>
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
                <a href="/dashboard/teacher/exams" className="block p-3 bg-accent rounded hover:bg-accent/80 transition">
                  Enter Exam Details
                </a>
                <a href="/dashboard/teacher/marks" className="block p-3 bg-accent rounded hover:bg-accent/80 transition">
                  Upload Marks (CSV)
                </a>
                <a href="/dashboard/teacher/research" className="block p-3 bg-accent rounded hover:bg-accent/80 transition">
                  Upload Research Paper
                </a>
                <a href="/dashboard/teacher/profile" className="block p-3 bg-accent rounded hover:bg-accent/80 transition">
                  Edit Profile & Achievements
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}   