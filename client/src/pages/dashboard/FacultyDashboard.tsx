import { useState } from 'react';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import {
  DocumentIcon,
  MessageIcon,
  CommunityIcon,
  CalendarIcon,
  UploadIcon,
} from '../../components/common/svgs';
import { useAuth } from '../../context';

export function FacultyDashboard() {
  const { user } = useAuth();
  const [alumniContactOn, setAlumniContactOn] = useState(true);
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'RS';

  return (
    <DashboardShell pageTitle="My Academic Portal">
      <div className="page-header">
        <div className="page-eyebrow">Faculty Member</div>
        <h2 className="page-title">My Academic Portal</h2>
        <p className="page-subtitle">
          Manage your publications, alumni interactions, and event participation.
        </p>
      </div>

      <div className="content-grid-65">
        <div>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 'var(--space-6)' }}>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-1)', '--kpi-subtle': 'var(--primary-subtle)' } as React.CSSProperties}>
              <div className="kpi-icon-wrap">
                <DocumentIcon size={20} />
              </div>
              <div className="kpi-label">My Papers</div>
              <div className="kpi-value">12</div>
              <div className="kpi-delta up">840 downloads</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-2)', '--kpi-subtle': 'var(--accent-subtle)' } as React.CSSProperties}>
              <div className="kpi-icon-wrap">
                <MessageIcon size={20} />
              </div>
              <div className="kpi-label">Messages</div>
              <div className="kpi-value">7</div>
              <div className="kpi-delta">Unread inbox</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-3)', '--kpi-subtle': 'var(--success-subtle)' } as React.CSSProperties}>
              <div className="kpi-icon-wrap">
                <CommunityIcon size={20} />
              </div>
              <div className="kpi-label">Alumni I mentor</div>
              <div className="kpi-value">24</div>
              <div className="kpi-delta up">3 active chats</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-4)', '--kpi-subtle': 'var(--warning-subtle)' } as React.CSSProperties}>
              <div className="kpi-icon-wrap">
                <CalendarIcon size={20} />
              </div>
              <div className="kpi-label">Events RSVP&apos;d</div>
              <div className="kpi-value">3</div>
              <div className="kpi-delta">Next: Mar 15</div>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <span className="widget-title">Upload Document</span>
            </div>
            <div className="widget-body">
              <div
                style={{
                  border: '2px dashed var(--border-base)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <UploadIcon size={32} />
                </div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                  Drop file here or click to browse
                </p>
                <p style={{ fontSize: 'var(--text-xs)', marginTop: '4px' }}>
                  Max 10 MB &bull; PDF, DOC, DOCX
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  Upload Document
                </button>
                <button type="button" className="btn btn-ghost btn-sm">
                  My Documents
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="profile-card">
            <div className="profile-cover">
              <div className="profile-cover-stripe" />
            </div>
            <div className="profile-body">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-name">{user?.name ?? 'Dr. Rajesh Sharma'}</div>
              <div className="profile-role">Associate Professor &bull; Computer Science</div>
              <div className="profile-stats">
                <div>
                  <div className="profile-stat-val">12</div>
                  <div className="profile-stat-label">Papers</div>
                </div>
                <div>
                  <div className="profile-stat-val">24</div>
                  <div className="profile-stat-label">Alumni</div>
                </div>
                <div>
                  <div className="profile-stat-val">840</div>
                  <div className="profile-stat-label">Downloads</div>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                      Alumni Contact
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                      Allow alumni to initiate messages to you
                    </div>
                  </div>
                  <label
                    style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                    aria-label="Toggle alumni contact permission"
                  >
                    <input
                      type="checkbox"
                      checked={alumniContactOn}
                      onChange={(e) => setAlumniContactOn(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                    <span
                      style={{
                        display: 'block',
                        width: 44,
                        height: 24,
                        background: alumniContactOn ? 'var(--success)' : 'var(--bg-muted)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'background 200ms ease',
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 3,
                          left: alumniContactOn ? 23 : 3,
                          width: 18,
                          height: 18,
                          background: '#fff',
                          borderRadius: '50%',
                          transition: 'left 200ms ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </span>
                  </label>
                </div>
                {alumniContactOn && (
                  <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Alumni can currently message you directly
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <span className="widget-title">Recent Messages</span>
              <span className="badge badge-error">7 new</span>
            </div>
            <div className="widget-body">
              <div className="list-item">
                <div className="avatar" style={{ width: 34, height: 34, fontSize: 'var(--text-xs)' }}>PM</div>
                <div className="list-item-body">
                  <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    Priya Mehta <span className="badge badge-primary" style={{ fontSize: '0.55rem' }}>Alumni</span>
                  </div>
                  <div className="list-item-sub">Regarding mentorship opportunity...</div>
                </div>
                <div className="list-item-meta">2h ago</div>
              </div>
              <div className="list-item">
                <div className="avatar" style={{ width: 34, height: 34, fontSize: 'var(--text-xs)', background: 'var(--accent)' }}>AJ</div>
                <div className="list-item-body">
                  <div className="list-item-title">Ankit Jain</div>
                  <div className="list-item-sub">Paper collaboration request</div>
                </div>
                <div className="list-item-meta">1d ago</div>
              </div>
              <div className="list-item">
                <div className="avatar" style={{ width: 34, height: 34, fontSize: 'var(--text-xs)', background: 'var(--success)' }}>NG</div>
                <div className="list-item-body">
                  <div className="list-item-title">Neha Gupta</div>
                  <div className="list-item-sub">Thank you for the recommendation!</div>
                </div>
                <div className="list-item-meta">3d ago</div>
              </div>
            </div>
            <div className="widget-footer">
              <button type="button" className="btn btn-ghost btn-sm">Open Inbox</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
