import { ageRangeOptions, interestOptions, participationOptions } from '../src/content/formOptions'
import { registrationSchema } from '../src/lib/schemas'
import type { Registration } from '../src/types'
import { getPool, SCHEMA } from './_lib/db'
import { HttpError, oneOf, parse, postHandler } from './_lib/http'
import { notify } from './_lib/router'

const INTERESTS = interestOptions.map((o) => o.value)

/** POST /api/registrations — "Join Global Harvest" form. */
export default postHandler(async (body) => {
  const r = parse<Registration>(body, registrationSchema, [
    'firstName', 'lastName', 'email', 'phone', 'country', 'city', 'ageRange', 'preferredLanguage',
    'referralSource', 'interests', 'participation', 'church', 'areasOfInterest', 'message', 'consent',
  ])
  oneOf(r.ageRange, ageRangeOptions.map((o) => o.value), 'ageRange')
  oneOf(r.participation, participationOptions.map((o) => o.value), 'participation')
  if (!Array.isArray(r.interests) || r.interests.some((i) => !INTERESTS.includes(i))) {
    throw new HttpError(422, 'Some fields are invalid.', { interests: 'Invalid option.' })
  }

  const { rows } = await getPool().query<{ id: string }>(
    `INSERT INTO ${SCHEMA}.registrations
       (first_name, last_name, email, phone, country, city, age_range, preferred_language, referral_source,
        interests, participation, church, areas_of_interest, message, consent)
     VALUES ($1,$2,lower($3),$4,$5,$6,$7,$8,$9,$10,$11,NULLIF($12,''),NULLIF($13,''),NULLIF($14,''),$15)
     RETURNING id`,
    [
      r.firstName, r.lastName, r.email, r.phone, r.country, r.city, r.ageRange, r.preferredLanguage, r.referralSource,
      r.interests, r.participation, r.church ?? '', r.areasOfInterest ?? '', r.message ?? '', r.consent === true,
    ],
  )
  await notify('registration', `New registration: ${r.firstName} ${r.lastName} (${r.country})`, 'registrations:read', 'registration', rows[0].id)
  return { id: rows[0].id }
})
