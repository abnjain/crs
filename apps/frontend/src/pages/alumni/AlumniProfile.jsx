import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import alumniService from "@/services/alumniService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import AlumniForm from "@/components/alumni/AlumniForm.jsx";
import MessageAlumni from "@/components/alumni/MessageAlumni";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import toast from "react-hot-toast";
import { Briefcase, MapPin, GraduationCap, Calendar, Globe } from "lucide-react";

export default function AlumniProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alumnus, setAlumnus] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isFaculty = user?.roles.some(role => ['Teacher', 'Staff', 'Admin', 'SuperAdmin'].includes(role));

  useEffect(() => {
    fetchAlumnus();
  }, [id]);

  const fetchAlumnus = async () => {
    try {
      const data = await alumniService.get(id);
      setAlumnus(data.alumnus);
    } catch (err) {
      toast.error(err.message);
      navigate("/alumni");
    }
  };

  const handleUpdate = async (data) => {
    await alumniService.update(id, data);
    setShowEditDialog(false);
    fetchAlumnus();
  };

  const handleDelete = async () => {
    try {
      const res = await alumniService.remove(id);
      toast.success(res.data.message || "Deleted successfully");
      navigate("/alumni");
    } catch (err) {
      toast.error(err.message || "Failed");
    }
    setShowDeleteConfirm(false);
  };

  if (!alumnus) return <div>Loading...</div>;

  return (
    <>
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader className="flex justify-between items-start">
            <CardTitle>{alumnus.name}</CardTitle>
            {isFaculty && (
              <div className="flex gap-2">
                <Button onClick={() => setShowEditDialog(true)}>Edit</Button>
                <Button onClick={() => setShowMessageDialog(true)}>Message</Button>
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {alumnus.degree} in {alumnus.specialization} ({alumnus.graduationYear})
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {alumnus.currentRole} at {alumnus.currentCompany}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {alumnus.location}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <a href={alumnus.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  LinkedIn Profile
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p>{alumnus.about}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Experiences</h3>
              {alumnus.experiences?.map((exp, idx) => (
                <Card key={idx} className="mb-2">
                  <CardContent className="pt-4">
                    <div className="font-medium">{exp.role} at {exp.company}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(exp.startDate).toLocaleDateString()} - {exp.currentlyWorking ? "Present" : new Date(exp.endDate).toLocaleDateString()}
                    </div>
                    <p className="mt-2">{exp.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {alumnus.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <AlumniForm onSubmit={handleUpdate} defaultValues={alumnus} isEdit={true} />
        </Dialog>

        <MessageAlumni
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
          alumniIds={[id]}
        />

        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Alumnus?"
          description="This will permanently delete this alumnus record."
        />
      </div>
    </>
  );
}