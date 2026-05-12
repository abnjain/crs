/**
 * ============================================================
 * Ban / unban user from messaging (admin)
 * ============================================================
 */

import { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { messagingService } from '../../services/messaging.service';
import toast from 'react-hot-toast';

export interface MessagingBanDialogProps {
  open: boolean;
  userId: string;
  userLabel: string;
  currentlyBanned: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function MessagingBanDialog({
  open,
  userId,
  userLabel,
  currentlyBanned,
  onClose,
  onSaved,
}: MessagingBanDialogProps) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!userId?.trim()) {
      toast.error('Invalid user');
      return;
    }
    setBusy(true);
    try {
      await messagingService.adminBanUser(userId, !currentlyBanned, reason.trim() || undefined);
      toast.success(currentlyBanned ? 'Messaging unbanned' : 'User banned from messaging');
      onSaved?.();
      onClose();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={currentlyBanned ? 'Unban messaging' : 'Ban from messaging'}>
      <p style={{ marginBottom: 'var(--space-3)' }}>{userLabel}</p>
      {!currentlyBanned && (
        <label className="form-label">
          Reason (optional)
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={busy}>
          {currentlyBanned ? 'Unban' : 'Ban'}
        </button>
      </div>
    </Dialog>
  );
}
