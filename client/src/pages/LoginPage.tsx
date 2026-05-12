import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { useTheme } from '../context';
import {
  EmailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SignInIcon,
  ChevronLeftIcon,
  MoonIcon,
  SunIcon,
} from '../components/common/svgs';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { cycleTheme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" aria-label="Loading" />
      </div>
    );
  }

  const validate = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const pwdOk = password.length > 0;
    setEmailError(!emailOk);
    setPasswordError(!pwdOk);
    if (!emailOk) setAlert('Please enter a valid email address.');
    else if (!pwdOk) setAlert('Password is required.');
    return emailOk && pwdOk;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Redirect to role-specific dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const ax = err as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
      };
      const status = ax.response?.status;
      const serverMsg = ax.response?.data?.message?.trim();

      if (status === 429) {
        setAlert(
          serverMsg ?? 'Too many sign-in attempts from this network. Please wait a few minutes and try again.'
        );
      } else {
        setAlert(serverMsg || 'Invalid email or password. Please try again.');
      }
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
          <div className="auth-college-branding">
            <div className="auth-college-logo">
              <img src="/SCSIT_logo.svg" alt="SCSIT DAVV Indore" width={72} height={72} />
            </div>
            <p className="auth-panel-title">
              Sign in to
              <br />
              <em>CRS Portal</em>
            </p>
            <p className="auth-panel-desc">
              The Central Repository System for School of Computer Science and Information Technology, DAVV Indore — established 1986.
            </p>
            <ul className="auth-feature-list">
              <li className="auth-feature-item">Access faculty documents and publications</li>
              <li className="auth-feature-item">Browse and borrow from the digital library catalog</li>
              <li className="auth-feature-item">Connect with alumni and faculty through messaging</li>
              <li className="auth-feature-item">Register and track college events and programs</li>
            </ul>
          </div>
          <div className="auth-panel-footer">
            SCSIT DAVV Indore — CRS Portal v1.0 — Secured with JWT + RBAC
          </div>
        </div>
      </aside>

      <main className="auth-panel-right" style={{ position: 'relative' }}>
        <div className="auth-panel-header">
          <button
            type="button"
            className="auth-theme-toggle"
            onClick={cycleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>

        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="auth-form-eyebrow">Secure Sign In</div>
            <h1 className="auth-form-title">Welcome Back</h1>
            <p className="auth-form-subtitle">Sign in with your institutional credentials to access the portal.</p>
          </div>

          {alert && (
            <div className="auth-alert auth-alert-error visible" role="alert">
              <span>{alert}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className={`auth-field ${emailError ? 'has-error' : ''}`}>
              <label className="auth-field-label" htmlFor="email">
                Institutional Email Address <span className="req">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <EmailIcon />
                </span>
                <input
                  className="auth-input"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                    setAlert('');
                  }}
                  placeholder="you@scsit.dauniv.ac.in"
                  autoComplete="email"
                />
              </div>
              <span className="auth-field-error">Please enter a valid email address.</span>
            </div>

            <div className={`auth-field ${passwordError ? 'has-error' : ''}`}>
              <div className="auth-field-row">
                <label className="auth-field-label" htmlFor="password">
                  Password <span className="req">*</span>
                </label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <LockIcon />
                </span>
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                    setAlert('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
              <span className="auth-field-error">Password is required.</span>
            </div>

            <div className="auth-checkbox-row">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="auth-checkbox-label" htmlFor="remember">
                Keep me signed in on this device
              </label>
            </div>

            <button type="submit" className="auth-btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <SignInIcon />
                  Sign In to Portal
                </>
              )}
            </button>
          </form>

          <div className="auth-form-switch">
            New to CRS? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
