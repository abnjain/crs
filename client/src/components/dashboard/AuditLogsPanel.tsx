import { useState, useEffect, useCallback } from 'react';
import { DataListing, DEFAULT_DATA_LISTING_PAGE_SIZE } from '../common/DataListing';
import type { ListingColumn } from '../common/DataListing';
import type { FilterField } from '../common/DataListing/ListingFilter';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { auditLogService, type AuditLogRecord } from '../../services/auditLog.service';
import { httpStatusBadgeClass } from '../../lib/httpStatusBadge';
import toast from 'react-hot-toast';

type AuditRow = {
  id: string;
  createdAt: string;
  action: string;
  category: string;
  actorDisplay: string;
  methodPath: string;
  statusCode: string;
  ip: string;
  log: AuditLogRecord;
} & Record<string, unknown>;

const filters: FilterField[] = [
  {
    id: 'category',
    label: 'Category',
    options: [
      { label: 'All', value: '' },
      { label: 'Auth', value: 'auth' },
      { label: 'User', value: 'user' },
      { label: 'Alumni', value: 'alumni' },
      { label: 'Event', value: 'event' },
      { label: 'System', value: 'system' },
      { label: 'API', value: 'api' },
    ],
  },
];

function categoryBadgeClass(cat: string): string {
  switch (cat) {
    case 'auth':
      return 'badge-primary';
    case 'user':
      return 'badge-accent';
    case 'alumni':
      return 'badge-success';
    case 'event':
      return 'badge-warning';
    case 'system':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
}

function formatDetails(details: Record<string, unknown> | undefined): string {
  if (!details || Object.keys(details).length === 0) return '';
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
}

export function AuditLogsPanel() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageState, setPageState] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_DATA_LISTING_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuditRow | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditLogService.getLogs({
        page: pageState,
        limit: pageSize,
        category: categoryFilter || undefined,
        action: search.trim() || undefined,
      });
      const mapped: AuditRow[] = data.logs.map((log) => {
        const actorName = log.actor?.name;
        const actorEmail = log.actor?.email ?? log.actorEmail;
        const actorDisplay = actorName ? `${actorName} (${actorEmail})` : actorEmail || '-';
        return {
          id: log._id,
          createdAt: log.createdAt,
          action: log.action,
          category: log.category,
          actorDisplay,
          methodPath: `${log.method} ${log.path}`,
          statusCode: String(log.statusCode),
          ip: log.ip ?? '',
          log,
        };
      });
      setRows(mapped);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [pageState, pageSize, categoryFilter, search]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const columns: ListingColumn<AuditRow>[] = [
    {
      key: 'createdAt',
      header: 'When',
      minWidth: '150px',
      render: (row) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    { key: 'action', header: 'Action', minWidth: '140px' },
    {
      key: 'category',
      header: 'Category',
      minWidth: '90px',
      render: (row) => (
        <span className={`badge ${categoryBadgeClass(row.category)}`}>{row.category}</span>
      ),
    },
    { key: 'actorDisplay', header: 'Actor', minWidth: '160px' },
    {
      key: 'methodPath',
      header: 'Request',
      minWidth: '260px',
      render: (row) => (
        <code style={{ fontSize: 'var(--text-xs)', wordBreak: 'break-all' }}>{row.methodPath}</code>
      ),
    },
    {
      key: 'statusCode',
      header: 'Status',
      minWidth: '70px',
      render: (row) => (
        <span className={`badge ${httpStatusBadgeClass(row.statusCode)}`}>{row.statusCode}</span>
      ),
    },
    { key: 'ip', header: 'IP', minWidth: '120px', render: (row) => <span>{row.ip || '-'}</span> },
    {
      key: 'details',
      header: 'Details',
      minWidth: '110px',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelected(row)}
          aria-label={`View details for ${row.action}`}
        >
          View
        </Button>
      ),
    },
  ];

  const selectedLog = selected?.log;
  const detailsText = selectedLog ? formatDetails(selectedLog.details) : '';

  return (
    <>
      {loading && rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      ) : (
        <DataListing<AuditRow>
          key={`audit-${categoryFilter}-${search}`}
          columns={columns}
          data={rows}
          searchable
          searchPlaceholder="Filter by action (server match)..."
          filters={filters}
          pageSize={pageSize}
          totalCount={total}
          onPageSizeChange={(n) => setPageSize(n)}
          onSearchChange={(q) => {
            setSearch(q);
            setPageState(1);
          }}
          onFilterChange={(v) => {
            setCategoryFilter(v.category ?? '');
            setPageState(1);
          }}
          onPageChange={(p) => setPageState(p)}
          onRowClick={(row) => setSelected(row)}
          getRowKey={(row) => row.id}
          emptyState="No audit entries found."
        />
      )}

      <Dialog
        open={!!selectedLog}
        onClose={() => setSelected(null)}
        title={selectedLog ? selectedLog.action : 'Audit Details'}
        size="wide"
      >
        {selectedLog && selected && (
          <>
            <dl className="dialog-detail-list">
              <div className="dialog-detail-row">
                <dt className="dialog-detail-term">When</dt>
                <dd className="dialog-detail-desc">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="dialog-detail-row">
                <dt className="dialog-detail-term">Category</dt>
                <dd className="dialog-detail-desc">
                  <span className={`badge ${categoryBadgeClass(selectedLog.category)}`}>
                    {selectedLog.category}
                  </span>
                </dd>
              </div>
              <div className="dialog-detail-row">
                <dt className="dialog-detail-term">Status</dt>
                <dd className="dialog-detail-desc">
                  <span className={`badge ${httpStatusBadgeClass(selectedLog.statusCode)}`}>
                    {selectedLog.statusCode}
                  </span>
                </dd>
              </div>
              <div className="dialog-detail-row">
                <dt className="dialog-detail-term">Request</dt>
                <dd className="dialog-detail-desc">
                  <code>
                    {selectedLog.method} {selectedLog.path}
                  </code>
                </dd>
              </div>
              <div className="dialog-detail-row">
                <dt className="dialog-detail-term">Actor</dt>
                <dd className="dialog-detail-desc">{selected.actorDisplay || '—'}</dd>
              </div>
              <div className="dialog-detail-row">
                <dt className="dialog-detail-term">Client IP</dt>
                <dd className="dialog-detail-desc">{selectedLog.ip || '—'}</dd>
              </div>
              <div className="dialog-detail-row">
                <dt className="dialog-detail-term">User agent</dt>
                <dd className="dialog-detail-desc">{selectedLog.userAgent || '—'}</dd>
              </div>
              {(selectedLog.targetModel || selectedLog.targetId) && (
                <div className="dialog-detail-row">
                  <dt className="dialog-detail-term">Target</dt>
                  <dd className="dialog-detail-desc">
                    {[selectedLog.targetModel, selectedLog.targetId].filter(Boolean).join(' · ') || '—'}
                  </dd>
                </div>
              )}
            </dl>
            <div className="dialog-detail-extra">
              <p className="dialog-detail-extra-label">Additional details</p>
              {detailsText ? (
                <pre className="dialog-detail-pre">{detailsText}</pre>
              ) : (
                <p className="dialog-detail-empty">No JSON payload recorded for this entry.</p>
              )}
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
