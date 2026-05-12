import { Link } from 'react-router-dom';

type NavLink = { to: string; label: string } | { href: string; label: string };

const moduleLinks: NavLink[] = [
  { to: '/events', label: 'Events' },
  { to: '/library', label: 'Library' },
  { to: '/faculty', label: 'Faculty' },
  { to: '/alumni', label: 'Alumni Directory' },
  { to: '/documents', label: 'Documents' },
];

const supportLinks: NavLink[] = [
  { to: '/help', label: 'Help Center' },
  { href: 'mailto:helpdesk@scsit.dauniv.ac.in', label: 'IT Helpdesk' },
  { to: '/faq', label: 'FAQ' },
  { to: '/accessibility', label: 'Accessibility' },
];

const institutionLinks: NavLink[] = [
  { href: 'https://www.dauniv.ac.in', label: 'DAVV Official Website' },
  { to: 'https://scs.dauniv.ac.in/', label: 'About SCSIT' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/privacy', label: 'Privacy Policy' },
];

function FooterLink({ link }: { link: NavLink }) {
  if ('to' in link) {
    return (
      <Link to={link.to} className="footer-link">
        {link.label}
      </Link>
    );
  }
  const isExternal = link.href.startsWith('http');
  return (
    <a
      href={link.href}
      className="footer-link"
      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {link.label}
    </a>
  );
}

export function Footer() {
  return (
    <>
      <div className="footer-stripe" aria-hidden="true" />
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <div className="footer-logo-wrap">
                  <img
                    src="/SCSIT_logo.svg"
                    alt="SCSIT DAVV Indore"
                    width={36}
                    height={36}
                  />
                </div>
                <div>
                  <div className="footer-brand-name">CRS Portal</div>
                  <div className="footer-brand-sub">SCSIT DAVV Indore</div>
                </div>
              </div>
              <p className="footer-desc">
                Central Repository System for the School of Computer Science and Information
                Technology, Devi Ahilya Vishwavidyalaya, Indore — since 1986.
              </p>
            </div>

            <div>
              <div className="footer-col-title">Modules</div>
              <ul className="footer-links">
                {moduleLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Support</div>
              <ul className="footer-links">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Institution</div>
              <ul className="footer-links">
                {institutionLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © 2025 School of Computer Science and Information Technology, DAVV Indore. All rights
              reserved.
            </p>
            <p className="footer-copy">
              CRS v1.0 — Node.js v22 · React 18 · MongoDB · Redis · Docker
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
