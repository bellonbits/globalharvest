import { Link } from 'react-router-dom'
import { categoryLabel } from '../../content/events'
import { cn } from '../../lib/cn'
import { dayOfMonth, formatDate, monthShort, participationLabel } from '../../lib/format'
import { isPastEvent } from '../../services'
import type { Event } from '../../types'
import { Icon } from '../brand/Icon'
import { Badge } from '../ui/Badge'
import { Img } from '../ui/Img'
import { PlaceholderBadge } from '../ui/PlaceholderBadge'

const statusLabel = { open: 'Registration open', waitlist: 'Waitlist', closed: 'Registration closed', 'not-required': 'No registration needed' }

interface EventCardProps {
  event: Event
  layout?: 'vertical' | 'horizontal'
  className?: string
}

export function EventCard({ event, layout = 'vertical', className }: EventCardProps) {
  const past = isPastEvent(event)
  const horizontal = layout === 'horizontal'
  return (
    <article
      className={cn(
        'group relative flex overflow-hidden rounded-[1.75rem] bg-cream-50 shadow-soft ring-1 ring-teal-800/8 transition duration-500 ease-(--ease-out-soft) hover:-translate-y-1 hover:shadow-lift',
        horizontal ? 'flex-col md:flex-row' : 'flex-col',
        past && 'opacity-85',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden', horizontal ? 'aspect-[16/10] md:aspect-auto md:w-[42%]' : 'aspect-[16/10]')}>
        <Img
          name={event.image}
          decorative
          sizes={horizontal ? '(min-width: 768px) 40vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
          className={cn('size-full object-cover transition duration-700 ease-(--ease-out-soft) group-hover:scale-[1.04]', past && 'grayscale-[40%]')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/50 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex flex-col items-center rounded-2xl bg-cream-50/95 px-3.5 py-2 text-teal-800 shadow-soft backdrop-blur">
          <span className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-coral-700">{monthShort(event.startsAt)}</span>
          <span className="font-display text-2xl leading-none font-bold">{dayOfMonth(event.startsAt)}</span>
        </div>
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <Badge tone="glass">{categoryLabel(event.category)}</Badge>
          {event.isPlaceholder ? <PlaceholderBadge label="Sample event" tone="light" /> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-xl leading-snug font-semibold text-teal-800 sm:text-[1.4rem]">
          <Link to={`/events/${event.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {event.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 leading-relaxed text-teal-900/70">{event.summary}</p>

        <dl className="mt-5 grid gap-2.5 text-sm text-teal-900/80">
          <div className="flex items-center gap-2.5">
            <dt className="sr-only">Date</dt>
            <Icon name="calendar" size={17} className="shrink-0 text-coral-600" />
            <dd>{formatDate(event.startsAt)}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <dt className="sr-only">Time</dt>
            <Icon name="clock" size={17} className="shrink-0 text-coral-600" />
            <dd>{event.timeLabel}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <dt className="sr-only">Location</dt>
            <Icon name={event.format === 'online' ? 'monitor' : 'pin'} size={17} className="shrink-0 text-coral-600" />
            <dd>
              {participationLabel[event.format]} · {event.location}
            </dd>
          </div>
          {event.speaker ? (
            <div className="flex items-center gap-2.5">
              <dt className="sr-only">Speaker</dt>
              <Icon name="user" size={17} className="shrink-0 text-coral-600" />
              <dd>{event.speaker.name}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-teal-800/10 pt-5 mt-6">
          <span className={cn('text-xs font-semibold uppercase tracking-[0.14em]', past ? 'text-teal-900/50' : event.registrationStatus === 'open' ? 'text-teal-600' : 'text-coral-700')}>
            {past ? 'Past event' : statusLabel[event.registrationStatus]}
          </span>
          <span className="inline-flex items-center gap-2 font-display text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-teal-800 transition group-hover:text-coral-700">
            {past || event.registrationStatus === 'closed' ? 'Details' : 'Register'}
            <Icon name="arrowRight" size={16} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  )
}
