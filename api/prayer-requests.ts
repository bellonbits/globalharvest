import { prayerRequestSchema } from '../src/lib/schemas'
import type { PrayerRequest } from '../src/types'
import { getPool, SCHEMA } from './_lib/db'
import { oneOf, parse, postHandler } from './_lib/http'
import { notify } from './_lib/router'

const CATEGORIES = ['personal', 'family', 'health', 'work', 'faith', 'community', 'mission', 'other'] as const

/**
 * POST /api/prayer-requests — confidential. There is deliberately no public
 * GET endpoint; requests are read only by the prayer team via the database.
 */
export default postHandler(async (body) => {
  const r = parse<PrayerRequest>(body, prayerRequestSchema, ['fullName', 'email', 'request', 'country', 'wantsContact', 'consent'])
  const category = body.category === undefined || body.category === '' ? 'other' : oneOf(body.category, CATEGORIES, 'category')
  const { rows } = await getPool().query<{ id: string }>(
    `INSERT INTO ${SCHEMA}.prayer_requests (full_name, email, request, country, wants_contact, consent, category)
     VALUES ($1, lower($2), $3, $4, $5, $6, $7) RETURNING id`,
    [r.fullName, r.email, r.request, r.country, r.wantsContact === true, r.consent === true, category],
  )
  // Notification title deliberately omits the request text and name (sensitive).
  await notify('prayer_request', `New prayer request (${category})${r.wantsContact ? ' — contact requested' : ''}`, 'prayer:read', 'prayer_request', rows[0].id)
  return { id: rows[0].id }
})
