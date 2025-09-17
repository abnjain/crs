// src/pages/dashboard/teacher/ExamMarksUpload.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import api from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Schema for form validation
const schema = z.object({
  examId: z.string().min(1, 'Exam is required'),
  csvFile: z.any().refine((file) => file?.length === 1, 'CSV file is required'),
});

export default function ExamMarksUpload() {
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema),
  });

  // Fetch exams on mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/assesment/exams', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExams(response.data.exams || []);
      } catch (err) {
        toast.error('Failed to load exams');
      }
    };
    fetchExams();
  }, [token]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('examId', data.examId);
      formData.append('csv', data.csvFile[0]);

      await api.post('/assesment/marks', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Marks uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Exam Marks</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="examId">Select Exam</Label>
              <Select onValueChange={(value) => setValue('examId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.examId && <p className="text-destructive text-sm">{errors.examId.message}</p>}
            </div>
            <div>
              <Label htmlFor="csvFile">Upload CSV</Label>
              <Input id="csvFile" type="file" accept=".csv" {...register('csvFile')} />
              {errors.csvFile && <p className="text-destructive text-sm">{errors.csvFile.message}</p>}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Marks'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}