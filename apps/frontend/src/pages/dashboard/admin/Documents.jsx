// src/pages/dashboard/admin/Documents.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/config/api';
import toast from "react-hot-toast";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/v1/docs?q=&type=syllabus,circular,notes,researches');
        setDocs(res.data.docs);
      } catch (err) {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Document Repository</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-12">Loading...</div>
          ) : docs.length === 0 ? (
            <div className="col-span-3 text-center text-secondText py-12">No documents uploaded yet.</div>
          ) : (
            docs.map((doc) => (
              <Card key={doc._id}>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{doc.title}</h3>
                  <p className="text-xs text-secondText mt-1 capitalize">{doc.type}</p>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-primary text-sm hover:underline"
                  >
                    View →
                  </a>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}