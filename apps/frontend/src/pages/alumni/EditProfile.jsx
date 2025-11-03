import React, { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import alumniService from "@/services/alumniService";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function EditProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};
    let { alumniId } = state;
    const { userId } = useAuth();
    const { register, handleSubmit, setValue } = useForm();
    const [loading, setLoading] = useState(true);
    const [alumnusId, setAlumnusId] = useState(null);

    // Fetch alumni data
    useEffect(() => {
        alumniId = alumniId || userId; 
        alumniService.get(alumniId)
            .then(res => {
                const data = res.alumni;
                setAlumnusId(data._id);
                const fields = [
                    "name", "enrollmentNo", "batch", "department", "degree", "specialization", "graduationYear", "currentCompany", "currentRole", "linkedin", "location", "about", "tags"
                ];
                fields.forEach(f => setValue(f, data[f] || ""));
                setLoading(false);
            })
            .catch(() => toast.error("Failed to load profile."));
    }, [setValue]);

    const onSubmit = async (data) => {
        try {
            const response = await alumniService.update(alumnusId, data);
            toast.success(response.message);
            navigate("/alumni/dashboard");
        } catch (err) {
            toast.error(err.message || "Failed");
        }
    };

    if (loading) return <p className="text-center mt-10">Loading...</p>;

    return (
        <>
            <div className="flex justify-center p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg space-y-4">
                    <h2 className="text-2xl font-semibold">Edit Profile</h2>

                    <div className="grid gap-2">
                        <Label>Full Name</Label>
                        <Input {...register("name")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Enrollment Number</Label>
                        <Input {...register("enrollmentNo")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Batch</Label>
                        <Input {...register("batch")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Department</Label>
                        <Input {...register("department")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Degree</Label>
                        <Input {...register("degree")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Specialization</Label>
                        <Input {...register("specialization")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Graduation Year</Label>
                        <Input type="number" {...register("graduationYear")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Current Company</Label>
                        <Input {...register("currentCompany")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Current Role</Label>
                        <Input {...register("currentRole")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>LinkedIn</Label>
                        <Input {...register("linkedin")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Location</Label>
                        <Input {...register("location")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>About</Label>
                        <Input {...register("about")} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Tags (comma separated)</Label>
                        <Input {...register("tags")} />
                    </div>

                    <Button type="submit" className="mt-4 w-full">Update Profile</Button>
                </form>
            </div>
        </>
    );
}
