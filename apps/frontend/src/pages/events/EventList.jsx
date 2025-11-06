// apps/frontend/src/pages/events/EventList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getEvents, deleteEvent } from "@/services/eventsService";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import { ModuleLayout } from "@/components/layout/ModuleLayout";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const canEdit = user?.roles?.some(r =>
    ["Teacher", "Staff", "Admin", "SuperAdmin"].includes(r)
  );

  const loadPage = useCallback(
    async (page = 1) => {
      const validPage = Math.max(1, page);
      setIsLoading(true);
      try {
        const res = await getEvents({ page: validPage });
        setEvents(res.data.events);
        setPagination(res.data.pagination);
        setSearchParams({ page: validPage }, { replace: true });
      } catch (err) {
        toast.error(err.message || "Failed to load events");
      } finally {
        setIsLoading(false);
      }
    },
    [setSearchParams]
  );

  // --------------------------------------------------- 1. Load data
  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page"), 10);
    const page = !isNaN(urlPage) && urlPage > 0 ? urlPage : 1;
    loadPage(page);
  }, [searchParams, loadPage]);

  // --------------------------------------------------- 2. Validate page after totalPages is known
  useEffect(() => {
    if (!pagination.totalPages) return;               // first load → skip
    const current = parseInt(searchParams.get("page") || "1", 10);

    if (current > pagination.totalPages) {
      setSearchParams({ page: 1 }, { replace: true });
    }
  }, [pagination.totalPages, searchParams, setSearchParams]);

  // --------------------------------------------------- Delete handler (unchanged)
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteEvent(deleteId);
      setEvents(prev => prev.filter(e => e._id !== deleteId));
      toast.success("Event deleted");

      if (events.length === 1 && pagination.page > 1) {
        loadPage(pagination.page - 1);
      }
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };
  if (isLoading && events.length === 0) {
    return (
      <ModuleLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Events</h1>
        {canEdit && (
          <Button onClick={() => navigate("/events/create")}>Create Event</Button>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-center text-gray-500 italic mt-10">
          No events found.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event._id}
                className="hover:shadow-lg transition cursor-pointer flex flex-col"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                {/* Photos */}
                <div className="w-full h-54 overflow-hidden rounded-t-md bg-gray-50">
                  {event.photos?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {event.photos.slice(0, 4).map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo.url || photo}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm italic">
                      No photos
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col flex-grow justify-between">
                  <div className="space-y-1">
                    <p className="line-clamp-2 break-words text-gray-600 mt-1 h-12">
                      {event.description || "No description provided."}
                    </p>
                    <div className="text-xs pt-2 flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} -{" "}
                        {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event._id}/edit`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(event._id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ---------- Pagination Controls ---------- */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => loadPage(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
              Page <strong>{pagination.page}</strong> of{" "}
              <strong>{pagination.totalPages}</strong>
            </span>

            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => loadPage(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Event?"
        description="This action cannot be undone."
        variant="destructive"
      />
    </ModuleLayout>
  );
}
// return (
//   // <ModuleLayout>
//   //   <Card>
//   //     <CardHeader className="flex flex-row items-center justify-between">
//   //       <CardTitle>Events</CardTitle>
//   //       {canEdit && <Button onClick={() => navigate("/events/create")}>Create Event</Button>}
//   //     </CardHeader>
//   //     <CardContent>
//   //       <Table>
//   //         <TableHeader>
//   //           <TableRow>
//   //             <TableHead>Title</TableHead>
//   //             <TableHead>Start Date</TableHead>
//   //             <TableHead>End Date</TableHead>
//   //             <TableHead>Photos</TableHead>
//   //             {canEdit && <TableHead>Actions</TableHead>}
//   //           </TableRow>
//   //         </TableHeader>
//   //         <TableBody>
//   //           {events.map((event) => (
//   //             <TableRow key={event._id}>
//   //               <TableCell className="font-medium cursor-pointer" onClick={() => navigate(`/events/${event._id}`)}>
//   //                 {event.title}
//   //               </TableCell>
//   //               <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
//   //               <TableCell>{new Date(event.endDate).toLocaleDateString()}</TableCell>
//   //               <TableCell>
//   //                 {event.photos?.length > 0 ? `${event.photos.length} photos` : "None"}
//   //               </TableCell>
//   //               {canEdit && (
//   //                 <TableCell className="flex gap-2">
//   //                   <Button variant="ghost" size="icon" onClick={() => navigate(`/events/${event._id}/edit`)}>
//   //                     <Edit className="h-4 w-4" />
//   //                   </Button>
//   //                   <Button variant="ghost" size="icon" onClick={() => { setDeleteId(event._id); setShowDeleteConfirm(true); }}>
//   //                     <Trash2 className="h-4 w-4" />
//   //                   </Button>
//   //                 </TableCell>
//   //               )}
//   //             </TableRow>
//   //           ))}
//   //         </TableBody>
//   //       </Table>
//   //     </CardContent>
//   //     <ConfirmationDialog
//   //       isOpen={showDeleteConfirm}
//   //       onClose={() => setShowDeleteConfirm(false)}
//   //       onConfirm={handleDelete}
//   //       title="Delete Event?"
//   //       description="This action cannot be undone."
//   //       variant="destructive"
//   //     />
//   //   </Card>
//   // </ModuleLayout>
//   <ModuleLayout>
//     <div className="flex items-center justify-between mb-6">
//       <h1 className="text-2xl font-semibold">Events</h1>
//       {canEdit && (
//         <Button onClick={() => navigate("/events/create")}>Create Event</Button>
//       )}
//     </div>

//     {events.length === 0 ? (
//       <p className="text-center text-gray-500 italic mt-10">
//         No events found.
//       </p>
//     ) : (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {events.map((event) => (
//           <Card
//             key={event._id}
//             className="hover:shadow-lg transition cursor-pointer flex flex-col"
//             onClick={() => navigate(`/events/${event._id}`)}
//           >
//             {/* ✅ Photos Section */}
//             <div className="w-full h-54 overflow-hidden rounded-t-md">
//               {event.photos && event.photos.length > 0 ? (
//                 <div className="grid grid-cols-2 gap-1 p-2">
//                   {event.photos.slice(0, 4).map((photo, idx) => (
//                     <img
//                       key={idx}
//                       src={photo.url || photo}
//                       alt={`Photo ${idx + 1}`}
//                       className="w-full h-24 object-cover rounded-md"
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center h-32 bg-gray-100 text-gray-400 text-sm italic">
//                   No photos available
//                 </div>
//               )}
//             </div>

//             <CardHeader>
//               <CardTitle className="text-xl">{event.title}</CardTitle>
//             </CardHeader>

//             <CardContent className="flex flex-col flex-grow justify-between">
//               <div className="space-y-1">
//                 <p className="line-clamp-2 break-words text-gray-600 mt-1 h-12">
//                   {event.description || "No description provided."}
//                 </p>
//                 <div className="text-xs pt-2 flex items-center text-muted-foreground">
//                   <Calendar className="h-4 w-4 mr-1" />
//                   <span>
//                     {new Date(event.startDate).toLocaleDateString()} -{" "}
//                     {new Date(event.endDate).toLocaleDateString()}
//                   </span>
//                 </div>
//               </div>

//               {canEdit && (
//                 <div className="flex justify-end gap-2 mt-3">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       navigate(`/events/${event._id}/edit`);
//                     }}
//                   >
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setDeleteId(event._id);
//                       setShowDeleteConfirm(true);
//                     }}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     )}

//     <ConfirmationDialog
//       isOpen={showDeleteConfirm}
//       onClose={() => setShowDeleteConfirm(false)}
//       onConfirm={handleDelete}
//       title="Delete Event?"
//       description="This action cannot be undone."
//       variant="destructive"
//     />
//   </ModuleLayout>
// );
// }