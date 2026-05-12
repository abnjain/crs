import { DashboardShell } from '../../components/dashboard/DashboardShell';
import {
  CommunityIcon,
  SearchIcon,
  AlumniIcon,
  CalendarIcon,
  UserXIcon,
  UserCheckIcon,
} from '../../components/common/svgs';

export function HodDashboard() {
  return (
    <DashboardShell pageTitle="Department Overview">
      <div className="page-header">
        <div className="page-eyebrow">Head of Department / Senior Faculty</div>
        <h2 className="page-title">Department Overview</h2>
        <p className="page-subtitle">
          Monitor faculty activity, publications, student interactions, and departmental performance.
        </p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-1)', '--kpi-subtle': 'var(--primary-subtle)' } as React.CSSProperties}>
          <div className="kpi-icon-wrap"><CommunityIcon size={22} /></div>
          <div className="kpi-label">Dept. Faculty</div>
          <div className="kpi-value">18</div>
          <div className="kpi-delta up">2 new this year</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-2)', '--kpi-subtle': 'var(--accent-subtle)' } as React.CSSProperties}>
          <div className="kpi-icon-wrap"><SearchIcon size={22} /></div>
          <div className="kpi-label">Publications</div>
          <div className="kpi-value">47</div>
          <div className="kpi-delta up">+8 this semester</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-3)', '--kpi-subtle': 'var(--success-subtle)' } as React.CSSProperties}>
          <div className="kpi-icon-wrap"><AlumniIcon size={22} /></div>
          <div className="kpi-label">Alumni (Dept.)</div>
          <div className="kpi-value">612</div>
          <div className="kpi-delta up">84% connected</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-4)', '--kpi-subtle': 'var(--warning-subtle)' } as React.CSSProperties}>
          <div className="kpi-icon-wrap"><CalendarIcon size={22} /></div>
          <div className="kpi-label">Dept. Events</div>
          <div className="kpi-value">5</div>
          <div className="kpi-delta">This semester</div>
        </div>
      </div>

      <div className="content-grid-65">
        <div className="widget">
          <div className="widget-header"><span className="widget-title">Faculty Publication Output</span><button type="button" className="btn btn-ghost btn-sm">Export</button></div>
          <div className="widget-body" style={{ padding: 0 }}>
            <table className="tbl">
              <thead><tr><th>Faculty</th><th>Papers</th><th>Downloads</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td className="tbl-name">Dr. R. Sharma</td><td>12</td><td>840</td><td><span className="badge badge-success">Active</span></td></tr>
                <tr><td className="tbl-name">Prof. K. Joshi</td><td>9</td><td>620</td><td><span className="badge badge-success">Active</span></td></tr>
                <tr><td className="tbl-name">Dr. P. Gupta</td><td>7</td><td>510</td><td><span className="badge badge-success">Active</span></td></tr>
                <tr><td className="tbl-name">Dr. A. Mishra</td><td>5</td><td>310</td><td><span className="badge badge-warning">On Leave</span></td></tr>
                <tr><td className="tbl-name">Prof. S. Rao</td><td>4</td><td>280</td><td><span className="badge badge-success">Active</span></td></tr>
              </tbody>
            </table>
          </div>
          <div className="widget-footer"><button type="button" className="btn btn-ghost btn-sm">Full Faculty List</button></div>
        </div>

        <div className="widget">
          <div className="widget-header"><span className="widget-title">Focus Areas</span></div>
          <div className="widget-body">
            <div className="stat-bar-row">
              <div className="stat-bar-item"><div className="stat-bar-header"><span className="stat-bar-label">Machine Learning</span><span className="stat-bar-value">38%</span></div><div className="stat-bar-track"><div className="stat-bar-fill" style={{ width: '38%', background: 'var(--primary)' }} /></div></div>
              <div className="stat-bar-item"><div className="stat-bar-header"><span className="stat-bar-label">Cloud Computing</span><span className="stat-bar-value">24%</span></div><div className="stat-bar-track"><div className="stat-bar-fill" style={{ width: '24%', background: 'var(--accent)' }} /></div></div>
              <div className="stat-bar-item"><div className="stat-bar-header"><span className="stat-bar-label">Cybersecurity</span><span className="stat-bar-value">18%</span></div><div className="stat-bar-track"><div className="stat-bar-fill" style={{ width: '18%', background: 'var(--success)' }} /></div></div>
              <div className="stat-bar-item"><div className="stat-bar-header"><span className="stat-bar-label">Data Engineering</span><span className="stat-bar-value">12%</span></div><div className="stat-bar-track"><div className="stat-bar-fill" style={{ width: '12%', background: 'var(--warning)' }} /></div></div>
              <div className="stat-bar-item"><div className="stat-bar-header"><span className="stat-bar-label">IoT / Embedded</span><span className="stat-bar-value">8%</span></div><div className="stat-bar-track"><div className="stat-bar-fill" style={{ width: '8%', background: 'var(--error)' }} /></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="widget">
        <div className="widget-header"><span className="widget-title">Pending Document Reviews</span><span className="badge badge-warning">3 pending</span></div>
        <div className="widget-body tbl-scroll" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Document</th>
                <th>Submitted By</th>
                <th>Type</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="tbl-name">AI in Education — Review Paper</td>
                <td>Dr. Meena</td>
                <td><span className="badge badge-primary">Publication</span></td>
                <td className="tbl-meta">2 days ago</td>
                <td><div className="tbl-actions"><button type="button" className="btn btn-sm btn-primary btn-icon-label" aria-label="Approve"><UserCheckIcon size={18} /><span className="btn-label">Approve</span></button><button type="button" className="btn btn-sm btn-ghost btn-icon-label" aria-label="Reject"><UserXIcon size={18} /><span className="btn-label">Reject</span></button></div></td>
              </tr>
              <tr>
                <td className="tbl-name">Network Security Lab Manual</td>
                <td>Prof. S. Rao</td>
                <td><span className="badge badge-neutral">Lab Manual</span></td>
                <td className="tbl-meta">4 days ago</td>
                <td><div className="tbl-actions"><button type="button" className="btn btn-sm btn-primary btn-icon-label" aria-label="Approve"><UserCheckIcon size={18} /><span className="btn-label">Approve</span></button><button type="button" className="btn btn-sm btn-ghost btn-icon-label" aria-label="Reject"><UserXIcon size={18} /><span className="btn-label">Reject</span></button></div></td>
              </tr>
              <tr>
                <td className="tbl-name">Cloud Infra Cost Analysis</td>
                <td>Dr. P. Gupta</td>
                <td><span className="badge badge-primary">Publication</span></td>
                <td className="tbl-meta">5 days ago</td>
                <td><div className="tbl-actions"><button type="button" className="btn btn-sm btn-primary btn-icon-label" aria-label="Approve"><UserCheckIcon size={18} /><span className="btn-label">Approve</span></button><button type="button" className="btn btn-sm btn-ghost btn-icon-label" aria-label="Reject"><UserXIcon size={18} /><span className="btn-label">Reject</span></button></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
