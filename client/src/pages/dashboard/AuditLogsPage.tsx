import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { AuditLogsPanel } from '../../components/dashboard/AuditLogsPanel';

export function AuditLogsPage() {
  return (
    <DashboardShell pageTitle="Audit Logs">
      <div className="page-header">
        <h2 className="page-title">Audit Logs</h2>
        <p className="page-subtitle">Platform-wide API and security activity persisted for review.</p>
      </div>
      <AuditLogsPanel />
    </DashboardShell>
  );
}
