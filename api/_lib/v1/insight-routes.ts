import { can, isRole, ROLE_PERMISSIONS, type Permission } from '../../../src/admin/rbac.js'
import { getPool, SCHEMA } from '../db.js'
import { HttpError } from '../http.js'
import { audit, oneOfOr, pageParams, str, uuidOk, type AuthedCtx, type Router } from '../router.js'
import { revokeAllSessions } from '../auth.js'
import { createResetToken } from './auth-routes.js'
import { mapRecord } from './record-routes.js'

const T = (t: string) => `${SCHEMA}.${t}`
const db = () => getPool()

/** % change between the last 30 days and the 30 days before; null without history. */
function trend(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

const countRecords = async (collection: string, statusIn?: string[], extra = '') => {
  const { rows } = await db().query(
    `SELECT count(*)::int AS n,
            count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS cur,
            count(*) FILTER (WHERE created_at <= now() - interval '30 days' AND created_at > now() - interval '60 days')::int AS prev
       FROM ${T('records')} WHERE collection = $1 ${statusIn ? 'AND status = ANY($2)' : ''} ${extra}`,
    statusIn ? [collection, statusIn] : [collection],
  )
  return rows[0] as { n: number; cur: number; prev: number }
}

const countTable = async (table: string, where = 'TRUE') => {
  const { rows } = await db().query(
    `SELECT count(*)::int AS n,
            count(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS cur,
            count(*) FILTER (WHERE created_at <= now() - interval '30 days' AND created_at > now() - interval '60 days')::int AS prev
       FROM ${T(table)} WHERE ${where}`,
  )
  return rows[0] as { n: number; cur: number; prev: number }
}

const stat = (c: { n: number; cur: number; prev: number }) => ({ value: c.n, trend: trend(c.cur, c.prev) })

/**
 * Creates reminder notifications for events starting within 3 days or with a
 * registration deadline within 2 days. One SQL statement, deduplicated, and
 * run at most every 5 minutes per server instance.
 */
let lastReminderRun = 0
async function ensureEventReminders() {
  if (Date.now() - lastReminderRun < 5 * 60_000) return
  lastReminderRun = Date.now()
  await db().query(
    `WITH due AS (
       SELECT id::text AS id, data->>'title' AS title, data->>'date' AS date, nullif(data->>'registrationDeadline', '') AS deadline
         FROM ${T('records')}
        WHERE collection = 'events' AND status NOT IN ('draft', 'cancelled', 'completed')
     ), wanted AS (
       SELECT 'event_upcoming' AS type, id, 'Upcoming event: ' || title || ' (' || date || ')' AS title FROM due
        WHERE date ~ '^\\d{4}-\\d{2}-\\d{2}$' AND date::date BETWEEN current_date AND current_date + 3
       UNION ALL
       SELECT 'event_deadline', id, 'Registration deadline for ' || title || ': ' || deadline FROM due
        WHERE deadline ~ '^\\d{4}-\\d{2}-\\d{2}$' AND deadline::date BETWEEN current_date AND current_date + 2
     )
     INSERT INTO ${T('notifications')} (type, title, entity_type, entity_id, permission)
     SELECT w.type, w.title, 'event', w.id, 'events:read' FROM wanted w
      WHERE NOT EXISTS (SELECT 1 FROM ${T('notifications')} n WHERE n.type = w.type AND n.entity_id = w.id)`,
  )
}

export function registerInsightRoutes(r: Router) {
  /* ===== Dashboard ===== */
  r.on('GET', '/admin/dashboard', 'dashboard:read', async (ctx) => {
    const role = ctx.user.role
    const [members, regs, groups, studies, prayer, upcoming, demo, recentRows] = await Promise.all([
      can(role, 'members:read') ? countRecords('members', ['active']) : null,
      can(role, 'registrations:read') ? countTable('registrations', "status <> 'archived'") : null,
      can(role, 'groups:read') ? countRecords('groups', ['active', 'full']) : null,
      can(role, 'bible_studies:read') ? countRecords('bible_studies', ['open', 'active']) : null,
      can(role, 'prayer:read') ? countTable('prayer_requests', "status <> 'archived'") : null,
      can(role, 'events:read')
        ? db().query(
            `SELECT id, data->>'title' AS title, data->>'date' AS date, data->>'startTime' AS "startTime", status
               FROM ${T('records')} WHERE collection = 'events' AND status NOT IN ('draft', 'cancelled', 'completed')
                AND (data->>'date')::date >= current_date ORDER BY data->>'date' ASC LIMIT 5`,
          )
        : null,
      db().query(
        `SELECT (SELECT count(*) FROM ${T('records')} WHERE is_demo) + (SELECT count(*) FROM ${T('registrations')} WHERE is_demo)
              + (SELECT count(*) FROM ${T('event_registrations')} WHERE is_demo) + (SELECT count(*) FROM ${T('prayer_requests')} WHERE is_demo)
              + (SELECT count(*) FROM ${T('contact_messages')} WHERE is_demo) AS n`,
      ),
      can(role, 'registrations:read') ? db().query(`SELECT id, first_name, last_name, country, status, created_at FROM ${T('registrations')} ORDER BY created_at DESC LIMIT 6`) : null,
    ])
    const recent = (recentRows?.rows ?? []).map((x) => ({
      id: x.id, firstName: x.first_name, lastName: x.last_name, country: x.country, status: x.status, createdAt: x.created_at,
    }))
    const empty = { value: 0, trend: null }
    return {
      stats: {
        members: members ? stat(members) : empty,
        registrations: regs ? stat(regs) : empty,
        upcomingEvents: { value: upcoming?.rows.length ?? 0, trend: null },
        activeBibleStudies: studies ? stat(studies) : empty,
        prayerRequests: prayer ? stat(prayer) : null,
        activeGroups: groups ? stat(groups) : empty,
      },
      recentRegistrations: recent,
      upcomingEvents: upcoming?.rows ?? [],
      demoRecords: Number(demo.rows[0].n),
      visible: {
        members: can(role, 'members:read'),
        registrations: can(role, 'registrations:read'),
        events: can(role, 'events:read'),
        bibleStudies: can(role, 'bible_studies:read'),
        prayer: can(role, 'prayer:read'),
        groups: can(role, 'groups:read'),
      },
    }
  })

  /* ===== Analytics (only real data) ===== */
  r.on('GET', '/analytics', 'analytics:read', async (ctx) => {
    const days = Math.min(730, Math.max(1, Number(ctx.query.get('days')) || 30))
    const fromQ = str(ctx.query.get('from'), 10)
    const toQ = str(ctx.query.get('to'), 10)
    const custom = /^\d{4}-\d{2}-\d{2}$/.test(fromQ) && /^\d{4}-\d{2}-\d{2}$/.test(toQ)
    const range = custom ? [fromQ, toQ] : [new Date(Date.now() - days * 864e5).toISOString().slice(0, 10), new Date().toISOString().slice(0, 10)]
    const span = (new Date(range[1]).getTime() - new Date(range[0]).getTime()) / 864e5
    const bucket = span <= 45 ? 'day' : span <= 200 ? 'week' : 'month'
    const inRange = `created_at >= $1::date AND created_at < ($2::date + 1)`
    const canPrayer = can(ctx.user.role, 'prayer:read')

    const q = (sql: string) => db().query(sql, range)
    const [overTime, byCountry, byPart, byInterest, events, prayer, groups, studies, eventsByCountry, totals] = await Promise.all([
      q(`SELECT to_char(date_trunc('${bucket}', created_at), 'YYYY-MM-DD') AS label, count(*)::int AS value FROM ${T('registrations')} WHERE ${inRange} GROUP BY 1 ORDER BY 1`),
      q(`SELECT country, count(*)::int AS count FROM ${T('registrations')} WHERE ${inRange} GROUP BY 1 ORDER BY 2 DESC LIMIT 60`),
      q(`SELECT participation AS label, count(*)::int AS value FROM ${T('registrations')} WHERE ${inRange} GROUP BY 1 ORDER BY 2 DESC`),
      q(`SELECT i AS label, count(*)::int AS value FROM ${T('registrations')}, unnest(interests) i WHERE ${inRange} GROUP BY 1 ORDER BY 2 DESC`),
      q(`SELECT event_slug AS label, count(*)::int AS value FROM ${T('event_registrations')} WHERE ${inRange} GROUP BY 1 ORDER BY 2 DESC LIMIT 12`),
      canPrayer ? q(`SELECT category AS label, count(*)::int AS value FROM ${T('prayer_requests')} WHERE ${inRange} GROUP BY 1 ORDER BY 2 DESC`) : null,
      db().query(`SELECT coalesce(nullif(data->>'country', ''), 'Online / not set') AS label, count(*)::int AS value FROM ${T('records')} WHERE collection = 'groups' GROUP BY 1 ORDER BY 2 DESC`),
      db().query(`SELECT coalesce(data->>'format', 'not set') AS label, count(*)::int AS value FROM ${T('records')} WHERE collection = 'bible_studies' GROUP BY 1 ORDER BY 2 DESC`),
      q(`SELECT country AS label, count(*)::int AS value FROM ${T('event_registrations')} WHERE ${inRange} GROUP BY 1 ORDER BY 2 DESC LIMIT 30`),
      q(`SELECT (SELECT count(*) FROM ${T('registrations')} WHERE ${inRange})::int AS registrations,
                (SELECT count(*) FROM ${T('event_registrations')} WHERE ${inRange})::int AS "eventRegistrations",
                (SELECT count(*) FROM ${T('prayer_requests')} WHERE ${inRange})::int AS "prayerRequests",
                (SELECT count(*) FROM ${T('contact_messages')} WHERE ${inRange})::int AS messages`),
    ])
    const t = totals.rows[0]
    return {
      range: { from: range[0], to: range[1] },
      bucket,
      registrationsOverTime: overTime.rows,
      byCountry: byCountry.rows,
      byParticipation: byPart.rows,
      byInterest: byInterest.rows,
      eventRegistrations: events.rows,
      prayerRequests: prayer?.rows ?? null,
      groupsByCountry: groups.rows,
      studiesByFormat: studies.rows,
      eventsByCountry: eventsByCountry.rows,
      totals: { ...t, prayerRequests: canPrayer ? t.prayerRequests : null },
    }
  })

  /* ===== Notifications ===== */
  const userPerms = (ctx: AuthedCtx) => ROLE_PERMISSIONS[ctx.user.role] as readonly Permission[]

  r.on('GET', '/notifications', null, async (ctx) => {
    await ensureEventReminders().catch(() => undefined)
    const { rows } = await db().query(
      `SELECT n.*, (nr.user_id IS NOT NULL) AS read FROM ${T('notifications')} n
         LEFT JOIN ${T('notification_reads')} nr ON nr.notification_id = n.id AND nr.user_id = $1
        WHERE n.permission = ANY($2) ORDER BY n.created_at DESC LIMIT 50`,
      [ctx.user.id, userPerms(ctx)],
    )
    return {
      items: rows.map((n) => ({ id: n.id, type: n.type, title: n.title, entityType: n.entity_type, entityId: n.entity_id, read: n.read, createdAt: n.created_at })),
      unread: rows.filter((n) => !n.read).length,
    }
  })

  r.on('POST', '/notifications/read', null, async (ctx) => {
    const ids = ctx.body.all === true ? null : Array.isArray(ctx.body.ids) ? ctx.body.ids.filter((x): x is string => typeof x === 'string' && uuidOk(x)) : []
    await db().query(
      `INSERT INTO ${T('notification_reads')} (notification_id, user_id)
       SELECT id, $1 FROM ${T('notifications')} WHERE permission = ANY($2) AND ($3::uuid[] IS NULL OR id = ANY($3::uuid[]))
       ON CONFLICT DO NOTHING`,
      [ctx.user.id, userPerms(ctx), ids],
    )
    return { ok: true }
  })

  /* ===== Audit log (read-only; there is intentionally no delete) ===== */
  r.on('GET', '/audit-logs', 'audit:read', async ({ query }) => {
    const args: unknown[] = []
    const where: string[] = []
    const add = (sql: string, v: unknown) => {
      args.push(v)
      where.push(sql.replace('?', `$${args.length}`))
    }
    if (query.get('user')) add('user_email ILIKE ?', `%${str(query.get('user'), 100)}%`)
    if (query.get('action')) add('action ILIKE ?', `%${str(query.get('action'), 60)}%`)
    if (query.get('resource')) add('resource = ?', str(query.get('resource'), 60))
    if (/^\d{4}-\d{2}-\d{2}$/.test(query.get('from') ?? '')) add('created_at >= ?::date', query.get('from'))
    if (/^\d{4}-\d{2}-\d{2}$/.test(query.get('to') ?? '')) add(`created_at < (?::date + 1)`, query.get('to'))
    const w = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const { page, pageSize, offset } = pageParams(query)
    const [list, count, resources] = await Promise.all([
      db().query(`SELECT * FROM ${T('audit_logs')} ${w} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`, args),
      db().query(`SELECT count(*)::int AS n FROM ${T('audit_logs')} ${w}`, args),
      db().query(`SELECT DISTINCT resource FROM ${T('audit_logs')} ORDER BY 1`),
    ])
    return {
      items: list.rows.map((a) => ({
        id: String(a.id), userId: a.user_id, userEmail: a.user_email, action: a.action, resource: a.resource, resourceId: a.resource_id,
        details: a.details, ip: a.ip, userAgent: a.user_agent, createdAt: a.created_at,
      })),
      total: count.rows[0].n,
      page,
      pageSize,
      resources: resources.rows.map((x) => x.resource),
    }
  })

  /* ===== Global search (permission-aware) ===== */
  r.on('GET', '/search', null, async (ctx) => {
    const q = str(ctx.query.get('q'), 80)
    if (q.length < 2) return { results: [] }
    const like = `%${q}%`
    const role = ctx.user.role
    const results: { type: string; id: string; title: string; subtitle: string; href: string }[] = []
    if (can(role, 'registrations:read')) {
      const { rows } = await db().query(
        `SELECT id, first_name || ' ' || last_name AS title, email, country FROM ${T('registrations')}
          WHERE first_name || ' ' || last_name || ' ' || email ILIKE $1 ORDER BY created_at DESC LIMIT 5`,
        [like],
      )
      rows.forEach((x) => results.push({ type: 'Registration', id: x.id, title: x.title, subtitle: `${x.email} · ${x.country}`, href: `/admin/registrations/${x.id}` }))
    }
    const recordTypes: [string, Permission, string, string][] = [
      ['members', 'members:read', 'Member', '/admin/members/'],
      ['events', 'events:read', 'Event', '/admin/events/'],
      ['bible_studies', 'bible_studies:read', 'Bible study', '/admin/bible-studies/'],
      ['groups', 'groups:read', 'Group', '/admin/groups/'],
      ['resources', 'resources:read', 'Resource', '/admin/resources/'],
    ]
    for (const [collection, perm, label, base] of recordTypes) {
      if (!can(role, perm)) continue
      const { rows } = await db().query(`SELECT * FROM ${T('records')} WHERE collection = $1 AND data::text ILIKE $2 ORDER BY updated_at DESC LIMIT 4`, [collection, like])
      rows.map(mapRecord).forEach((x: Record<string, any>) =>
        results.push({
          type: label,
          id: x.id,
          title: x.title ?? x.name ?? `${x.firstName ?? ''} ${x.lastName ?? ''}`.trim(),
          subtitle: x.email ?? x.date ?? x.status ?? '',
          href: collection === 'resources' ? `/admin/resources?edit=${x.id}` : `${base}${x.id}`,
        }),
      )
    }
    if (can(role, 'messages:read')) {
      const { rows } = await db().query(`SELECT id, name, subject FROM ${T('contact_messages')} WHERE name || ' ' || email || ' ' || subject ILIKE $1 ORDER BY created_at DESC LIMIT 4`, [like])
      rows.forEach((x) => results.push({ type: 'Message', id: x.id, title: x.subject, subtitle: x.name, href: `/admin/messages?open=${x.id}` }))
    }
    return { results }
  })

  /* ===== Organization settings ===== */
  r.on('GET', '/settings', 'settings:read', async () => {
    const { rows } = await db().query(`SELECT * FROM ${T('records')} WHERE collection = 'settings' ORDER BY created_at ASC LIMIT 1`)
    return { settings: rows[0] ? mapRecord(rows[0]) : null }
  })

  /* ===== Admin users (Super Admin) ===== */
  const mapUser = (u: Record<string, any>) => ({
    id: u.id, email: u.email, name: u.name, role: u.role, status: u.status, lastLoginAt: u.last_login_at, createdAt: u.created_at,
    locked: u.locked_until ? new Date(u.locked_until) > new Date() : false,
  })

  r.on('GET', '/users', 'users:read', async () => {
    const { rows } = await db().query(`SELECT * FROM ${T('admin_users')} ORDER BY created_at ASC`)
    return { items: rows.map(mapUser) }
  })

  /** Creates an admin in "pending" state and returns a one-time set-password link. */
  r.on('POST', '/users', 'users:write', async (ctx) => {
    const email = str(ctx.body.email, 254).toLowerCase()
    const name = str(ctx.body.name, 120)
    const role = ctx.body.role
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(422, 'Enter a valid email.', { email: 'Invalid email' })
    if (!name) throw new HttpError(422, 'Enter a name.', { name: 'Required' })
    if (!isRole(role)) throw new HttpError(422, 'Choose a role.', { role: 'Required' })
    const { rows } = await db().query(`INSERT INTO ${T('admin_users')} (email, name, role, status) VALUES ($1, $2, $3, 'pending') RETURNING *`, [email, name, role])
    const token = await createResetToken(rows[0].id, 72)
    await audit(ctx, 'admin_user.created', 'admin_user', rows[0].id, { email, role })
    return { user: mapUser(rows[0]), setupPath: `/admin/reset-password?token=${token}&welcome=1` }
  })

  r.on('PATCH', '/users/:id', 'users:write', async (ctx) => {
    if (!uuidOk(ctx.params.id)) throw new HttpError(404, 'Not found.')
    const self = ctx.params.id === ctx.user.id
    const role = ctx.body.role === undefined ? null : isRole(ctx.body.role) ? ctx.body.role : 'invalid'
    const status = ctx.body.status === undefined ? null : oneOfOr(ctx.body.status, ['active', 'suspended', 'pending'] as const) ?? 'invalid'
    const name = ctx.body.name === undefined ? null : str(ctx.body.name, 120) || null
    if (role === 'invalid' || status === 'invalid') throw new HttpError(422, 'Invalid value.')
    if (self && (role || status)) throw new HttpError(422, 'You can’t change your own role or status.')
    if (role || status) {
      // Never leave the organisation without an active Super Admin.
      const { rows } = await db().query(`SELECT role FROM ${T('admin_users')} WHERE id = $1`, [ctx.params.id])
      if (rows[0]?.role === 'SUPER_ADMIN' && ((role && role !== 'SUPER_ADMIN') || (status && status !== 'active'))) {
        const others = await db().query(`SELECT count(*)::int n FROM ${T('admin_users')} WHERE role = 'SUPER_ADMIN' AND status = 'active' AND id <> $1`, [ctx.params.id])
        if (others.rows[0].n === 0) throw new HttpError(422, 'There must always be at least one active Super Admin.')
      }
    }
    const { rows } = await db().query(
      `UPDATE ${T('admin_users')} SET role = coalesce($2, role), status = coalesce($3, status), name = coalesce($4, name), updated_at = now() WHERE id = $1 RETURNING *`,
      [ctx.params.id, role, status, name],
    )
    if (!rows[0]) throw new HttpError(404, 'Not found.')
    if (status === 'suspended' || role) await revokeAllSessions(ctx.params.id)
    await audit(ctx, 'admin_user.updated', 'admin_user', ctx.params.id, { role, status, name: name ? true : undefined })
    return { user: mapUser(rows[0]) }
  })

  /** Generates a one-time password reset link for another admin (no email provider needed). */
  r.on('POST', '/users/:id/reset-link', 'users:write', async (ctx) => {
    if (!uuidOk(ctx.params.id)) throw new HttpError(404, 'Not found.')
    const { rows } = await db().query(`SELECT id FROM ${T('admin_users')} WHERE id = $1`, [ctx.params.id])
    if (!rows[0]) throw new HttpError(404, 'Not found.')
    const token = await createResetToken(ctx.params.id, 24)
    await db().query(`UPDATE ${T('admin_users')} SET locked_until = NULL, failed_attempts = 0 WHERE id = $1`, [ctx.params.id])
    await audit(ctx, 'admin_user.reset_link_created', 'admin_user', ctx.params.id)
    return { resetPath: `/admin/reset-password?token=${token}` }
  })

  /** Signs a user out everywhere. */
  r.on('POST', '/users/:id/revoke-sessions', 'users:write', async (ctx) => {
    if (!uuidOk(ctx.params.id)) throw new HttpError(404, 'Not found.')
    await revokeAllSessions(ctx.params.id)
    await audit(ctx, 'admin_user.sessions_revoked', 'admin_user', ctx.params.id)
    return { ok: true }
  })
}
