/**
 * ============================================================
 * Notifications Page - full list with pagination
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { DataListing } from '../../components/common/DataListing';
import type { ListingColumn } from '../../components/common/DataListing';
import type { FilterField } from '../../components/common/DataListing/ListingFilter';
import { Button } from '../../components/common/Button';
import { notificationService, type NotificationDTO, type NotificationType } from '../../services/notification.service';
import { useNotifications } from '../../context';

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt?: string;
  readAt: string | null;
  link?: string;
  notification: NotificationDTO;
} & Record<string, unknown>;

const filters: FilterField[] = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { label: 'All', value: '' },
      { label: 'Unread', value: 'unread' },
      { label: 'Read', value: 'read' },
    ],
  },
  {
    id: 'type',
    label: 'Type',
    options: [
      { label: 'All', value: '' },
      { label: 'Message', value: 'message' },
      { label: 'Event', value: 'event' },
      { label: 'Document', value: 'document' },
      { label: 'Fee', value: 'fee' },
      { label: 'System', value: 'system' },
    ],
  },
];

function typeBadgeClass(type: NotificationType): string {
  switch (type) {
    case 'message':
      return 'badge-primary';
    case 'event':
      return 'badge-warning';
    case 'document':
      return 'badge-accent';
    case 'fee':
      return 'badge-error';
    case 'system':
      return 'badge-neutral';
    default:
      return 'badge-neutral';
  }
}

function formatTime(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { markRead, markAllRead } = useNotifications();

  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageState, setPageState] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const pageSize = 12;
  const hasUnread = rows.some((row) => !row.readAt);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const unread = statusFilter === 'unread' ? true : statusFilter === 'read' ? false : undefined;
      const data = await notificationService.list({
        page: pageState,
        limit: pageSize,
        type: (typeFilter as NotificationType) || undefined,
        unread: unread === true ? true : undefined,
        read: statusFilter === 'read' ? true : undefined,
      });
      const mapped = data.notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.createdAt,
        readAt: n.readAt,
        link: n.link,
        notification: n,
      }));
      setRows(mapped);
      setTotal(data.pagination.total);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [pageState, statusFilter, typeFilter]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const columns: ListingColumn<NotificationRow>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Notification',
        minWidth: '280px',
        render: (row) => (
          <div className={`notif-row ${row.readAt ? '' : 'unread'}`}>
            <div className="notif-row-title">{row.title}</div>
            <div className="notif-row-message">{row.message}</div>
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        minWidth: '100px',
        render: (row) => (
          <span className={`badge ${typeBadgeClass(row.type)}`}>{row.type}</span>
        ),
      },
      {
        key: 'createdAt',
        header: 'When',
        minWidth: '160px',
        render: (row) => (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {formatTime(row.createdAt)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        minWidth: '90px',
        render: (row) => (
          <span className={`badge ${row.readAt ? 'badge-neutral' : 'badge-accent'}`}>
            {row.readAt ? 'Read' : 'Unread'}
          </span>
        ),
      },
    ],
    []
  );

  const actions = (
    <Button
      size="sm"
      variant="outline"
      disabled={!hasUnread}
      onClick={async () => {
        const now = new Date().toISOString();
        await markAllRead();
        setRows((prev) => prev.map((row) => (row.readAt ? row : { ...row, readAt: now })));
      }}
    >
      Mark all read
    </Button>
  );

  return (
    <DashboardShell pageTitle="Notifications">
      <div className="page-header">
        <h2 className="page-title">Notifications</h2>
        <p className="page-subtitle">Updates across messages, events, documents, and system activity.</p>
      </div>

      {loading && rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      ) : (
        <DataListing<NotificationRow>
          key={`notifications-${statusFilter}-${typeFilter}`}
          columns={columns}
          data={rows}
          filters={filters}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={(p) => setPageState(p)}
          onFilterChange={(v) => {
            setStatusFilter(v.status ?? '');
            setTypeFilter(v.type ?? '');
            setPageState(1);
          }}
          emptyState="No notifications available."
          actions={actions}
          onRowClick={(row) => {
            if (!row.readAt) {
              void markRead(row.id, true);
              setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, readAt: new Date().toISOString() } : r)));
            }
            if (row.link) {
              if (row.link.startsWith('/')) {
                navigate(row.link);
              } else {
                window.location.href = row.link;
              }
            }
          }}
        />
      )}
    </DashboardShell>
  );
}
