import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alumniSchema, defaultAlumniValues } from "@/schemas/alumniSelfSchema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import api from "@/config/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function CompleteProfile() {
    const navigate = useNavigate();
    const [alumni, setAlumni] = useState();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(alumniSchema),
        defaultValues: defaultAlumniValues,
    });
    const [selectedFileName, setSelectedFileName] = useState("Choose a file...");
    const [loading, setLoading] = useState(true);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [photoOption, setPhotoOption] = useState("file");

    useEffect(() => {
        api.get("/auth/users/me")
            .then(res => {
                setAlumni(res.data.user)
                const fields = ["enrollmentNo", "batch", "department", "degree", "specialization", "graduationYear", "currentCompany", "currentRole", "currentDesignation", "linkedin", "location", "about"];
                fields.forEach(f => setValue(f, res.data[f] || ""));
                setLoading(false);
            })
            .catch(() => toast.error("Failed to load data."));
    }, [setValue]);

    const onSubmit = async (data) => {
        try {
            const merge = { ...data, ...alumni }
            data = merge
            const res = await api.patch(`/alumni/${data._id || ""}`, data);
            toast.success(res.data.message || "Profile updated!!");
            navigate("/dashboard/alumni");
        } catch (err) {
            toast.error(err.message || "Failed");
        }
    };

    if (loading) return <p className="text-center mt-10">Loading...</p>;

    return (
        <div className="flex justify-center p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg space-y-4 selection:text-foreground selection:bg-background">
                <h2 className="text-2xl font-semibold">Please Complete Your Profile First</h2>

                {/* Enrollment Number */}
                <div className="grid gap-2">
                    <Label>Enrollment Number <span className="text-[var(--danger-color)]">*</span></Label>
                    <Input {...register("enrollmentNo")} />
                    {errors.enrollmentNo && <p className="text-red-500 text-sm">{errors.enrollmentNo.message}</p>}
                </div>

                {/* Batch */}
                <div className="grid gap-2">
                    <Label>Batch <span className="text-[var(--danger-color)]">*</span></Label>
                    <Input {...register("batch")} />
                    {errors.batch && <p className="text-red-500 text-sm">{errors.batch.message}</p>}
                </div>

                {/* Department */}
                <div className="grid gap-2">
                    <Label>Department <span className="text-[var(--danger-color)]">*</span></Label>
                    <Input {...register("department")} />
                    {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
                </div>

                {/* Degree */}
                <div className="grid gap-2">
                    <Label>Degree <span className="text-[var(--danger-color)]">*</span></Label>
                    <Input {...register("degree")} />
                    {errors.degree && <p className="text-red-500 text-sm">{errors.degree.message}</p>}
                </div>

                {/* Specialization */}
                <div className="grid gap-2">
                    <Label>Specialization</Label>
                    <Input {...register("specialization")} />
                    {errors.specialization && <p className="text-red-500 text-sm">{errors.specialization.message}</p>}
                </div>

                {/* Graduation Year */}
                <div className="grid gap-2">
                    <Label>Graduation Year <span className="text-[var(--danger-color)]">*</span></Label>
                    <Input type="tel" pattern="[0-9]{4}" {...register("graduationYear")} />
                    {errors.graduationYear && <p className="text-red-500 text-sm">{errors.graduationYear.message}</p>}
                </div>

                {/* Current Company */}
                <div className="grid gap-2">
                    <Label>Current Company <span className="text-[var(--danger-color)]">*</span></Label>
                    <Input {...register("currentCompany")} />
                    {errors.currentCompany && <p className="text-red-500 text-sm">{errors.currentCompany.message}</p>}
                </div>

                {/* Current Role */}
                <div className="grid gap-2 w-full">
                    <Label>Current Role <span className="text-[var(--danger-color)]">*</span></Label>
                    <Select onValueChange={(val) => setValue("currentRole", val)} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Employee">Employee</SelectItem>
                            <SelectItem value="Employer (Owner)">Employer (Owner)</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.currentRole && <p className="text-red-500 text-sm">{errors.currentRole.message}</p>}
                </div>

                {/* Current Designation */}
                <div className="grid gap-2">
                    <Label>Current Designation <span className="text-[var(--danger-color)]">*</span></Label>
                    <Input {...register("currentDesignation")} />
                    {errors.currentDesignation && <p className="text-red-500 text-sm">{errors.currentDesignation.message}</p>}
                </div>

                {/* Profile Photo */}
                <div className="grid gap-2">
                    <Label>
                        Your Profile Photo <span className="text-[var(--danger-color)]">*</span>
                    </Label>

                    <div className="flex flex-col gap-2">
                        {/* Option Selector */}
                        <div className="flex gap-4 items-center">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="photoOption"
                                    value="file"
                                    checked={photoOption === "file"}
                                    onChange={() => {
                                        setPhotoOption("file");
                                        setValue("profilePhoto", ""); // reset field
                                        setPreviewSrc(null);
                                    }}
                                />
                                Upload File
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="photoOption"
                                    value="url"
                                    checked={photoOption === "url"}
                                    onChange={() => {
                                        setPhotoOption("url");
                                        setValue("profilePhoto", ""); // reset field
                                        setSelectedFileName("Choose a file...");
                                        setPreviewSrc(null);
                                    }}
                                />
                                Enter URL
                            </label>
                        </div>

                        {/* File Upload */}
                        {photoOption === "file" && (
                            <div className="w-full flex items-center justify-between relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    id="profilePhoto"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setSelectedFileName(file ? file.name : "Choose a file...");

                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () =>
                                                setValue("profilePhoto", reader.result, { shouldValidate: true });
                                            reader.readAsDataURL(file);
                                            setPreviewSrc(URL.createObjectURL(file));
                                        } else {
                                            setPreviewSrc(null);
                                            setValue("profilePhoto", "");
                                        }
                                    }}
                                />
                                <div className="flex w-96 items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white hover:border-primary transition">
                                    <span className="text-gray-500 truncate">{selectedFileName}</span>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("profilePhoto")?.click()}
                                        className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary/80 transition"
                                    >
                                        Browse
                                    </button>
                                </div>

                                {previewSrc && (
                                    <img
                                        src={previewSrc}
                                        alt={selectedFileName}
                                        className="h-20 w-20 object-cover rounded-full border border-gray-300"
                                    />
                                )}

                                {previewSrc ? (
                                    <X
                                        onClick={() => {
                                            setSelectedFileName("Choose a file...");
                                            setPreviewSrc(null);
                                            setValue("profilePhoto", "");
                                        }}
                                    />
                                ) : (
                                    <X className="opacity-0" />
                                )}
                            </div>
                        )}

                        {/* URL Input */}
                        {photoOption === "url" && (
                            <Input
                                type="text"
                                placeholder="Enter image URL"
                                {...register("profilePhoto", { required: true })}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    setValue("profilePhoto", value || "", { shouldValidate: true });
                                    setPreviewSrc(value || null);
                                }}
                            />
                        )}
                    </div>

                    {errors.profilePhoto && (
                        <p className="text-red-500 text-sm">{errors.profilePhoto.message}</p>
                    )}
                </div>



                {/* LinkedIn */}
                <div className="grid gap-2">
                    <Label>LinkedIn <span className="text-[var(--danger-color)]">*</span></Label>
                    <Input {...register("linkedin")} />
                    {errors.linkedin && <p className="text-red-500 text-sm">{errors.linkedin.message}</p>}
                </div>

                {/* Location */}
                <div className="grid gap-2">
                    <Label>Location</Label>
                    <Input {...register("location")} />
                    {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
                </div>

                {/* About */}
                <div className="grid gap-2">
                    <Label>About</Label>
                    <Input {...register("about")} />
                    {errors.about && <p className="text-red-500 text-sm">{errors.about.message}</p>}
                </div>

                <Button type="submit" className="mt-4 w-full">Save Profile</Button>
            </form>
        </div>
    );
}
