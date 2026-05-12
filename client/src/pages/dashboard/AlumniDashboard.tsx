import { useAuth } from '../../context';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { MessageIcon, CalendarIcon, BookIcon } from '../../components/common/svgs';

export function AlumniDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Alumni';

  return (
    <DashboardShell pageTitle="Alumni Portal">
      <div className="page-header">
        <div className="page-eyebrow">Alumni Member</div>
        <h2 className="page-title">Alumni Portal</h2>
        <p className="page-subtitle">
          Stay connected with SCSIT DAVV — browse publications, attend events, and engage with the alumni network.
        </p>
      </div>

      <div className="alert-banner info" role="note">
        <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden>
          <circle cx={12} cy={12} r={10} />
          <path d="M12 8h.01M12 12v4" />
        </svg>
        <span>
          As an alumnus you have <strong>read-only access to the digital library catalog</strong> — physical borrowing is available to current enrolled students and faculty only. Messaging faculty is available only when the faculty member has enabled alumni contact for their profile.
        </span>
      </div>

      <div className="content-grid-65">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }}
            />
            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--space-2)' }}>
              Welcome back
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>
              {firstName}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.75)', marginBottom: 'var(--space-6)' }}>
              {user?.email}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="button" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>
                Edit Profile
              </button>
              <button type="button" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.10)', color: '#fff', borderColor: 'rgba(255,255,255,0.15)' }}>
                Update Resume
              </button>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <span className="widget-title">Upcoming Events</span>
            </div>
            <div className="widget-body">
              <div className="cal-strip" aria-label="Week view">
                <div className="cal-day"><div className="cal-dow">Mon</div><div className="cal-date">10</div><div style={{ height: 5 }} /></div>
                <div className="cal-day"><div className="cal-dow">Tue</div><div className="cal-date">11</div><div style={{ height: 5 }} /></div>
                <div className="cal-day today"><div className="cal-dow">Wed</div><div className="cal-date">12</div><div className="cal-dot" /></div>
                <div className="cal-day"><div className="cal-dow">Thu</div><div className="cal-date">13</div><div style={{ height: 5 }} /></div>
                <div className="cal-day"><div className="cal-dow">Fri</div><div className="cal-date">14</div><div className="cal-dot" /></div>
                <div className="cal-day"><div className="cal-dow">Sat</div><div className="cal-date">15</div><div className="cal-dot" /></div>
                <div className="cal-day"><div className="cal-dow">Sun</div><div className="cal-date">16</div><div style={{ height: 5 }} /></div>
              </div>
              <div className="activity-list" style={{ marginTop: 'var(--space-4)' }}>
                <div className="activity-item">
                  <div className="activity-dot" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                    <CalendarIcon size={14} />
                  </div>
                  <div className="activity-body">
                    <div className="activity-text"><strong>Alumni Connect 2025</strong></div>
                    <div className="activity-time">Mar 15 &bull; SCSIT Auditorium &bull; You RSVP&apos;d</div>
                  </div>
                  <span className="badge badge-success">Confirmed</span>
                </div>
                <div className="activity-item">
                  <div className="activity-dot" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                    <CalendarIcon size={14} />
                  </div>
                  <div className="activity-body">
                    <div className="activity-text"><strong>Cloud Native Workshop</strong></div>
                    <div className="activity-time">Apr 2 &bull; Online &bull; 40 seats left</div>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm">RSVP</button>
                </div>
              </div>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <span className="widget-title">Library Catalog</span>
              <span className="badge badge-neutral" title="Alumni cannot borrow physical books">
                <svg width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                  <rect x={3} y={11} width={18} height={11} rx={2} />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {' '}Read-only
              </span>
            </div>
            <div style={{ margin: 'var(--space-4) var(--space-5) 0', padding: 'var(--space-3) var(--space-4)', background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <rect x={3} y={11} width={18} height={11} rx={2} />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Book borrowing is restricted to enrolled students and faculty. Alumni have catalog browse access only.
            </div>
            <div className="widget-body">
              <div className="list-item">
                <div className="list-item-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                  <BookIcon size={18} />
                </div>
                <div className="list-item-body">
                  <div className="list-item-title">Clean Code — Robert C. Martin</div>
                  <div className="list-item-sub">Software Engineering &bull; ISBN 978-0132350884</div>
                </div>
                <span className="badge badge-success">Available</span>
              </div>
              <div className="list-item">
                <div className="list-item-icon" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                  <BookIcon size={18} />
                </div>
                <div className="list-item-body">
                  <div className="list-item-title">Designing Data-Intensive Applications</div>
                  <div className="list-item-sub">Distributed Systems &bull; ISBN 978-1449373320</div>
                </div>
                <span className="badge badge-warning">2 on loan</span>
              </div>
              <div className="list-item">
                <div className="list-item-icon" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>
                  <BookIcon size={18} />
                </div>
                <div className="list-item-body">
                  <div className="list-item-title">The Pragmatic Programmer</div>
                  <div className="list-item-sub">Software Craft &bull; ISBN 978-0135957059</div>
                </div>
                <span className="badge badge-success">Available</span>
              </div>
            </div>
            <div className="widget-footer">
              <button type="button" className="btn btn-ghost btn-sm">Browse Full Catalog</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-2)', '--kpi-subtle': 'var(--accent-subtle)' } as React.CSSProperties}>
              <div className="kpi-icon-wrap">
                <MessageIcon size={20} />
              </div>
              <div className="kpi-label">Messages</div>
              <div className="kpi-value">2</div>
              <div className="kpi-delta">Received from admin</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-3)', '--kpi-subtle': 'var(--success-subtle)' } as React.CSSProperties}>
              <div className="kpi-icon-wrap">
                <CalendarIcon size={20} />
              </div>
              <div className="kpi-label">Events RSVP&apos;d</div>
              <div className="kpi-value">2</div>
              <div className="kpi-delta">Next: Mar 15</div>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <span className="widget-title">My Inbox</span>
              <span className="badge badge-primary">2 unread</span>
            </div>
            <div className="widget-body">
              <div className="list-item">
                <div className="avatar" style={{ width: 38, height: 38, fontSize: 'var(--text-xs)', background: 'var(--error)' }}>AP</div>
                <div className="list-item-body">
                  <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    Admin Prashant
                    <span className="badge badge-error" style={{ fontSize: '0.58rem' }}>Admin</span>
                  </div>
                  <div className="list-item-sub">Your profile has been verified. Welcome to CRS!</div>
                </div>
                <div className="list-item-meta">1d ago</div>
              </div>
              <div className="list-item">
                <div className="avatar" style={{ width: 38, height: 38, fontSize: 'var(--text-xs)' }}>RS</div>
                <div className="list-item-body">
                  <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    Dr. R. Sharma
                    <span className="badge badge-success" style={{ fontSize: '0.58rem' }}>Contact Open</span>
                  </div>
                  <div className="list-item-sub">Happy to mentor you on your ML path.</div>
                </div>
                <div className="list-item-meta">3d ago</div>
              </div>
            </div>
            <div className="widget-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>You can reply only to faculty with open contact</span>
              <button type="button" className="btn btn-ghost btn-sm">Open Inbox</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
