import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import {
  CommunityIcon,
  AlumniIcon,
  CalendarIcon,
  BarChartIcon,
  ShieldIcon,
  CircleCheckIcon,
  CircleXIcon,
  UserCheckIcon,
  UserXIcon,
} from '../../components/common/svgs';
import { healthService, type HealthResponse } from '../../services/health.service';
import {
  reportsService,
  type DashboardDayCount,
  type DashboardKpis,
  type ReviewQueueItem,
} from '../../services/reports.service';
import { auditLogService, type AuditLogRecord } from '../../services/auditLog.service';
import { alumniService } from '../../services/alumni.service';
import { userService } from '../../services/user.service';
import { alumniProfileUrl, userProfileUrl } from '../../lib/profilePaths';

/** Matches server `buildReviewQueue(6)` cap in reports summary */
const REVIEW_QUEUE_PREVIEW_CAP = 6;
/** Matches audit preview fetch limit below */
const AUDIT_LOG_PREVIEW_LIMIT = 6;

type HealthDotClass = 'green' | 'yellow' | 'red';

function formatInt(n: number): string {
  return new Intl.NumberFormat().format(n);
}

function compactNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return formatInt(n);
}

function auditCategoryStyle(cat: string): { background: string; color: string } {
  switch (cat) {
    case 'auth':
      return { background: 'var(--primary-subtle)', color: 'var(--primary)' };
    case 'user':
      return { background: 'var(--accent-subtle)', color: 'var(--accent)' };
    case 'alumni':
      return { background: 'var(--success-subtle)', color: 'var(--success)' };
    case 'event':
      return { background: 'var(--warning-subtle)', color: 'var(--warning)' };
    case 'system':
      return { background: 'var(--error-subtle)', color: 'var(--error)' };
    default:
      return { background: 'var(--neutral-subtle, var(--border-subtle))', color: 'var(--text-muted)' };
  }
}

function auditActorLabel(log: AuditLogRecord): string {
  const name = log.actor?.name?.trim();
  if (name) return name;
  const email = log.actorEmail?.trim();
  if (email) return email;
  return 'System';
}

function reviewQueueErrMsg(err: unknown): string {
  const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return typeof msg === 'string' ? msg : 'Could not apply decision. Try again.';
}

