// src/pages/dashboard/student/Notices.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function StudentNotices() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Notices</h1>
        <p className="text-secondText">College-wide announcements.</p>
        <Card>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Summer Break: 1 May – 15 June</li>
              <li>• Exam Schedule Released</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}