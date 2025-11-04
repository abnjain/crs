import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getEvents, deleteEvent } from "@/services/eventsService";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import { ModuleLayout } from "@/components/layout/ModuleLayout";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canEdit = user?.roles?.some(role => ["Teacher", "Staff", "Admin", "SuperAdmin"].includes(role));

  useEffect(() => {
    getEvents()
      .then((res) => setEvents(res.data))
      .catch(() => toast.error("Failed to load events"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteEvent(deleteId);
      setEvents(events.filter((e) => e._id !== deleteId));
      toast.success("Event deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <ModuleLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Events</CardTitle>
          {canEdit && <Button onClick={() => navigate("/events/create")}>Create Event</Button>}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Photos</TableHead>
                {canEdit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell className="font-medium cursor-pointer" onClick={() => navigate(`/events/${event._id}`)}>
                    {event.title}
                  </TableCell>
                  <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(event.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {event.photos?.length > 0 ? `${event.photos.length} photos` : "None"}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/events/${event._id}/edit`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setDeleteId(event._id); setShowDeleteConfirm(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Event?"
          description="This action cannot be undone."
          variant="destructive"
        />
      </Card>
    </ModuleLayout>
  );
}