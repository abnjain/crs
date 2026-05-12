/**
 * ============================================================
 * Conversation sidebar list
 * ============================================================
 */

import type { ConversationSummary } from '../../services/messaging.service';

export interface ConversationListProps {
  items: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase();
}

export function ConversationList({ items, selectedId, onSelect }: ConversationListProps) {
  return (
    <div className="msg-conv-list">
      {items.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`msg-conv-item ${selectedId === c.id ? 'active' : ''}`}
          onClick={() => onSelect(c.id)}
        >
          <div className="msg-conv-item-inner">
            <div className="msg-conv-avatar" aria-hidden="true">
              {getInitials(c.otherParticipant?.name ?? 'U')}
            </div>
            <div className="msg-conv-content">
              <div className="msg-conv-title">
                <span>{c.otherParticipant?.name ?? 'Unknown'}</span>
                {c.unreadCount > 0 && <span className="nav-badge">{c.unreadCount}</span>}
              </div>
              <div className="msg-conv-preview">{c.preview || '—'}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
