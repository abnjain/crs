import { useState, useEffect, type FormEvent, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { DataListing } from '../../components/common/DataListing';
import type { ListingColumn } from '../../components/common/DataListing';
import { Dropdown } from '../../components/common/Dropdown';
import type { DropdownOption } from '../../components/common/Dropdown';
import { siteConfigService } from '../../services/siteConfig.service';
import type { SiteConfigRecord } from '../../services/siteConfig.service';
import toast from 'react-hot-toast';

type ConfigRow = {
  keyField: keyof SiteConfigRecord;
  label: string;
  rawValue: string;
} & Record<string, unknown>;

const FIELD_META_LIST: {
  field: keyof SiteConfigRecord;
  label: string;
  type: 'text' | 'checkbox' | 'number' | 'select' | 'textarea';
  options?: string[];
  /** Uses full grid width (e.g. textarea) */
  fullWidth?: boolean;
}[] = [
  { field: 'siteName', label: 'Site name', type: 'text' },
  { field: 'contactEmail', label: 'Contact email', type: 'text' },
  { field: 'announcementBanner', label: 'Announcement banner', type: 'textarea', fullWidth: true },
  { field: 'messagingEnabled', label: 'Messaging enabled (global)', type: 'checkbox' },
  { field: 'alumniCanMessageFaculty', label: 'Alumni can message faculty', type: 'checkbox' },
  { field: 'alumniCanMessageAlumni', label: 'Alumni can message alumni', type: 'checkbox' },
  { field: 'alumniCanMessageAdmin', label: 'Alumni can message administration', type: 'checkbox' },
  { field: 'facultyMustOptInForAlumniChat', label: 'Faculty must opt-in for alumni DMs', type: 'checkbox' },
  { field: 'maintenanceMode', label: 'Maintenance mode', type: 'checkbox' },
  { field: 'registrationEnabled', label: 'Registration open', type: 'checkbox' },
  {
    field: 'defaultRole',
    label: 'Default signup role',
    type: 'select',
    options: ['alumni', 'faculty', 'hod', 'admin', 'superadmin'],
  },
  { field: 'maxUploadSizeMB', label: 'Max upload (MB)', type: 'number' },
  { field: 'sessionTimeoutMinutes', label: 'Session timeout (minutes)', type: 'number' },
];

const FIELD_META_BY_KEY = FIELD_META_LIST.reduce(
  (acc, m) => {
    acc[m.field] = m;
    return acc;
  },
  {} as Record<keyof SiteConfigRecord, (typeof FIELD_META_LIST)[number]>
);

/** Edit form: grouped logically and alphabetically within each group */
const CONFIG_FORM_SECTIONS: { title: string; fieldKeys: (keyof SiteConfigRecord)[] }[] = [
  {
    title: 'Site & contact',
    fieldKeys: (['siteName', 'contactEmail'] as (keyof SiteConfigRecord)[]).sort((a, b) =>
      FIELD_META_BY_KEY[a].label.localeCompare(FIELD_META_BY_KEY[b].label)
    ),
  },
  { title: 'Announcements', fieldKeys: ['announcementBanner'] },
  {
    title: 'Messaging policy',
    fieldKeys: (
      [
        'messagingEnabled',
        'alumniCanMessageFaculty',
        'alumniCanMessageAlumni',
        'alumniCanMessageAdmin',
        'facultyMustOptInForAlumniChat',
      ] as (keyof SiteConfigRecord)[]
    ).sort((a, b) => FIELD_META_BY_KEY[a].label.localeCompare(FIELD_META_BY_KEY[b].label)),
  },
  {
    title: 'Public access',
    fieldKeys: (['maintenanceMode', 'registrationEnabled'] as (keyof SiteConfigRecord)[]).sort((a, b) =>
      FIELD_META_BY_KEY[a].label.localeCompare(FIELD_META_BY_KEY[b].label)
    ),
  },
  {
    title: 'Registration & security',
    fieldKeys: (
      ['defaultRole', 'maxUploadSizeMB', 'sessionTimeoutMinutes'] as (keyof SiteConfigRecord)[]
    ).sort((a, b) => FIELD_META_BY_KEY[a].label.localeCompare(FIELD_META_BY_KEY[b].label)),
  },
];

function summarizeValue(cfg: SiteConfigRecord, field: keyof SiteConfigRecord): string {
  const v = cfg[field];
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (v === undefined || v === null) return '';
  return String(v);
}

function roleSelectOptions(raw: string[] | undefined): DropdownOption[] {
  return (raw ?? []).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
    searchText: value,
  }));
}

