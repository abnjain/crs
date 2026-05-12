import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { DataListing } from '../../components/common/DataListing';
import type { ListingColumn } from '../../components/common/DataListing';
import type { SortOption } from '../../components/common/DataListing/ListingSort';
import type { FilterField } from '../../components/common/DataListing/ListingFilter';
import { Dialog } from '../../components/common/Dialog';
import { useAuth } from '../../context';
import { api } from '../../services/api';
import {
  documentService,
  type DocumentRecord,
  type DocumentPayload,
  type DocumentKind,
  type DocumentVisibility,
  type StorageProvider,
  type DocumentAudienceRole,
} from '../../services/document.service';
import toast from 'react-hot-toast';

type DocumentRow = {
  _id: string;
  title: string;
  kind: DocumentKind;
  ownerName: string;
  visibility: DocumentVisibility;
  audienceLabel: string;
  updatedAt: string;
  sizeLabel: string;
  fileName: string;
  doc: DocumentRecord;
} & Record<string, unknown>;

type DocumentFormState = {
  title: string;
  description: string;
  kind: DocumentKind;
  visibility: DocumentVisibility;
  shareAll: boolean;
  audienceRoles: DocumentAudienceRole[];
  audienceEmails: string;
  storageProvider: StorageProvider;
  file: File | null;
};

const ROLE_OPTIONS: { label: string; value: DocumentAudienceRole }[] = [
  { label: 'HOD', value: 'hod' },
  { label: 'Faculty', value: 'faculty' },
  { label: 'Alumni', value: 'alumni' },
];

