import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getEventById } from "@/services/eventsService";
import { ModuleLayout } from "@/components/layout/ModuleLayout";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const canEdit = user?.roles?.some(role => ["Teacher", "Staff", "Admin", "SuperAdmin"].includes(role));

  useEffect(() => {
    getEventById(id)
      .then((res) => setEvent(res.data))
      .catch(() => toast.error("Failed to load event"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <ModuleLayout>
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{event.title}</CardTitle>
          {canEdit && <Button onClick={() => navigate(`/events/${id}/edit`)}>Edit</Button>}
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p>{event.description || "No description"}</p>
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
              {event.photos?.map((photo, index) => (
                <img key={index} src={photo} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
              ))}
              {(!event.photos || event.photos.length === 0) && <p>No photos</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </ModuleLayout>
  );
}