function renderSettingControl(
  m: (typeof FIELD_META_LIST)[number],
  form: SiteConfigRecord,
  setForm: Dispatch<SetStateAction<SiteConfigRecord | null>>
): ReactNode {
  const fid = String(m.field);

  if (m.type === 'checkbox') {
    return (
      <label className="config-field config-field-checkbox" htmlFor={fid}>
        <input
          id={fid}
          type="checkbox"
          checked={Boolean(form[m.field])}
          onChange={(e) =>
            setForm((prev) => (prev ? ({ ...prev, [m.field]: e.target.checked } as SiteConfigRecord) : prev))
          }
        />
        <span className="config-field-checkbox-label">{m.label}</span>
      </label>
    );
  }

  if (m.type === 'select') {
    const labelId = `${fid}-label`;
    const options = roleSelectOptions(m.options);
    return (
      <div className="config-field config-field-stack">
        <label id={labelId} className="config-field-label">
          {m.label}
        </label>
        <Dropdown
          className="dropdown--role-select"
          options={options}
          value={String(form[m.field])}
          onChange={(v) =>
            setForm((prev) => (prev ? ({ ...prev, [m.field]: v } as SiteConfigRecord) : prev))
          }
          placeholder="Select role…"
          ariaLabelledBy={labelId}
        />
      </div>
    );
  }

  if (m.type === 'number') {
    return (
      <div className="config-field config-field-stack">
        <label htmlFor={fid} className="config-field-label">
          {m.label}
        </label>
        <input
          id={fid}
          type="number"
          className="input"
          required
          min={m.field === 'maxUploadSizeMB' ? 1 : 5}
          value={Number(form[m.field])}
          onChange={(e) =>
            setForm((prev) => (prev ? ({ ...prev, [m.field]: Number(e.target.value) } as SiteConfigRecord) : prev))
          }
        />
      </div>
    );
  }

  if (m.type === 'textarea') {
    return (
      <div className="config-field config-field-stack">
        <label htmlFor={fid} className="config-field-label">
          {m.label}
        </label>
        <textarea
          id={fid}
          className="input"
          rows={3}
          value={String(form[m.field] ?? '')}
          onChange={(e) =>
            setForm((prev) => (prev ? ({ ...prev, [m.field]: e.target.value } as SiteConfigRecord) : prev))
          }
        />
      </div>
    );
  }

  return (
    <div className="config-field config-field-stack">
      <label htmlFor={fid} className="config-field-label">
        {m.label}
      </label>
      <input
        id={fid}
        type="text"
        className="input"
        required={m.field === 'siteName'}
        value={String(form[m.field] ?? '')}
        onChange={(e) =>
          setForm((prev) => (prev ? ({ ...prev, [m.field]: e.target.value } as SiteConfigRecord) : prev))
        }
      />
    </div>
  );
}

export function SystemConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SiteConfigRecord | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const c = await siteConfigService.get();
        setForm({
          siteName: c.siteName,
          maintenanceMode: c.maintenanceMode,
          registrationEnabled: c.registrationEnabled,
          defaultRole: c.defaultRole,
          maxUploadSizeMB: c.maxUploadSizeMB,
          sessionTimeoutMinutes: c.sessionTimeoutMinutes,
          contactEmail: c.contactEmail ?? '',
          announcementBanner: c.announcementBanner ?? '',
          messagingEnabled: c.messagingEnabled ?? true,
          alumniCanMessageFaculty: c.alumniCanMessageFaculty ?? true,
          alumniCanMessageAlumni: c.alumniCanMessageAlumni ?? false,
          alumniCanMessageAdmin: c.alumniCanMessageAdmin ?? true,
          facultyMustOptInForAlumniChat: c.facultyMustOptInForAlumniChat ?? true,
        });
      } catch {
        toast.error('Failed to load system config');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const rowsAlphabetical: ConfigRow[] = form
    ? [...FIELD_META_LIST]
        .map((m) => ({
          keyField: m.field,
          label: m.label,
          rawValue: summarizeValue(form, m.field),
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    : [];

  const previewColumns: ListingColumn<ConfigRow>[] = [
    { key: 'label', header: 'Setting', minWidth: '200px' },
    {
      key: 'rawValue',
      header: 'Current value',
      minWidth: '240px',
      render: (row) => (
        <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{row.rawValue || '—'}</span>
      ),
    },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await siteConfigService.update({
        ...form,
        maxUploadSizeMB: Number(form.maxUploadSizeMB),
        sessionTimeoutMinutes: Number(form.sessionTimeoutMinutes),
      });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <DashboardShell pageTitle="System Configuration">
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell pageTitle="System Configuration">
      <div className="page-header">
        <h2 className="page-title">System Configuration</h2>
        <p className="page-subtitle">
          Editable CRS platform settings stored in MongoDB (singleton). Sensitive env overrides remain server-side only.
        </p>
      </div>

      <DataListing<ConfigRow>
        title={<span style={{ fontSize: 'var(--text-lg)' }}>Effective values</span>}
        columns={previewColumns}
        data={rowsAlphabetical}
        pagination={false}
      />

      <div className="widget" style={{ marginTop: 'var(--space-8)' }}>
        <div className="widget-header">
          <span className="widget-title">Edit configuration</span>
        </div>
        <div className="widget-body">
          <form onSubmit={(e) => void handleSubmit(e)} className="config-settings-form">
            {CONFIG_FORM_SECTIONS.map((section) => {
              const isCheckboxOnlySection =
                section.fieldKeys.length > 1 &&
                section.fieldKeys.every((k) => FIELD_META_BY_KEY[k].type === 'checkbox');

              return (
                <section key={section.title} className="config-settings-section">
                  <h3 className="config-settings-section-title">{section.title}</h3>

                  {isCheckboxOnlySection ? (
                    <div className="config-settings-check-row">
                      {section.fieldKeys.map((key) =>
                        renderSettingControl(FIELD_META_BY_KEY[key], form, setForm)
                      )}
                    </div>
                  ) : (
                    <div className="config-settings-grid">
                      {section.fieldKeys.map((key) => {
                        const m = FIELD_META_BY_KEY[key];
                        const fw = Boolean(m.fullWidth);
                        const isCb = m.type === 'checkbox';
                        return (
                          <div
                            key={key}
                            className={fw || isCb ? 'config-settings-grid-span' : undefined}
                          >
                            {renderSettingControl(m, form, setForm)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}

            <div className="config-settings-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
