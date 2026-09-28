import { can, type Permission } from '../../../src/admin/rbac'
import { getPool, SCHEMA } from '../db'
import { HttpError } from '../http'
import { audit, oneOfOr, pageParams, sendCsv, sortClause, str, toCsv, uuidOk, type AuthedCtx, type Router } from '../router'

const REG_STATUSES = ['new', 'contacted', 'active', 'inactive', 'archived'] as const
const ATTENDANCE = ['registered', 'confirmed', 'attended', 'no-show', 'cancelled'] as const
const PRAYER_STATUSES = ['new', 'being-prayed-for', 'follow-up', 'answered', 'archived'] as const
const PRAYER_CATEGORIES = ['personal', 'family', 'health', 'work', 'faith', 'community', 'mission', 'other'] as const
const MSG_STATUSES = ['unread', 'read', 'replied', 'archived'] as const
const NOTE_KINDS = ['note', 'email', 'call', 'message', 'status'] as const

const db = () => getPool()
const T = (t: string) => `${SCHEMA}.${t}`

/* ---------------- row mappers ---------------- */

export const mapRegistration = (r: Record<string, any>) => ({
  id: r.id,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  phone: r.phone,
  country: r.country,
  city: r.city,
  ageRange: r.age_range,
  preferredLanguage: r.preferred_language,
  referralSource: r.referral_source,
  interests: r.interests,
  participation: r.participation,
  church: r.church,
  areasOfInterest: r.areas_of_interest,
  message: r.message,
  status: r.status,
  isDemo: r.is_demo,
  createdAt: r.created_at,
})

const mapEventReg = (r: Record<string, any>) => ({
  id: r.id,
  eventSlug: r.event_slug,
  firstName: r.first_name,
  lastName: r.last_name,
  email: r.email,
  phone: r.phone,
  country: r.country,
  attendees: r.attendees,
  specialRequirements: r.special_requirements,
  attendance: r.attendance,
  isDemo: r.is_demo,
  createdAt: r.created_at,
})

/** Prayer list view deliberately returns only an excerpt of the request (minimal data exposure). */
const mapPrayer = (r: Record<string, any>, full = false) => ({
  id: r.id,
  fullName: r.full_name,
  // Email is only released when the person asked to be contacted (minimal data exposure).
  email: full && r.wants_contact ? r.email : undefined,
  request: full ? r.request : r.request.length > 120 ? `${r.request.slice(0, 120)}…` : r.request,
  country: r.country,
  category: r.category,
  wantsContact: r.wants_contact,
  status: r.status,
  isDemo: r.is_demo,
  createdAt: r.created_at,
})

const mapMessage = (r: Record<string, any>) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  category: r.category,
  subject: r.subject,
  message: r.message,
  status: r.status,
  repliedAt: r.replied_at,
  isDemo: r.is_demo,
  createdAt: r.created_at,
})

/* ---------------- notes ---------------- */

/** Which permission guards the notes of each entity type. */
const NOTE_PERMS: Record<string, { read: Permission; write: Permission }> = {
  registration: { read: 'registrations:read', write: 'registrations:write' },
  member: { read: 'members:read', write: 'members:write' },
  prayer_request: { read: 'prayer:read', write: 'prayer:write' },
  contact_message: { read: 'messages:read', write: 'messages:write' },
  group: { read: 'groups:read', write: 'groups:write' },
}

async function listNotes(entityType: string, entityId: string) {
  const { rows } = await db().query(
    `SELECT id, kind, body, author_name, created_at FROM ${T('admin_notes')} WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC LIMIT 200`,
    [entityType, entityId],
  )
  return rows.map((n) => ({ id: n.id, kind: n.kind, body: n.body, authorName: n.author_name, createdAt: n.created_at }))
}

export async function addNote(ctx: AuthedCtx, entityType: string, entityId: string, body: string, kind: (typeof NOTE_KINDS)[number] = 'note') {
  const { rows } = await db().query(
    `INSERT INTO ${T('admin_notes')} (entity_type, entity_id, kind, body, author_id, author_name) VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, kind, body, author_name, created_at`,
    [entityType, entityId, kind, body, ctx.user.id, ctx.user.name],
  )
  const n = rows[0]
  return { id: n.id, kind: n.kind, body: n.body, authorName: n.author_name, createdAt: n.created_at }
}

