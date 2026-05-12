import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import { useTheme } from '../context';
import {
  EmailIcon,
  UserIcon,
  LockIcon,
  FacultyIcon,
  AlumniIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  ChevronLeftIcon,
  MoonIcon,
  SunIcon,
} from '../components/common/svgs';

type RegRole = 'faculty' | 'alumni';

export function RegisterPage() {
  const { register } = useAuth();
  const { cycleTheme, isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<RegRole>('alumni');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState('');
  const [success, setSuccess] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const setError = (key: string, val: boolean) => setErrors((p) => ({ ...p, [key]: val }));

  const validateStep1 = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setError('email', !emailOk);
    if (!emailOk) {
      setAlert('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const fnameOk = firstName.trim().length > 0;
    const lnameOk = lastName.trim().length > 0;
    setError('firstName', !fnameOk);
    setError('lastName', !lnameOk);
    if (!fnameOk || !lnameOk) {
      setAlert('Please complete all required fields.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const pwdOk = password.length >= 6;
    const matchOk = password === confirmPassword;
    const termsOk = terms;
    setError('password', !pwdOk);
    setError('confirmPassword', !matchOk);
    if (!termsOk) {
      setAlert('Please accept the Terms of Use to continue.');
      return false;
    }
    if (!pwdOk) {
      setAlert('Password must be at least 6 characters.');
      return false;
    }
    if (!matchOk) {
      setAlert('Passwords do not match.');
      return false;
    }
    return true;
  };

  const goTo = (s: number) => {
    setStep(s);
    setAlert('');
  };

  const handleStep1Next = () => {
    if (validateStep1()) goTo(2);
  };

  const handleStep2Next = () => {
    if (validateStep2()) goTo(3);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    setAlert('');
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`;
      const { pendingApproval } = await register({
        name,
        email: email.trim(),
        password,
        role,
      });
      setAwaitingApproval(pendingApproval);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed. Please try again.';
      setAlert(msg);
    } finally {
      setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <aside className="auth-panel-left">
        <div className="auth-panel-stripe" aria-hidden="true" />
        <div className="auth-panel-inner">
          <Link to="/" className="auth-back-link">
            <ChevronLeftIcon size={16} />
            Back to Portal Home
          </Link>
          <div className="auth-college-logo" style={{ marginBottom: 'var(--space-6)' }}>
            <img src="/SCSIT_logo.svg" alt="SCSIT" width={66} height={66} />
          </div>
          <p className="auth-panel-title">
            Create your
            <br />
            <em>CRS Account</em>
          </p>
          <p className="auth-panel-desc">
            Join the School of Computer Science and Information Technology institutional portal. Registration is open to SCSIT DAVV faculty and alumni only.
          </p>
          <nav className="auth-feature-list" style={{ marginTop: 'auto', marginBottom: 'var(--space-8)' }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: step > s ? 'rgba(255,255,255,0.2)' : step === s ? '#fff' : 'rgba(255,255,255,0.12)',
                    color: step === s ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                  }}
                >
                  {s}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: step >= s ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)' }}>
                    {s === 1 && 'Account Type'}
                    {s === 2 && 'Personal Details'}
                    {s === 3 && 'Set Password'}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.4)' }}>
                    {s === 1 && 'Choose role and email'}
                    {s === 2 && 'Name and contact'}
                    {s === 3 && 'Create password'}
                  </div>
                </div>
              </div>
            ))}
          </nav>
          <div className="auth-panel-footer">
            SCSIT DAVV Indore — CRS Portal v1.0
          </div>
        </div>
      </aside>

      <main className="auth-panel-right" style={{ position: 'relative', overflowY: 'auto' }}>
        <div className="auth-panel-header">
          <button type="button" className="auth-theme-toggle" onClick={cycleTheme} aria-label="Toggle theme">
            {isDark ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>

        <div className="auth-form-card" style={{ padding: 'var(--space-10)', maxWidth: 560 }}>
          {!success ? (
            <>
              <div className="auth-progress-steps">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`auth-progress-step ${step > s ? 'done' : ''} ${step === s ? 'active' : ''}`}>
                    <div className="auth-progress-dot">{s}</div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {s === 1 && 'Account Type'}
                      {s === 2 && 'Personal Details'}
                      {s === 3 && 'Set Password'}
                    </span>
                  </div>
                ))}
              </div>

              {alert && (
                <div className="auth-alert auth-alert-error visible" role="alert">
                  {alert}
                </div>
              )}

              {/* Step 1 */}
              <div className={`auth-step-panel ${step === 1 ? 'active' : ''}`}>
                <div className="auth-form-header">
                  <div className="auth-form-eyebrow">Step 1 of 3</div>
                  <h1 className="auth-form-title">Account Type</h1>
                  <p className="auth-form-subtitle">Select your role and provide your institutional email. Admin accounts cannot be created via self-registration.</p>
                </div>
                <div className="auth-form">
                  <fieldset style={{ border: 'none', padding: 0 }}>
                    <legend className="auth-field-label" style={{ marginBottom: 'var(--space-3)' }}>
                      I am registering as <span className="req">*</span>
                    </legend>
                    <div className="auth-role-grid">
                      <div className="auth-role-option">
                        <input type="radio" id="reg-faculty" name="role" value="faculty" checked={role === 'faculty'} onChange={() => setRole('faculty')} />
                        <label className="auth-role-label" htmlFor="reg-faculty">
                          <span className="auth-role-icon"><FacultyIcon /></span>
                          <span className="auth-role-name">Faculty</span>
                          <span className="auth-role-desc">Teaching or administrative staff</span>
                        </label>
                      </div>
                      <div className="auth-role-option">
                        <input type="radio" id="reg-alumni" name="role" value="alumni" checked={role === 'alumni'} onChange={() => setRole('alumni')} />
                        <label className="auth-role-label" htmlFor="reg-alumni">
                          <span className="auth-role-icon"><AlumniIcon /></span>
                          <span className="auth-role-name">Alumni</span>
                          <span className="auth-role-desc">Former SCSIT student</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>
                  <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
                    <label className="auth-field-label" htmlFor="s1-email">
                      Institutional Email <span className="req">*</span>
                    </label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><EmailIcon /></span>
                      <input
                        className="auth-input"
                        type="email"
                        id="s1-email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('email', false);
                          setAlert('');
                        }}
                        placeholder="yourname@scsit.dauniv.ac.in"
                        autoComplete="email"
                      />
                    </div>
                    <span className="auth-field-error">Enter a valid email address.</span>
                  </div>
                  <div className="auth-step-actions">
                    <button type="button" className="auth-btn-submit" onClick={handleStep1Next}>
                      Continue →
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`auth-step-panel ${step === 2 ? 'active' : ''}`}>
                <div className="auth-form-header">
                  <div className="auth-form-eyebrow">Step 2 of 3</div>
                  <h1 className="auth-form-title">Personal Details</h1>
                  <p className="auth-form-subtitle">Tell us about yourself.</p>
                </div>
                <div className="auth-form">
                  <div className="auth-field-row-2">
                    <div className={`auth-field ${errors.firstName ? 'has-error' : ''}`}>
                      <label className="auth-field-label" htmlFor="firstName">First Name <span className="req">*</span></label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><UserIcon /></span>
                        <input
                          className="auth-input"
                          type="text"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setError('firstName', false);
                          }}
                          placeholder="Priya"
                          autoComplete="given-name"
                        />
                      </div>
                    </div>
                    <div className={`auth-field ${errors.lastName ? 'has-error' : ''}`}>
                      <label className="auth-field-label" htmlFor="lastName">Last Name <span className="req">*</span></label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><UserIcon /></span>
                        <input
                          className="auth-input"
                          type="text"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            setError('lastName', false);
                          }}
                          placeholder="Sharma"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="auth-step-actions">
                    <button type="button" className="auth-btn-ghost" onClick={() => goTo(1)}>← Back</button>
                    <button type="button" className="auth-btn-submit" style={{ flex: 2 }} onClick={handleStep2Next}>
                      Continue →
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`auth-step-panel ${step === 3 ? 'active' : ''}`}>
                <div className="auth-form-header">
                  <div className="auth-form-eyebrow">Step 3 of 3</div>
                  <h1 className="auth-form-title">Set Password</h1>
                  <p className="auth-form-subtitle">Create a strong password (min 6 characters).</p>
                </div>
                <div className="auth-form">
                  <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
                    <label className="auth-field-label" htmlFor="password">Password <span className="req">*</span></label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><LockIcon /></span>
                      <input
                        className="auth-input"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('password', false);
                        }}
                        placeholder="Minimum 6 characters"
                        autoComplete="new-password"
                        style={{ paddingRight: 50 }}
                      />
                      <button
                        type="button"
                        className="auth-pwd-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    <span className="auth-field-error">Password must be at least 6 characters.</span>
                  </div>
                  <div className={`auth-field ${errors.confirmPassword ? 'has-error' : ''}`}>
                    <label className="auth-field-label" htmlFor="confirm">Confirm Password <span className="req">*</span></label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><LockIcon /></span>
                      <input
                        className="auth-input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirm"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('confirmPassword', false);
                        }}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        style={{ paddingRight: 50 }}
                      />
                      <button
                        type="button"
                        className="auth-pwd-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    <span className="auth-field-error">Passwords do not match.</span>
                  </div>
                  <div className="auth-checkbox-row">
                    <input type="checkbox" id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                    <label className="auth-checkbox-label" htmlFor="terms">
                      I agree to the <Link to="/terms">Terms of Use</Link> and <Link to="/privacy">Privacy Policy</Link>.
                    </label>
                  </div>
                  <div className="auth-step-actions">
                    <button type="button" className="auth-btn-ghost" onClick={() => goTo(2)}>← Back</button>
                    <button type="button" className="auth-btn-submit" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
                      {loading ? 'Creating account…' : 'Create Account'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-success-screen visible">
              <div className="auth-success-icon">
                <CheckIcon size={40} />
              </div>
              <h1 className="auth-success-title">{awaitingApproval ? 'Registration submitted' : 'Account created'}</h1>
              <p className="auth-success-desc">
                {awaitingApproval
                  ? 'Your request has been received. A platform administrator must approve your account before you can sign in. You will be able to log in once approval is complete.'
                  : 'Your CRS account has been created successfully. You can now sign in.'}
              </p>
              <Link to="/login" className="auth-btn-submit" style={{ minWidth: 220 }}>
                {awaitingApproval ? 'Return to sign in' : 'Sign In Now'}
              </Link>
              <Link to="/" style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)' }}>
                Return to Portal Home
              </Link>
            </div>
          )}

          {!success && (
            <div className="auth-form-switch">
              Already registered? <Link to="/login">Sign in to your account</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
