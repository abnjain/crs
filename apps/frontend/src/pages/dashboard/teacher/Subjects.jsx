// src/pages/dashboard/teacher/Subjects.jsx
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import api from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from "react-hot-toast";
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Subjects() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Assuming endpoint /api/v1/teachers/my-subjects; add to backend if needed
        // Example: router.get('/my-subjects', auth, role(['Teacher']), ctrl.getMySubjects);
        // Fetches from Teacher model or Subjects assigned
        const response = await api.get('/teachers/my-subjects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(response.data.subjects || []);
      } catch (err) {
        setError('Failed to load subjects');
        toast.error('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [token]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <>
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Assigned Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Section</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((sub, i) => (
                  <TableRow key={i}>
                    <TableCell>{sub.name}</TableCell>
                    <TableCell>{sub.code}</TableCell>
                    <TableCell>{sub.section}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
}