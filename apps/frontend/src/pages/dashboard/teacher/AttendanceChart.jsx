// src/pages/dashboard/teacher/AttendanceChart.jsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast'; // Assuming react-hot-toast is used for notifications

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AttendanceChart() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const response = await api.get('/attendance/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch (err) {
        setError('Failed to load attendance data');
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceSummary();
  }, [token]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  const chartData = {
    labels: data?.byClass?.map((c) => c.class) || [],
    datasets: [
      {
        label: 'Attendance %',
        data: data?.byClass?.map((c) => c.att) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="h-48">
          <Bar data={chartData} options={options} />
        </div>
        <p className="text-center mt-2 text-sm text-muted-foreground">
          Average: {data?.averageAttendance || 0}%
        </p>
      </CardContent>
    </Card>
  );
}