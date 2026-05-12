import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { DataListing } from '../../components/common/DataListing';
import type { ListingColumn } from '../../components/common/DataListing';
import { CommunityIcon, AlumniIcon, CalendarIcon } from '../../components/common/svgs';
import { reportsService } from '../../services/reports.service';
import type { SummaryReportResponse } from '../../services/reports.service';
import {
  eventsListingForStatus,
  eventsListingForType,
  usersListingAlumniDepartment,
  usersListingAlumniGradYear,
  usersListingAlumniScope,
  usersListingAlumniVerification,
  usersListingForRole,
} from '../../lib/dashboardListSearchParams';
import toast from 'react-hot-toast';

const USERS_LIST = '/dashboard/users';
const EVENTS_LIST = '/dashboard/events';

/** Matches `listing.css` — single-line header on Reports (minimal toolbar). */
const REPORT_LISTING_CLASS = 'data-listing--inline-header';

type PairRow = { key: string; label: string; count: number; explorePath: string } & Record<string, unknown>;

const countColumn: ListingColumn<PairRow> = {
  key: 'count',
  header: 'Count',
  minWidth: '90px',
  render: (row) => <span className="badge badge-neutral">{row.count}</span>,
};

function labelColumn(header: string, minWidth: string): ListingColumn<PairRow> {
  return {
    key: 'label',
    header,
    minWidth,
    render: (row) => <span className="tbl-name">{row.label}</span>,
  };
}

