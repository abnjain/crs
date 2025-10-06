// src/components/alumni/MessageAlumni.jsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import alumniService from "@/services/alumniService";

export default function MessageAlumni({ isOpen, onClose, alumniIds = [] }) { // alumniIds: array of ids
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      const res = await alumniService.message({ ids: alumniIds, message });
      toast.success(res.data.message || "Message sent!!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {alumniIds.length > 1 ? "Alumnus" : "Selected Alumni"}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSend} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}