function formatBytes(size?: number): string {
  if (!size || size <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let n = size;
  while (n >= 1024 && idx < units.length - 1) {
    n /= 1024;
    idx += 1;
  }
  return `${n.toFixed(n < 10 && idx > 0 ? 1 : 0)} ${units[idx]}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ownerName(owner: DocumentRecord['owner']): string {
  if (!owner) return '—';
  if (typeof owner === 'string') return '—';
  return owner.name || owner.email || '—';
}

function ownerId(owner: DocumentRecord['owner']): string {
  if (!owner) return '';
  if (typeof owner === 'string') return owner;
  return owner._id;
}

function audienceLabel(doc: DocumentRecord): string {
  if (doc.visibility === 'private') return 'Private';
  if (doc.shareAll) return 'All roles';
  if (doc.audienceRoles?.length) {
    return doc.audienceRoles.map((r) => capitalize(r)).join(', ');
  }
  if (doc.audienceUsers?.length) return 'Selected users';
  return 'Shared';
}

function buildDefaultForm(): DocumentFormState {
  return {
    title: '',
    description: '',
    kind: 'document',
    visibility: 'shared',
    shareAll: false,
    audienceRoles: ['faculty'],
    audienceEmails: '',
    storageProvider: 'local',
    file: null,
  };
}

function buildFormFromDoc(doc: DocumentRecord): DocumentFormState {
  const audienceEmails = Array.isArray(doc.audienceUsers)
    ? doc.audienceUsers.map((u) => u.email).filter(Boolean).join(', ')
    : '';

  return {
    title: doc.title ?? '',
    description: doc.description ?? '',
    kind: doc.kind ?? 'document',
    visibility: doc.visibility ?? 'shared',
    shareAll: Boolean(doc.shareAll),
    audienceRoles: doc.audienceRoles?.length ? doc.audienceRoles : ['faculty'],
    audienceEmails,
    storageProvider: doc.storageProvider ?? 'local',
    file: null,
  };
}

function resolveReadUrl(id: string): string {
  const base = import.meta.env.VITE_API_URL || '/api';
  const trimmed = base.replace(/\/$/, '');
  return `${trimmed}/v1/documents/${id}/read`;
}

export function DocumentsListingPage() {
  const { user } = useAuth();
  const roles = user?.roles?.length ? user.roles : user?.role ? [user.role] : [];

  const canCreate = roles.some((r) => ['faculty', 'hod', 'admin', 'superadmin'].includes(r));
  const canDelete = roles.some((r) => ['admin', 'superadmin'].includes(r));

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DocumentRecord | null>(null);
  const [form, setForm] = useState<DocumentFormState>(buildDefaultForm());
  const [saving, setSaving] = useState(false);
  const [readTarget, setReadTarget] = useState<DocumentRecord | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const rows = useMemo<DocumentRow[]>(() => {
    return documents.map((doc) => ({
      _id: doc._id,
      title: doc.title,
      kind: doc.kind,
      ownerName: ownerName(doc.owner),
      visibility: doc.visibility,
      audienceLabel: audienceLabel(doc),
      updatedAt: doc.updatedAt,
      sizeLabel: formatBytes(doc.sizeBytes),
      fileName: doc.fileName,
      doc,
    }));
  }, [documents]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await documentService.getAll();
        setDocuments(data);
      } catch {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!formOpen && !editTarget) {
      setForm(buildDefaultForm());
      return;
    }
    if (editTarget) {
      setForm(buildFormFromDoc(editTarget));
    }
  }, [formOpen, editTarget]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const sortOptions: SortOption[] = [
    { label: 'Updated (Newest)', value: 'updatedAt-desc' },
    { label: 'Updated (Oldest)', value: 'updatedAt-asc' },
    { label: 'Title A-Z', value: 'title-asc' },
    { label: 'Title Z-A', value: 'title-desc' },
  ];

  const filters: FilterField[] = [
    {
      id: 'kind',
      label: 'Type',
      options: [
        { label: 'All', value: '' },
        { label: 'Document', value: 'document' },
        { label: 'Research', value: 'research' },
      ],
    },
    {
      id: 'visibility',
      label: 'Visibility',
      options: [
        { label: 'All', value: '' },
        { label: 'Shared', value: 'shared' },
        { label: 'Private', value: 'private' },
      ],
    },
  ];

  async function refresh() {
    const data = await documentService.getAll();
    setDocuments(data);
  }

  function openCreate() {
    setEditTarget(null);
    setForm(buildDefaultForm());
    setFormOpen(true);
  }

  function openEdit(doc: DocumentRecord) {
    setEditTarget(doc);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
  }

  function toggleRole(role: DocumentAudienceRole) {
    setForm((prev) => {
      const exists = prev.audienceRoles.includes(role);
      const nextRoles = exists
        ? prev.audienceRoles.filter((r) => r !== role)
        : [...prev.audienceRoles, role];
      return { ...prev, audienceRoles: nextRoles };
    });
  }

  async function saveDocument() {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!editTarget && !form.file) {
      toast.error('Select a file to upload');
      return;
    }

    const payload: DocumentPayload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      audienceEmails: form.audienceEmails.trim(),
    };

    if (form.visibility === 'private') {
      payload.shareAll = false;
      payload.audienceRoles = [];
      payload.audienceEmails = '';
    } else if (form.shareAll) {
      payload.audienceRoles = [];
    } else if (!payload.audienceRoles.length && !payload.audienceEmails) {
      payload.audienceRoles = ['faculty'];
    }

    setSaving(true);
    try {
      if (editTarget) {
        await documentService.update(editTarget._id, payload);
        toast.success('Document updated');
      } else {
        await documentService.create(payload);
        toast.success('Document uploaded');
      }
      await refresh();
      closeForm();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function removeDocument(doc: DocumentRecord) {
    if (!canDelete) return;
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    try {
      await documentService.remove(doc._id);
      toast.success('Document deleted');
      await refresh();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Delete failed');
    }
  }

  async function openRead(doc: DocumentRecord) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setReadTarget(doc);
    setPreviewLoading(true);
    try {
      const res = await api.get(resolveReadUrl(doc._id), { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      setPreviewUrl(url);
    } catch {
      toast.error('Failed to load document');
    } finally {
      setPreviewLoading(false);
    }
  }

  function closeRead() {
    setReadTarget(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  async function downloadCurrent() {
    if (!readTarget) return;
    if (!previewUrl) {
      await openRead(readTarget);
      return;
    }
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = readTarget.fileName || 'document';
    link.click();
  }

  const columns: ListingColumn<DocumentRow>[] = [
    {
      key: 'title',
      header: 'Title',
      minWidth: '220px',
      render: (row) => (
        <div>
          <div className="tbl-name">{row.title}</div>
          <div className="tbl-meta">{row.fileName} &bull; {row.sizeLabel}</div>
        </div>
      ),
    },
    {
      key: 'kind',
      header: 'Type',
      minWidth: '110px',
      render: (row) => (
        <span className={`badge badge-${row.kind === 'research' ? 'accent' : 'primary'}`}>
          {row.kind === 'research' ? 'Research' : 'Document'}
        </span>
      ),
    },
    {
      key: 'visibility',
      header: 'Visibility',
      minWidth: '160px',
      render: (row) => (
        <div>
          <span className={`badge badge-${row.visibility === 'private' ? 'error' : 'success'}`}>
            {row.visibility === 'private' ? 'Private' : 'Shared'}
          </span>
          <div className="tbl-meta">{row.audienceLabel}</div>
        </div>
      ),
    },
    {
      key: 'ownerName',
      header: 'Owner',
      minWidth: '160px',
      render: (row) => <span className="tbl-name">{row.ownerName}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      minWidth: '140px',
      render: (row) => (
        <span className="tbl-meta">{new Date(row.updatedAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      minWidth: '220px',
      render: (row) => {
        const isOwner = ownerId(row.doc.owner) === (user?.id || '');
        return (
          <div className="doc-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void openRead(row.doc)}>
              Read
            </button>
            {isOwner && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(row.doc)}>
                Edit
              </button>
            )}
            {canDelete && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => void removeDocument(row.doc)}>
                Delete
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const readIsPdf = readTarget?.mimeType === 'application/pdf';

  return (
    <DashboardShell pageTitle="Documents">
      <div className="page-header">
        <h2 className="page-title">Documents</h2>
        <p className="page-subtitle">
          Upload, share, and manage documents and research. Set visibility for roles or specific users.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      ) : (
        <DataListing<DocumentRow>
          columns={columns}
          data={rows}
          searchable
          searchPlaceholder="Search by title or owner…"
          searchKeys={['title', 'ownerName', 'fileName'] as (keyof DocumentRow)[]}
          sortOptions={sortOptions}
          defaultSort="updatedAt-desc"
          filters={filters}
          pageSize={10}
          emptyState="No documents found."
          actions={
            canCreate ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                Upload Document
              </button>
            ) : null
          }
        />
      )}

      <Dialog open={formOpen} onClose={closeForm} title={editTarget ? 'Edit Document' : 'Upload Document'} className="doc-dialog">
        <div className="doc-form-grid">
          <label className="form-label">
            Title
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </label>

          <label className="form-label">
            Description (optional)
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </label>

          <div className="doc-form-row">
            <label className="form-label">
              Type
              <select
                className="input"
                value={form.kind}
                onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value as DocumentKind }))}
              >
                <option value="document">Document</option>
                <option value="research">Research</option>
              </select>
            </label>

            <label className="form-label">
              Storage
              <select
                className="input"
                value={form.storageProvider}
                onChange={(e) => setForm((prev) => ({ ...prev, storageProvider: e.target.value as StorageProvider }))}
              >
                <option value="local">System (Local)</option>
                <option value="s3">S3</option>
              </select>
            </label>
          </div>

          <div className="doc-form-row">
            <label className="form-label">
              Visibility
              <select
                className="input"
                value={form.visibility}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    visibility: e.target.value as DocumentVisibility,
                  }))
                }
              >
                <option value="shared">Shared</option>
                <option value="private">Private</option>
              </select>
            </label>

            <label className="form-label checkbox-row">
              <input
                type="checkbox"
                checked={form.shareAll}
                disabled={form.visibility === 'private'}
                onChange={(e) => setForm((prev) => ({ ...prev, shareAll: e.target.checked }))}
              />
              Share with all roles
            </label>
          </div>

          <div className="doc-form-roles">
            <div className="form-label">Share with roles</div>
            <div className="doc-role-grid">
              {ROLE_OPTIONS.map((role) => (
                <label key={role.value} className="doc-role-item">
                  <input
                    type="checkbox"
                    checked={form.audienceRoles.includes(role.value)}
                    disabled={form.visibility === 'private' || form.shareAll}
                    onChange={() => toggleRole(role.value)}
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
            <p className="doc-form-hint">
              Faculty is selected by default. Toggle Alumni to share with alumni.
            </p>
          </div>

          <label className="form-label">
            Specific users (emails, comma-separated)
            <input
              className="input"
              value={form.audienceEmails}
              disabled={form.visibility === 'private'}
              onChange={(e) => setForm((prev) => ({ ...prev, audienceEmails: e.target.value }))}
              placeholder="example@domain.edu, another@domain.edu"
            />
          </label>

          <label className="form-label">
            {editTarget ? 'Replace file (optional)' : 'File'}
            <input
              className="input"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setForm((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))}
            />
          </label>

          {editTarget && editTarget.fileName ? (
            <p className="doc-form-hint">Current file: {editTarget.fileName}</p>
          ) : null}
        </div>

        <div className="doc-form-actions">
          <button type="button" className="btn btn-ghost" onClick={closeForm} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void saveDocument()} disabled={saving}>
            {editTarget ? 'Save Changes' : 'Upload'}
          </button>
        </div>
      </Dialog>

      <Dialog open={!!readTarget} onClose={closeRead} title={readTarget?.title} className="doc-dialog doc-read-dialog">
        {readTarget ? (
          <div className="doc-read-grid">
            <div className="doc-read-meta">
              <div className="doc-read-row">
                <span className="doc-read-label">File</span>
                <span className="doc-read-value">{readTarget.fileName}</span>
              </div>
              <div className="doc-read-row">
                <span className="doc-read-label">Type</span>
                <span className="doc-read-value">{readTarget.kind === 'research' ? 'Research' : 'Document'}</span>
              </div>
              <div className="doc-read-row">
                <span className="doc-read-label">Visibility</span>
                <span className="doc-read-value">{readTarget.visibility === 'private' ? 'Private' : 'Shared'}</span>
              </div>
              <div className="doc-read-row">
                <span className="doc-read-label">Shared with</span>
                <span className="doc-read-value">{audienceLabel(readTarget)}</span>
              </div>
              <div className="doc-read-row">
                <span className="doc-read-label">Size</span>
                <span className="doc-read-value">{formatBytes(readTarget.sizeBytes)}</span>
              </div>
            </div>

            <div className="doc-read-preview">
              {previewLoading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div className="loading-spinner" aria-label="Loading" />
                </div>
              ) : readIsPdf && previewUrl ? (
                <iframe
                  title={readTarget.title}
                  className="doc-preview-frame"
                  src={previewUrl}
                />
              ) : (
                <div className="doc-preview-placeholder">
                  <p>This file type cannot be previewed. Use download.</p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="doc-form-actions">
          <button type="button" className="btn btn-ghost" onClick={closeRead}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void downloadCurrent()}>
            Download
          </button>
        </div>
      </Dialog>
    </DashboardShell>
  );
}
