/**
 * ============================================================
 * My Profile Page (/me)
 * ============================================================
 */

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { FormField } from '../../components/common/FormField';
import { useAuth } from '../../context';
import { authService } from '../../services/auth.service';
import { alumniService, type AlumniRecord } from '../../services/alumni.service';
import type { UserRole } from '../../context/AuthContext';

function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    superadmin: 'Super Administrator',
    admin: 'Administrator',
    hod: 'Head of Department',
    faculty: 'Faculty',
    alumni: 'Alumni',
    guest: 'Guest',
  };
  return map[role] ?? role;
}

function roleSubtitle(role: UserRole): string {
  switch (role) {
    case 'superadmin':
      return 'Manage system configuration, security, and platform-wide governance.';
    case 'admin':
      return 'Oversee users, reports, and institutional operations.';
    case 'hod':
      return 'Monitor department activity and coordinate faculty initiatives.';
    case 'faculty':
      return 'Maintain your academic profile and alumni engagement settings.';
    case 'alumni':
      return 'Keep your alumni profile current for networking and events.';
    default:
      return 'Review and update your account profile information.';
  }
}

const OTP_LENGTH = 6;

export function MeProfilePage() {
  const { user, logout, refreshMe } = useAuth();
  const navigate = useNavigate();
  const primaryRole = (user?.role ?? 'alumni') as UserRole;
  const roles = useMemo(() => user?.roles ?? (user?.role ? [user.role] : ['alumni']), [user]);
  const canEditAlumni = roles.includes('alumni');
  const canDeleteAccount = !roles.includes('superadmin');
  const canChooseDocuments = roles.includes('faculty') || roles.includes('hod');
  const canToggleSelfActive = !['admin', 'hod', 'superadmin'].includes(primaryRole);
  const [me, setMe] = useState<{ id: string; name: string; email: string; isActive?: boolean } | null>(null);
  const [alumni, setAlumni] = useState<AlumniRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    isActive: true,
  });
  const [accountOriginal, setAccountOriginal] = useState(accountForm);
  const accountFormDirty = useMemo(
    () =>
      accountForm.name !== accountOriginal.name ||
      accountForm.isActive !== accountOriginal.isActive,
    [accountForm, accountOriginal]
  );
  const emailChanged = useMemo(() => {
    const current = accountOriginal.email.trim().toLowerCase();
    const next = accountForm.email.trim().toLowerCase();
    return next.length > 0 && next !== current;
  }, [accountForm.email, accountOriginal.email]);
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});
  const [savingAccount, setSavingAccount] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [otpValues, setOtpValues] = useState(() => Array.from({ length: OTP_LENGTH }, () => ''));
  const [otpError, setOtpError] = useState('');
  const [otpOpen, setOtpOpen] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [alumniForm, setAlumniForm] = useState({
    graduationYear: '',
    batch: '',
    department: '',
    company: '',
    designation: '',
    location: '',
    address: '',
    linkedIn: '',
    phone: '',
    bio: '',
  });
  const [alumniErrors, setAlumniErrors] = useState<Record<string, string>>({});
  const [savingAlumni, setSavingAlumni] = useState(false);
  const [alumniReadOnly, setAlumniReadOnly] = useState(true);
  const [accountReadOnly, setAccountReadOnly] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirm: '',
    deleteDocuments: false,
  });
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState(false);

  const showVerifyButton = emailChanged || Boolean(pendingEmail);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const record = await authService.getMe();
        if (cancelled) return;
        const payload = record.user;
        const pending = record.pendingEmail ?? '';
        setMe({
          id: payload.id,
          name: payload.name,
          email: payload.email,
          isActive: payload.isActive,
        });
        const newForm = {
          name: payload.name ?? '',
          email: pending || payload.email || '',
          isActive: payload.isActive ?? true,
        };
        setAccountForm(newForm);
        setAccountOriginal({
          name: payload.name ?? '',
          email: payload.email ?? '',
          isActive: payload.isActive ?? true,
        });
        setPendingEmail(pending);
        setOtpOpen(Boolean(pending));
        setOtpValues(Array.from({ length: OTP_LENGTH }, () => ''));
        setOtpError('');
      } catch {
        if (!cancelled) {
          toast.error('Failed to load your profile');
          setNotFound(true);
          setMe(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    const userId = user?.id ?? '';
    if (!userId || !canEditAlumni) {
      setAlumni(null);
      setAlumniLoading(false);
      return;
    }

    let cancelled = false;
    setAlumniLoading(true);

    async function loadAlumni() {
      try {
        const data = await alumniService.getByUserId(userId);
        if (cancelled) return;
        setAlumni(data);
        if (data) {
          setAlumniForm({
            graduationYear: data.graduationYear?.toString() ?? '',
            batch: data.batch ?? '',
            department: data.department ?? '',
            company: data.company ?? '',
            designation: data.designation ?? '',
            location: data.location ?? '',
            address: data.address ?? '',
            linkedIn: data.linkedIn ?? '',
            phone: data.phone ?? '',
            bio: data.bio ?? '',
          });
        }
      } catch {
        if (!cancelled) toast.error('Failed to load alumni details');
      } finally {
        if (!cancelled) setAlumniLoading(false);
      }
    }

    void loadAlumni();
    return () => {
      cancelled = true;
    };
  }, [user?.id, canEditAlumni]);

  useEffect(() => {
    if (otpOpen) {
      otpRefs.current[0]?.focus();
    }
  }, [otpOpen]);

  function validateAccount() {
    const errors: Record<string, string> = {};
    if (!accountForm.name.trim() || accountForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }
    return errors;
  }

  function validateAlumni(isCreate: boolean) {
    const errors: Record<string, string> = {};
    const year = alumniForm.graduationYear.trim();
    if (isCreate && !year) errors.graduationYear = 'Graduation year is required.';
    if (year) {
      const numeric = Number(year);
      if (!Number.isInteger(numeric) || numeric < 1950 || numeric > 2100) {
        errors.graduationYear = 'Graduation year must be between 1950 and 2100.';
      }
    }
    if (isCreate && !alumniForm.department.trim()) {
      errors.department = 'Department is required.';
    }
    if (alumniForm.linkedIn && !/^https?:\/\//i.test(alumniForm.linkedIn)) {
      errors.linkedIn = 'LinkedIn must be a valid URL.';
    }
    return errors;
  }

  function validateEmailValue(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Enter a valid email address.';
    }
    if (trimmed.toLowerCase() === accountOriginal.email.trim().toLowerCase()) {
      return 'This is already your current email.';
    }
    return null;
  }

  function handleOtpChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 0) {
      setOtpValues((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    setOtpValues((prev) => {
      const next = [...prev];
      let cursor = index;
      for (const char of digits) {
        if (cursor >= OTP_LENGTH) break;
        next[cursor] = char;
        cursor += 1;
      }
      return next;
    });

    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    otpRefs.current[nextIndex]?.focus();
    otpRefs.current[nextIndex]?.select();
    setOtpError('');
  }

  function handleOtpKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  async function handleSendEmailOtp() {
    const error = validateEmailValue(accountForm.email);
    if (error) {
      setAccountErrors((prev) => ({ ...prev, email: error }));
      return;
    }

    setAccountErrors((prev) => ({ ...prev, email: '' }));
    setSendingEmailOtp(true);
    try {
      const res = await authService.requestEmailVerification({ email: accountForm.email.trim() });
      setPendingEmail(res.pendingEmail);
      setOtpValues(Array.from({ length: OTP_LENGTH }, () => ''));
      setOtpError('');
      setOtpOpen(true);
      toast.success('Verification code sent. Check your inbox.');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Failed to send verification code');
    } finally {
      setSendingEmailOtp(false);
    }
  }

  async function handleVerifyEmailOtp() {
    const code = otpValues.join('');
    if (code.length !== OTP_LENGTH) {
      setOtpError('Enter the 6-digit verification code.');
      return;
    }

    setVerifyingEmailOtp(true);
    try {
      const res = await authService.verifyEmailOtp({ code });
      setPendingEmail('');
      setOtpOpen(false);
      setOtpValues(Array.from({ length: OTP_LENGTH }, () => ''));
      setOtpError('');
      setAccountForm((prev) => ({ ...prev, email: res.user.email }));
      setAccountOriginal((prev) => ({ ...prev, email: res.user.email }));
      setMe((prev) =>
        prev
          ? {
              ...prev,
              email: res.user.email,
            }
          : prev
      );
      await refreshMe();
      toast.success('Email verified successfully');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Failed to verify email');
    } finally {
      setVerifyingEmailOtp(false);
    }
  }

  async function handleAccountSubmit(event: React.FormEvent) {
    event.preventDefault();
    const errors = validateAccount();
    setAccountErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingAccount(true);
    try {
      const res = await authService.updateMe({
        name: accountForm.name.trim(),
        isActive: accountForm.isActive,
      });
      const isActive = res.user.isActive ?? true;
      setAccountForm((prev) => ({
        ...prev,
        name: res.user.name,
        isActive,
      }));
      setAccountOriginal((prev) => ({
        ...prev,
        name: res.user.name,
        isActive,
      }));
      setMe({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        isActive: res.user.isActive,
      });
      setAccountReadOnly(true);
      await refreshMe();
      if (res.pendingEmail) {
        setPendingEmail(res.pendingEmail);
      }
      toast.success('Profile updated');
      if (res.user.isActive === false) {
        toast('Your account is now inactive. You will be signed out.');
        logout();
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Failed to update profile');
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleAlumniSubmit(event: React.FormEvent) {
    event.preventDefault();
    const isCreate = !alumni;
    const errors = validateAlumni(isCreate);
    setAlumniErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingAlumni(true);
    try {
      const payload = {
        graduationYear: alumniForm.graduationYear ? Number(alumniForm.graduationYear) : undefined,
        batch: alumniForm.batch.trim() || undefined,
        department: alumniForm.department.trim() || undefined,
        company: alumniForm.company.trim() || undefined,
        designation: alumniForm.designation.trim() || undefined,
        location: alumniForm.location.trim() || undefined,
        address: alumniForm.address.trim() || undefined,
        linkedIn: alumniForm.linkedIn.trim() || undefined,
        phone: alumniForm.phone.trim() || undefined,
        bio: alumniForm.bio.trim() || undefined,
      };
      const updated = await alumniService.upsertMe(payload);
      setAlumni(updated);
      setAlumniReadOnly(true);
      toast.success('Alumni profile updated');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Failed to update alumni profile');
    } finally {
      setSavingAlumni(false);
    }
  }

  async function handleDeleteAccount(event: React.FormEvent) {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!deleteForm.password) errors.password = 'Password is required.';
    if (deleteForm.confirm !== 'DELETE') errors.confirm = 'Type DELETE to confirm.';
    setDeleteErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setDeleting(true);
    try {
      const res = await authService.deleteMe({
        password: deleteForm.password,
        confirm: 'DELETE',
        deleteDocuments: canChooseDocuments ? deleteForm.deleteDocuments : undefined,
      });
      toast.success(`Account deletion scheduled for ${new Date(res.scheduledFor).toLocaleDateString()}.`);
      logout();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Failed to schedule deletion');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardShell pageTitle="My Profile">
      <div className="page-header">
        <div className="page-eyebrow">{roleLabel(primaryRole)}</div>
        <h2 className="page-title">My Profile</h2>
        <p className="page-subtitle">{roleSubtitle(primaryRole)}</p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      )}

      {!loading && notFound && (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
          Profile not available.
        </div>
      )}

      {!loading && me && (
        <div className="profile-form">
          <section className="widget">
            <div className="widget-header">
              <span className="widget-title">Account details</span>
              {/* <span className="badge badge-neutral">{roleLabel(primaryRole)}</span> */}
              {!accountReadOnly ? (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setAccountForm(accountOriginal);
                    setAccountErrors({});
                    setAccountReadOnly(true);
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setAccountReadOnly(false)}
                >
                  Edit
                </button>
              )}
            </div>
            <div className="widget-body">
              <form className="profile-form-grid" onSubmit={handleAccountSubmit}>
                <FormField
                  name="name"
                  label="Full name"
                  type="text"
                  value={accountForm.name}
                  required
                  readOnly={accountReadOnly}
                  error={accountErrors.name}
                  onChange={(val) => setAccountForm((prev) => ({ ...prev, name: String(val ?? '') }))}
                />
                <FormField
                  name="email"
                  label="Email"
                  type="email"
                  value={accountForm.email}
                  required
                  readOnly={accountReadOnly}
                  error={accountErrors.email}
                  info={
                    pendingEmail
                      ? `Pending verification for ${pendingEmail}.`
                      : emailChanged
                        ? `We will verify ${accountForm.email || 'this email'} before updating your account.`
                        : undefined
                  }
                  onChange={(val) => {
                    const next = String(val ?? '');
                    setAccountForm((prev) => ({ ...prev, email: next }));
                    setAccountErrors((prev) => ({ ...prev, email: '' }));
                    if (pendingEmail && pendingEmail.trim().toLowerCase() !== next.trim().toLowerCase()) {
                      setPendingEmail('');
                      setOtpOpen(false);
                      setOtpValues(Array.from({ length: OTP_LENGTH }, () => ''));
                      setOtpError('');
                    }
                  }}
                />
                {showVerifyButton && !accountReadOnly && (
                  <div className="email-verify-row">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleSendEmailOtp}
                      disabled={sendingEmailOtp}
                    >
                      {sendingEmailOtp ? 'Sending...' : pendingEmail ? 'Resend code' : 'Send verification code'}
                    </button>
                    {pendingEmail && <span className="email-verify-hint">Code sent to {pendingEmail}.</span>}
                  </div>
                )}
                {otpOpen && !accountReadOnly && (
                  <div className="otp-panel">
                    <div className="otp-title">Enter verification code</div>
                    <div className="otp-inputs">
                      {otpValues.map((value, index) => (
                        <input
                          key={`otp-${index}`}
                          ref={(el) => {
                            otpRefs.current[index] = el;
                          }}
                          className={`otp-input${value ? ' filled' : ''}`}
                          type="text"
                          inputMode="numeric"
                          pattern="\d*"
                          maxLength={index === 0 ? 6 : 1}
                          value={value}
                          onChange={(event) => handleOtpChange(index, event.target.value)}
                          onKeyDown={(event) => handleOtpKeyDown(event, index)}
                          onFocus={(event) => event.currentTarget.select()}
                          onPaste={index === 0 ? (e) => {
                            e.preventDefault();
                            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
                            setOtpValues((prev) => {
                              const next = [...prev];
                              for (let i = 0; i < OTP_LENGTH; i++) {
                                next[i] = pasted[i] ?? '';
                              }
                              return next;
                            });
                            const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
                            otpRefs.current[focusIndex]?.focus();
                          } : undefined}
                          aria-label={`Verification code digit ${index + 1}`}
                        />
                      ))}
                    </div>
                    {otpError && <div className="form-field-error">{otpError}</div>}
                    <div className="otp-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleVerifyEmailOtp}
                        disabled={verifyingEmailOtp}
                      >
                        {verifyingEmailOtp ? 'Verifying...' : 'Verify email'}
                      </button>
                    </div>
                  </div>
                )}
                {canToggleSelfActive && !accountReadOnly && (
                <FormField
                  name="status"
                  label="Account active"
                  type="checkbox"
                  value={accountForm.isActive}
                  info="Turning this off will sign you out and require admin reactivation."
                  onChange={(val) => setAccountForm((prev) => ({ ...prev, isActive: Boolean(val) }))}
                />
                )}
                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={savingAccount || !accountFormDirty || Boolean(accountErrors.name) || accountReadOnly}
                  >
                    {savingAccount ? 'Saving...' : 'Save account'}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {canEditAlumni && (
            <section className="widget" style={{ marginTop: 'var(--space-6)' }}>
              <div className="widget-header">
                <span className="widget-title">Alumni profile</span>
                {alumniLoading && <span className="badge badge-neutral">Loading...</span>}
                {!alumniReadOnly ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      const original = alumni ? {
                        graduationYear: alumni.graduationYear?.toString() ?? '',
                        batch: alumni.batch ?? '',
                        department: alumni.department ?? '',
                        company: alumni.company ?? '',
                        designation: alumni.designation ?? '',
                        location: alumni.location ?? '',
                        address: alumni.address ?? '',
                        linkedIn: alumni.linkedIn ?? '',
                        phone: alumni.phone ?? '',
                        bio: alumni.bio ?? '',
                      } : {
                        graduationYear: '',
                        batch: '',
                        department: '',
                        company: '',
                        designation: '',
                        location: '',
                        address: '',
                        linkedIn: '',
                        phone: '',
                        bio: '',
                      };
                      setAlumniForm(original);
                      setAlumniErrors({});
                      setAlumniReadOnly(true);
                    }}
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setAlumniReadOnly(false)}
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="widget-body">
                <form className="profile-form-grid" onSubmit={handleAlumniSubmit}>
                  <FormField
                    name="graduationYear"
                    label="Graduation year"
                    type="number"
                    value={alumniForm.graduationYear}
                    readOnly={alumniReadOnly}
                    min={1950}
                    max={2100}
                    required={!alumni}
                    error={alumniErrors.graduationYear}
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, graduationYear: String(val ?? '') }))}
                  />
                  <FormField
                    name="batch"
                    label="Batch"
                    type="text"
                    value={alumniForm.batch}
                    readOnly={alumniReadOnly}
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, batch: String(val ?? '') }))}
                  />
                  <FormField
                    name="department"
                    label="Department"
                    type="text"
                    value={alumniForm.department}
                    readOnly={alumniReadOnly}
                    required={!alumni}
                    error={alumniErrors.department}
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, department: String(val ?? '') }))}
                  />
                  <FormField
                    name="company"
                    label="Company"
                    type="text"
                    value={alumniForm.company}
                    readOnly={alumniReadOnly}
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, company: String(val ?? '') }))}
                  />
                  <FormField
                    name="designation"
                    label="Designation"
                    type="text"
                    value={alumniForm.designation}
                    readOnly={alumniReadOnly}
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, designation: String(val ?? '') }))}
                  />
                  <FormField
                    name="location"
                    label="Location"
                    type="text"
                    value={alumniForm.location}
                    readOnly={alumniReadOnly}
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, location: String(val ?? '') }))}
                  />
                  <FormField
                    name="address"
                    label="Address"
                    type="address"
                    value={alumniForm.address}
                    readOnly={alumniReadOnly}
                    info="Used for alumni directory and event outreach."
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, address: String(val ?? '') }))}
                  />
                  <FormField
                    name="linkedIn"
                    label="LinkedIn"
                    type="url"
                    value={alumniForm.linkedIn}
                    readOnly={alumniReadOnly}
                    error={alumniErrors.linkedIn}
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, linkedIn: String(val ?? '') }))}
                  />
                  <FormField
                    name="phone"
                    label="Phone"
                    type="tel"
                    value={alumniForm.phone}
                    readOnly={alumniReadOnly}
                    pattern="^[0-9+()\-\s]{6,}$"
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, phone: String(val ?? '') }))}
                  />
                  <FormField
                    name="bio"
                    label="Bio"
                    type="address"
                    rows={5}
                    value={alumniForm.bio}
                    readOnly={alumniReadOnly}
                    onChange={(val) => setAlumniForm((prev) => ({ ...prev, bio: String(val ?? '') }))}
                  />
                  <div className="profile-form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={savingAlumni || alumniReadOnly}
                    >
                      {savingAlumni ? 'Saving...' : alumni ? 'Update alumni profile' : 'Create alumni profile'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {canDeleteAccount && (
            <section className="profile-danger" style={{ marginTop: 'var(--space-8)' }}>
              <button
                type="button"
                className="profile-danger-toggle"
                onClick={() => setDeleteOpen((prev) => !prev)}
                aria-expanded={deleteOpen}
              >
                {deleteOpen ? 'Hide delete options' : 'Delete account'}
              </button>

              {deleteOpen && (
                <div className="profile-danger-panel">
                  <div className="profile-danger-title">Delete account</div>
                  <p className="profile-danger-text">
                    This will schedule deletion of your profile and associated data. Your data will be retained
                    for 2 months, then permanently removed. This action cannot be undone.
                  </p>
                  {canChooseDocuments && (
                    <FormField
                      name="deleteDocuments"
                      label="Delete my documents"
                      type="checkbox"
                      value={deleteForm.deleteDocuments}
                      info="If unchecked, your documents will remain available to the institution."
                      onChange={(val) => setDeleteForm((prev) => ({ ...prev, deleteDocuments: Boolean(val) }))}
                    />
                  )}
                  <form className="profile-danger-form" onSubmit={handleDeleteAccount}>
                    <FormField
                      name="password"
                      label="Confirm password"
                      type="password"
                      value={deleteForm.password}
                      error={deleteErrors.password}
                      onChange={(val) => setDeleteForm((prev) => ({ ...prev, password: String(val ?? '') }))}
                    />
                    <FormField
                      name="confirm"
                      label="Type DELETE to confirm"
                      type="text"
                      value={deleteForm.confirm}
                      error={deleteErrors.confirm}
                      onChange={(val) => setDeleteForm((prev) => ({ ...prev, confirm: String(val ?? '') }))}
                    />
                    <button type="submit" className="btn btn-outline btn-sm" disabled={deleting}>
                      {deleting ? 'Scheduling...' : 'Schedule deletion'}
                    </button>
                  </form>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
