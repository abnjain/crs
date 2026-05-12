import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { ProfileDetails } from '../../components/common/ProfileDetails';
import { userService } from '../../services/user.service';
import type { UserRecord } from '../../services/user.service';
import { useAuth } from '../../context';
import { alumniService } from '../../services/alumni.service';
import type { AlumniRecord } from '../../services/alumni.service';
import { parseProfileKind, type ProfileKind } from '../../lib/profilePaths';
import { normalizeMongoId } from '../../lib/mongoId';
import { userRecordFromAlumniPopulation } from '../../lib/alumniUser';
import toast from 'react-hot-toast';

function listPathForKind(kind: ProfileKind): string {
  return kind === 'user' ? '/dashboard/users' : '/dashboard/alumni';
}

function listLabelForKind(kind: ProfileKind): string {
  return kind === 'user' ? 'User management' : 'Alumni directory';
}

export function ProfileDetailsPage() {
  const { kind: kindParam, entityId: entityIdParam } = useParams<{
    kind: string;
    entityId: string;
  }>();
  const kind = parseProfileKind(kindParam);
  const entityId = entityIdParam
    ? normalizeMongoId(decodeURIComponent(entityIdParam))
    : '';

  const [user, setUser] = useState<UserRecord | null>(null);
  const [alumni, setAlumni] = useState<AlumniRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [alumniExtraLoading, setAlumniExtraLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!kind || !entityId) {
      setNotFound(true);
      setLoading(false);
      setUser(null);
      setAlumni(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setUser(null);
      setAlumni(null);
      try {
        if (kind === 'user') {
          const u = await userService.getById(entityId);
          if (cancelled) return;
          setUser(u);
        } else {
          const a = await alumniService.getById(entityId);
          if (cancelled) return;
          setAlumni(a);
          setUser(userRecordFromAlumniPopulation(a));
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load profile');
          setNotFound(true);
          setUser(null);
          setAlumni(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [kind, entityId]);

  useEffect(() => {
    if (kind !== 'user' || !user) {
      setAlumniExtraLoading(false);
      return;
    }

    const uid = normalizeMongoId(user._id ?? user.id);
    if (!uid) {
      setAlumniExtraLoading(false);
      return;
    }

    let cancelled = false;
    setAlumniExtraLoading(true);
    setAlumni(null);

    async function loadLinkedAlumni() {
      try {
        const a = await alumniService.getByUserId(uid);
        if (cancelled) return;
        setAlumni(a);
      } catch {
        if (!cancelled) toast.error('Failed to load alumni details');
      } finally {
        if (!cancelled) setAlumniExtraLoading(false);
      }
    }

    void loadLinkedAlumni();
    return () => {
      cancelled = true;
    };
  }, [kind, user]);

  const heading = notFound || !user ? 'Profile not found' : user.name;

  return (
    <DashboardShell pageTitle={heading}>
      {kind && (
        <div className="page-header">
          <Link to={listPathForKind(kind)} className="profile-back-link">
            ← Back to {listLabelForKind(kind)}
          </Link>
          <h2 className="page-title">{heading}</h2>
          <p className="page-subtitle">
            {kind === 'user'
              ? 'Account details; alumni profile loads when available.'
              : 'Linked account and alumni profile details.'}
          </p>
        </div>
      )}

      {!kind && (
        <div className="page-header">
          <h2 className="page-title">Invalid link</h2>
          <p className="page-subtitle">This profile URL is not valid.</p>
          <Link to="/dashboard" className="profile-back-link">
            ← Back to dashboard
          </Link>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      )}

      {!loading && user && kind && (
        <ProfileDetails
          user={user}
          alumni={alumni}
          alumniSectionLoading={kind === 'user' ? alumniExtraLoading : false}
          canManage={Boolean(currentUser && ['admin', 'superadmin', 'hod'].includes(currentUser.role))}
          onCancelDeletion={async (userId: string) => {
            try {
              await userService.cancelDeletion(userId);
              toast.success('Scheduled deletion cancelled');
              // refresh
              const refreshed = await userService.getById(entityId);
              setUser(refreshed);
            } catch (err: unknown) {
              const ax = err as { response?: { data?: { message?: string } } };
              toast.error(ax.response?.data?.message ?? 'Failed to cancel deletion');
            }
          }}
        />
      )}
    </DashboardShell>
  );
}
