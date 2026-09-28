import { contactCategoryOptions } from '../src/content/formOptions'
import { contactSchema } from '../src/lib/schemas'
import type { ContactMessage } from '../src/types'
import { getPool, SCHEMA } from './_lib/db'
import { oneOf, parse, postHandler } from './_lib/http'
import { notify } from './_lib/router'

/** POST /api/contact — contact form. */
export default postHandler(async (body) => {
  const r = parse<ContactMessage>(body, contactSchema, ['name', 'email', 'phone', 'category', 'subject', 'message'])
  oneOf(r.category, contactCategoryOptions.map((o) => o.value), 'category')
  const { rows } = await getPool().query<{ id: string }>(
    `INSERT INTO ${SCHEMA}.contact_messages (name, email, phone, category, subject, message)
     VALUES ($1, lower($2), NULLIF($3,''), $4, $5, $6) RETURNING id`,
    [r.name, r.email, r.phone ?? '', r.category, r.subject, r.message],
  )
  await notify('contact_message', `New message: ${r.subject}`, 'messages:read', 'contact_message', rows[0].id)
  return { id: rows[0].id }
})
