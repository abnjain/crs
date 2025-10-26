import React, { useEffect, useState } from "react";
import api from "@/config/api";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { replace, useNavigate } from "react-router-dom";
import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, Building, Mail, Phone, User } from "lucide-react";

export default function AlumniDashboard() {
    const [alumni, setAlumni] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch logged-in alumni
    const fetchAlumni = async () => {
        try {
            const user = await api.get("/auth/users/me");
            const res = await api.get(`/alumni/${user.data.user._id}`);
            console.log("Alumni details fetched successfully:", res.data.message);
            setAlumni(res.data.alumni);

            // Check mandatory fields
            const mandatoryFields = ["enrollmentNo", "batch", "department", "degree", "graduationYear", "currentDesignation"];
            const isIncomplete = mandatoryFields.some(field => !res.data.alumni[field]);
            if (isIncomplete) {
                navigate("/dashboard/alumni/complete-profile", { state: { from: "dashboard", alumniId: user.data.user._id, alumniName: user.data.user.name } }, { replace: true });
                toast.success("Welcome Alumni! Please Complete the Details", { duration: 5000 });
            } else toast.success("Welcome to Alumni Dashboard!");
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
        Promise.all([fetchAlumni(), fetchEvents()]).finally(() => setLoading(false));
    }, []);

    // Helper to render info items
    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="font-medium text-gray-800 truncate">{value || "Not specified"}</p>
            </div>
        </div>
    );

    if (loading) return <p className="text-center mt-10">Loading...</p>;

    return (
        <>
            <ModuleLayout>
                <div className="p-6 space-y-6">
                    <Card className="w-full max-w-4xl mx-auto overflow-hidden border border-gray-200 shadow-sm">
                        {/* Header with cover and avatar */}
                        <div className="relative">
                            <div className="h-24 md:h-32 bg-gradient-to-r from-blue-500/10 to-indigo-600/10" />

                            <div className="absolute -bottom-12 left-6 md:-bottom-16 md:left-8">
                                <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-white shadow-xl">
                                    <AvatarImage
                                        src={alumni.profilePhoto}
                                        alt={`${alumni.name}'s profile`}
                                    />
                                    <AvatarFallback className="bg-gray-200">
                                        <User className="h-10 w-10 text-gray-500 md:h-14 md:w-14" />
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>

                        <CardHeader className="pt-14 md:pt-20 pb-4 pl-6 md:pl-8">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">
                                        Welcome, {alumni.name}
                                    </CardTitle>
                                    <p className="text-sm md:text-base text-gray-600 mt-1">
                                        {alumni.department} • Batch {alumni.batch}
                                    </p>
                                </div>
                                <Button
                                    variant="link"
                                    className="h-9 px-4 text-sm md:text-base"
                                    onClick={() => navigate("/dashboard/alumni/edit", {
                                        state: { alumniId: alumni._id }
                                    })}
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="px-6 md:px-8 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Left Column - Contact Info */}
                                <div className="space-y-4">
                                    <InfoItem
                                        icon={Mail}
                                        label="Email"
                                        value={alumni.email}
                                    />
                                    <InfoItem
                                        icon={Phone}
                                        label="Phone"
                                        value={alumni.phone || "Not provided"}
                                    />
                                </div>

                                {/* Right Column - Professional Info */}
                                <div className="space-y-4">
                                    <InfoItem
                                        icon={Building}
                                        label="Current Company"
                                        value={alumni.currentCompany}
                                    />
                                    <InfoItem
                                        icon={Briefcase}
                                        label="Current Designation"
                                        value={alumni.currentDesignation}
                                    />
                                </div>
                            </div>
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
            </ModuleLayout>
        </>
    );
}
