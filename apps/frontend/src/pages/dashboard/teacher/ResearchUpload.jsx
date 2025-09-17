// src/pages/dashboard/teacher/ResearchUpload.jsx
// Assuming this is for uploading study materials or research papers via /api/v1/teachers/materials
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import api from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  file: z.any().refine((file) => file?.length === 1, 'File is required'),
});

export default function ResearchUpload() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('file', data.file[0]);

      await api.post('/teachers/materials', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Material uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Research/Material</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} />
            </div>
            <div>
              <Label htmlFor="file">Upload File</Label>
              <Input id="file" type="file" {...register('file')} />
              {errors.file && <p className="text-destructive text-sm">{errors.file.message}</p>}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}