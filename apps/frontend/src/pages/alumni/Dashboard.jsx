import React, { useEffect, useState } from "react";
import api from "@/config/api";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AlumniDashboard() {
    const [alumnus, setAlumnus] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch logged-in alumnus
    const fetchAlumnus = async () => {
        try {
            const user = await api.get("/auth/users/me");
            const res = await api.get(`/alumni/${user.data.user._id}`);
            console.log("Alumnus details fetched successfully:", res.data);
            setAlumnus(res.data);

            // Check mandatory fields
            const mandatoryFields = ["enrollmentNo", "batch", "department", "degree", "graduationYear"];
            const isIncomplete = mandatoryFields.some(field => !res.data[field]);
            if (isIncomplete) navigate("/dashboard/alumni/complete-profile");
        } catch (err) {
            toast.error("Failed to fetch alumni details.");
        }
    };

    // Fetch events
    const fetchEvents = async () => {
        try {
            const res = await api.get("/events");
            setEvents(res.data);
        } catch (err) {
            toast.error("Failed to fetch events.");
        }
    };

    useEffect(() => {
        Promise.all([fetchAlumnus(), fetchEvents()]).finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-center mt-10">Loading...</p>;

    return (
        <>
            <div className="p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {alumnus.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Email:</strong> {alumnus.email}</p>
                        <p><strong>Phone:</strong> {alumnus.phone}</p>
                        <p><strong>Batch:</strong> {alumnus.batch}</p>
                        <p><strong>Department:</strong> {alumnus.department}</p>
                        <p><strong>Current Company:</strong> {alumnus.currentCompany || "Not specified"}</p>
                        <p><strong>Current Role:</strong> {alumnus.currentRole || "Not specified"}</p>
                        <Button className="mt-3" onClick={() => navigate("/alumni/edit")}>
                            Edit Profile
                        </Button>
                    </CardContent>
                </Card>

                <h2 className="text-xl font-semibold">Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((event) => (
                        <Card key={event._id}>
                            <CardHeader>
                                <CardTitle>{event.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{event.description}</p>
                                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                                {event.photos?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {event.photos.map((photo, idx) => (
                                            <img key={idx} src={photo} className="w-24 h-24 object-cover rounded" />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
