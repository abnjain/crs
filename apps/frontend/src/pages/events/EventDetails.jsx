// apps/frontend/src/pages/events/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getEventById } from "@/services/eventsService";
import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { X } from "lucide-react";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const canEdit = user?.roles?.some(role => ["Teacher", "Staff", "Admin", "SuperAdmin"].includes(role));

  useEffect(() => {
    getEventById(id)
      .then((res) => setEvent(res.data.event))
      .catch(() => toast.error("Failed to load event"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <ModuleLayout>
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{event.title}</CardTitle>
          {canEdit && <Button onClick={() => navigate(`/events/${id}/edit`)}>Edit</Button>}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-fit break-words">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-base ">{event.description || "No description"}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p>{new Date(event.startDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p>{new Date(event.endDate).toLocaleString()}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Photos</p>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {event.photos?.length > 0 ? (
                event.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.url || photo} // Support both {url} or base64 strings
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-80 transition"
                    onClick={() => setSelectedPhoto(photo.url || photo)} // ✅ Open viewer
                  />
                ))
              ) : (
                <p>No photos</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* ✅ Fullscreen Photo Viewer */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)} // Close when clicking outside
        >
          <div
            className="relative max-w-4xl w-full p-4 flex justify-center"
            // onClick={(e) => e.stopPropagation()} // Prevent background click from closing
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white bg-black/60  cursor-pointer hover:bg-black/80 rounded-full p-2"
            >
              <X size={24} />
            </button>
            <img
              src={selectedPhoto}
              alt="Enlarged view"
              className="max-h-[80vh] w-auto rounded-lg shadow-lg object-contain"
            />
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}