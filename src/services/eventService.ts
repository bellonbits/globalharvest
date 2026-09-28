import { events as localEvents } from '../content/events'
import type { Event, EventRegistration, SubmissionResult } from '../types'
import { http, isApiConfigured, isContentApiConfigured, mockDelay, newId } from './http'
import { appendLocal } from './localStore'

const byDateAsc = (a: Event, b: Event) => +new Date(a.startsAt) - +new Date(b.startsAt)

let adminEvents: Promise<Event[]> | null = null
/** Events published from the admin portal (GET /api/v1/public/events). */
function publishedEvents(): Promise<Event[]> {
  if (!isApiConfigured) return Promise.resolve([])
  adminEvents ??= http.get<{ events: Event[] }>('/v1/public/events').then((r) => r.events).catch(() => [])
  return adminEvents
}

/**
 * Admin-published events come first. The built-in sample events are shown
 * only until at least one real (non-demo) event has been published.
 */
async function allEvents(): Promise<Event[]> {
  const managed = await publishedEvents()
  const hasReal = managed.some((e) => !e.isPlaceholder)
  const slugs = new Set(managed.map((e) => e.slug))
  return hasReal ? managed : [...managed, ...localEvents.filter((e) => !slugs.has(e.slug))]
}

export const isPastEvent = (e: Event, now = new Date()) => new Date(e.endsAt ?? e.startsAt) < now

export const eventService = {
  /** GET /events */
  async list(): Promise<Event[]> {
    if (isContentApiConfigured) return http.get<Event[]>('/events')
    return (await allEvents()).sort(byDateAsc)
  },

  async upcoming(limit?: number): Promise<Event[]> {
    const all = await this.list()
    const upcoming = all.filter((e) => !isPastEvent(e)).sort(byDateAsc)
    return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming
  },

  /** GET /events/:slug */
  async getBySlug(slug: string): Promise<Event | null> {
    if (isContentApiConfigured) {
      try {
        return await http.get<Event>(`/events/${encodeURIComponent(slug)}`)
      } catch {
        return null
      }
    }
    return (await allEvents()).find((e) => e.slug === slug) ?? null
  },

  /** POST /event-registrations */
  async register(registration: EventRegistration): Promise<SubmissionResult> {
    const payload = { ...registration, submittedAt: new Date().toISOString() }
    if (isApiConfigured) {
      return http.post<SubmissionResult>('/event-registrations', payload)
    }
    await mockDelay()
    const id = newId('evreg')
    appendLocal('eventRegistrations', { id, ...payload })
    return { ok: true, id }
  },
}
