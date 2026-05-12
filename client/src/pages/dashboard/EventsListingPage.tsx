import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { DataListing } from '../../components/common/DataListing';
import type { ListingColumn } from '../../components/common/DataListing';
import type { SortOption } from '../../components/common/DataListing/ListingSort';
import type { FilterField } from '../../components/common/DataListing/ListingFilter';
import { eventService } from '../../services/event.service';
import type { EventRecord } from '../../services/event.service';
import toast from 'react-hot-toast';
import { parseEventsListingSearch } from '../../lib/dashboardListSearchParams';

type EventRow = {
  _id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  organizerName: string;
  status: string;
} & Record<string, unknown>;

function toRows(records: EventRecord[]): EventRow[] {
  return records.map((r) => ({
    _id: r._id,
    title: r.title,
    type: r.type ?? 'other',
    date: r.date ? new Date(r.date).toLocaleDateString() : '—',
    location: r.isOnline ? 'Online' : (r.location || '—'),
    organizerName: r.organizer?.name ?? '—',
    status: r.status ?? 'upcoming',
  }));
}

const columns: ListingColumn<EventRow>[] = [
  {
    key: 'title',
    header: 'Title',
    minWidth: '200px',
    render: (row) => <span className="tbl-name">{row.title}</span>,
  },
  {
    key: 'type',
    header: 'Type',
    minWidth: '110px',
    render: (row) => (
      <span className={`badge badge-${typeBadge(row.type)}`}>
        {capitalize(row.type)}
      </span>
    ),
  },
  { key: 'date', header: 'Date', minWidth: '110px' },
  { key: 'location', header: 'Location', minWidth: '130px' },
  { key: 'organizerName', header: 'Organizer', minWidth: '130px' },
  {
    key: 'status',
    header: 'Status',
    minWidth: '100px',
    render: (row) => (
      <span className={`badge badge-${statusBadge(row.status)}`}>
        {capitalize(row.status)}
      </span>
    ),
  },
];

const sortOptions: SortOption[] = [
  { label: 'Date (Newest)', value: 'date-desc' },
  { label: 'Date (Oldest)', value: 'date-asc' },
  { label: 'Title A-Z', value: 'title-asc' },
  { label: 'Title Z-A', value: 'title-desc' },
];

const filters: FilterField[] = [
  {
    id: 'type',
    label: 'Type',
    options: [
      { label: 'All', value: '' },
      { label: 'Seminar', value: 'seminar' },
      { label: 'Workshop', value: 'workshop' },
      { label: 'Reunion', value: 'reunion' },
      { label: 'Webinar', value: 'webinar' },
      { label: 'Conference', value: 'conference' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    options: [
      { label: 'All', value: '' },
      { label: 'Upcoming', value: 'upcoming' },
      { label: 'Ongoing', value: 'ongoing' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
];

function typeBadge(type: string): string {
  switch (type) {
    case 'seminar': return 'primary';
    case 'workshop': return 'accent';
    case 'reunion': return 'success';
    case 'webinar': return 'warning';
    case 'conference': return 'error';
    default: return 'neutral';
  }
}

function statusBadge(status: string): string {
  switch (status) {
    case 'upcoming': return 'primary';
    case 'ongoing': return 'success';
    case 'completed': return 'neutral';
    case 'cancelled': return 'error';
    default: return 'neutral';
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function EventsListingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultFilterValues = useMemo(() => parseEventsListingSearch(searchParams), [searchParams]);
  const listResetKey = searchParams.toString();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await eventService.getAll();
        setEvents(toRows(data));
      } catch {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardShell pageTitle="Events">
      <div className="page-header">
        <h2 className="page-title">Events</h2>
        <p className="page-subtitle">
          Manage institutional events — seminars, workshops, reunions, and more.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      ) : (
        <DataListing<EventRow>
          key={listResetKey}
          defaultFilterValues={defaultFilterValues}
          columns={columns}
          data={events}
          searchable
          searchPlaceholder="Search by title…"
          searchKeys={['title', 'organizerName', 'location'] as (keyof EventRow)[]}
          sortOptions={sortOptions}
          defaultSort="date-desc"
          filters={filters}
          pageSize={10}
          emptyState="No events found."
          getRowKey={(row) => row._id}
          onRowClick={(row) => navigate(`/dashboard/events/${encodeURIComponent(row._id)}`)}
        />
      )}
    </DashboardShell>
  );
}
