/**
 * ============================================================
 * Broadcast composer (admin)
 * ============================================================
 */

import { useState } from 'react';
import { messagingService } from '../../services/messaging.service';
import toast from 'react-hot-toast';

export function BroadcastDialog({ onDone }: { onDone?: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ids, setIds] = useState('');
  const [allAlumni, setAllAlumni] = useState(false);
  const [department, setDepartment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const recipientUserIds = ids
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const hasFilters = allAlumni || !!department.trim();
      if (!recipientUserIds.length && !hasFilters) {
        toast.error('Add recipient IDs or select filters');
        return;
      }
      const res = await messagingService.adminBroadcast({
        title,
        content,
        recipientUserIds: recipientUserIds.length ? recipientUserIds : undefined,
        filters:
          allAlumni || department
            ? {
                allAlumni,
                ...(department ? { department } : {}),
              }
            : undefined,
      });
      toast.success(`Broadcast threads created: ${res.createdThreads}`);
      onDone?.();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Broadcast failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card messaging-card" onSubmit={submit}>
      <h3 className="card-title">Broadcast to alumni</h3>
      <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
        Creates one conversation per recipient (they can reply individually). Leave IDs empty and check “All alumni” or set a department filter.
      </p>
      <label className="form-label">
        Title
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="form-label">
        Message
        <textarea className="input" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
      </label>
      <label className="form-label">
        Recipient user IDs (comma-separated)
        <input className="input" value={ids} onChange={(e) => setIds(e.target.value)} placeholder="Optional if using filters" />
      </label>
      <label className="form-label checkbox-row">
        <input type="checkbox" checked={allAlumni} onChange={(e) => setAllAlumni(e.target.checked)} /> All alumni
      </label>
      <label className="form-label">
        Department filter
        <input className="input" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Optional" />
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        Send broadcast
      </button>
    </form>
  );
}
