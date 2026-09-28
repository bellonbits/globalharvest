import { Link, useParams } from 'react-router-dom'
import { Icon, type IconName } from '../components/brand/Icon'
import { EventRegistrationForm } from '../components/forms/EventRegistrationForm'
import { PageHero } from '../components/sections/PageHero'
import { Badge } from '../components/ui/Badge'
import { CTAButton } from '../components/ui/Button'
import { PlaceholderBadge, PlaceholderNotice } from '../components/ui/PlaceholderBadge'
import { Reveal } from '../components/ui/Reveal'
import { site } from '../config/site'
import { categoryLabel } from '../content/events'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { formatDate, participationLabel } from '../lib/format'
import { eventService, isPastEvent } from '../services'
import NotFound from './NotFound'

export default function EventDetail() {
  const { slug = '' } = useParams()
  const { data: event, loading } = useAsync(() => eventService.getBySlug(slug), [slug])

  useSeo({
    title: event?.title ?? 'Event',
    description: event?.summary,
    type: 'event',
    // Structured data only for confirmed events — never advertise samples to search engines.
    jsonLd:
      event && !event.isPlaceholder
        ? {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: event.title,
            description: event.summary,
            startDate: event.startsAt,
            endDate: event.endsAt,
            eventAttendanceMode:
              event.format === 'online'
                ? 'https://schema.org/OnlineEventAttendanceMode'
                : event.format === 'both'
                  ? 'https://schema.org/MixedEventAttendanceMode'
                  : 'https://schema.org/OfflineEventAttendanceMode',
            location: { '@type': event.format === 'online' ? 'VirtualLocation' : 'Place', name: event.location },
            organizer: { '@type': 'Organization', name: site.name, url: site.url },
          }
        : undefined,
    noindex: event?.isPlaceholder,
  })

  if (loading) {
    return <div className="min-h-[70vh] bg-teal-800" role="status" aria-label="Loading event" />
  }
  if (!event) return <NotFound />

  const past = isPastEvent(event)
  const canRegister = !past && (event.registrationStatus === 'open' || event.registrationStatus === 'waitlist')
  const details: { icon: IconName; label: string; value: string }[] = [
    { icon: 'calendar', label: 'Date', value: formatDate(event.startsAt) },
    { icon: 'clock', label: 'Time', value: event.timeLabel },
    { icon: event.format === 'online' ? 'monitor' : 'pin', label: 'Location', value: `${participationLabel[event.format]} · ${event.location}` },
    ...(event.speaker ? [{ icon: 'user' as IconName, label: 'Speaker', value: event.speaker.name }] : []),
  ]

  return (
    <>
      <PageHero
        eyebrow={categoryLabel(event.category)}
        title={event.title}
        description={event.summary}
        image={event.image}
        aside={
          <dl className="rounded-3xl border border-cream-100/15 bg-teal-950/45 p-7 backdrop-blur-md">
            {event.isPlaceholder ? <PlaceholderBadge label="Sample event" tone="light" className="mb-5" /> : null}
            <div className="space-y-4">
              {details.map((d) => (
                <div key={d.label} className="flex items-start gap-3">
                  <Icon name={d.icon} size={20} className="mt-0.5 shrink-0 text-coral-300" />
                  <div>
                    <dt className="text-xs font-semibold tracking-[0.14em] text-cream-100/60 uppercase">{d.label}</dt>
                    <dd className="text-cream-100">{d.value}</dd>
                  </div>
                </div>
              ))}
            </div>
          </dl>
        }
      >
        {canRegister ? (
          <CTAButton href="#register" size="lg">
            {event.registrationStatus === 'waitlist' ? 'Join the waitlist' : 'Register'}
          </CTAButton>
        ) : null}
        <CTAButton to="/events" variant="outline-light" size="lg" icon={null} iconLeft="arrowLeft">
          All events
        </CTAButton>
      </PageHero>

      <section className="bg-cream-100 py-20 sm:py-28">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow text-coral-700">About this event</p>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-teal-900/80">
                {event.description.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <Badge tone="cream">{categoryLabel(event.category)}</Badge>
                <Badge tone="teal">{participationLabel[event.format]}</Badge>
                {event.capacity ? <Badge tone="coral">Limited to {event.capacity} places</Badge> : null}
              </div>
              {event.speaker ? (
                <div className="mt-10 flex items-center gap-4 rounded-2xl border border-teal-800/10 bg-cream-50 p-5">
                  <span className="grid size-12 place-items-center rounded-full bg-teal-800 text-cream-100">
                    <Icon name="user" size={22} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-teal-900/55 uppercase">Speaker</p>
                    <p className="font-display text-lg font-semibold text-teal-800">{event.speaker.name}</p>
                  </div>
                </div>
              ) : null}
            </Reveal>
          </div>

          <div id="register" className="scroll-mt-24 lg:col-span-7">
            <Reveal className="rounded-[2rem] bg-cream-50 p-6 shadow-soft ring-1 ring-teal-800/10 sm:p-10">
              {canRegister ? (
                <>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-teal-800">
                    {event.registrationStatus === 'waitlist' ? 'Join the waitlist' : 'Register for this event'}
                  </h2>
                  <p className="mt-2 mb-8 text-teal-900/70">It only takes a minute. We’ll send the details to your email.</p>
                  {event.isPlaceholder ? (
                    <PlaceholderNotice className="mb-8">This is a sample event. The form works in demo mode; confirm real events before launch.</PlaceholderNotice>
                  ) : null}
                  <EventRegistrationForm event={event} />
                </>
              ) : (
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-teal-800">{past ? 'This event has taken place.' : 'Registration is closed.'}</h2>
                  <p className="mt-3 text-teal-900/70">
                    Browse other <Link to="/events" className="font-medium text-teal-700 underline underline-offset-4">upcoming events</Link>, or register with Global Harvest to hear about the next one.
                  </p>
                  <div className="mt-8">
                    <CTAButton to="/register?interest=events">Get event updates</CTAButton>
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
