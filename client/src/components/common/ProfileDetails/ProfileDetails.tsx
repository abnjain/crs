import type { ReactNode } from 'react';
import type { UserRecord } from '../../../services/user.service';
import type { AlumniRecord } from '../../../services/alumni.service';

export type ProfileDetailsProps = {
  user: UserRecord;
  alumni?: AlumniRecord | null;
  /** True while fetching optional alumni data for a user profile */
  alumniSectionLoading?: boolean;
  /** If true, show admin actions (cancel deletion) */
  canManage?: boolean;
  /** Callback invoked when admin cancels a scheduled deletion */
  onCancelDeletion?: (userId: string) => Promise<void> | void;
};

function formatDt(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function roleBadgeClass(role: string): string {
  switch (role) {
    case 'superadmin':
      return 'error';
    case 'admin':
      return 'warning';
    case 'hod':
      return 'accent';
    case 'faculty':
      return 'primary';
    default:
      return 'neutral';
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="profile-details-field">
      <div className="profile-details-label">{label}</div>
      <div className="profile-details-value">{children}</div>
    </div>
  );
}

/**
 * Reusable account + optional alumni profile blocks for dashboard profile pages
 * and any other screen that needs the same layout.
 */
export function ProfileDetails({ user, alumni, alumniSectionLoading }: ProfileDetailsProps) {
  const roles = user.roles?.length ? user.roles : user.role ? [user.role] : [];

  return (
    <div className="profile-details">
      <section className="profile-details-card" aria-labelledby="profile-account-heading">
        <h3 id="profile-account-heading" className="profile-details-section-title">
          Account
        </h3>
        <div className="profile-details-grid">
          <Field label="Name">{user.name}</Field>
          <Field label="Email">{user.email}</Field>
          <Field label="Primary role">
            <span className={`badge badge-${roleBadgeClass(user.role)}`}>{user.role}</span>
          </Field>
          <Field label="Roles">
            {roles.length ? (
              <span className="profile-details-role-list">
                {roles.map((r) => (
                  <span key={r} className={`badge badge-${roleBadgeClass(r)}`}>
                    {r}
                  </span>
                ))}
              </span>
            ) : (
              '—'
            )}
          </Field>
          <Field label="Status">
            <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </Field>
          {user.deletionScheduledFor && (
            <Field label="Deletion scheduled">
              <span className="badge badge-warning">
                {new Date(user.deletionScheduledFor).toLocaleString()}
              </span>
              {canManage && onCancelDeletion && (
                <div style={{ marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={async () => {
                      if (!confirm('Cancel scheduled deletion for this user?')) return;
                      try {
                        await onCancelDeletion(user.id);
                        // nothing else here; parent should refresh
                      } catch (err) {
                        // swallow; parent should surface error via toast
                      }
                    }}
                  >
                    Cancel deletion
                  </button>
                </div>
              )}
            </Field>
          )}
          <Field label="Created">{formatDt(user.createdAt)}</Field>
          <Field label="Last updated">{formatDt(user.updatedAt)}</Field>
        </div>
      </section>

      {alumniSectionLoading && (
        <section
          className="profile-details-card profile-details-card--loading"
          aria-busy="true"
          aria-live="polite"
        >
          <h3 className="profile-details-section-title">Alumni profile</h3>
          <div className="profile-details-lazy-placeholder">
            <div className="loading-spinner" aria-label="Loading alumni profile" />
            <p className="profile-details-lazy-text">Loading alumni details…</p>
          </div>
        </section>
      )}

      {!alumniSectionLoading && alumni && (
        <section className="profile-details-card" aria-labelledby="profile-alumni-heading">
          <h3 id="profile-alumni-heading" className="profile-details-section-title">
            Alumni profile
          </h3>
          <div className="profile-details-grid">
            <Field label="Department">{alumni.department ?? '—'}</Field>
            <Field label="Graduation year">{alumni.graduationYear ?? '—'}</Field>
            <Field label="Batch">{alumni.batch ?? '—'}</Field>
            <Field label="Company">{alumni.company ?? '—'}</Field>
            <Field label="Designation">{alumni.designation ?? '—'}</Field>
            <Field label="Location">{alumni.location ?? '—'}</Field>
            <Field label="Phone">{alumni.phone ?? '—'}</Field>
            <Field label="LinkedIn">
              {alumni.linkedIn ? (
                <a
                  href={alumni.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-details-external-link"
                >
                  {alumni.linkedIn}
                </a>
              ) : (
                '—'
              )}
            </Field>
            <Field label="Verification">
              <span
                className={`badge ${alumni.isVerified ? 'badge-success' : 'badge-warning'}`}
              >
                {alumni.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </Field>
            <Field label="Bio">
              {alumni.bio ? (
                <p className="profile-details-bio">{alumni.bio}</p>
              ) : (
                '—'
              )}
            </Field>
            <Field label="Profile created">{formatDt(alumni.createdAt)}</Field>
            <Field label="Profile updated">{formatDt(alumni.updatedAt)}</Field>
          </div>
        </section>
      )}
    </div>
  );
}
