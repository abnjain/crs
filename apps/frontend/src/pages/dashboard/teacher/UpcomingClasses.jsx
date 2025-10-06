// src/pages/dashboard/teacher/UpcomingClasses.jsx
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from "react-hot-toast";

export default function UpcomingClasses() {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      try {
        // Assuming an API endpoint /api/v1/teachers/upcoming-classes exists; if not, add it to backend teacher.routes.js
        // Example backend addition: router.get('/upcoming-classes', auth, role(['Teacher']), ctrl.getUpcomingClasses);
        // Where ctrl.getUpcomingClasses fetches from Timetable model filtered by teacher and date
        const response = await api.get('/teachers/upcoming-classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(response.data.classes || []);
      } catch (err) {
        setError('Failed to load upcoming classes');
        toast.error('Failed to load upcoming classes');
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingClasses();
  }, [token]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <ul className="space-y-2">
            {classes.length > 0 ? (
              classes.map((c, i) => (
                <li key={i} className="p-3 border rounded bg-accent/50">
                  <div className="font-medium">{c.subject} • {c.section}</div>
                  <div className="text-sm text-muted-foreground">{c.time}</div>
                </li>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No upcoming classes</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}