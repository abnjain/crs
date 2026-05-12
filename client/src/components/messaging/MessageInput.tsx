/**
 * ============================================================
 * Message composer
 * ============================================================
 */

import { useState } from 'react';
import { FormField } from '../common/FormField';

export interface MessageInputProps {
  disabled?: boolean;
  placeholder?: string;
  onSend: (text: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function MessageInput({
  disabled,
  placeholder = 'Type a message…',
  onSend,
  onTypingStart,
  onTypingStop,
}: MessageInputProps) {
  const [draft, setDraft] = useState('');

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = draft.trim();
    if (!raw || disabled) return;
    onSend(raw);
    setDraft('');
    onTypingStop?.();
  }

  return (
    <form className="msg-input-form" onSubmit={submit}>
      <div className="msg-input-field-wrapper">
        <FormField
          name="msg"
          label=""
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          value={draft}
          onChange={(value) => {
            setDraft(String(value ?? ''));
            onTypingStart?.();
          }}
        />
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={disabled}>
        Send
      </button>
    </form>
  );
}
