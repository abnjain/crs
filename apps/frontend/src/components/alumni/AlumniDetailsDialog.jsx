import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Briefcase, MapPin, GraduationCap, Calendar, Globe, Mail, Phone, Hash, User, Award, User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function AlumniDetailsDialog({ isOpen, onClose, alumnus, user }) {
  if (!alumnus || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatRange = (startDate, endDate, currentlyWorking) => {
    const start = formatDate(startDate);
    if (currentlyWorking) {
      return `${start} - Present`;
    }
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-col space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            {alumnus.name}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {alumnus.degree} {alumnus.specialization && `(${alumnus.specialization})`}
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <span>{alumnus.department || "N/A"}</span>
            {alumnus.batch && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-xs">Batch: {alumnus.batch}</span>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {/* Profile Overview */}
          <Card>
            <CardHeader className="pb-3 flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5" />
                  Profile Overview
                </CardTitle>
                <CardDescription className="text-sm">
                  Contact and basic information
                </CardDescription>
              </div>
              <div>
                {<Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-white shadow-xl">
                  <AvatarImage
                    src={user.profilePhoto}
                    alt={`${alumnus.name}'s profile`}
                  />
                  <AvatarFallback className="bg-gray-200 text-5xl">
                    {user?.name?.charAt(0) || <User2 className="h-10 w-10 text-gray-500 md:h-14 md:w-14" />}
                  </AvatarFallback>
                </Avatar>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                  {alumnus.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{alumnus.email}</span>
                    </div>
                  )}
                  {alumnus.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{alumnus.phone}</span>
                    </div>
                  )}
                  {alumnus.enrollmentNo && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Enrollment: {alumnus.enrollmentNo}</span>
                    </div>
                  )}
                </div>

                {/* Current Position */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Current Position</h4>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{alumnus.currentRole || "Not specified"}</div>
                      <div className="text-xs text-muted-foreground">{alumnus.currentCompany || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & LinkedIn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {alumnus.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{alumnus.location}</span>
                  </div>
                )}
                {alumnus.linkedin ? (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={alumnus.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      View LinkedIn Profile
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">No LinkedIn profile</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          {alumnus.about && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" />
                  About {alumnus.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap max-w-none">
                  {alumnus.about}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Professional Experiences */}
          {alumnus.experiences && alumnus.experiences.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5" />
                  Professional Experience
                </CardTitle>
                <CardDescription className="text-sm">
                  {alumnus.experiences.length} {alumnus.experiences.length === 1 ? 'role' : 'roles'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {alumnus.experiences.map((exp, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Role & Company */}
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">
                          {exp.role || "Role not specified"}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {exp.company || "Company not specified"}
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          <span>{formatRange(exp.startDate, exp.endDate, exp.currentlyWorking)}</span>
                        </div>

                        {/* Description */}
                        {exp.description && (
                          <p className="text-sm leading-relaxed text-muted-foreground max-w-none">
                            {exp.description}
                          </p>
                        )}
                      </div>

                      {/* Current Position Badge */}
                      {exp.currentlyWorking && (
                        <Badge variant="default" className="self-start mt-1 text-white">
                          Current Position
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Skills & Tags */}
          {alumnus.tags && alumnus.tags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5" />
                  Skills & Expertise
                </CardTitle>
                <CardDescription className="text-sm">
                  {alumnus.tags.length} {alumnus.tags.length === 1 ? 'skill' : 'skills'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {alumnus.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs px-2 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info (if any) */}
          {(alumnus.visibility === "private" || alumnus.createdAt) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hash className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {alumnus.visibility === "private" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Private profile (visible to faculty only)</span>
                  </div>
                )}
                {alumnus.createdAt && (
                  <div className="text-xs text-muted-foreground">
                    Profile created: {new Date(alumnus.createdAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}