import { Button, Badge } from '../index';
import { CalendarIcon, CommunityIcon, WorkshopIcon, LocationIcon, SeatsIcon } from '../common/svgs';

const events = [
  {
    type: 'seminar' as const,
    badge: 'Seminar',
    badgeVariant: 'primary' as const,
    day: '14',
    month: 'Mar',
    title: 'Annual Symposium 2025',
    location: 'Main Auditorium, Block A',
    desc: 'Faculty and students present work in AI, data science, and cybersecurity. External reviewers and industry professionals invited as evaluators.',
    seats: '142 / 300 attending',
    link: '/events/annual-symposium',
    dateBoxBg: 'var(--primary)',
  },
  {
    type: 'alumni' as const,
    badge: 'Alumni Meet',
    badgeVariant: 'accent' as const,
    day: '22',
    month: 'Mar',
    title: 'Alumni Reconnect — Batch 2014',
    location: 'Seminar Hall, Block C',
    desc: 'A dedicated networking event for the 2014 graduating batch. Share career journeys, reconnect with faculty and peers, and contribute to institutional growth.',
    seats: '67 / 150 attending',
    link: '/events/alumni-reconnect-2014',
    dateBoxBg: 'var(--accent)',
  },
  {
    type: 'workshop' as const,
    badge: 'Workshop',
    badgeVariant: 'success' as const,
    day: '05',
    month: 'Apr',
    title: 'Cloud Computing & DevOps Workshop',
    location: 'Computer Lab 3, Block B',
    desc: 'Hands-on workshop covering Docker, Kubernetes, and CI/CD pipelines. Delivered by senior faculty with industry experience. Open to Faculty and Alumni.',
    seats: '48 / 60 attending',
    link: '/events/cloud-devops',
    dateBoxBg: '#2D6A4F',
  },
];

const bannerIcons = {
  seminar: () => <CalendarIcon size={72} aria-hidden />,
  alumni: () => <CommunityIcon size={72} aria-hidden />,
  workshop: () => <WorkshopIcon size={72} aria-hidden />,
};

export function EventsSection() {
  return (
    <section className="section" id="events" aria-labelledby="events-h">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-4" style={{ marginBottom: 'var(--space-10)' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div className="section-eyebrow">Upcoming Events</div>
            <h2 className="section-title" id="events-h">
              College Events & Programs
            </h2>
            <p className="section-desc">
              Academic seminars, alumni meets, technical workshops, and cultural programs hosted by
              SCSIT DAVV Indore.
            </p>
          </div>
          <Button variant="outline" to="/events">
            View All Events
          </Button>
        </div>

        <div className="events-grid" role="list" aria-label="Upcoming events">
          {events.map((event) => {
            const BannerIcon = bannerIcons[event.type];
            return (
              <article
                key={event.link}
                className="event-card"
                role="listitem"
                data-type={event.type}
              >
                <div className="event-card-banner">
                  <div className="event-card-top-stripe" aria-hidden="true" />
                  <BannerIcon />
                  <div style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)' }}>
                    <Badge variant={event.badgeVariant}>{event.badge}</Badge>
                  </div>
                </div>
                <div className="event-card-body">
                  <div className="event-header">
                    <div
                      className="event-date-box"
                      aria-label={`${event.month} ${event.day}`}
                      style={{ background: event.dateBoxBg }}
                    >
                      <span className="event-date-day">{event.day}</span>
                      <span className="event-date-mon">{event.month}</span>
                    </div>
                    <div className="event-meta">
                      <span className="event-title">{event.title}</span>
                      <span className="event-location">
                        <LocationIcon />
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <p className="event-desc">{event.desc}</p>
                  <div className="event-footer">
                    <span className="event-seats">
                      <SeatsIcon />
                      {event.seats}
                    </span>
                    <Button variant="ghost" size="sm" to={event.link}>
                      Details
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
