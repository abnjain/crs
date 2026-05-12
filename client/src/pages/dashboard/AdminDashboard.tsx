import { DashboardShell } from '../../components/dashboard/DashboardShell';
import {
  CommunityIcon,
  CalendarIcon,
  DocumentIcon,
  BookIcon,
  MessageIcon,
  BarChartIcon,
  UserPlusIcon,
  UploadIcon,
} from '../../components/common/svgs';

export function AdminDashboard() {
  return (
    <DashboardShell pageTitle="Admin Control Panel">
      <div className="page-header">
        <div className="page-eyebrow">Administrator</div>
        <h2 className="page-title">Admin Control Panel</h2>
        <p className="page-subtitle">
          Manage users, content, events, and institutional data across all modules.
        </p>
      </div>

      <div className="quick-actions">
        <div className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <UserPlusIcon size={22} />
          </div>
          <span className="quick-action-label">Add User</span>
        </div>
        <div className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
            <CalendarIcon size={22} />
          </div>
          <span className="quick-action-label">Create Event</span>
        </div>
        <div className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>
            <UploadIcon size={22} />
          </div>
          <span className="quick-action-label">Upload Doc</span>
        </div>
        <div className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}>
            <BookIcon size={22} />
          </div>
          <span className="quick-action-label">Add Book</span>
        </div>
        <div className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--info-subtle)', color: 'var(--info)' }}>
            <MessageIcon size={22} />
          </div>
          <span className="quick-action-label">Message Alumni</span>
        </div>
        <div className="quick-action">
          <div className="quick-action-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <BarChartIcon size={22} />
          </div>
          <span className="quick-action-label">Reports</span>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-1)', '--kpi-subtle': 'var(--primary-subtle)' } as React.CSSProperties}>
          <div className="kpi-icon-wrap">
            <CommunityIcon size={22} />
          </div>
          <div className="kpi-label">Active Users</div>
          <div className="kpi-value">3,612</div>
          <div className="kpi-delta up">98% of registered</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-2)', '--kpi-subtle': 'var(--accent-subtle)' } as React.CSSProperties}>
          <div className="kpi-icon-wrap">
            <CalendarIcon size={22} />
          </div>
          <div className="kpi-label">Events This Month</div>
          <div className="kpi-value">14</div>
          <div className="kpi-delta up">3 upcoming</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-3)', '--kpi-subtle': 'var(--success-subtle)' } as React.CSSProperties}>
          <div className="kpi-icon-wrap">
            <BookIcon size={22} />
          </div>
          <div className="kpi-label">Books Available</div>
          <div className="kpi-value">892</div>
          <div className="kpi-delta">47 on loan</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-4)', '--kpi-subtle': 'var(--warning-subtle)' } as React.CSSProperties}>
          <div className="kpi-icon-wrap">
            <DocumentIcon size={22} />
          </div>
          <div className="kpi-label">Pending Approvals</div>
          <div className="kpi-value">6</div>
          <div className="kpi-delta down">Requires attention</div>
        </div>
      </div>

      <div className="content-grid-2">
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title">User Directory</span>
            <button type="button" className="btn btn-primary btn-sm">Add User</button>
          </div>
          <div className="widget-body" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="tbl-name">Dr. R. Sharma</td>
                  <td><span className="badge badge-accent">Faculty</span></td>
                  <td style={{ fontSize: 'var(--text-xs)' }}>Computer Science</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td className="tbl-name">Priya Mehta</td>
                  <td><span className="badge badge-primary">Alumni</span></td>
                  <td style={{ fontSize: 'var(--text-xs)' }}>MCA 2020</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td className="tbl-name">Prof. K. Joshi</td>
                  <td><span className="badge badge-accent">Faculty</span></td>
                  <td style={{ fontSize: 'var(--text-xs)' }}>IT</td>
                  <td><span className="badge badge-warning">Pending</span></td>
                </tr>
                <tr>
                  <td className="tbl-name">Admin Arun</td>
                  <td><span className="badge badge-error">Admin</span></td>
                  <td style={{ fontSize: 'var(--text-xs)' }}>Administration</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="widget-footer">
            <button type="button" className="btn btn-ghost btn-sm">View All Users</button>
          </div>
        </div>
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title">Upcoming Events</span>
            <button type="button" className="btn btn-outline btn-sm">Create</button>
          </div>
          <div className="widget-body">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                  <CalendarIcon size={14} />
                </div>
                <div className="activity-body">
                  <div className="activity-text"><strong>Alumni Connect 2025</strong> — Annual meetup</div>
                  <div className="activity-time">March 15 &bull; 320 RSVPs</div>
                </div>
                <span className="badge badge-success">Open</span>
              </div>
              <div className="activity-item">
                <div className="activity-dot" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                  <CalendarIcon size={14} />
                </div>
                <div className="activity-body">
                  <div className="activity-text"><strong>Department Symposium</strong> — CS Dept.</div>
                  <div className="activity-time">March 22 &bull; 85 RSVPs</div>
                </div>
                <span className="badge badge-warning">Draft</span>
              </div>
              <div className="activity-item">
                <div className="activity-dot" style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>
                  <CalendarIcon size={14} />
                </div>
                <div className="activity-body">
                  <div className="activity-text"><strong>Workshop: Cloud Native</strong> — SCSIT Lab</div>
                  <div className="activity-time">April 2 &bull; 40 seats left</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
