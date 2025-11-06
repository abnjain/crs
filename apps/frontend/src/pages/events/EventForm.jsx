// apps/frontend/src/pages/events/EventForm.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createEvent, updateEvent, getEventById } from "@/services/eventsService";
import { eventSchema } from "@/schemas/eventsSchema";
import { DateRangePicker } from "../../components/ui/date-picker.tsx";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { X } from "lucide-react";
import { Textarea } from "../../components/ui/textarea.tsx";

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [deletedIndexes, setDeletedIndexes] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue, trigger, getValues, watch, reset } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: null,
      endDate: null,
    },
  });

  useEffect(() => {
    if (isEdit) {
      setIsLoading(true);
      getEventById(id)
        .then((res) => {
          const event = res.data.event;
          setEvent(event);
          // setValue("title", event.title);
          // setValue("description", event.description || "");
          const start = event.startDate ? new Date(event.startDate) : null;
          const end = event.endDate ? new Date(event.endDate) : null;
          const range = { from: start, to: end };
          setDateRange({ from: start, to: end });
          // setValue("startDate", range.from);
          // setValue("endDate", range.to);
          if (Array.isArray(event.photos)) {
            setExistingPhotos(event.photos);
          }
          reset({
            title: event.title || "",
            description: event.description || "",
            startDate: start,
            endDate: end,
          });
        })
        .catch(() => toast.error("Failed to load event"))
        .finally(() => setIsLoading(false));
    }
  }, [id, isEdit]);

  const onSubmit = async (data) => {
    // Manual validation for date order
    if (dateRange.from && dateRange.to && dateRange.to < dateRange.from) {
      toast.error("End date must be after start date");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      const payload = {
        title: getValues("title"),
        description: getValues("description"),
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
        deletedPhotoIndexes: deletedIndexes, // ✅ Send deleted photos info to backend
      };

      formData.append("data", JSON.stringify(payload));
      photos.forEach((file) => formData.append("photos", file));

      // // ✅ Debug: see what’s actually inside
      // console.log("FormData contents:");
      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }

      if (isEdit) {
        await updateEvent(id, formData);
        toast.success("Event updated");
      } else {
        await createEvent(formData);
        toast.success("Event created");
      }

      navigate("/events");
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleFileChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const canAccess = user?.roles?.some((r) =>
    ["Teacher", "Staff", "Admin", "SuperAdmin"].includes(r)
  );
  if (!canAccess) {
    return <div className="p-6">Unauthorized</div>;
  }

  return (
    <ModuleLayout>
      <Card className="mx-auto max-w-2xl overflow-hidden">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Event" : "Create Event"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter Event Title" {...register("title", { required: true })} />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>
            <div className="space-y-3">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter Description" {...register("description")} />
              {errors.description && (
                <p className="text-destructive text-sm">{errors.description.message}</p>
              )}
            </div>
            <div className="space-y-3">
              <Label>Date Range</Label>
              <div className="flex justify-center items-center">
                <DateRangePicker
                  value={dateRange}
                  onChange={(range) => {
                    setDateRange(range);
                    // setValue("startDate", range.from);
                    // setValue("endDate", range.to);
                    trigger(["startDate", "endDate"]);
                  }}
                />
                <p className="text-gray-400 text-xs italic">Double-Click on Date to Select Same Date Range</p>
              </div>
              {(errors.startDate || errors.endDate) && (
                <p className="text-destructive text-sm">{errors.startDate?.message || errors.endDate?.message || "Invalid date range"}</p>
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="photos">Photos (Multiple)</Label>
              <Input id="photos" type="file" className="cursor-pointer" multiple accept="image/*" onChange={handleFileChange} />
            </div>
            {(existingPhotos.length > 0 || photos.length > 0) && (
              <div className="space-y-2">
                <Label>Photos</Label>
                <div className="flex flex-wrap gap-3">
                  {photos.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`new-photo-${idx}`}
                        className="w-20 h-20 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos(photos.filter((_, i) => i !== idx))
                        }
                        className="absolute top-2 right-2 bg-black/60 text-white text-xs rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {existingPhotos.map((photo, idx) => (
                    <div key={photo.index} className="relative group">
                      <img
                        src={photo.url}
                        alt={`photo-${photo.index}`}
                        className="w-20 h-20 rounded-lg object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDeletedIndexes([...deletedIndexes, photo.index]); // ✅ store index only
                          setExistingPhotos(existingPhotos.filter((p) => p.index !== photo.index));
                        }}
                        className="absolute top-2 right-2 bg-black/60 text-white text-xs rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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