import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createEvent, updateEvent, getEventById } from "@/services/eventsService";
import { eventSchema } from "@/schemas/eventsSchema";
import { DateRangePicker } from "@/components/ui/date-picker";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import { ModuleLayout } from "@/components/layout/ModuleLayout";

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (isEdit) {
      setIsLoading(true);
      getEventById(id)
        .then((res) => {
          const event = res.data;
          setValue("title", event.title);
          setValue("description", event.description);
          setValue("startDate", new Date(event.startDate));
          setValue("endDate", new Date(event.endDate));
          // Existing photos not editable here; new ones append.
        })
        .catch(() => toast.error("Failed to load event"))
        .finally(() => setIsLoading(false));
    }
  }, [id, isEdit, setValue]);

  const onSubmit = (data) => {
    setShowConfirm(true);
  };

  const handleConfirm = handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      const dateRange = { startDate: data.startDate, endDate: data.endDate };
      if (isEdit) {
        await updateEvent(id, { ...data, ...dateRange }, photos);
        toast.success("Event updated");
      } else {
        await createEvent({ ...data, ...dateRange }, photos);
        toast.success("Event created");
      }
      navigate("/dashboard/events");
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  });

  const handleFileChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  if (!user?.roles?.includes("Teacher") && !user?.roles?.includes("Admin") && !user?.roles?.includes("SuperAdmin") && !user?.roles?.includes("Staff")) {
    return <div>Unauthorized</div>;
  }

  return (
    <ModuleLayout>
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Event" : "Create Event"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
              {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
            </div>
            <div>
              <Label>Date Range</Label>
              <DateRangePicker
                onChange={(range) => {
                  setValue("startDate", range.from);
                  setValue("endDate", range.to);
                }}
                value={{ from: setValue("startDate"), to: setValue("endDate") }}
              />
              {(errors.startDate || errors.endDate) && <p className="text-destructive text-sm">Invalid date range</p>}
            </div>
            <div>
              <Label htmlFor="photos">Photos (Multiple)</Label>
              <Input id="photos" type="file" multiple accept="image/*" onChange={handleFileChange} />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : isEdit ? "Update" : "Create"}
            </Button>
          </form>
        </CardContent>
        <ConfirmationDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
          title={isEdit ? "Update Event?" : "Create Event?"}
          description="This action will save the event details."
        />
      </Card>
    </ModuleLayout>
  );
}