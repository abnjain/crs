// src/components/alumni/AlumniCard.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export default function AlumniCard({ alumnus }) {
  return (
    <Link to={`/alumni/${alumnus._id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {alumnus.name}
            <Badge variant="secondary">{alumnus.currentRole}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {alumnus.currentCompany}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {alumnus.location}
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {alumnus.degree} ({alumnus.graduationYear})
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {alumnus.tags?.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}