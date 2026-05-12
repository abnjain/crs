import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { eventService } from '../../services/event.service';
import type { EventRecord } from '../../services/event.service';
import toast from 'react-hot-toast';
import { normalizeMongoId } from '../../lib/mongoId';
import { useAuth } from '../../context';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function typeBadge(type: string): string {
  switch (type) {
    case 'seminar':
      return 'primary';
    case 'workshop':
      return 'accent';
    case 'reunion':
      return 'success';
    case 'webinar':
      return 'warning';
    case 'conference':
      return 'error';
    default:
      return 'neutral';
  }
}

function statusBadge(status: string): string {
  switch (status) {
    case 'upcoming':
      return 'primary';
    case 'ongoing':
      return 'success';
    case 'completed':
      return 'neutral';
    case 'cancelled':
      return 'error';
    default:
      return 'neutral';
  }
}

/** Prefix API origin when the server stores root-relative paths (e.g. /uploads/...). */
function resolveMediaUrl(pathOrUrl: string): string {
  const s = pathOrUrl.trim();
  if (/^https?:\/\//i.test(s)) return s;
  const raw = import.meta.env.VITE_API_URL || '';
  if (/^https?:\/\//i.test(raw)) {
    const origin = raw.replace(/\/api\/?$/, '');
    return `${origin}${s.startsWith('/') ? s : `/${s}`}`;
  }
  return s;
}

function formatWhen(startIso: string, endIso?: string | null): string {
  try {
    const start = new Date(startIso);
    const opt: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    const a = start.toLocaleString(undefined, opt);
    if (!endIso) return a;
    const end = new Date(endIso);
    if (Number.isNaN(end.getTime()) || end.getTime() === start.getTime()) return a;
    const b = end.toLocaleString(undefined, { ...opt, weekday: undefined });
    return `${a} — ${b}`;
  } catch {
    return startIso;
  }
}

export function EventDetailPage() {
  const { eventId: rawId } = useParams<{ eventId: string }>();
  const eventId = rawId ? normalizeMongoId(decodeURIComponent(rawId)) : '';

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [rsvping, setRsvping] = useState(false);
  const { user } = useAuth();

  const photos = event?.photos?.filter(Boolean) ?? [];

  useEffect(() => {
    if (lightbox == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((i) => (i != null && photos.length ? (i + 1) % photos.length : null));
      if (e.key === 'ArrowLeft')
        setLightbox((i) => (i != null && photos.length ? (i - 1 + photos.length) % photos.length : null));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, photos.length]);

  useEffect(() => {
    if (!eventId) {
      setNotFound(true);
      setLoading(false);
      setEvent(null);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const e = await eventService.getById(eventId);
        if (!cancelled) setEvent(e);
      } catch {
        if (!cancelled) {
          toast.error('Failed to load event');
          setNotFound(true);
          setEvent(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const isRsvped = event?.attendees?.includes(user?.id ?? '') ?? false;
  const canRsvp = event?.rsvpEnabled && event?.status === 'upcoming';
  const attendeeCount = event?.attendees?.length ?? 0;

  async function handleRsvpToggle() {
    if (!event || rsvping) return;
    setRsvping(true);
    try {
      if (isRsvped) {
        const res = await eventService.cancelRsvp(event.id);
        setEvent((prev) =>
          prev ? { ...prev, attendees: prev.attendees.filter((a) => a !== user?.id) } : prev
        );
        toast.success('RSVP cancelled');
      } else {
        await eventService.rsvp(event.id);
        setEvent((prev) =>
          prev ? { ...prev, attendees: [...prev.attendees, user?.id ?? ''] } : prev
        );
        toast.success('RSVP confirmed!');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Failed to update RSVP');
    } finally {
      setRsvping(false);
    }
  }

  if (!eventId) {
    return (
      <DashboardShell pageTitle="Event">
        <p className="page-subtitle" style={{ color: 'var(--color-red)' }}>
          Invalid event link.
        </p>
        <Link to="/dashboard/events" className="btn btn-outline btn-sm" style={{ marginTop: 'var(--space-4)' }}>
          Back to Events
        </Link>
      </DashboardShell>
    );
  }

  if (loading) {
    return (
      <DashboardShell pageTitle="Event">
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="loading-spinner" aria-label="Loading" />
        </div>
      </DashboardShell>
    );
  }

  if (notFound || !event) {
    return (
      <DashboardShell pageTitle="Event not found">
        <Link to="/dashboard/events" className="btn btn-outline btn-sm">
          ← Back to Events
        </Link>
      </DashboardShell>
    );
  }

  const org = event.organizer;
  const cover = photos[0] ? resolveMediaUrl(photos[0]) : null;
  const headerMod = cover ? ' event-detail-header--has-cover' : '';

  return (
    <DashboardShell pageTitle={event.title}>
      <div className="event-detail">
        <div className="event-detail-toolbar">
          <Link to="/dashboard/events" className="btn btn-ghost btn-sm">
            ← Events
          </Link>
        </div>

        <header className={`event-detail-header${headerMod}`}>
          {cover ? (
            <div className="event-detail-hero">
              <img src={cover} alt="" className="event-detail-hero-img" />
              <div className="event-detail-hero-scrim" />
            </div>
          ) : (
            <div className="event-detail-hero event-detail-hero--placeholder" aria-hidden />
          )}
          <div className="event-detail-header-inner">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
              <span className={`badge badge-${typeBadge(event.type ?? 'other')}`}>{capitalize(event.type ?? 'other')}</span>
              <span className={`badge badge-${statusBadge(event.status ?? 'upcoming')}`}>
                {capitalize(event.status ?? 'upcoming')}
              </span>
              {event.isOnline ? <span className="badge badge-primary">Online</span> : null}
            </div>
            <h1 className="event-detail-title">{event.title}</h1>
            <p className="event-detail-datetime">{formatWhen(event.date, event.endDate)}</p>
          </div>
        </header>

        <div className="event-detail-layout">
          <div className="event-detail-main">
            {event.description?.trim() ? (
              <section className="event-detail-card">
                <h2 className="event-detail-card-title">About</h2>
                <div className="event-detail-prose">{event.description}</div>
              </section>
            ) : null}

            {photos.length > 0 ? (
              <section className="event-detail-card">
                <h2 className="event-detail-card-title">Photos ({photos.length})</h2>
                <p className="event-detail-hint">
                  Select a thumbnail to enlarge. Use arrow keys when the viewer is open.
                </p>
                <div className="event-detail-gallery">
                  {photos.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      className="event-detail-gallery-item"
                      onClick={() => setLightbox(i)}
                      aria-label={`View photo ${i + 1} of ${photos.length}`}
                    >
                      <img src={resolveMediaUrl(src)} alt={`${event.title} — photo ${i + 1}`} loading="lazy" />
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className="event-detail-card event-detail-card--muted">
                <p className="event-detail-empty">No gallery images for this event yet.</p>
              </section>
            )}
          </div>

          <aside className="event-detail-aside">
            <div className="event-detail-card">
              <h2 className="event-detail-card-title">Logistics</h2>
              <dl className="event-detail-meta">
                <dt>Where</dt>
                <dd>{event.isOnline ? 'Online' : event.location?.trim() || '—'}</dd>
                {event.isOnline && event.meetLink?.trim() ? (
                  <>
                    <dt>Link</dt>
                    <dd>
                      <a href={event.meetLink} target="_blank" rel="noopener noreferrer" className="event-detail-link">
                        Join session
                      </a>
                    </dd>
                  </>
                ) : null}
                <dt>Organizer</dt>
                <dd>
                  <span className="tbl-name">{org?.name ?? '—'}</span>
                  {org?.email ? (
                    <>
                      {' '}
                      <a href={`mailto:${org.email}`} className="event-detail-link">
                        {org.email}
                      </a>
                    </>
                  ) : null}
                </dd>
                {event.maxAttendees != null && event.maxAttendees > 0 ? (
                  <>
                    <dt>Capacity</dt>
                    <dd>{event.maxAttendees} attendees (registered headcount tracked separately)</dd>
                  </>
                ) : null}
                <dt>RSVP</dt>
                <dd>
                  {canRsvp ? (
                    <button
                      type="button"
                      className={`btn btn-sm ${isRsvped ? 'btn-outline' : 'btn-primary'}`}
                      onClick={handleRsvpToggle}
                      disabled={rsvping}
                    >
                      {rsvping ? (isRsvped ? 'Cancelling…' : 'RSVPing…') : isRsvped ? '✓ RSVPed — Cancel' : 'RSVP for this event'}
                    </button>
                  ) : (
                    <span className="text-muted text-sm">
                      {event.rsvpEnabled
                        ? event.status === 'upcoming'
                          ? 'RSVP closed'
                          : 'Only upcoming events accept RSVPs'
                        : 'RSVP disabled for this event'}
                    </span>
                  )}
                  {attendeeCount > 0 && (
                    <span className="text-sm text-muted" style={{ marginLeft: 'var(--space-2)' }}>
                      ({attendeeCount} attendee{attendeeCount !== 1 ? 's' : ''})
                    </span>
                  )}
                </dd>
              </dl>
            </div>

            {event.tags && event.tags.length > 0 ? (
              <div className="event-detail-card">
                <h2 className="event-detail-card-title">Tags</h2>
                <div className="event-detail-tags">
                  {event.tags.map((t) => (
                    <span key={t} className="badge badge-neutral">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>

      {lightbox != null && photos[lightbox] ? (
        <div
          className="event-detail-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={closeLightbox}
        >
          <button type="button" className="event-detail-lightbox-close" onClick={closeLightbox} aria-label="Close">
            ×
          </button>
          <img
            src={resolveMediaUrl(photos[lightbox])}
            alt={`${event.title} — full size`}
            className="event-detail-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 ? (
            <span className="event-detail-lightbox-counter">
              {lightbox + 1} / {photos.length}
            </span>
          ) : null}
        </div>
      ) : null}
    </DashboardShell>
  );
}
