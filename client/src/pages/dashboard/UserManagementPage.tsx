import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { DataListing } from '../../components/common/DataListing';
import type { ListingColumn } from '../../components/common/DataListing';
import type { SortOption } from '../../components/common/DataListing/ListingSort';
import type { FilterField } from '../../components/common/DataListing/ListingFilter';
import { userService } from '../../services/user.service';
import type { UserRecord } from '../../services/user.service';
import { userProfileUrl } from '../../lib/profilePaths';
import { normalizeMongoId } from '../../lib/mongoId';
import toast from 'react-hot-toast';
import { MessagingBanDialog } from '../../components/messaging/MessagingBanDialog';
import { parseUsersListingSearch } from '../../lib/dashboardListSearchParams';

type UserRow = UserRecord & Record<string, unknown>;

const columns: ListingColumn<UserRow>[] = [
  {
    key: 'name',
    header: 'Name',
    minWidth: '150px',
    render: (row) => <span className="tbl-name">{row.name}</span>,
  },
  {
    key: 'email',
    header: 'Email',
    minWidth: '200px',
  },
  {
    key: 'role',
    header: 'Role',
    minWidth: '100px',
    render: (row) => (
      <span className={`badge badge-${roleBadge(row.role)}`}>
        {row.role}
      </span>
    ),
  },
  {
    key: 'isActive',
    header: 'Status',
    minWidth: '90px',
    render: (row) => (
      <span className={`badge ${row.isActive ? 'badge-success' : 'badge-error'}`}>
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'messagingBanned',
    header: 'Messaging',
    minWidth: '140px',
    render: (row) => (
      <span className={`badge ${row.messagingBanned ? 'badge-error' : 'badge-success'}`}>
        {row.messagingBanned ? 'Banned' : 'Allowed'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Created',
    minWidth: '120px',
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

const sortOptions: SortOption[] = [
  { label: 'Name A-Z', value: 'name-asc' },
  { label: 'Name Z-A', value: 'name-desc' },
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Oldest First', value: 'createdAt-asc' },
];

const roleFilterField: FilterField = {
  id: 'role',
  label: 'Role',
  options: [
    { label: 'All', value: '' },
    { label: 'Super Admin', value: 'superadmin' },
    { label: 'Admin', value: 'admin' },
    { label: 'HOD', value: 'hod' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Alumni', value: 'alumni' },
  ],
};

function roleBadge(role: string): string {
  switch (role) {
    case 'superadmin': return 'error';
    case 'admin': return 'warning';
    case 'hod': return 'accent';
    case 'faculty': return 'primary';
    default: return 'neutral';
  }
}

export function UserManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultFilterValues = useMemo(() => parseUsersListingSearch(searchParams), [searchParams]);
  const listResetKey = searchParams.toString();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [banUser, setBanUser] = useState<UserRow | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await userService.getAll();
        setUsers(data as UserRow[]);
      } catch {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const listingFilters = useMemo((): FilterField[] => {
    const depts = new Set<string>();
    const years = new Set<number>();
    for (const u of users) {
      const d = u.alumniDepartment;
      if (d?.trim()) depts.add(d);
      const y = u.alumniGraduationYear;
      if (typeof y === 'number' && !Number.isNaN(y)) years.add(y);
    }

    const alumniVerifiedFilter: FilterField = {
      id: 'alumniProfileVerified',
      label: 'Alumni verified',
      options: [
        { label: 'All', value: '' },
        { label: 'Verified', value: 'true' },
        { label: 'Unverified', value: 'false' },
      ],
    };

    const out: FilterField[] = [roleFilterField, alumniVerifiedFilter];

    if (depts.size > 0) {
      out.push({
        id: 'alumniDepartment',
        label: 'Alumni dept',
        options: [
          { label: 'All', value: '' },
          ...[...depts].sort((a, b) => a.localeCompare(b)).map((v) => ({ label: v, value: v })),
        ],
      });
    }

    if (years.size > 0) {
      out.push({
        id: 'alumniGraduationYear',
        label: 'Grad year',
        options: [
          { label: 'All', value: '' },
          ...[...years]
            .sort((a, b) => b - a)
            .map((y) => ({ label: String(y), value: String(y) })),
        ],
      });
    }

    return out;
  }, [users]);

  return (
    <DashboardShell pageTitle="User Management">
      <div className="page-header">
        <h2 className="page-title">User Management</h2>
        <p className="page-subtitle">
          View and manage all registered users across the platform.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      ) : (
        <DataListing<UserRow>
          key={listResetKey}
          defaultFilterValues={defaultFilterValues}
          columns={[
            ...columns,
            {
              key: '_msg_actions',
              header: '',
              minWidth: '120px',
              render: (row) => (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBanUser(row);
                  }}
                >
                  Messaging…
                </button>
              ),
            },
          ]}
          data={users}
          searchable
          searchPlaceholder="Search by name or email…"
          searchKeys={['name', 'email'] as (keyof UserRow)[]}
          sortOptions={sortOptions}
          defaultSort="name-asc"
          filters={listingFilters}
          pageSize={10}
          emptyState="No users found."
          getRowKey={(row) => normalizeMongoId(row._id ?? row.id)}
          onRowClick={(row) => {
            const id = normalizeMongoId(row._id ?? row.id);
            if (id) navigate(userProfileUrl(id));
          }}
        />
      )}

      {banUser && (
        <MessagingBanDialog
          open={!!banUser}
          userId={normalizeMongoId(banUser._id ?? banUser.id) ?? ''}
          userLabel={`${banUser.name} (${banUser.email})`}
          currentlyBanned={banUser.messagingBanned === true}
          onClose={() => setBanUser(null)}
          onSaved={async () => {
            try {
              const data = await userService.getAll();
              setUsers(data as UserRow[]);
            } catch {
              toast.error('Failed to refresh users');
            }
          }}
        />
      )}
    </DashboardShell>
  );
}
