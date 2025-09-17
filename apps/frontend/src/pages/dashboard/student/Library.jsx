// src/pages/dashboard/student/Library.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function StudentLibrary() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Library</h1>
        <p className="text-secondText">View issued books, due dates, and search catalog.</p>
        <Card>
          <CardContent>
            <p className="text-sm text-secondText">No books issued yet.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}