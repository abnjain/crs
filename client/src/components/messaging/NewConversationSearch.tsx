/**
 * ============================================================
 * New Conversation search — search by name, pick user, start DM
 * ============================================================
 */

import { useState, useRef, useEffect } from 'react';
import { FormField } from '../common/FormField';
import { messagingService, type SearchUserResult } from '../../services/messaging.service';

interface NewConversationSearchProps {
  onStartConversation: (userId: string, userName: string) => void;
}

export function NewConversationSearch({ onStartConversation }: NewConversationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(SearchUserResult & { canMessage?: boolean; reason?: string })[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(value: string | number | boolean | FileList | null) {
    const q = String(value ?? '');
    setQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await messagingService.searchUsers(q);
        setResults(users);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function handleSelect(user: SearchUserResult) {
    setQuery('');
    setResults([]);
    setOpen(false);
    onStartConversation(user.id, user.name);
  }

  return (
    <div className="new-conv-search" ref={wrapperRef}>
      <FormField
        name="userSearch"
        label="Find user to message"
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Search by name…"
        className="new-conv-search-field"
      />
      {open && results.length > 0 && (
        <ul className="new-conv-dropdown" role="listbox">
          {results.map((u) => (
            <li key={u.id} className="new-conv-option" role="option">
              <button
                type="button"
                className={`new-conv-option-btn${u.canMessage === false ? ' disabled' : ''}`}
                onClick={() => u.canMessage === false ? undefined : handleSelect(u)}
                disabled={u.canMessage === false}
                aria-disabled={u.canMessage === false}
              >
                <div className="new-conv-avatar" aria-hidden="true">
                  {getInitials(u.name)}
                </div>
                <div className="new-conv-user-info">
                  <span className="new-conv-user-name">{u.name}</span>
                  <span className="new-conv-user-email">{u.email}</span>
                  {u.canMessage === false && (
                    <div className="new-conv-disabled-reason text-muted">{u.reason ?? 'Not allowed'}</div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && !searching && (
        <div className="new-conv-dropdown new-conv-no-results">
          No users found for &ldquo;{query}&rdquo;
        </div>
      )}
      {searching && open && (
        <div className="new-conv-dropdown new-conv-loading">
          Searching…
        </div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase();
}