function assertId(id: string) {
  if (!uuidOk(id)) throw new HttpError(404, 'Not found.')
}

/* ---------------- routes ---------------- */

export function registerSubmissionRoutes(r: Router) {
  /* ===== Registrations ===== */

  const regFilters = (q: URLSearchParams) => {
    const where: string[] = []
    const args: unknown[] = []
    const add = (sql: string, v: unknown) => {
      args.push(v)
      where.push(sql.replace('?', `$${args.length}`))
    }
    const search = str(q.get('q'), 100)
    if (search) add(`(first_name || ' ' || last_name || ' ' || email || ' ' || city ILIKE ?)`, `%${search}%`)
    const status = oneOfOr(q.get('status'), REG_STATUSES)
    if (status) add('status = ?', status)
    else if (q.get('includeArchived') !== 'true') where.push(`status <> 'archived'`)
    if (q.get('country')) add('country = ?', str(q.get('country'), 80))
    if (q.get('participation')) add('participation = ?', str(q.get('participation'), 20))
    if (q.get('interest')) add('? = ANY(interests)', str(q.get('interest'), 30))
    return { where: where.length ? `WHERE ${where.join(' AND ')}` : '', args }
  }
  const REG_SORT = { name: 'last_name', email: 'email', country: 'country', city: 'city', status: 'status', createdAt: 'created_at' }

  r.on('GET', '/registrations', 'registrations:read', async ({ query }) => {
    const { where, args } = regFilters(query)
    const { pageSize, offset, page } = pageParams(query)
    const [list, count] = await Promise.all([
      db().query(`SELECT * FROM ${T('registrations')} ${where} ORDER BY ${sortClause(query, REG_SORT, 'created_at')} LIMIT ${pageSize} OFFSET ${offset}`, args),
      db().query(`SELECT count(*)::int AS n FROM ${T('registrations')} ${where}`, args),
    ])
    return { items: list.rows.map(mapRegistration), total: count.rows[0].n, page, pageSize }
  })

  r.on('GET', '/registrations/export', 'registrations:read', async (ctx) => {
    const { where, args } = regFilters(ctx.query)
    const { rows } = await db().query(`SELECT * FROM ${T('registrations')} ${where} ORDER BY created_at DESC LIMIT 10000`, args)
    await audit(ctx, 'registrations.export', 'registration', null, { count: rows.length })
    const csv = toCsv(rows.map(mapRegistration), [
      { key: 'firstName', label: 'First name' }, { key: 'lastName', label: 'Last name' }, { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' }, { key: 'country', label: 'Country' }, { key: 'city', label: 'City' },
      { key: 'ageRange', label: 'Age range' }, { key: 'preferredLanguage', label: 'Language' }, { key: 'interests', label: 'Interests' },
      { key: 'participation', label: 'Participation' }, { key: 'church', label: 'Church' }, { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Registered at' },
    ])
    sendCsv(ctx.res, `registrations-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  })

  r.on('GET', '/registrations/:id', 'registrations:read', async ({ params }) => {
    assertId(params.id)
    const { rows } = await db().query(`SELECT * FROM ${T('registrations')} WHERE id = $1`, [params.id])
    if (!rows[0]) throw new HttpError(404, 'Registration not found.')
    const member = await db().query(`SELECT id FROM ${T('records')} WHERE collection = 'members' AND data->>'registrationId' = $1 LIMIT 1`, [params.id])
    return { registration: mapRegistration(rows[0]), notes: await listNotes('registration', params.id), memberId: member.rows[0]?.id ?? null }
  })

  r.on('PATCH', '/registrations/:id', 'registrations:write', async (ctx) => {
    assertId(ctx.params.id)
    const status = oneOfOr(ctx.body.status, REG_STATUSES)
    if (!status) throw new HttpError(422, 'Invalid status.')
    const { rows } = await db().query(`UPDATE ${T('registrations')} SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`, [ctx.params.id, status])
    if (!rows[0]) throw new HttpError(404, 'Registration not found.')
    await addNote(ctx, 'registration', ctx.params.id, `Status changed to “${status}”.`, 'status')
    await audit(ctx, 'registration.status_changed', 'registration', ctx.params.id, { status })
    return { registration: mapRegistration(rows[0]) }
  })

  r.on('POST', '/registrations/bulk', 'registrations:write', async (ctx) => {
    const ids = Array.isArray(ctx.body.ids) ? ctx.body.ids.filter((x): x is string => typeof x === 'string' && uuidOk(x)).slice(0, 500) : []
    const status = oneOfOr(ctx.body.status, REG_STATUSES)
    if (!ids.length || !status) throw new HttpError(422, 'Choose registrations and a status.')
    const res = await db().query(`UPDATE ${T('registrations')} SET status = $2, updated_at = now() WHERE id = ANY($1::uuid[])`, [ids, status])
    await audit(ctx, 'registration.bulk_status', 'registration', null, { count: res.rowCount, status })
    return { updated: res.rowCount }
  })

  r.on('POST', '/registrations/:id/notes', 'registrations:write', async (ctx) => {
    assertId(ctx.params.id)
    const body = str(ctx.body.body, 5000)
    if (!body) throw new HttpError(422, 'Write a note first.')
    const kind = oneOfOr(ctx.body.kind, NOTE_KINDS) ?? 'note'
    const note = await addNote(ctx, 'registration', ctx.params.id, body, kind)
    await audit(ctx, 'registration.note_added', 'registration', ctx.params.id, { kind })
    return { note }
  })

  /** Converts a registration into a member record (keeps the link). */
  r.on('POST', '/registrations/:id/convert', ['members:write'], async (ctx) => {
    assertId(ctx.params.id)
    const { rows } = await db().query(`SELECT * FROM ${T('registrations')} WHERE id = $1`, [ctx.params.id])
    const reg = rows[0]
    if (!reg) throw new HttpError(404, 'Registration not found.')
    const existing = await db().query(`SELECT id FROM ${T('records')} WHERE collection = 'members' AND data->>'registrationId' = $1`, [reg.id])
    if (existing.rows[0]) return { memberId: existing.rows[0].id }
    const data = {
      firstName: reg.first_name, lastName: reg.last_name, email: reg.email, phone: reg.phone, country: reg.country, city: reg.city,
      status: 'active', groupIds: [], bibleStudyIds: [], eventSlugs: [], registrationId: reg.id, joinedAt: new Date().toISOString(),
    }
    const ins = await db().query(
      `INSERT INTO ${T('records')} (collection, status, data, is_demo, created_by, updated_by) VALUES ('members', 'active', $1, $2, $3, $3) RETURNING id`,
      [JSON.stringify(data), reg.is_demo, ctx.user.id],
    )
    await db().query(`UPDATE ${T('registrations')} SET status = 'active', updated_at = now() WHERE id = $1 AND status IN ('new', 'contacted')`, [reg.id])
    await addNote(ctx, 'registration', reg.id, 'Converted to member.', 'status')
    await audit(ctx, 'member.created_from_registration', 'member', ins.rows[0].id, { registrationId: reg.id })
    return { memberId: ins.rows[0].id }
  })

  /* ===== Event registrations ===== */

  const erFilters = (slug: string, q: URLSearchParams) => {
    const args: unknown[] = [slug]
    const where = ['event_slug = $1']
    const search = str(q.get('q'), 100)
    if (search) {
      args.push(`%${search}%`)
      where.push(`(first_name || ' ' || last_name || ' ' || email ILIKE $${args.length})`)
    }
    const att = oneOfOr(q.get('attendance'), ATTENDANCE)
    if (att) {
      args.push(att)
      where.push(`attendance = $${args.length}`)
    }
    return { where: `WHERE ${where.join(' AND ')}`, args }
  }

  r.on('GET', '/event-registrations', 'event_registrations:read', async ({ query }) => {
    const slug = str(query.get('event'), 120)
    if (!slug) throw new HttpError(422, 'Missing event.')
    const { where, args } = erFilters(slug, query)
    const { pageSize, offset, page } = pageParams(query)
    const sort = sortClause(query, { name: 'last_name', email: 'email', attendees: 'attendees', attendance: 'attendance', createdAt: 'created_at' }, 'created_at')
    const [list, count, stats] = await Promise.all([
      db().query(`SELECT * FROM ${T('event_registrations')} ${where} ORDER BY ${sort} LIMIT ${pageSize} OFFSET ${offset}`, args),
      db().query(`SELECT count(*)::int AS n FROM ${T('event_registrations')} ${where}`, args),
      db().query(
        `SELECT count(*) FILTER (WHERE attendance <> 'cancelled')::int AS registrations,
                coalesce(sum(attendees) FILTER (WHERE attendance <> 'cancelled'), 0)::int AS people,
                coalesce(sum(attendees) FILTER (WHERE attendance = 'attended'), 0)::int AS attended
           FROM ${T('event_registrations')} WHERE event_slug = $1`,
        [slug],
      ),
    ])
    return { items: list.rows.map(mapEventReg), total: count.rows[0].n, page, pageSize, stats: stats.rows[0] }
  })

  r.on('GET', '/event-registrations/export', 'event_registrations:read', async (ctx) => {
    const slug = str(ctx.query.get('event'), 120)
    const { where, args } = erFilters(slug, ctx.query)
    const { rows } = await db().query(`SELECT * FROM ${T('event_registrations')} ${where} ORDER BY created_at DESC LIMIT 10000`, args)
    await audit(ctx, 'event_registrations.export', 'event', slug, { count: rows.length })
    sendCsv(
      ctx.res,
      `event-${slug}-registrations.csv`,
      toCsv(rows.map(mapEventReg), [
        { key: 'firstName', label: 'First name' }, { key: 'lastName', label: 'Last name' }, { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' }, { key: 'country', label: 'Country' }, { key: 'attendees', label: 'Attendees' },
        { key: 'specialRequirements', label: 'Special requirements' }, { key: 'attendance', label: 'Attendance' }, { key: 'createdAt', label: 'Registered at' },
      ]),
    )
  })

  r.on('PATCH', '/event-registrations/:id', 'event_registrations:write', async (ctx) => {
    assertId(ctx.params.id)
    const attendance = oneOfOr(ctx.body.attendance, ATTENDANCE)
    if (!attendance) throw new HttpError(422, 'Invalid attendance status.')
    const { rows } = await db().query(`UPDATE ${T('event_registrations')} SET attendance = $2 WHERE id = $1 RETURNING *`, [ctx.params.id, attendance])
    if (!rows[0]) throw new HttpError(404, 'Registration not found.')
    await audit(ctx, 'event_registration.attendance', 'event_registration', ctx.params.id, { attendance })
    return { registration: mapEventReg(rows[0]) }
  })

  r.on('POST', '/event-registrations/bulk', 'event_registrations:write', async (ctx) => {
    const ids = Array.isArray(ctx.body.ids) ? ctx.body.ids.filter((x): x is string => typeof x === 'string' && uuidOk(x)).slice(0, 500) : []
    const attendance = oneOfOr(ctx.body.attendance, ATTENDANCE)
    if (!ids.length || !attendance) throw new HttpError(422, 'Choose registrations and an attendance status.')
    const res = await db().query(`UPDATE ${T('event_registrations')} SET attendance = $2 WHERE id = ANY($1::uuid[])`, [ids, attendance])
    await audit(ctx, 'event_registration.bulk_attendance', 'event_registration', null, { count: res.rowCount, attendance })
    return { updated: res.rowCount }
  })

  /* ===== Prayer requests (restricted) ===== */

  r.on('GET', '/prayer-requests', 'prayer:read', async ({ query }) => {
    const args: unknown[] = []
    const where: string[] = []
    const status = oneOfOr(query.get('status'), PRAYER_STATUSES)
    if (status) {
      args.push(status)
      where.push(`status = $${args.length}`)
    } else if (query.get('includeArchived') !== 'true') where.push(`status <> 'archived'`)
    const category = oneOfOr(query.get('category'), PRAYER_CATEGORIES)
    if (category) {
      args.push(category)
      where.push(`category = $${args.length}`)
    }
    if (query.get('contact') === 'true') where.push('wants_contact')
    const search = str(query.get('q'), 100)
    if (search) {
      args.push(`%${search}%`)
      where.push(`(full_name ILIKE $${args.length} OR request ILIKE $${args.length})`)
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const { pageSize, offset, page } = pageParams(query)
    const sort = sortClause(query, { createdAt: 'created_at', name: 'full_name', category: 'category', status: 'status' }, 'created_at')
    const [list, count] = await Promise.all([
      db().query(`SELECT * FROM ${T('prayer_requests')} ${w} ORDER BY ${sort} LIMIT ${pageSize} OFFSET ${offset}`, args),
      db().query(`SELECT count(*)::int AS n FROM ${T('prayer_requests')} ${w}`, args),
    ])
    return { items: list.rows.map((x) => mapPrayer(x)), total: count.rows[0].n, page, pageSize }
  })

  /** Opening a request is audited — it contains sensitive personal information. */
  r.on('GET', '/prayer-requests/:id', 'prayer:read', async (ctx) => {
    assertId(ctx.params.id)
    const { rows } = await db().query(`SELECT * FROM ${T('prayer_requests')} WHERE id = $1`, [ctx.params.id])
    if (!rows[0]) throw new HttpError(404, 'Prayer request not found.')
    await audit(ctx, 'prayer_request.viewed', 'prayer_request', ctx.params.id)
    return { request: mapPrayer(rows[0], true), notes: await listNotes('prayer_request', ctx.params.id) }
  })

  r.on('PATCH', '/prayer-requests/:id', 'prayer:write', async (ctx) => {
    assertId(ctx.params.id)
    const status = ctx.body.status === undefined ? null : oneOfOr(ctx.body.status, PRAYER_STATUSES)
    const category = ctx.body.category === undefined ? null : oneOfOr(ctx.body.category, PRAYER_CATEGORIES)
    if (!status && !category) throw new HttpError(422, 'Nothing to update.')
    const { rows } = await db().query(
      `UPDATE ${T('prayer_requests')} SET status = coalesce($2, status), category = coalesce($3, category), updated_at = now() WHERE id = $1 RETURNING *`,
      [ctx.params.id, status, category],
    )
    if (!rows[0]) throw new HttpError(404, 'Prayer request not found.')
    await audit(ctx, 'prayer_request.updated', 'prayer_request', ctx.params.id, { status, category })
    return { request: mapPrayer(rows[0], true) }
  })

  r.on('POST', '/prayer-requests/:id/notes', 'prayer:write', async (ctx) => {
    assertId(ctx.params.id)
    const body = str(ctx.body.body, 5000)
    if (!body) throw new HttpError(422, 'Write a note first.')
    const note = await addNote(ctx, 'prayer_request', ctx.params.id, body)
    await audit(ctx, 'prayer_request.note_added', 'prayer_request', ctx.params.id)
    return { note }
  })

  /* ===== Contact messages ===== */

  r.on('GET', '/messages', 'messages:read', async ({ query }) => {
    const args: unknown[] = []
    const where: string[] = []
    const status = oneOfOr(query.get('status'), MSG_STATUSES)
    if (status) {
      args.push(status)
      where.push(`status = $${args.length}`)
    } else if (query.get('includeArchived') !== 'true') where.push(`status <> 'archived'`)
    if (query.get('category')) {
      args.push(str(query.get('category'), 30))
      where.push(`category = $${args.length}`)
    }
    const search = str(query.get('q'), 100)
    if (search) {
      args.push(`%${search}%`)
      where.push(`(name ILIKE $${args.length} OR email ILIKE $${args.length} OR subject ILIKE $${args.length})`)
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const { pageSize, offset, page } = pageParams(query)
    const sort = sortClause(query, { createdAt: 'created_at', name: 'name', subject: 'subject', category: 'category', status: 'status' }, 'created_at')
    const [list, count] = await Promise.all([
      db().query(`SELECT * FROM ${T('contact_messages')} ${w} ORDER BY ${sort} LIMIT ${pageSize} OFFSET ${offset}`, args),
      db().query(`SELECT count(*)::int AS n FROM ${T('contact_messages')} ${w}`, args),
    ])
    return { items: list.rows.map(mapMessage), total: count.rows[0].n, page, pageSize }
  })

  r.on('GET', '/messages/:id', 'messages:read', async (ctx) => {
    assertId(ctx.params.id)
    const { rows } = await db().query(`SELECT * FROM ${T('contact_messages')} WHERE id = $1`, [ctx.params.id])
    if (!rows[0]) throw new HttpError(404, 'Message not found.')
    // Opening an unread message marks it read (only for users who may change messages).
    if (rows[0].status === 'unread' && can(ctx.user.role, 'messages:write')) {
      await db().query(`UPDATE ${T('contact_messages')} SET status = 'read' WHERE id = $1`, [ctx.params.id])
      rows[0].status = 'read'
    }
    return { message: mapMessage(rows[0]), notes: await listNotes('contact_message', ctx.params.id) }
  })

  r.on('PATCH', '/messages/:id', 'messages:write', async (ctx) => {
    assertId(ctx.params.id)
    const status = oneOfOr(ctx.body.status, MSG_STATUSES)
    if (!status) throw new HttpError(422, 'Invalid status.')
    const { rows } = await db().query(
      `UPDATE ${T('contact_messages')} SET status = $2, replied_at = CASE WHEN $2 = 'replied' THEN coalesce(replied_at, now()) ELSE replied_at END WHERE id = $1 RETURNING *`,
      [ctx.params.id, status],
    )
    if (!rows[0]) throw new HttpError(404, 'Message not found.')
    await audit(ctx, 'message.status_changed', 'contact_message', ctx.params.id, { status })
    return { message: mapMessage(rows[0]) }
  })

  /**
   * Records a reply. No email provider is connected yet, so the reply text is
   * stored in the message history and the admin sends it from their mail client.
   */
  r.on('POST', '/messages/:id/reply', 'messages:write', async (ctx) => {
    assertId(ctx.params.id)
    const body = str(ctx.body.body, 5000)
    if (!body) throw new HttpError(422, 'Write a reply first.')
    const note = await addNote(ctx, 'contact_message', ctx.params.id, body, 'email')
    const { rows } = await db().query(`UPDATE ${T('contact_messages')} SET status = 'replied', replied_at = now() WHERE id = $1 RETURNING *`, [ctx.params.id])
    if (!rows[0]) throw new HttpError(404, 'Message not found.')
    await audit(ctx, 'message.replied', 'contact_message', ctx.params.id)
    return { message: mapMessage(rows[0]), note, emailSent: false }
  })

  r.on('POST', '/messages/bulk', 'messages:write', async (ctx) => {
    const ids = Array.isArray(ctx.body.ids) ? ctx.body.ids.filter((x): x is string => typeof x === 'string' && uuidOk(x)).slice(0, 500) : []
    const status = oneOfOr(ctx.body.status, MSG_STATUSES)
    if (!ids.length || !status) throw new HttpError(422, 'Choose messages and a status.')
    const res = await db().query(`UPDATE ${T('contact_messages')} SET status = $2 WHERE id = ANY($1::uuid[])`, [ids, status])
    await audit(ctx, 'message.bulk_status', 'contact_message', null, { count: res.rowCount, status })
    return { updated: res.rowCount }
  })

  /* ===== Generic notes for managed records (members, groups) ===== */

  r.on('GET', '/notes/:entityType/:entityId', null, async (ctx) => {
    const perms = NOTE_PERMS[ctx.params.entityType]
    if (!perms || !can(ctx.user.role, perms.read)) throw new HttpError(403, 'You don’t have permission to do that.')
    return { notes: await listNotes(ctx.params.entityType, ctx.params.entityId) }
  })

  r.on('POST', '/notes/:entityType/:entityId', null, async (ctx) => {
    const perms = NOTE_PERMS[ctx.params.entityType]
    if (!perms || !can(ctx.user.role, perms.write)) throw new HttpError(403, 'You don’t have permission to do that.')
    const body = str(ctx.body.body, 5000)
    if (!body) throw new HttpError(422, 'Write a note first.')
    const note = await addNote(ctx, ctx.params.entityType, ctx.params.entityId, body, oneOfOr(ctx.body.kind, NOTE_KINDS) ?? 'note')
    await audit(ctx, `${ctx.params.entityType}.note_added`, ctx.params.entityType, ctx.params.entityId)
    return { note }
  })
}
