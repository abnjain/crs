import { InfoIcon } from '../common/svgs';

export function NoticeSection() {
  return (
    <section className="section-sm" aria-label="Portal access notice">
      <div className="container">
        <div className="notice-band">
          <div className="notice-icon" aria-hidden="true">
            <InfoIcon size={20} />
          </div>
          <div>
            <div className="notice-title">Restricted Access Portal</div>
            <div className="notice-text">
              CRS is available to registered Faculty, Alumni, and Administrative staff of SCSIT
              DAVV Indore. Guest visitors may browse public events and library information. For
              login issues or first-time registration, contact{' '}
              <strong>helpdesk@scsit.dauniv.ac.in</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
