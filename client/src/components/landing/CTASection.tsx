import { Button } from '../common/Button';

export function CTASection() {
  return (
    <section className="section-sm" aria-labelledby="cta-h">
      <div className="container">
        <div className="cta-block">
          <h2 className="cta-title" id="cta-h">
            Ready to Access the Portal?
          </h2>
          <p className="cta-desc">
            Faculty and alumni can sign in using institutional credentials. Contact your department
            coordinator for first-time registration.
          </p>
          <div className="cta-actions">
            <Button variant="white" size="lg" to="/login">
              Sign In to CRS
            </Button>
            <Button
              variant="white-outline"
              size="lg"
              href="mailto:helpdesk@scsit.dauniv.ac.in"
            >
              Contact Helpdesk
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
