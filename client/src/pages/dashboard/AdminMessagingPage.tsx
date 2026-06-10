/**
 * ============================================================
 * Admin Messaging — oversight, broadcast, stats
 * ============================================================
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { BroadcastDialog } from '../../components/messaging/BroadcastDialog';
import { messagingService, type AdminConversationRow } from '../../services/messaging.service';

export function AdminMessagingPage() {
  const [tab, setTab] = useState<'stats' | 'threads' | 'broadcast'>('stats');
  const [stats, setStats] = useState<{
    conversationCount: number;
    messageCount: number;
    bannedUsers: number;
    messagesLast24h: number;
  } | null>(null);
  const [threads, setThreads] = useState<AdminConversationRow[]>([]);
  const [q, setQ] = useState('');
  const qRef = useRef(q);
  qRef.current = q;
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const s = await messagingService.adminStats();
      setStats(s);
    } catch {
      toast.error('Failed to load stats');
    }
  }, []);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await messagingService.adminListConversations({
        q: qRef.current.trim() || undefined,
        limit: 50,
      });
      setThreads(res.conversations);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (tab === 'threads') void loadThreads();
  }, [tab, loadThreads]);

  return (
    <DashboardShell pageTitle="Messaging admin">
      <div className="page-header">
        <div className="page-eyebrow">Administration</div>
        <h2 className="page-title">Messaging oversight</h2>
        <p className="page-subtitle">Monitor threads, broadcast to alumni groups, and review traffic.</p>
      </div>

      <div className="tabs-row" style={{ marginBottom: 'var(--space-6)', gap: 'var(--space-2)', display: 'flex' }}>
        {(['stats', 'threads', 'broadcast'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t)}
          >
            {t === 'stats' ? 'Stats' : t === 'threads' ? 'Threads' : 'Broadcast'}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="content-grid-65">
          <div className="card messaging-card">
            <h3 className="card-title">Overview</h3>
            <ul className="text-muted" style={{ lineHeight: 1.8 }}>
              <li>Conversations: {stats.conversationCount}</li>
              <li>Messages (non-deleted): {stats.messageCount}</li>
              <li>Messages last 24h: {stats.messagesLast24h}</li>
              <li>Users banned from messaging: {stats.bannedUsers}</li>
            </ul>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void loadStats()}>
              Refresh
            </button>
          </div>
        </div>
      )}

      {tab === 'threads' && (
        <div className="card messaging-card">
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <input
              className="input"
              placeholder="Search name or email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="button" className="btn btn-primary" onClick={() => void loadThreads()} disabled={loading}>
              Search
            </button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Participants</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {threads.map((t) => (
                  <tr key={t.id}>
                    <td>{t.preview}</td>
                    <td>
                      {t.participants.map((p) => (
                        <div key={p.id}>
                          {p.name} ({p.email}){p.messagingBanned ? ' · banned' : ''}
                        </div>
                      ))}
                    </td>
                    <td>{t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'broadcast' && (
        <BroadcastDialog onDone={() => void loadStats()} />
      )}
    </DashboardShell>
  );
}
