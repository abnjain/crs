import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import alumniService from "@/services/alumniService";
import Upload from "@/components/shared/Upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AlumniForm from "@/components/alumni/AlumniForm";
import MessageAlumni from "@/components/alumni/MessageAlumni";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import AlumniDetailsDialog from "@/components/alumni/AlumniDetailsDialog";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash, MessageSquare, Eye, Plus } from "lucide-react";
import { ModuleLayout } from "@/components/layout/ModuleLayout";

export default function AlumniList() {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAlumnus, setEditAlumnus] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);

  const isFaculty = user?.roles.some(role => ['Teacher', 'Staff', 'Admin', 'SuperAdmin'].includes(role));

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const data = await alumniService.list();
      setAlumni(data.alumni || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Memoize filtered alumni to prevent unnecessary re-renders
  const filteredAlumni = useMemo(() => {
    return alumni.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.currentRole?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alumni, searchTerm]);

  const handleCreate = async (data) => {
    try {
      const res = await alumniService.create(data);
      setShowCreateDialog(false);
      fetchAlumni();
      toast.success(res.data.message || "Alumnus created!!");
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const handleEdit = (alumnus) => {
    setEditAlumnus(alumnus);
    setShowEditDialog(true);
  };

  const handleUpdate = async (data) => {
    try {
      const res = await alumniService.update(editAlumnus._id, data);
      setShowEditDialog(false);
      setEditAlumnus(null);
      fetchAlumni();
      toast.success(res.data.message || "Alumnus updated!!");
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const handleDelete = async () => {
    try {
      let res = null;
      for (const id of selectedIds) {
        res = await alumniService.remove(id);
      }
      toast.success(res.data.message || "Selected alumni deleted!!");
      setSelectedIds([]);
      fetchAlumni();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
    setShowDeleteConfirm(false);
  };

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleUpload = async (file) => {
    try {
      const res = await alumniService.uploadExcel(file);
      fetchAlumni();
      toast.success(res.data.message || "Excel uploaded!!");
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const handleView = (alumnus) => {
    setSelectedAlumnus(alumnus);
    setShowDetailsDialog(true);
  };

  // Memoize edit alumnus to prevent unnecessary re-renders
  const memoizedEditAlumnus = useMemo(() => editAlumnus, [editAlumnus]);

  return (
    <>
      <ModuleLayout title="Alumni Management" description="Manage and connect with your alumni network.">
        <div className="container mx-auto p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search by name, company, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {isFaculty && (
              <div className="flex flex-wrap gap-2 justify-end items-center">
                {/* Create Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Alumnus
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Create New Alumnus</DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        Fill in the details to create a new alumnus profile
                      </p>
                    </DialogHeader>
                    <AlumniForm onSubmit={handleCreate} isEdit={false} />
                  </DialogContent>
                </Dialog>

                <Upload
                  onUpload={handleUpload}
                  label="Upload Excel"
                  accept=".xlsx,.xls"
                  className="flex items-center gap-2 px-3 py-2   transition-colors rounded-md text-sm"
                />

                <Button
                  onClick={() => setShowMessageDialog(true)}
                  disabled={selectedIds.length === 0}
                  variant={selectedIds.length === 0 ? "outline" : "default"}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message ({selectedIds.length})
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={selectedIds.length === 0}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete ({selectedIds.length})
                </Button>
              </div>
            )}
          </div>

          {/* Selection Info */}
          {isFaculty && selectedIds.length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-md text-sm">
              {selectedIds.length} alumn{selectedIds.length === 1 ? 'us' : 'i'} selected.
              <Button
                variant="link"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="h-auto p-0 ml-2"
              >
                Clear selection
              </Button>
            </div>
          )}

          {/* Alumni Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isFaculty && <TableHead className="w-12">Select</TableHead>}
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Current Role</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Graduation Year</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumni.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isFaculty ? 7 : 6} className="h-24 text-center">
                      {searchTerm ? "No alumni found matching your search." : "No alumni records found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlumni.map((alumnus) => (
                    <TableRow
                      key={alumnus._id}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleView(alumnus)}
                    >
                      {isFaculty && (
                        <TableCell className="w-12">
                          <Checkbox
                            checked={selectedIds.includes(alumnus._id)}
                            onCheckedChange={() => handleSelect(alumnus._id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{alumnus.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="max-w-[150px] truncate">
                          {alumnus.currentRole || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="max-w-[150px] truncate">
                          {alumnus.currentCompany || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {alumnus.graduationYear || "N/A"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {alumnus.department || "N/A"}
                      </TableCell>
                      {isFaculty && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(alumnus);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(alumnus);
                              }}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIds([alumnus._id]);
                                setShowMessageDialog(true);
                              }}
                              title="Message"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIds([alumnus._id]);
                                setShowDeleteConfirm(true);
                              }}
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Edit Alumni Profile</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Update Alumni Information
                </p>
              </DialogHeader>
              <AlumniForm
                onSubmit={handleUpdate}
                defaultValues={memoizedEditAlumnus}
                isEdit={true}
              />
            </DialogContent>
          </Dialog>

          <MessageAlumni
            isOpen={showMessageDialog}
            onClose={() => setShowMessageDialog(false)}
            alumniIds={selectedIds}
          />

          <ConfirmationDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title={`Delete ${selectedIds.length > 1 ? 'Alumni' : 'Alumnus'}?`}
            description={`This will permanently delete ${selectedIds.length} alumn${selectedIds.length === 1 ? 'us' : 'i'} record${selectedIds.length > 1 ? 's' : ''}. This action cannot be undone.`}
            confirmText="Delete"
            variant="destructive"
          />

          <AlumniDetailsDialog
            isOpen={showDetailsDialog}
            onClose={() => setShowDetailsDialog(false)}
            alumnus={selectedAlumnus}
          />
        </div>
      </ModuleLayout>
    </>
  );
}