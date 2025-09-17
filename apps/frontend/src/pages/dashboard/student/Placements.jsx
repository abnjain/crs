// src/pages/dashboard/student/Placement.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function StudentPlacement() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Placement Portal</h1>
        <p className="text-secondText">Browse internships and apply.</p>
        <Card>
          <CardContent>
            <p className="text-sm text-secondText">No job postings available.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}  