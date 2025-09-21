import React, { useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { alumniSchema, transformData, initializeForm } from "@/schemas/alumniSchema.js";

export default function AlumniForm({ onSubmit, defaultValues = {}, isEdit = false }) {
  // Use ref to track if we've already initialized the form
  const hasInitialized = useRef(false);
  const isEditRef = useRef(isEdit);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isEdit ? alumniSchema.partial().extend({ 
      name: alumniSchema.shape.name // Keep name required for edit too
    }) : alumniSchema),
    defaultValues: initializeForm(defaultValues),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences",
  });

  // Fixed useEffect to prevent infinite loop
  useEffect(() => {
    // Only run initialization once or when switching between create/edit modes
    if (!hasInitialized.current || isEditRef.current !== isEdit) {
      hasInitialized.current = true;
      isEditRef.current = isEdit;
      
      const safeDefaults = initializeForm(defaultValues);
      reset(safeDefaults);
    }
  }, [defaultValues, isEdit, reset]);

  const submitHandler = async (data) => {
    try {
      // Transform data before submitting
      const transformedData = transformData(data);
      
      // Call the onSubmit callback with transformed data
      await onSubmit(transformedData);
      
      toast.success(isEdit ? "Alumnus updated successfully!" : "Alumnus created successfully!");
      
      // Optionally reset form after successful submission (for create mode)
      if (!isEdit) {
        reset(initializeForm({})); // Reset to empty form for new creation
      }
    } catch (err) {
      console.error("Form submission error:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "An unexpected error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Basic Information - 2 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Name Field */}
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input 
            id="name" 
            placeholder="Enter full name (e.g., John Doe)" 
            className="mt-1"
            {...register("name")} 
          />
          {errors.name && (
            <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-sm font-medium">Email Address<span className="text-destructive">*</span></Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="john.doe@example.com" 
            className="mt-1"
            {...register("email")} 
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium">Phone Number<span className="text-destructive">*</span></Label>
          <Input 
            id="phone" 
            placeholder="+1 (555) 123-4567" 
            className="mt-1"
            {...register("phone")} 
          />
          {errors.phone && (
            <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Enrollment Number */}
        <div>
          <Label htmlFor="enrollmentNo" className="text-sm font-medium">Enrollment Number<span className="text-destructive">*</span></Label>
          <Input 
            id="enrollmentNo" 
            placeholder="e.g., CS001" 
            className="mt-1"
            {...register("enrollmentNo")} 
          />
          {errors.enrollmentNo && (
            <p className="text-destructive text-xs mt-1">{errors.enrollmentNo.message}</p>
          )}
        </div>

        {/* Batch */}
        <div>
          <Label htmlFor="batch" className="text-sm font-medium">Batch<span className="text-destructive">*</span></Label>
          <Input 
            id="batch" 
            placeholder="e.g., 2018-2022" 
            className="mt-1"
            {...register("batch")} 
          />
          {errors.batch && (
            <p className="text-destructive text-xs mt-1">{errors.batch.message}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <Label htmlFor="department" className="text-sm font-medium">Department<span className="text-destructive">*</span></Label>
          <Input 
            id="department" 
            placeholder="e.g., Computer Science" 
            className="mt-1"
            {...register("department")} 
          />
          {errors.department && (
            <p className="text-destructive text-xs mt-1">{errors.department.message}</p>
          )}
        </div>

        {/* Degree */}
        <div>
          <Label htmlFor="degree" className="text-sm font-medium">Degree<span className="text-destructive">*</span></Label>
          <Input 
            id="degree" 
            placeholder="e.g., B.Tech, M.Sc." 
            className="mt-1"
            {...register("degree")} 
          />
          {errors.degree && (
            <p className="text-destructive text-xs mt-1">{errors.degree.message}</p>
          )}
        </div>

        {/* Specialization */}
        <div>
          <Label htmlFor="specialization" className="text-sm font-medium">Specialization<span className="text-destructive">*</span></Label>
          <Input 
            id="specialization" 
            placeholder="e.g., Software Engineering" 
            className="mt-1"
            {...register("specialization")} 
          />
          {errors.specialization && (
            <p className="text-destructive text-xs mt-1">{errors.specialization.message}</p>
          )}
        </div>

        {/* Graduation Year */}
        <div>
          <Label htmlFor="graduationYear" className="text-sm font-medium">Graduation Year<span className="text-destructive">*</span></Label>
          <Input 
            id="graduationYear" 
            type="number" 
            placeholder="e.g., 2022"
            min="1900" 
            max={new Date().getFullYear() + 5}
            className="mt-1"
            {...register("graduationYear", { valueAsNumber: true })} 
          />
          {errors.graduationYear && (
            <p className="text-destructive text-xs mt-1">{errors.graduationYear.message}</p>
          )}
        </div>

        {/* Current Company */}
        <div>
          <Label htmlFor="currentCompany" className="text-sm font-medium">Current Company<span className="text-destructive">*</span></Label>
          <Input 
            id="currentCompany" 
            placeholder="Current employer" 
            className="mt-1"
            {...register("currentCompany")} 
          />
          {errors.currentCompany && (
            <p className="text-destructive text-xs mt-1">{errors.currentCompany.message}</p>
          )}
        </div>

        {/* Current Role */}
        <div>
          <Label htmlFor="currentRole" className="text-sm font-medium">Current Role<span className="text-destructive">*</span></Label>
          <Input 
            id="currentRole" 
            placeholder="Current job title" 
            className="mt-1"
            {...register("currentRole")} 
          />
          {errors.currentRole && (
            <p className="text-destructive text-xs mt-1">{errors.currentRole.message}</p>
          )}
        </div>

        {/* LinkedIn */}
        <div>
          <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn Profile<span className="text-destructive">*</span></Label>
          <Input 
            id="linkedin" 
            placeholder="https://linkedin.com/in/username" 
            className="mt-1"
            {...register("linkedin")} 
          />
          {errors.linkedin && (
            <p className="text-destructive text-xs mt-1">{errors.linkedin.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location" className="text-sm font-medium">Location<span className="text-destructive">*</span></Label>
          <Input 
            id="location" 
            placeholder="Current city, country" 
            className="mt-1"
            {...register("location")} 
          />
          {errors.location && (
            <p className="text-destructive text-xs mt-1">{errors.location.message}</p>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-2">
        <Label htmlFor="about" className="text-sm font-medium">About</Label>
        <Textarea 
          id="about" 
          placeholder="Tell us about your professional journey, achievements, and current interests..." 
          rows={4}
          className="mt-1"
          {...register("about")} 
        />
        {errors.about && (
          <p className="text-destructive text-xs">{errors.about.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Share your story - what you've accomplished since graduation and where you're headed next.
        </p>
      </div>

      {/* Experiences Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Professional Experiences<span className="text-destructive">*</span></Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => append({ 
              company: "", 
              role: "", 
              startDate: null, 
              endDate: null, 
              currentlyWorking: false, 
              description: "" 
            })}
          >
            + Add Experience
          </Button>
        </div>
        
        {fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">No experiences added yet. Click "Add Experience" to start.</p>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="space-y-3 border p-4 rounded-lg bg-card/50">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm">Experience {index + 1}</h4>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`experiences.${index}.company`} className="text-sm font-medium">
                    Company/Organization
                  </Label>
                  <Input 
                    id={`experiences.${index}.company`}
                    placeholder="e.g., Google, Microsoft" 
                    className="mt-1"
                    {...register(`experiences.${index}.company`)} 
                  />
                  {errors.experiences?.[index]?.company && (
                    <p className="text-destructive text-xs mt-1">{errors.experiences[index].company.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`experiences.${index}.role`} className="text-sm font-medium">
                    Job Title
                  </Label>
                  <Input 
                    id={`experiences.${index}.role`}
                    placeholder="e.g., Software Engineer" 
                    className="mt-1"
                    {...register(`experiences.${index}.role`)} 
                  />
                  {errors.experiences?.[index]?.role && (
                    <p className="text-destructive text-xs mt-1">{errors.experiences[index].role.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`experiences.${index}.startDate`} className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Input 
                    id={`experiences.${index}.startDate`}
                    type="date" 
                    className="mt-1"
                    {...register(`experiences.${index}.startDate`, { valueAsDate: true })} 
                  />
                  {errors.experiences?.[index]?.startDate && (
                    <p className="text-destructive text-xs mt-1">{errors.experiences[index].startDate.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`experiences.${index}.endDate`} className="text-sm font-medium">
                    End Date
                  </Label>
                  <Input 
                    id={`experiences.${index}.endDate`}
                    type="date" 
                    className="mt-1"
                    {...register(`experiences.${index}.endDate`, { valueAsDate: true })} 
                  />
                  {errors.experiences?.[index]?.endDate && (
                    <p className="text-destructive text-xs mt-1">{errors.experiences[index].endDate.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id={`experiences.${index}.currentlyWorking`} 
                  {...register(`experiences.${index}.currentlyWorking`)} 
                />
                <Label 
                  htmlFor={`experiences.${index}.currentlyWorking`} 
                  className="text-sm font-medium cursor-pointer"
                >
                  Currently working here
                </Label>
              </div>
              
              <div>
                <Label htmlFor={`experiences.${index}.description`} className="text-sm font-medium">
                  Description
                </Label>
                <Textarea 
                  id={`experiences.${index}.description`}
                  placeholder="Describe your role, key responsibilities, and major achievements..." 
                  rows={3}
                  className="mt-1"
                  {...register(`experiences.${index}.description`)} 
                />
                {errors.experiences?.[index]?.description && (
                  <p className="text-destructive text-xs mt-1">{errors.experiences[index].description.message}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tags Section */}
      <div className="space-y-2">
        <Label htmlFor="tags" className="text-sm font-medium">
          Skills & Tags<span className="text-destructive">*</span>
        </Label>
        <Input 
          id="tags" 
          placeholder="e.g., JavaScript, React, Node.js, Full Stack Development, Leadership" 
          className="mt-1"
          {...register("tags")} 
        />
        <p className="text-xs text-muted-foreground">
          Separate multiple skills/tags with commas (max 20)
        </p>
        {errors.tags && (
          <p className="text-destructive text-xs mt-1">{errors.tags.message}</p>
        )}
      </div>

      {/* Visibility Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Profile Visibility<span className="text-destructive">*</span></Label>
        <Select {...register("visibility")} defaultValue="public">
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public (visible to all users)</SelectItem>
            <SelectItem value="private">Private (visible to faculty only)</SelectItem>
          </SelectContent>
        </Select>
        {errors.visibility && (
          <p className="text-destructive text-xs mt-1">{errors.visibility.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-center gap-3 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => reset(initializeForm({}))}
          className="px-6"
        >
          Reset Form
        </Button>
        <Button 
          type="submit" 
          className="px-8 bg-primary hover:bg-primary/90"
          onClick={handleSubmit(submitHandler)}
        >
          {isEdit ? "Update Alumni" : "Create Alumni"}
        </Button>
      </div>
    </div>
  );
}