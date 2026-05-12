/**
 * ============================================================
 * Messages Page — inbox + chat (REST + Socket.IO)
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { useAuth, useMessaging } from '../../context';
import { ConversationList } from '../../components/messaging/ConversationList';
import { ChatWindow } from '../../components/messaging/ChatWindow';
import { NewConversationSearch } from '../../components/messaging/NewConversationSearch';
import { Dialog } from '../../components';
import {
  messagingService,
  type ConversationSummary,
  type MessageDTO,
} from '../../services/messaging.service';

export function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams<{ conversationId?: string }>();
  const { socket, refreshUnread } = useMessaging();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(params.conversationId ?? null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'clear' | 'delete' | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [optIn, setOptIn] = useState(user?.messagingOptIn !== false);

  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await messagingService.listConversations({ limit: 80 });
      setConversations(res.conversations);
      await refreshUnread();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Failed to load conversations');
    }
  }, [refreshUnread]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    setSelectedId(params.conversationId ?? null);
  }, [params.conversationId]);

  useEffect(() => {
    setOptIn(user?.messagingOptIn !== false);
  }, [user?.messagingOptIn]);

  useEffect(() => {
    if (!selectedId || !user?.id) {
      setMessages([]);
      setNextCursor(null);
      setSelectedMessageIds([]);
      return;
    }

    let cancelled = false;
    setLoadingThread(true);
    void (async () => {
      try {
        const first = await messagingService.listMessages(selectedId, { limit: 60 });
        if (cancelled) return;
        setMessages(first.messages);
        setNextCursor(first.nextCursor);
        await messagingService.markConversationRead(selectedId);
        await refreshUnread();
      } catch (err: unknown) {
        const ax = err as { response?: { data?: { message?: string } } };
        toast.error(ax.response?.data?.message ?? 'Failed to load messages');
      } finally {
        if (!cancelled) setLoadingThread(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, user?.id, refreshUnread]);

  useEffect(() => {
    if (!socket || !selectedId) return;

    socket.emit('join_conversation', selectedId);

    const onNew = (payload: MessageDTO & { type?: string }) => {
      if (payload.conversationId !== selectedId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, payload];
      });
      void refreshUnread();
    };

    const onDeleted = (payload: { conversationId?: string; messageId?: string }) => {
      if (payload.conversationId !== selectedId || !payload.messageId) return;
      setMessages((prev) => prev.filter((m) => m.id !== payload.messageId));
    };

    const onTyping = (p: { conversationId?: string; userId?: string; typing?: boolean }) => {
      if (p.conversationId !== selectedId || !p.userId || p.userId === user?.id) return;
      setPeerTyping(!!p.typing);
    };

    socket.on('new_message', onNew);
    socket.on('message_deleted', onDeleted);
    socket.on('typing', onTyping);

    return () => {
      socket.emit('leave_conversation', selectedId);
      socket.off('new_message', onNew);
      socket.off('message_deleted', onDeleted);
      socket.off('typing', onTyping);
    };
  }, [socket, selectedId, user?.id, refreshUnread]);

  const disabledComposer = user?.messagingBanned === true;

  const headerSubtitle = useMemo(() => {
    const sel = conversations.find((c) => c.id === selectedId);
    return sel?.otherParticipant?.email ?? '';
  }, [conversations, selectedId]);

  async function handleSend(text: string) {
    if (!selectedId || disabledComposer) return;
    try {
      await messagingService.sendMessage(selectedId, text);
      await refreshUnread();
      await loadConversations();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Send failed');
    }
  }

  function toggleSelectMessage(id: string) {
    setSelectedMessageIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function performDeleteSelected() {
    if (!selectedMessageIds.length) return;
    try {
      await Promise.all(selectedMessageIds.map((id) => messagingService.deleteMessage(id, true)));
      // remove from local state
      setMessages((prev) => prev.filter((m) => !selectedMessageIds.includes(m.id)));
      setSelectedMessageIds([]);
      toast.success('Deleted selected messages');
    } catch {
      toast.error('Failed to delete selected messages');
    }
  }

  async function performClearConversation() {
    if (!selectedId) return;
    try {
      await messagingService.clearConversation(selectedId);
      setMessages([]);
      setSelectedMessageIds([]);
      toast.success('Conversation cleared');
    } catch {
      toast.error('Failed to clear conversation');
    }
  }

  function emitTypingStart() {
    if (!socket || !selectedId) return;
    socket.emit('typing_start', { conversationId: selectedId });
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: selectedId });
    }, 2500);
  }

  function emitTypingStop() {
    if (!socket || !selectedId) return;
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    socket.emit('typing_stop', { conversationId: selectedId });
  }

  async function handleLoadOlder() {
    if (!selectedId || !nextCursor) return;
    try {
      const older = await messagingService.listMessages(selectedId, {
        limit: 40,
        before: nextCursor,
      });
      setMessages((prev) => [...older.messages, ...prev]);
      setNextCursor(older.nextCursor);
    } catch {
      toast.error('Could not load older messages');
    }
  }

  async function handleStartConversation(userId: string, _userName: string) {
    try {
      const res = await messagingService.createDirectConversation(userId);
      navigate(`/dashboard/messages/${res.conversationId}`);
      await loadConversations();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Could not start conversation');
    }
  }

  async function saveOptIn(next: boolean) {
    setOptIn(next);
    try {
      await messagingService.updateOptIn(next);
      toast.success('Preference saved');
    } catch {
      toast.error('Could not update preference');
      setOptIn(!next);
    }
  }

  function selectConversation(id: string) {
    setSelectedId(id);
    navigate(`/dashboard/messages/${id}`);
  }

  const facultyLike =
    user?.roles.some((r) => ['faculty', 'hod', 'admin', 'superadmin'].includes(r)) ?? false;

  return (
    <DashboardShell pageTitle="Messages">
      <div className="page-header">
        <div className="page-eyebrow">Inbox</div>
        <h2 className="page-title">Messaging</h2>
        <p className="page-subtitle">Direct messages with faculty and administration when permitted by policy.</p>
      </div>

      {user?.messagingBanned && (
        <div className="alert-banner error" role="alert">
          You are banned from messaging. You can still read history where applicable.
        </div>
      )}

      {facultyLike && (
        <div className="card messaging-card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 className="card-title">Alumni contact preference</h3>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => void saveOptIn(e.target.checked)}
            />{' '}
            Allow alumni to message me (subject to site rules)
          </label>
        </div>
      )}

      <div className="msg-layout">
        <aside className="msg-aside card messaging-card">
          <NewConversationSearch onStartConversation={handleStartConversation} />
          <ConversationList
            items={conversations}
            selectedId={selectedId}
            onSelect={(id) => selectConversation(id)}
          />
        </aside>

        <section className="msg-main card messaging-card">
          {selectedId ? (
            <>
              <div className="msg-thread-header">
                <div>
                  <div className="msg-thread-title">
                    {conversations.find((c) => c.id === selectedId)?.otherParticipant?.name ?? 'Conversation'}
                  </div>
                  <div className="text-muted text-sm">{headerSubtitle}</div>
                </div>
                <div className="msg-thread-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setConfirmAction('clear');
                      setConfirmDialogOpen(true);
                    }}
                  >
                    Clear chat
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={selectedMessageIds.length === 0}
                    onClick={() => {
                      setConfirmAction('delete');
                      setConfirmDialogOpen(true);
                    }}
                  >
                    Delete selected
                  </button>
                </div>
              </div>
              <ChatWindow
                currentUserId={user?.id ?? ''}
                messages={messages}
                disabled={disabledComposer}
                loading={loadingThread}
                typing={peerTyping}
                onSend={(t) => void handleSend(t)}
                onTypingStart={emitTypingStart}
                onTypingStop={emitTypingStop}
                onLoadOlder={nextCursor ? () => void handleLoadOlder() : undefined}
                hasMore={Boolean(nextCursor)}
                selectable
                selectedIds={selectedMessageIds}
                onToggleSelect={toggleSelectMessage}
              />
            </>
          ) : (
            <div className="text-muted" style={{ padding: 'var(--space-8)' }}>
              Select a conversation or start a new one by searching for a user above.
            </div>
          )}
        </section>
      </div>
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} title={confirmAction === 'clear' ? 'Clear conversation' : 'Delete selected messages'}>
        <p>
          {confirmAction === 'clear'
            ? 'This will remove the conversation messages for you. The other participant will still retain them unless they clear too. Continue?'
            : `Delete ${selectedMessageIds.length} selected message(s) for you?`}
        </p>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={() => setConfirmDialogOpen(false)}>Cancel</button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => {
              setConfirmDialogOpen(false);
              if (confirmAction === 'clear') await performClearConversation();
              if (confirmAction === 'delete') await performDeleteSelected();
            }}
          >
            Confirm
          </button>
        </div>
      </Dialog>
    </DashboardShell>
  );
}
