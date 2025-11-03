import React, { useEffect, useState } from "react";
import api from "@/config/api";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, Building, Mail, Phone, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function AlumniDashboard() {
    const [alumni, setAlumni] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchAlumni = async () => {
        try {
            const user = await api.get("/auth/users/me");
            const res = await api.get(`/alumni/${user.data.user._id}`);
            setAlumni(res.data.alumni);

            const mandatoryFields = ["enrollmentNo", "batch", "department", "degree", "graduationYear", "currentDesignation"];
            const isIncomplete = mandatoryFields.some(field => !res.data.alumni[field]);
            if (isIncomplete) {
                navigate("/dashboard/alumni/complete-profile", {
                    state: { from: "dashboard", alumniId: user.data.user._id, alumniName: user.data.user.name }
                });
                toast.success("Welcome Alumni! Please Complete the Details", { duration: 5000 });
            } else {
                toast.success("Welcome to Alumni Dashboard!");
            }
        } catch (err) {
            console.error("Error fetching alumni:", err);
            toast.error("Failed to fetch alumni details.");
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await api.get("/events");
            setEvents(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching events:", err);
            toast.error("Failed to fetch events.");
            setEvents([]);
        }
    };

    useEffect(() => {
        Promise.all([fetchAlumni(), fetchEvents()]).finally(() => setLoading(false));
    }, []);

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
        <ModuleLayout>
            <div className="p-6 space-y-6">
                {/* Profile Section */}
                <h2 className="text-xl font-semibold">Profile</h2>
                <Card className="w-full max-w-4xl mx-auto overflow-hidden border border-gray-200 shadow-sm">
                    <div className="relative">
                        <div className="h-24 md:h-32 bg-gradient-to-r from-blue-500/10 to-indigo-600/10" />
                        <div className="absolute -bottom-12 left-6 md:-bottom-16 md:left-8">
                            <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-white shadow-xl">
                                <AvatarImage
                                    src={user.profilePhoto}
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
                                    Welcome, {alumni.name?.split(" ")[0]?.charAt(0).toUpperCase() + alumni.name?.split(" ")[0]?.slice(1).toLowerCase()}
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
                            <div className="space-y-4">
                                <InfoItem icon={Mail} label="Email" value={alumni.email} />
                                <InfoItem icon={Phone} label="Phone" value={alumni.phone || "Not provided"} />
                            </div>
                            <div className="space-y-4">
                                <InfoItem icon={Building} label="Current Company" value={alumni.currentCompany} />
                                <InfoItem icon={Briefcase} label="Current Designation" value={alumni.currentDesignation} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Events Section */}
                <div className="w-full mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="text-xl font-semibold">Events</Label>
                        <Button
                            variant="link"
                            size="sm"
                            className="text-sm"
                            onClick={() => navigate("/dashboard/alumni/events")}
                        >
                            View All
                        </Button>
                    </div>

                    {/* Grid of up to 4 events */}
                    <div className="flex items-center justify-center gap-10 flex-wrap">
                        {events.slice(0, 4).map((event) => (
                            <Card key={event._id} className="border w-1/3 h-72 border-gray-200 shadow-sm flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold text-gray-800 line-clamp-1">
                                        {event.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                                    <p className="text-xs text-gray-700 mb-3">
                                        <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                                    </p>

                                    {/* Show up to 4 photos in a 2x2 grid */}
                                    {event.photos?.length > 0 && (
                                        <div className="grid grid-cols-2 gap-1 mt-2">
                                            {event.photos.slice(0, 4).map((photo, idx) => (
                                                <img
                                                    key={idx}
                                                    src={photo}
                                                    alt={`Event photo ${idx + 1}`}
                                                    className="w-full h-16 object-cover rounded-sm"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </ModuleLayout>
    );
}