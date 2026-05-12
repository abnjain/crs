import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../../context';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../Button';
import { MoonIcon, SunIcon, MenuIcon, XIcon } from '../svgs';

const navLinks = [
  { href: '#events', label: 'Events' },
  { href: '#library', label: 'Library' },
  { href: '#modules', label: 'Modules' },
  { href: '#faculty', label: 'Faculty' },
  { href: '#alumni', label: 'Alumni' },
];

export function Header() {
  const { pathname } = useLocation();
  const { cycleTheme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goHomeExtras = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="header" role="banner">
      <div className="header-inner">
        <Link
          to="/"
          className="header-brand"
          aria-label="SCSIT CRS Home"
          onClick={goHomeExtras}
        >
          <img
            src="/SCSIT_logo.svg"
            className="header-logo-img"
            alt="SCSIT DAVV Indore logo"
            width={44}
            height={44}
          />
          <div className="header-brand-text">
            <span className="header-brand-name">CRS Portal</span>
            <span className="header-brand-sub">SCSIT DAVV Indore — Est. 1986</span>
          </div>
        </Link>

        <div className="header-divider" aria-hidden="true" />

        {!isAuthenticated && (
          <nav className="header-nav" aria-label="Primary navigation" role="navigation">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={`header-nav-link ${i === 0 ? 'active' : ''}`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="header-spacer" aria-hidden="true" />

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={cycleTheme}
            aria-label={`Toggle color theme (current: ${isDark ? 'dark' : 'light'})`}
          >
            {isDark ? <MoonIcon aria-hidden="true" /> : <SunIcon aria-hidden="true" />}
          </button>
          {isAuthenticated ? (
            <Button variant="outline" size="sm" to="/dashboard">
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" to="/login">
                Sign In
              </Button>
              <Button variant="primary" size="sm" to="/register">
                Register
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
        >
          <MenuIcon aria-hidden="true" />
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Mobile navigation">
          <div className="mobile-menu-header">
            <Link
              to="/"
              className="header-brand"
              onClick={() => {
                setMobileOpen(false);
                goHomeExtras();
              }}
            >
              <img
                src="/SCSIT_logo.svg"
                className="header-logo-img"
                alt="SCSIT DAVV Indore logo"
                width={40}
                height={40}
              />
              <div className="header-brand-text">
                <span className="header-brand-name">CRS Portal</span>
                <span className="header-brand-sub">SCSIT DAVV Indore</span>
              </div>
            </Link>
            <button
              type="button"
              className="mobile-menu-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <XIcon aria-hidden="true" />
            </button>
          </div>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mobile-menu-footer" onClick={() => setMobileOpen(false)}>
            {isAuthenticated ? (
              <Button variant="outline" size="sm" to="/dashboard">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" to="/login">
                  Sign In
                </Button>
                <Button variant="primary" size="sm" to="/register">
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
