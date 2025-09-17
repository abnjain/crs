// src/pages/dashboard/teacher/MarksChart.jsx
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MarksChart() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await api.get('/analytics/performance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch (err) {
        setError('Failed to load marks data');
        toast.error('Failed to load marks data');
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [token]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  const chartData = {
    labels: data?.bySubject?.map((s) => s.subject) || [],
    datasets: [
      {
        data: data?.bySubject?.map((s) => s.avgMarks) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="h-48">
          <Doughnut data={chartData} options={options} />
        </div>
        <p className="text-center mt-2 text-sm text-muted-foreground">
          Average Marks: {data?.averageMarks || 0}
        </p>
      </CardContent>
    </Card>
  );
}