/** Pending registrations + unverified alumni — approve/reject; links open profiles */
function ReviewQueueEntries({
  items,
  onQueueUpdated,
}: {
  items: ReviewQueueItem[];
  onQueueUpdated: () => Promise<void>;
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function applyDecision(item: ReviewQueueItem, decision: 'approve' | 'reject') {
    const key = item.kind === 'new_user' ? `u:${item.userId}` : `a:${item.alumniId}`;
    setBusyKey(key);
    try {
      if (item.kind === 'new_user') {
        await userService.reviewQueueDecision(item.userId, decision);
      } else {
        await alumniService.reviewQueueDecision(item.alumniId, decision);
      }
      await onQueueUpdated();
    } catch (e: unknown) {
      window.alert(reviewQueueErrMsg(e));
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="activity-list review-queue-list">
      {items.map((item) => {
        const key = item.kind === 'new_user' ? `u:${item.userId}` : `a:${item.alumniId}`;
        const busy = busyKey === key;
        const when = item.createdAt ? new Date(item.createdAt).toLocaleString() : '—';

        if (item.kind === 'unverified_alumni') {
          const dept = item.department ? ` · ${item.department}` : '';
          return (
            <div key={`alumni-${item.alumniId}`} className="activity-item review-queue-row">
              <Link to={alumniProfileUrl(item.alumniId)} className="review-queue-main">
                <div className="activity-dot" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}>
                  <AlumniIcon size={14} />
                </div>
                <div className="activity-body">
                  <div className="activity-text">
                    <strong>{item.name}</strong>
                    <span style={{ fontWeight: 500 }}> Unverified alumni</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {' '}
                      · {item.email}
                      {dept}
                    </span>
                  </div>
                  <div className="activity-time">{when}</div>
                </div>
              </Link>
              <div className="review-queue-actions">
                <button
                  type="button"
                  className="review-queue-action-btn"
                  data-tone="approve"
                  aria-label="Approve alumni profile"
                  disabled={busy}
                  onClick={(ev) => {
                    ev.preventDefault();
                    void applyDecision(item, 'approve');
                  }}
                >
                  <UserCheckIcon size={20} />
                </button>
                <button
                  type="button"
                  className="review-queue-action-btn"
                  data-tone="reject"
                  aria-label="Reject alumni profile"
                  disabled={busy}
                  onClick={(ev) => {
                    ev.preventDefault();
                    void applyDecision(item, 'reject');
                  }}
                >
                  <UserXIcon size={16} />
                </button>
              </div>
            </div>
          );
        }

        return (
          <div key={`user-${item.userId}`} className="activity-item review-queue-row">
            <Link to={userProfileUrl(item.userId)} className="review-queue-main">
              <div className="activity-dot" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                <CommunityIcon size={14} />
              </div>
              <div className="activity-body">
                <div className="activity-text">
                  <strong>{item.name}</strong>
                  <span style={{ fontWeight: 500 }}> Pending registration</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {' '}
                    · {item.email} · {item.role}
                  </span>
                </div>
                <div className="activity-time">{when}</div>
              </div>
            </Link>
            <div className="review-queue-actions">
              <button
                type="button"
                className="review-queue-action-btn"
                data-tone="approve"
                aria-label="Approve registration"
                disabled={busy}
                onClick={(ev) => {
                  ev.preventDefault();
                  void applyDecision(item, 'approve');
                }}
              >
                <CircleCheckIcon size={16} />
              </button>
              <button
                type="button"
                className="review-queue-action-btn"
                data-tone="reject"
                aria-label="Reject registration"
                disabled={busy}
                onClick={(ev) => {
                  ev.preventDefault();
                  void applyDecision(item, 'reject');
                }}
              >
                <CircleXIcon size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HealthStatusRow({
  dotClass,
  label,
  value,
}: {
  dotClass: HealthDotClass;
  label: string;
  value: string;
}) {
  return (
    <div className="health-item">
      <span className={`health-dot ${dotClass}`} />
      <span className="health-label">{label}</span>
      <span className="health-val">{value}</span>
    </div>
  );
}

function buildMongoLine(health: HealthResponse | null): { dot: HealthDotClass; line: string } {
  const s = health?.services.mongodb;
  const lat = health?.diagnostics?.mongodbLatencyMs;
  const dbName = health?.services.mongodbDatabase;
  if (s === 'connected') {
    let line = lat != null ? `Online · ${lat} ms` : 'Online';
    if (dbName) line += ` · ${dbName}`;
    return { dot: 'green', line };
  }
  if (s === 'connecting') return { dot: 'yellow', line: 'Connecting…' };
  return { dot: 'red', line: 'Unavailable' };
}

function buildRedisLine(
  health: HealthResponse | null
): { dot: HealthDotClass; line: string } {
  const s = health?.services.redis;
  const d = health?.diagnostics;
  if (!s || s === 'disabled') return { dot: 'yellow', line: 'Not configured' };
  if (s === 'disconnected') return { dot: 'red', line: 'Offline' };

  const pieces: string[] = [];
  if (d?.redisLatencyMs != null) pieces.push(`${d.redisLatencyMs} ms`);
  if (d?.redisMemoryNote) pieces.push(d.redisMemoryNote);
  const line = pieces.length ? `Online · ${pieces.join(' · ')}` : 'Online';

  let dot: HealthDotClass = 'green';
  if (d?.redisMemoryPercent != null && d.redisMemoryPercent >= 78) dot = 'yellow';

  return { dot, line };
}

function buildApiLine(health: HealthResponse | null): { dot: HealthDotClass; line: string } {
  if (!health) return { dot: 'yellow', line: '—' };
  const heap = `${health.memory.heapUsed} / ${health.memory.heapTotal} ${health.memory.unit}`;
  const ms = health?.diagnostics?.probeDurationMs;
  const msPart = ms != null ? `checks ~${ms} ms · ` : '';
  const dot: HealthDotClass = health.status === 'healthy' ? 'green' : 'yellow';
  return { dot, line: `Online · ${msPart}heap ${heap}` };
}

function buildSmtpLine(health: HealthResponse | null): { dot: HealthDotClass; line: string } {
  const sm = health?.diagnostics?.smtp;
  if (!sm || !sm.configured) return { dot: 'yellow', line: 'Not configured' };
  if (sm.ok === true) {
    const lat = sm.latencyMs != null ? ` · ${sm.latencyMs} ms` : '';
    return { dot: 'green', line: `OK · ${sm.detail}${lat}` };
  }
  return { dot: 'red', line: sm.detail };
}

function buildStorageLine(
  health: HealthResponse | null
): { dot: HealthDotClass; line: string } {
  const st = health?.diagnostics?.storage;
  if (!st) return { dot: 'yellow', line: 'Unavailable' };
  const pct =
    st.totalBytes > 0 ? Math.min(100, Math.round((st.usedBytes / st.totalBytes) * 100)) : null;
  const dot: HealthDotClass =
    pct != null ? (pct >= 92 ? 'red' : pct >= 85 ? 'yellow' : 'green') : 'green';
  return { dot, line: `${st.usedLabel} / ${st.totalLabel} (${pct != null ? `${pct}%` : 'disk'} used)` };
}

function chartBarHeight(series: DashboardDayCount[]): number[] {
  const max = Math.max(1, ...series.map((d) => d.count));
  return series.map((d) => Math.round((d.count / max) * 100));
}

function pendingApprovalsBadgeLabel(
  status: 'loading' | 'error' | 'ok',
  queueLen: number
): string {
  if (status === 'loading') return 'Loading…';
  if (status === 'error') return 'Unavailable';
  if (queueLen === 0) return 'Queue clear';
  if (queueLen >= REVIEW_QUEUE_PREVIEW_CAP) {
    return `${queueLen} pending · preview`;
  }
  return `${queueLen} pending`;
}

function auditPreviewBadgeLabel(status: 'loading' | 'error' | 'ok', shown: number): string {
  if (status === 'loading') return 'Loading…';
  if (status === 'error') return 'Unavailable';
  if (shown === 0) return 'No entries yet';
  return `${shown} recent`;
}

export function SuperAdminDashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthStatus, setHealthStatus] = useState<'loading' | 'error' | 'ok'>('loading');

  const [totals, setTotals] = useState({ users: 0, alumni: 0, events: 0 });
  const [regSeries, setRegSeries] = useState<DashboardDayCount[]>([]);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [reportStatus, setReportStatus] = useState<'loading' | 'error' | 'ok'>('loading');
  const [recentLogs, setRecentLogs] = useState<AuditLogRecord[]>([]);
  const [auditStatus, setAuditStatus] = useState<'loading' | 'error' | 'ok'>('loading');

  const refreshReviewQueue = useCallback(async () => {
    try {
      const data = await reportsService.getSummary();
      setReviewQueue(data.dashboard?.reviewQueue ?? []);
    } catch {
      /* keep list */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setHealthStatus('loading');
      try {
        const h = await healthService.getHealth();
        if (!cancelled) {
          setHealth(h);
          setHealthStatus('ok');
        }
      } catch {
        if (!cancelled) setHealthStatus('error');
      }
    }

    async function refreshSilent() {
      try {
        const h = await healthService.getHealth();
        if (!cancelled) {
          setHealth(h);
          setHealthStatus('ok');
        }
      } catch {
        /* keep last good snapshot */
      }
    }

    loadInitial();
    const id = window.setInterval(refreshSilent, 45_000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setReportStatus('loading');
      try {
        const data = await reportsService.getSummary();
        if (cancelled) return;
        setTotals(data.totals);
        const dash = data.dashboard;
        setRegSeries(dash?.usersRegisteredLast7Days ?? []);
        setKpis(dash?.kpis ?? null);
        setReviewQueue(dash?.reviewQueue ?? []);
        setReportStatus('ok');
      } catch {
        if (!cancelled) setReportStatus('error');
      }
    }

    async function loadAudit() {
      setAuditStatus('loading');
      try {
        const res = await auditLogService.getLogs({ limit: AUDIT_LOG_PREVIEW_LIMIT, page: 1 });
        if (!cancelled) {
          setRecentLogs(res.logs);
          setAuditStatus('ok');
        }
      } catch {
        if (!cancelled) {
          setRecentLogs([]);
          setAuditStatus('error');
        }
      }
    }

    void loadReports();
    void loadAudit();

    return () => {
      cancelled = true;
    };
  }, []);

  const d = health?.diagnostics;

  const showRedisPressureBanner =
    d?.redisMemoryPercent != null &&
    d.redisMemoryPercent >= 78 &&
    health?.services.redis === 'connected';

  const mongo = buildMongoLine(health);
  const redis = buildRedisLine(health);
  const api = buildApiLine(health);
  const smtp = buildSmtpLine(health);
  const volume = buildStorageLine(health);

  const barHeights = useMemo(() => chartBarHeight(regSeries.length ? regSeries : Array.from({ length: 7 }, (_, i) => ({ isoDate: '', label: `D${i}`, count: 0 }))), [regSeries]);

  const userDeltaLine =
    kpis != null
      ? `+${formatInt(kpis.usersCreatedThisMonth)} this month`
      : reportStatus === 'loading'
        ? '…'
        : '—';

  const alumniDeltaLine =
    kpis != null
      ? `+${formatInt(kpis.alumniProfilesCreatedThisMonth)} profiles this month`
      : reportStatus === 'loading'
        ? '…'
        : '—';

  const eventsDeltaLine =
    kpis != null
      ? `+${formatInt(kpis.eventsCreatedRollingWeek)} in last 7 days`
      : reportStatus === 'loading'
        ? '…'
        : '—';

  const auditDeltaLine =
    kpis != null
      ? `${kpis.auditEntriesDeltaPercent >= 0 ? '+' : ''}${kpis.auditEntriesDeltaPercent}% vs prior 24h`
      : reportStatus === 'loading'
        ? '…'
        : '—';

  const auditDeltaClass =
    kpis != null && kpis.auditEntriesDeltaPercent < 0 ? 'kpi-delta down' : 'kpi-delta up';

  const auditPreviewLogs = useMemo(
    () => recentLogs.slice(0, AUDIT_LOG_PREVIEW_LIMIT),
    [recentLogs]
  );

  const pendingApprovalsBadge = pendingApprovalsBadgeLabel(reportStatus, reviewQueue.length);
  const auditPreviewBadge = auditPreviewBadgeLabel(auditStatus, auditPreviewLogs.length);

  return (
    <DashboardShell pageTitle="Platform Control Centre">
      <div className="page-header">
        <div className="page-eyebrow">Super Administrator</div>
        <h2 className="page-title">Platform Control Centre</h2>
        <p className="page-subtitle">
          Full governance of the CRS platform — users, system health, audit trails, and institutional data.
        </p>
      </div>

      {showRedisPressureBanner ? (
        <div className="alert-banner warning" role="alert">
          <svg
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1={12} y1={9} x2={12} y2={13} />
            <line x1={12} y1={17} x2={12.01} y2={17} />
          </svg>
          Redis memory is at <strong>{d?.redisMemoryPercent}%</strong> of <code>maxmemory</code> — consider raising
          the cap, trimming keys with TTLs, or enabling eviction tuned to your workloads.
        </div>
      ) : null}

      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-1)', '--kpi-subtle': 'var(--primary-subtle)' } as CSSProperties}>
          <div className="kpi-icon-wrap"><CommunityIcon size={22} /></div>
          <div className="kpi-label">Total Users</div>
          <div className="kpi-value">{formatInt(totals.users)}</div>
          <div className="kpi-delta up">{userDeltaLine}</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-2)', '--kpi-subtle': 'var(--accent-subtle)' } as CSSProperties}>
          <div className="kpi-icon-wrap"><AlumniIcon size={22} /></div>
          <div className="kpi-label">Alumni Registered</div>
          <div className="kpi-value">{formatInt(totals.alumni)}</div>
          <div className="kpi-delta up">{alumniDeltaLine}</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-3)', '--kpi-subtle': 'var(--success-subtle)' } as CSSProperties}>
          <div className="kpi-icon-wrap"><CalendarIcon size={22} /></div>
          <div className="kpi-label">Events</div>
          <div className="kpi-value">{formatInt(totals.events)}</div>
          <div className="kpi-delta up">{eventsDeltaLine}</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--kpi-4)', '--kpi-subtle': 'var(--warning-subtle)' } as CSSProperties}>
          <div className="kpi-icon-wrap"><BarChartIcon size={22} /></div>
          <div className="kpi-label">Audit entries (24h)</div>
          <div className="kpi-value">{kpis != null ? compactNum(kpis.auditEntriesLast24h) : reportStatus === 'loading' ? '…' : '0'}</div>
          <div className={auditDeltaClass}>{auditDeltaLine}</div>
        </div>
      </div>

      <div className="content-grid-65">
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title">User Registrations — Last 7 Days</span>
            <span className="badge badge-success">Live</span>
          </div>
          <div className="widget-body">
            {reportStatus === 'error' ? (
              <p style={{ margin: 0, color: 'var(--color-red)', fontSize: 'var(--text-sm)' }}>
                Could not load registration stats. Open Reports after fixing API access.
              </p>
            ) : reportStatus === 'loading' && regSeries.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading chart…</p>
            ) : (
              <div className="chart-area">
                {(regSeries.length ? regSeries : Array.from({ length: 7 }, (_, i) => ({ isoDate: `d${i}`, label: '—', count: 0 }))).map((day, i) => (
                  <div
                    key={day.isoDate || i}
                    className="chart-bar"
                    style={{ height: `${barHeights[i] ?? (day.count ? 8 : 4)}%` }}
                    title={`${day.label} · ${day.count} sign-ups`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="widget-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {(regSeries.length ? regSeries : []).map((d) => d.label).join(' · ') || 'No data yet'}
            </span>
            <Link to="/dashboard/reports" className="btn btn-ghost btn-sm">
              Full Report
            </Link>
          </div>
        </div>

        <div className="widget">
          <div className="widget-header">
            <span className="widget-title">System Health</span>
            {health?.timestamp ? (
              <span className="badge badge-success">
                Updated {new Date(health.timestamp).toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          <div className="widget-body">
            {healthStatus === 'loading' && !health ? (
              <div className="health-grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-3)' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  Loading live telemetry…
                </p>
              </div>
            ) : healthStatus === 'error' && !health ? (
              <div className="health-grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-3)' }}>
                <p style={{ margin: 0, color: 'var(--color-red)', fontSize: 'var(--text-sm)' }}>
                  Could not load system health. Check the CRS API connection and retry.
                </p>
              </div>
            ) : (
              <div className="health-grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-3)' }}>
                <HealthStatusRow dotClass={mongo.dot} label="MongoDB" value={mongo.line} />
                <HealthStatusRow dotClass={redis.dot} label="Redis cache" value={redis.line} />
                <HealthStatusRow dotClass={api.dot} label="CRS API" value={api.line} />
                <HealthStatusRow dotClass={smtp.dot} label="SMTP" value={smtp.line} />
                <HealthStatusRow dotClass={volume.dot} label="Upload volume" value={volume.line} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-grid-2">
        <div className="widget">
          <div className="widget-header">
            <span className="widget-title">Pending approvals</span>
            <span className="badge badge-neutral">{pendingApprovalsBadge}</span>
          </div>
          <div className="widget-body" style={{ padding: 'var(--space-4) var(--space-5)' }}>
            {reportStatus === 'loading' ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Loading approval queue…
              </p>
            ) : reportStatus === 'error' ? (
              <p style={{ margin: 0, color: 'var(--color-red)', fontSize: 'var(--text-sm)' }}>
                Could not load queue (reports API).
              </p>
            ) : reviewQueue.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                No pending registrations or unverified alumni to show.
              </p>
            ) : (
              <ReviewQueueEntries items={reviewQueue} onQueueUpdated={refreshReviewQueue} />
            )}
          </div>
          <div className="widget-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Full lists live under Users & Alumni
            </span>
            <Link to="/dashboard/users" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>
        </div>

        <div className="widget">
          <div className="widget-header">
            <span className="widget-title">Recent Audit Log</span>
            <span className="badge badge-neutral">{auditPreviewBadge}</span>
          </div>
          <div className="widget-body" style={{ padding: 'var(--space-4) var(--space-5)' }}>
            {auditStatus === 'loading' ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading audit entries…</p>
            ) : auditStatus === 'error' ? (
              <p style={{ margin: 0, color: 'var(--color-red)', fontSize: 'var(--text-sm)' }}>
                Could not load audit log (requires admin access).
              </p>
            ) : auditPreviewLogs.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No audit entries yet.</p>
            ) : (
              <div className="activity-list">
                {auditPreviewLogs.map((log) => {
                  const dot = auditCategoryStyle(log.category);
                  return (
                    <div key={log._id} className="activity-item">
                      <div
                        className="activity-dot"
                        style={{ background: dot.background, color: dot.color }}
                      >
                        <ShieldIcon size={14} />
                      </div>
                      <div className="activity-body">
                        <div className="activity-text">
                          <strong>{auditActorLabel(log)}</strong>{' '}
                          <span style={{ fontWeight: 500 }}>{log.action}</span>
                          <span style={{ color: 'var(--text-muted)' }}> · {log.method} {log.path}</span>
                        </div>
                        <div className="activity-time">
                          {new Date(log.createdAt).toLocaleString()} · {log.category}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="widget-footer">
            <Link to="/dashboard/audit-logs" className="btn btn-ghost btn-sm">
              View Full Audit Log
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