export function ReportsPage() {
  const navigate = useNavigate();
  const handleReportRowNavigate = useCallback((row: PairRow) => {
    void navigate(row.explorePath);
  }, [navigate]);

  const [data, setData] = useState<SummaryReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await reportsService.getSummary();
        setData(r);
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading || !data) {
    return (
      <DashboardShell pageTitle="Reports">
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      </DashboardShell>
    );
  }

  const usersByRoleRows: PairRow[] = data.usersByRole.map((x, idx) => ({
    key: `role-${idx}-${x.role}`,
    label: capitalize(x.role),
    count: x.count,
    explorePath: `${USERS_LIST}${usersListingForRole(x.role)}`,
  }));

  const verifiedRows: PairRow[] = data.alumniVerification.map((x, idx) => ({
    key: `ver-${idx}-${x.label}`,
    label: x.label,
    count: x.count,
    explorePath: `${USERS_LIST}${usersListingAlumniVerification(x.label.toLowerCase() === 'verified')}`,
  }));

  const alumniDeptRows: PairRow[] = data.alumniByDepartment.map((x, idx) => ({
    key: `dept-${idx}-${x.department}`,
    label: x.department === '—' ? '—' : x.department,
    count: x.count,
    explorePath:
      x.department === '—'
        ? `${USERS_LIST}${usersListingAlumniScope()}`
        : `${USERS_LIST}${usersListingAlumniDepartment(x.department)}`,
  }));

  const alumniYearRows: PairRow[] = data.alumniByGraduationYear.map((x, idx) => ({
    key: `year-${idx}-${x.year}`,
    label: x.year,
    count: x.count,
    explorePath:
      x.year === '—' ? `${USERS_LIST}${usersListingAlumniScope()}` : `${USERS_LIST}${usersListingAlumniGradYear(String(x.year))}`,
  }));

  const eventsTypeRows: PairRow[] = data.eventsByType.map((x, idx) => ({
    key: `etype-${idx}-${x.type}`,
    label: capitalize(x.type),
    count: x.count,
    explorePath: `${EVENTS_LIST}${eventsListingForType(x.type)}`,
  }));

  const eventsStatusRows: PairRow[] = data.eventsByStatus.map((x, idx) => ({
    key: `est-${idx}-${x.status}`,
    label: capitalize(x.status),
    count: x.count,
    explorePath: `${EVENTS_LIST}${eventsListingForStatus(x.status)}`,
  }));

  const kpiProps = (
    css: Partial<CSSProperties>,
    Icon: typeof CommunityIcon,
    label: string,
    value: number
  ) => (
    <div className="kpi-card" style={css as CSSProperties}>
      <div className="kpi-icon-wrap">
        <Icon size={22} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value.toLocaleString()}</div>
      <div className="kpi-delta">Live aggregate</div>
    </div>
  );

  return (
    <DashboardShell pageTitle="Reports">
      <div className="page-header">
        <h2 className="page-title">Institutional reports</h2>
        <p className="page-subtitle">Summary statistics across users, alumni profiles, and events.</p>
      </div>

      <div className="kpi-grid">
        {kpiProps(
          { '--kpi-color': 'var(--kpi-1)', '--kpi-subtle': 'var(--primary-subtle)' } as CSSProperties,
          CommunityIcon,
          'Total users',
          data.totals.users
        )}
        {kpiProps(
          { '--kpi-color': 'var(--kpi-2)', '--kpi-subtle': 'var(--accent-subtle)' } as CSSProperties,
          AlumniIcon,
          'Alumni profiles',
          data.totals.alumni
        )}
        {kpiProps(
          { '--kpi-color': 'var(--kpi-4)', '--kpi-subtle': 'var(--warning-subtle)' } as CSSProperties,
          CalendarIcon,
          'Events',
          data.totals.events
        )}
      </div>

      <div className="content-grid-2" style={{ marginTop: 'var(--space-10)' }}>
        <DataListing<PairRow>
          className={REPORT_LISTING_CLASS}
          onRowClick={handleReportRowNavigate}
          getRowKey={(row) => row.key}
          title="Users by role"
          columns={[labelColumn('Role', '140px'), countColumn]}
          data={usersByRoleRows}
          pagination={false}
          actions={
            <Link className="btn btn-ghost btn-sm" to={USERS_LIST}>
              View all
            </Link>
          }
          emptyState="No user aggregates."
        />
        <DataListing<PairRow>
          className={REPORT_LISTING_CLASS}
          onRowClick={handleReportRowNavigate}
          getRowKey={(row) => row.key}
          title="Alumni by verification"
          columns={[labelColumn('Status', '140px'), countColumn]}
          data={verifiedRows}
          pagination={false}
          actions={
            <Link className="btn btn-ghost btn-sm" to={`${USERS_LIST}${usersListingAlumniScope()}`}>
              View all
            </Link>
          }
          emptyState="No verification data."
        />
      </div>

      <div style={{ marginTop: 'var(--space-10)' }}>
        <DataListing<PairRow>
          className={REPORT_LISTING_CLASS}
          onRowClick={handleReportRowNavigate}
          getRowKey={(row) => row.key}
          title="Alumni by department"
          columns={[labelColumn('Department', '140px'), countColumn]}
          data={alumniDeptRows}
          pagination={false}
          actions={
            <Link className="btn btn-ghost btn-sm" to={`${USERS_LIST}${usersListingAlumniScope()}`}>
              View all
            </Link>
          }
          emptyState="No department breakdown."
        />
      </div>

      <div style={{ marginTop: 'var(--space-10)' }}>
        <DataListing<PairRow>
          className={REPORT_LISTING_CLASS}
          onRowClick={handleReportRowNavigate}
          getRowKey={(row) => row.key}
          title="Alumni by graduation year"
          columns={[labelColumn('Year', '140px'), countColumn]}
          data={alumniYearRows}
          pagination={false}
          actions={
            <Link className="btn btn-ghost btn-sm" to={`${USERS_LIST}${usersListingAlumniScope()}`}>
              View all
            </Link>
          }
          sortOptions={[
            { label: 'Year (newest)', value: 'label-desc' },
            { label: 'Year (oldest)', value: 'label-asc' },
          ]}
          defaultSort="label-desc"
        />
      </div>

      <div className="content-grid-2" style={{ marginTop: 'var(--space-10)' }}>
        <DataListing<PairRow>
          className={REPORT_LISTING_CLASS}
          onRowClick={handleReportRowNavigate}
          getRowKey={(row) => row.key}
          title="Events by type"
          columns={[labelColumn('Type', '140px'), countColumn]}
          data={eventsTypeRows}
          searchable={false}
          pagination={false}
          actions={
            <Link className="btn btn-ghost btn-sm" to={EVENTS_LIST}>
              View all
            </Link>
          }
          emptyState="No events tracked."
        />
        <DataListing<PairRow>
          className={REPORT_LISTING_CLASS}
          onRowClick={handleReportRowNavigate}
          getRowKey={(row) => row.key}
          title="Events by status"
          columns={[labelColumn('Status', '140px'), countColumn]}
          data={eventsStatusRows}
          pagination={false}
          actions={
            <Link className="btn btn-ghost btn-sm" to={EVENTS_LIST}>
              View all
            </Link>
          }
        />
      </div>
    </DashboardShell>
  );
}

function capitalize(s: string): string {
  if (!s || s === '—') return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
