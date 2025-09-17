// src/pages/dashboard/student/StudentIdCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/config/api';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function StudentIdCard() {
  const { user } = useAuth();
  const [idCardUrl, setIdCardUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdCard = async () => {
      try {
        const res = await api.get(`/v1/students/${user?.studentId}/idcard`);
        setIdCardUrl(res.data.url);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.studentId) fetchIdCard();
  }, [user?.studentId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Digital ID Card</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your College ID</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span>Loading ID Card...</span>
            </div>
          ) : idCardUrl ? (
            <a
              href={idCardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-dashed border-border p-6 rounded-lg hover:border-primary transition"
            >
              <img
                src={idCardUrl}
                alt="Student ID Card"
                className="max-w-full max-h-96 object-contain"
              />
            </a>
          ) : (
            <p className="text-secondText">ID card not generated yet. Contact admin.</p>
          )}
          <Button className="mt-6" onClick={() => window.open(idCardUrl, '_blank')} disabled={!idCardUrl}>
            Download ID Card
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}