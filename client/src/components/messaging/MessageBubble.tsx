/**
 * ============================================================
 * Message bubble — messaging UI
 * ============================================================
 */

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
  // long press handling
  let timer: ReturnType<typeof setTimeout> | null = null;
  function startPress() {
    if (!onLongPress) return;
    timer = setTimeout(() => onLongPress(message.id), 500);
  }
  function cancelPress() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
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
