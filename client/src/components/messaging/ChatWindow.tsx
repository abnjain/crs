/**
 * ============================================================
 * Chat window — messages + composer
 * ============================================================
 */

import { useEffect, useRef } from 'react';
import type { MessageDTO } from '../../services/messaging.service';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

export interface ChatWindowProps {
  currentUserId: string;
  messages: MessageDTO[];
  disabled?: boolean;
  loading?: boolean;
  typing?: boolean;
  onSend: (text: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onLoadOlder?: () => void;
  hasMore?: boolean;
  // multi-select
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export function ChatWindow({
  currentUserId,
  messages,
  disabled,
  loading,
  typing,
  onSend,
  onTypingStart,
  onTypingStop,
  onLoadOlder,
  hasMore,
  selectable,
  selectedIds,
  onToggleSelect,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const pendingScrollRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);

  const ordered = [...messages].sort(
    (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
  );

  function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }

  function updateAutoScrollState() {
    const el = streamRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScrollRef.current = distance < 80;
  }

  function handleSend(text: string) {
    pendingScrollRef.current = true;
    onSend(text);
  }

  function handleStreamScroll() {
    updateAutoScrollState();
  }

  useEffect(() => {
    if (messages.length === 0) {
      shouldAutoScrollRef.current = true;
      pendingScrollRef.current = false;
      return;
    }

    const shouldScroll = pendingScrollRef.current || shouldAutoScrollRef.current;
    pendingScrollRef.current = false;
    if (!shouldScroll) return;
    requestAnimationFrame(() => scrollToBottom('smooth'));
  }, [messages.length]);

  return (
    <div className="msg-chat">
      {hasMore && (
        <button type="button" className="btn btn-ghost btn-sm msg-load-more" onClick={onLoadOlder}>
          Load older
        </button>
      )}
      <div className="msg-stream" ref={streamRef} onScroll={handleStreamScroll}>
        {loading && <div className="text-muted">Loading…</div>}
        {ordered.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isSelf={m.senderId === currentUserId}
            selectable={selectable}
            selected={selectedIds?.includes(m.id)}
            onToggleSelect={onToggleSelect}
            onLongPress={onToggleSelect ? (id) => {
              // when long-pressed, toggle and ensure selection UI handled by parent
              onToggleSelect(id);
            } : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      {typing && <div className="msg-typing">Typing…</div>}
      <MessageInput
        disabled={disabled}
        onSend={handleSend}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  );
}
