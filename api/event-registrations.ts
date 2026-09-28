import { events } from '../src/content/events.js'
import { eventRegistrationSchema, type EventRegistrationInput } from '../src/lib/schemas.js'
import { getPool, SCHEMA } from './_lib/db.js'
import { HttpError, parse, postHandler } from './_lib/http.js'
import { notify } from './_lib/router.js'

/** POST /api/event-registrations — per-event registration form. */
export default postHandler(async (body) => {
  const slug = typeof body.eventSlug === 'string' ? body.eventSlug : ''
  if (!slug || slug.length > 120) throw new HttpError(404, 'Event not found.')
  let title: string
  const managed = await getPool().query(`SELECT data, status FROM ${SCHEMA}.records WHERE collection = 'events' AND data->>'slug' = $1 LIMIT 1`, [slug])
  if (managed.rows[0]) {
    // Event created in the admin portal.
    const e = managed.rows[0].data as Record<string, any>
    const deadlinePassed = e.registrationDeadline && new Date(`${e.registrationDeadline}T23:59:59`) < new Date()
    const past = new Date(`${e.date}T${e.endTime ?? e.startTime ?? '23:59'}:00`) < new Date()
    if (managed.rows[0].status !== 'registration-open' || e.registrationEnabled === false || deadlinePassed || past) throw new HttpError(409, 'Registration for this event is closed.')
    if (e.capacity) {
      const taken = await getPool().query(`SELECT coalesce(sum(attendees), 0)::int AS n FROM ${SCHEMA}.event_registrations WHERE event_slug = $1 AND attendance <> 'cancelled'`, [slug])
      if (taken.rows[0].n + Number(body.attendees ?? 1) > Number(e.capacity)) throw new HttpError(409, 'This event is full.')
    }
    title = e.title
  } else {
    // Built-in sample event from src/content/events.ts.
    const event = events.find((e) => e.slug === slug)
    if (!event) throw new HttpError(404, 'Event not found.')
    const past = new Date(event.endsAt ?? event.startsAt) < new Date()
    if (past || !['open', 'waitlist'].includes(event.registrationStatus)) throw new HttpError(409, 'Registration for this event is closed.')
    title = event.title
  }

  const r = parse<EventRegistrationInput>(body, eventRegistrationSchema, [
    'firstName', 'lastName', 'email', 'phone', 'country', 'attendees', 'specialRequirements', 'consent',
  ])
  const { rows } = await getPool().query<{ id: string }>(
    `INSERT INTO ${SCHEMA}.event_registrations
       (event_slug, first_name, last_name, email, phone, country, attendees, special_requirements, consent)
     VALUES ($1,$2,$3,lower($4),$5,$6,$7,NULLIF($8,''),$9)
     RETURNING id`,
    [slug, r.firstName, r.lastName, r.email, r.phone, r.country, Number(r.attendees), r.specialRequirements ?? '', r.consent === true],
  )
  await notify('event_registration', `New registration for ${title}: ${r.firstName} ${r.lastName} (${r.attendees})`, 'event_registrations:read', 'event', slug)
  return { id: rows[0].id }
})
