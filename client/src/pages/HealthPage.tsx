import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthService, type HealthResponse } from '../services/health.service';
import { useAuth } from '../context';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function HealthContent() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    healthService
      .getHealth()
      .then(setHealth)
      .catch((e) => setError(e.message || 'Failed to fetch health'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main id="main-content">
          <div className="container section">
            <p>Loading health data...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main id="main-content">
          <div className="container section">
            <div className="auth-alert auth-alert-error visible">{error}</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!health) return null;

  const isHealthy = health.status === 'healthy';
  const statusTone = isHealthy ? 'ok' : 'warn';
  const lastUpdated = new Date(health.timestamp).toLocaleString();
  const heapPct = health.diagnostics?.nodeHeapPercent ?? null;
  const mongoTone =
    health.services.mongodb === 'connected'
      ? 'ok'
      : health.services.mongodb === 'connecting'
        ? 'warn'
        : 'error';
  const redisTone =
    health.services.redis === 'connected'
      ? 'ok'
      : health.services.redis === 'disabled'
        ? 'warn'
        : 'error';
  const mailTone =
    health.services.mail.status === 'connected'
      ? 'ok'
      : health.services.mail.status === 'disabled'
        ? 'warn'
        : 'error';
  const smtpDetail = health.services.mail.detail ?? health.diagnostics?.smtp?.detail ?? null;
  const smtpLatency = health.diagnostics?.smtp?.latencyMs ?? null;
  const storage = health.diagnostics?.storage ?? null;
  const storagePct = storage ? Math.round((storage.usedBytes / storage.totalBytes) * 100) : null;
  const storageTone =
    storagePct == null ? 'disabled' : storagePct >= 90 ? 'error' : storagePct >= 75 ? 'warn' : 'ok';
  const storageLabel =
    storagePct == null ? 'Unknown' : storagePct >= 90 ? 'Critical' : storagePct >= 75 ? 'Warning' : 'Healthy';

  return (
    <>
      <Header />
      <main id="main-content">
        <div className="container section health-page">
          <div className="health-header">
            <Link to="/dashboard" className="health-back">
              ← Back to Dashboard
            </Link>
            <div>
              <h1 className="dashboard-title">Server Health</h1>
              <p className="dashboard-subtitle">
                Admin view • Logged in as {user?.email} ({user?.role})
              </p>
            </div>
          </div>

          <div className="health-summary-grid">
            <div className={`dashboard-card health-card health-status-card health-status-${statusTone}`}>
              <div className="health-card-head">
                <h2 className="dashboard-card-title">Overall status</h2>
                <span className={`health-pill health-pill--${statusTone}`}>{capitalize(health.status)}</span>
              </div>
              <div className="health-kpi">{health.status.toUpperCase()}</div>
              <p className="health-subtext">Last updated {lastUpdated}</p>
            </div>

            <div className="dashboard-card health-card">
              <div className="health-card-head">
                <h2 className="dashboard-card-title">Uptime</h2>
              </div>
              <div className="health-kpi">{health.uptime.formatted}</div>
              <p className="health-subtext">{health.uptime.seconds} seconds since last restart.</p>
            </div>

            <div className="dashboard-card health-card">
              <div className="health-card-head">
                <h2 className="dashboard-card-title">Memory</h2>
                {heapPct != null && <span className="health-pill health-pill--neutral">{heapPct}% heap</span>}
              </div>
              <div className="health-kpi">
                {health.memory.heapUsed} / {health.memory.heapTotal} {health.memory.unit}
              </div>
              <p className="health-subtext">RSS {health.memory.rss} {health.memory.unit} in use.</p>
            </div>

            <div className="dashboard-card health-card">
              <div className="health-card-head">
                <h2 className="dashboard-card-title">Storage</h2>
                <span className={`health-pill health-pill--${storageTone}`}>{storageLabel}</span>
              </div>
              <div className="health-kpi">
                {storage ? `${storage.usedLabel} / ${storage.totalLabel}` : 'Unavailable'}
              </div>
              <div className="health-progress">
                <span
                  className={`health-progress-bar health-progress--${storageTone}`}
                  style={{ width: `${storagePct ?? 0}%` }}
                />
              </div>
              <p className="health-subtext">
                {storagePct != null ? `${storagePct}% used` : 'Storage metrics not available yet.'}
              </p>
            </div>
          </div>

          <section className="health-section">
            <div className="health-section-head">
              <h2 className="dashboard-card-title">Service checks</h2>
              <p className="health-section-subtext">Clear signals for each dependency, plus quick context for what is affected.</p>
            </div>
            <div className="health-service-grid">
              <div className={`dashboard-card health-service-card health-service-${mongoTone}`}>
                <div className="health-card-head">
                  <h3 className="health-service-title">MongoDB</h3>
                  <span className={`health-pill health-pill--${mongoTone}`}>{capitalize(health.services.mongodb)}</span>
                </div>
                <p className="health-service-info">Primary database connectivity and query latency.</p>
                <ul className="health-service-list">
                  <li>
                    <span className="health-service-label">Database</span>
                    <span className="health-service-value">
                      {health.services.mongodbDatabase ? health.services.mongodbDatabase : 'Unknown'}
                    </span>
                  </li>
                  <li>
                    <span className="health-service-label">Ping</span>
                    <span className="health-service-value">
                      {health.diagnostics?.mongodbLatencyMs != null ? `${health.diagnostics.mongodbLatencyMs} ms` : '—'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className={`dashboard-card health-service-card health-service-${redisTone}`}>
                <div className="health-card-head">
                  <h3 className="health-service-title">Redis</h3>
                  <span className={`health-pill health-pill--${redisTone}`}>{capitalize(health.services.redis)}</span>
                </div>
                <p className="health-service-info">Cache and rate-limit state for fast responses.</p>
                <ul className="health-service-list">
                  <li>
                    <span className="health-service-label">Ping</span>
                    <span className="health-service-value">
                      {health.diagnostics?.redisLatencyMs != null ? `${health.diagnostics.redisLatencyMs} ms` : '—'}
                    </span>
                  </li>
                  <li>
                    <span className="health-service-label">Memory</span>
                    <span className="health-service-value">
                      {health.diagnostics?.redisMemoryPercent != null
                        ? `${health.diagnostics.redisMemoryPercent}%`
                        : '—'}
                    </span>
                  </li>
                  {health.diagnostics?.redisMemoryNote && (
                    <li>
                      <span className="health-service-label">Note</span>
                      <span className="health-service-value">{health.diagnostics.redisMemoryNote}</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className={`dashboard-card health-service-card health-service-${mailTone}`}>
                <div className="health-card-head">
                  <h3 className="health-service-title">SMTP</h3>
                  <span className={`health-pill health-pill--${mailTone}`}>{capitalize(health.services.mail.status)}</span>
                </div>
                <p className="health-service-info">Outbound email and verification delivery.</p>
                <ul className="health-service-list">
                  <li>
                    <span className="health-service-label">Endpoint</span>
                    <span className="health-service-value">{smtpDetail || 'Not configured'}</span>
                  </li>
                  <li>
                    <span className="health-service-label">Latency</span>
                    <span className="health-service-value">{smtpLatency != null ? `${smtpLatency} ms` : '—'}</span>
                  </li>
                </ul>
              </div>

              <div className={`dashboard-card health-service-card health-service-${storageTone}`}>
                <div className="health-card-head">
                  <h3 className="health-service-title">Upload storage</h3>
                  <span className={`health-pill health-pill--${storageTone}`}>{storageLabel}</span>
                </div>
                <p className="health-service-info">Attachment storage for documents and media.</p>
                <ul className="health-service-list">
                  <li>
                    <span className="health-service-label">Usage</span>
                    <span className="health-service-value">
                      {storage ? `${storage.usedLabel} / ${storage.totalLabel}` : 'Unavailable'}
                    </span>
                  </li>
                  <li>
                    <span className="health-service-label">Capacity</span>
                    <span className="health-service-value">{storagePct != null ? `${storagePct}% used` : '—'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <div className="health-detail-grid">
            <div className="dashboard-card health-card">
              <h2 className="dashboard-card-title">Diagnostics</h2>
              <ul className="health-metric-list">
                <li>Mongo ping: {health.diagnostics?.mongodbLatencyMs != null ? `${health.diagnostics.mongodbLatencyMs} ms` : '—'}</li>
                <li>Redis ping: {health.diagnostics?.redisLatencyMs != null ? `${health.diagnostics.redisLatencyMs} ms` : '—'}</li>
                <li>SMTP latency: {smtpLatency != null ? `${smtpLatency} ms` : '—'}</li>
                <li>Heap usage: {heapPct != null ? `${heapPct}%` : '—'}</li>
                <li>Health probe: {health.diagnostics?.probeDurationMs != null ? `${health.diagnostics.probeDurationMs} ms` : '—'}</li>
              </ul>
            </div>
            <div className="dashboard-card health-card">
              <h2 className="dashboard-card-title">About this server</h2>
              <ul className="health-metric-list">
                <li>Version: {health.version}</li>
                <li>Status summary: {capitalize(health.status)}</li>
                <li>Timestamp: {health.timestamp}</li>
                <li>Mail status: {capitalize(health.services.mail.status)}</li>
                <li>Redis status: {capitalize(health.services.redis)}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function HealthPage() {
  return (
    <ProtectedRoute>
      <HealthContent />
    </ProtectedRoute>
  );
}
