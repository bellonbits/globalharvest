import { AnimatePresence, m } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { EventCard } from '../components/cards/EventCard'
import { PageHero } from '../components/sections/PageHero'
import { CTAButton } from '../components/ui/Button'
import { PlaceholderNotice } from '../components/ui/PlaceholderBadge'
import { SectionHeader } from '../components/ui/SectionHeader'
import { eventCategories } from '../content/events'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { cn } from '../lib/cn'
import { eventService, isPastEvent } from '../services'
import type { EventCategory } from '../types'

export default function Events() {
  useSeo({
    title: 'Events',
    description: 'Upcoming Global Harvest events — Bible studies, prayer nights, fellowship evenings, mission gatherings and special events, online and in person.',
  })
  const [params, setParams] = useSearchParams()
  const raw = params.get('category')
  const active = (eventCategories.some((c) => c.value === raw) ? raw : 'all') as EventCategory | 'all'
  const { data, loading } = useAsync(() => eventService.list(), [])

  const filtered = (data ?? []).filter((e) => active === 'all' || e.category === active)
  const upcoming = filtered.filter((e) => !isPastEvent(e))
  const past = filtered.filter((e) => isPastEvent(e)).reverse()

  const setCategory = (value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete('category')
    else next.set('category', value)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  return (
    <>
      <PageHero
        eyebrow="Events"
        title={
          <>
            Gather with us.
          </>
        }
        description="Bible studies, prayer nights, fellowship and mission evenings. Find your next gathering, online or in person."
        image="nugget-point-sunset"
        imagePosition="50% 30%"
      />

      <section className="bg-cream-100 py-16 sm:py-24" aria-labelledby="upcoming-title">
        <div className="container-page">
          <div role="group" aria-label="Filter events by category" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {eventCategories.map((c) => {
              const isActive = active === c.value
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    'shrink-0 rounded-full border px-5 py-2.5 font-display text-sm font-semibold transition',
                    isActive ? 'border-teal-800 bg-teal-800 text-cream-100' : 'border-teal-800/15 text-teal-800 hover:border-teal-800/50',
                  )}
                >
                  {c.label}
                </button>
              )
            })}
          </div>

          {data?.some((e) => e.isPlaceholder) ? (
            <PlaceholderNotice className="mt-8">
              These are sample events that show how listings, filters and registration work. Confirmed events will replace them.
            </PlaceholderNotice>
          ) : null}

          <SectionHeader id="upcoming-title" title="Upcoming events" className="mt-14" />
          <p className="sr-only" aria-live="polite">
            {loading ? 'Loading events' : `${upcoming.length} upcoming event${upcoming.length === 1 ? '' : 's'}`}
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[520px] animate-pulse rounded-[1.75rem] bg-cream-200" />)
            ) : upcoming.length ? (
              <AnimatePresence mode="popLayout">
                {upcoming.map((e) => (
                  <m.div key={e.slug} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="flex">
                    <EventCard event={e} className="w-full" />
                  </m.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-teal-800/25 p-12 text-center">
                <p className="font-display text-xl font-semibold text-teal-800">No upcoming events in this category yet.</p>
                <p className="mt-2 text-teal-900/65">Register to hear about new events first.</p>
                <div className="mt-6 flex justify-center">
                  <CTAButton to="/register?interest=events">Get event updates</CTAButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {past.length ? (
        <section className="bg-cream-200/60 py-16 sm:py-24" aria-labelledby="past-title">
          <div className="container-page">
            <SectionHeader id="past-title" title="Past events" />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {past.map((e) => (
                <EventCard key={e.slug} event={e} layout="horizontal" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
