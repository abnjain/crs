import { Button } from '../common/Button';
import { StatusDotIcon, ShieldIcon, LocationIcon, CommunityIcon, GlobeIcon } from '../common/svgs';

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-stripe" aria-hidden="true" />

      <div className="hero-inner">
        <div>
          <div className="hero-tag" aria-label="Status">
            <StatusDotIcon aria-hidden />
            Academic Year 2024–25 — Portal Active
          </div>

          <h1 className="hero-title" id="hero-heading">
            Central Repository
            <br />
            for <em>Academic Excellence</em>
            <br />
            at <strong>SCSIT DAVV</strong>
          </h1>

          <p className="hero-lead">
            A unified digital platform for faculty, alumni, and administration at the School of
            Computer Science and Information Technology, Devi Ahilya Vishwavidyalaya, Indore. Access
            documents, events, library resources, and institutional knowledge — all in one place.
          </p>

          <div className="hero-actions">
            <Button variant="primary" size="lg" to="/login">
              Access Portal
            </Button>
            <Button variant="outline" size="lg" href="#modules">
              Explore Features
            </Button>
          </div>
        </div>

        <div className="college-card" aria-hidden="true">
          <div className="college-card-header">
            <div className="college-logo-wrap">
              <img src="/SCSIT_logo.svg" alt="" width={80} height={80} />
            </div>
            <div>
              <div className="college-card-name">
                School of Computer
                <br />
                Science & IT
              </div>
              <div className="college-card-dept">SCSIT — DAVV Indore</div>
            </div>
          </div>
          <div className="college-card-body">
            <div className="college-info-row">
              <div className="college-info-icon" aria-hidden="true">
                <ShieldIcon size={18} />
              </div>
              <div className="college-info-text">
                <span className="college-info-label">Established</span>
                <span className="college-info-value">1986 — 39 Years of Excellence</span>
              </div>
            </div>
            <div className="college-info-row">
              <div className="college-info-icon" aria-hidden="true">
                <LocationIcon size={18} />
              </div>
              <div className="college-info-text">
                <span className="college-info-label">Location</span>
                <span className="college-info-value">Indore, Madhya Pradesh</span>
              </div>
            </div>
            <div className="college-info-row">
              <div className="college-info-icon" aria-hidden="true">
                <CommunityIcon size={18} />
              </div>
              <div className="college-info-text">
                <span className="college-info-label">Community</span>
                <span className="college-info-value">3,400+ Alumni — 120 Faculty</span>
              </div>
            </div>
            <div className="college-info-row">
              <div className="college-info-icon" aria-hidden="true">
                <GlobeIcon size={18} />
              </div>
              <div className="college-info-text">
                <span className="college-info-label">University</span>
                <span className="college-info-value">Devi Ahilya Vishwavidyalaya</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
