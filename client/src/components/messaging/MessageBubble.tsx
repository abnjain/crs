/**
 * ============================================================
 * Message bubble — messaging UI
 * ============================================================
 */

import { useRef } from 'react';
import type { MessageDTO } from '../../services/messaging.service';

export interface MessageBubbleProps {
  message: MessageDTO;
  isSelf: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export function MessageBubble({ message, isSelf, selectable, selected, onToggleSelect, onLongPress }: MessageBubbleProps) {
  const hidden = message.deletedForViewer || (message.isDeleted && !isSelf);
  const body = hidden ? 'Message deleted' : message.content;
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startPress() {
    if (!onLongPress) return;
    pressTimerRef.current = setTimeout(() => onLongPress(message.id), 500);
  }

  function cancelPress() {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  return (
    <div
      className={`msg-bubble-row ${isSelf ? 'msg-self' : 'msg-peer'}`}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
    >
      <div className={`msg-bubble ${isSelf ? 'msg-bubble-self' : 'msg-bubble-peer'}`}>
        {selectable && typeof onToggleSelect === 'function' && (
          <label className="msg-select-checkbox">
            <input
              type="checkbox"
              checked={!!selected}
              onChange={() => onToggleSelect?.(message.id)}
            />
          </label>
        )}
        <div className="msg-body">{body}</div>
        <div className="msg-meta">
          {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}
        </div>
      </div>
    </div>
  );
}
