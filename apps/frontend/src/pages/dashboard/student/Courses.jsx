// src/pages/dashboard/student/Courses.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function StudentCourses() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <p className="text-secondText">This page will show enrolled courses, syllabus, and materials.</p>
        <Card>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Algorithms & Data Structures (CSE-A)</li>
              <li>• Operating Systems (CSE-A)</li>
              <li>• Database Management Systems (CSE-A)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}