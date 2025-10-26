// src/components/shared/Upload.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function Upload({
  onUpload,
  accept = ".xlsx,.xls",
  label = "Upload File",
  multiple = false,
  disabled = false,
  className = "",
}) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }
    setIsLoading(true);
    try {
      let res = null;
      if (multiple) {
        res = await onUpload(files);
      } else {
        res = await onUpload(files[0]);
      }
      toast.success(res.data.message || "Uploaded!!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        <label className="block">
          <span className="sr-only">{label}</span>
          <Input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            disabled={disabled || isLoading}
            className="hidden"
            id="file-upload"
          />
          <div className="px-3 py-2 border rounded cursor-pointer hover:bg-muted/50" onClick={() => document.getElementById('file-upload').click()}>
            {files.length > 0 ? `${files.length} file(s) selected` : label}
          </div>
        </label>
        <Button onClick={handleSubmit} disabled={!files.length || isLoading || disabled}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </>
  );
}