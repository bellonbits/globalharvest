import { createHash } from 'node:crypto'
import { can, collectionPermission, isCollection, type Collection } from '../../../src/admin/rbac.js'
import { getPool, SCHEMA } from '../db.js'
import { HttpError } from '../http.js'
import { audit, pageParams, str, uuidOk, type AuthedCtx, type Router } from '../router.js'

const T = (t: string) => `${SCHEMA}.${t}`
const db = () => getPool()

const MAX_RECORD_BYTES = 200 * 1024

/** Allowed status values and required fields per collection. */
const RULES: Record<Collection, { statuses: string[]; required: string[]; slugFrom?: string }> = {
  events: { statuses: ['draft', 'published', 'registration-open', 'registration-closed', 'completed', 'cancelled'], required: ['title', 'date'], slugFrom: 'title' },
  bible_studies: { statuses: ['draft', 'open', 'active', 'completed', 'archived'], required: ['title'], slugFrom: 'title' },
  guides: { statuses: ['draft', 'published', 'archived'], required: ['title', 'kind'], slugFrom: 'title' },
  groups: { statuses: ['active', 'inactive', 'full'], required: ['name'], slugFrom: 'name' },
  members: { statuses: ['active', 'inactive', 'pending'], required: ['firstName', 'lastName', 'email'] },
  resources: { statuses: ['draft', 'published', 'archived'], required: ['title', 'type'], slugFrom: 'title' },
  content_pages: { statuses: ['draft', 'published'], required: ['slug', 'title'] },
  media: { statuses: ['active'], required: ['filename', 'url'] },
  subscribers: { statuses: ['subscribed', 'unsubscribed'], required: ['email'] },
  campaigns: { statuses: ['draft', 'scheduled', 'sent'], required: ['subject'] },
  settings: { statuses: ['active'], required: [] },
}

const CONTENT_PAGES = ['home', 'about', 'bible-study', 'prayer', 'community', 'mission', 'contact', 'join']

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const URL_KEY = /(url|link|image|logo)$/i

/**
 * Recursively trims strings, caps lengths, drops functions/prototype keys and
 * rejects unsafe URLs (only http(s) or site-relative paths are allowed).
 */
function sanitize(value: unknown, key = '', depth = 0): unknown {
  if (depth > 6) return undefined
  if (typeof value === 'string') {
    const s = value.trim().slice(0, 20000)
    // Links/images must be http(s) URLs or site paths; image fields may also name a built-in image (e.g. "bible-golden-light").
    const builtInImage = /image$/i.test(key) && /^[a-z0-9-]{1,60}$/.test(s)
    if (URL_KEY.test(key) && s && !builtInImage && !/^(https?:\/\/|\/(?!\/))/i.test(s)) throw new HttpError(422, `“${key}” must be a web address starting with https:// or /.`, { [key]: 'Invalid URL' })
    return s
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'boolean' || value === null) return value
  if (Array.isArray(value)) return value.slice(0, 500).map((v) => sanitize(v, key, depth + 1))
  if (typeof value === 'object' && value) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue
      // System fields are only stripped at the top level; nested items (pages, blocks, sessions) keep their ids.
      if (depth === 0 && (k === 'id' || k === 'createdAt' || k === 'updatedAt' || k === 'isDemo')) continue
      const clean = sanitize(v, k, depth + 1)
      if (clean !== undefined) out[k.slice(0, 60)] = clean
    }
    return out
  }
  return undefined
}

function prepare(collection: Collection, input: unknown, partial: boolean) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new HttpError(422, 'Invalid data.')
  const data = sanitize(input) as Record<string, unknown>
  if (JSON.stringify(data).length > MAX_RECORD_BYTES) throw new HttpError(413, 'This record is too large.')
  const rules = RULES[collection]
  if (!partial) {
    const missing = rules.required.filter((f) => data[f] === undefined || data[f] === '')
    if (missing.length) throw new HttpError(422, 'Please fill in the required fields.', Object.fromEntries(missing.map((m) => [m, 'Required'])))
  }
  if (data.status !== undefined && !rules.statuses.includes(String(data.status))) throw new HttpError(422, 'Invalid status.', { status: 'Invalid status' })
  if (rules.slugFrom && (data.slug !== undefined || data[rules.slugFrom] !== undefined)) {
    const base = typeof data.slug === 'string' && data.slug ? data.slug : typeof data[rules.slugFrom] === 'string' ? (data[rules.slugFrom] as string) : ''
    if (base) data.slug = slugify(base)
  }
  if (collection === 'content_pages' && data.slug !== undefined && !CONTENT_PAGES.includes(String(data.slug))) throw new HttpError(422, 'Unknown page.')
  if ((collection === 'members' || collection === 'subscribers') && typeof data.email === 'string') {
    const email = data.email.toLowerCase()
    data.email = email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(422, 'Enter a valid email.', { email: 'Invalid email' })
  }
  return data
}

export const mapRecord = (row: Record<string, any>) => ({
  ...(row.data ?? {}),
  id: row.id,
  status: row.status ?? row.data?.status,
  isDemo: row.is_demo,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

function perm(ctx: AuthedCtx, collection: string, mode: 'read' | 'write'): Collection {
  if (!isCollection(collection)) throw new HttpError(404, 'Unknown collection.')
  if (!can(ctx.user.role, collectionPermission(collection, mode))) throw new HttpError(403, 'You don’t have permission to do that.')
  return collection
}

export async function getRecord(collection: Collection, id: string) {
  if (!uuidOk(id)) return null
  const { rows } = await db().query(`SELECT * FROM ${T('records')} WHERE collection = $1 AND id = $2`, [collection, id])
  return rows[0] ? mapRecord(rows[0]) : null
}

export function registerRecordRoutes(r: Router) {
  /** GET /records/:collection — list with search, status filter, pagination. */
  r.on('GET', '/records/:collection', null, async (ctx) => {
    const collection = perm(ctx, ctx.params.collection, 'read')
    const q = ctx.query
    const args: unknown[] = [collection]
    const where = ['collection = $1']
    const search = str(q.get('q'), 100)
    if (search) {
      args.push(`%${search}%`)
      where.push(`data::text ILIKE $${args.length}`)
    }
    if (q.get('status')) {
      args.push(str(q.get('status'), 40))
      where.push(`status = $${args.length}`)
    }
    for (const field of ['category', 'type', 'groupType', 'format', 'country', 'kind']) {
      if (q.get(field)) {
        args.push(field, str(q.get(field), 80))
        where.push(`data->>$${args.length - 1} = $${args.length}`)
      }
    }
    if (q.get('groupId')) {
      args.push(JSON.stringify([str(q.get('groupId'), 40)]))
      where.push(`data->'groupIds' @> $${args.length}::jsonb`)
    }
    const { page, pageSize, offset } = pageParams(q)
    const sortKey = str(q.get('sort'), 40)
    const dir = q.get('dir') === 'asc' ? 'ASC' : 'DESC'
    const order =
      sortKey === 'updatedAt' || !sortKey
        ? `updated_at ${dir}`
        : sortKey === 'createdAt'
          ? `created_at ${dir}`
          : sortKey === 'status'
            ? `status ${dir}`
            : /^[a-zA-Z]{1,40}$/.test(sortKey)
              ? `data->>'${sortKey}' ${dir} NULLS LAST`
              : `updated_at ${dir}`
    const w = `WHERE ${where.join(' AND ')}`
    const [list, count] = await Promise.all([
      db().query(`SELECT * FROM ${T('records')} ${w} ORDER BY ${order} LIMIT ${pageSize} OFFSET ${offset}`, args),
      db().query(`SELECT count(*)::int AS n FROM ${T('records')} ${w}`, args),
    ])
    return { items: list.rows.map(mapRecord), total: count.rows[0].n, page, pageSize }
  })

  r.on('GET', '/records/:collection/:id', null, async (ctx) => {
    const collection = perm(ctx, ctx.params.collection, 'read')
    const record = await getRecord(collection, ctx.params.id)
    if (!record) throw new HttpError(404, 'Not found.')
    return { record }
  })

  r.on('POST', '/records/:collection', null, async (ctx) => {
    const collection = perm(ctx, ctx.params.collection, 'write')
    const data = prepare(collection, ctx.body, false)
    const status = (data.status as string | undefined) ?? RULES[collection].statuses[0]
    data.status = status
    const { rows } = await db().query(
      `INSERT INTO ${T('records')} (collection, status, data, created_by, updated_by) VALUES ($1, $2, $3, $4, $4) RETURNING *`,
      [collection, status, JSON.stringify(data), ctx.user.id],
    )
    await audit(ctx, `${collection}.created`, collection, rows[0].id, { title: data.title ?? data.name ?? data.subject ?? data.filename ?? data.email })
    return { record: mapRecord(rows[0]) }
  })

  r.on('PATCH', '/records/:collection/:id', null, async (ctx) => {
    const collection = perm(ctx, ctx.params.collection, 'write')
    if (!uuidOk(ctx.params.id)) throw new HttpError(404, 'Not found.')
    const data = prepare(collection, ctx.body, true)
    const { rows } = await db().query(
      `UPDATE ${T('records')} SET data = data || $3::jsonb, status = coalesce($4, status), updated_by = $5, updated_at = now()
        WHERE collection = $1 AND id = $2 RETURNING *`,
      [collection, ctx.params.id, JSON.stringify(data), (data.status as string | undefined) ?? null, ctx.user.id],
    )
    if (!rows[0]) throw new HttpError(404, 'Not found.')
    const changed = Object.keys(data)
    const action = data.status && changed.length === 1 ? `${collection}.status_changed` : `${collection}.updated`
    await audit(ctx, action, collection, ctx.params.id, { fields: changed, status: data.status })
    return { record: mapRecord(rows[0]) }
  })

  r.on('DELETE', '/records/:collection/:id', null, async (ctx) => {
    const collection = perm(ctx, ctx.params.collection, 'write')
    if (collection === 'settings') throw new HttpError(403, 'Settings can’t be deleted.')
    if (!uuidOk(ctx.params.id)) throw new HttpError(404, 'Not found.')
    const { rows } = await db().query(`DELETE FROM ${T('records')} WHERE collection = $1 AND id = $2 RETURNING data`, [collection, ctx.params.id])
    if (!rows[0]) throw new HttpError(404, 'Not found.')
    await audit(ctx, `${collection}.deleted`, collection, ctx.params.id, { title: rows[0].data?.title ?? rows[0].data?.name ?? rows[0].data?.filename })
    return { ok: true }
  })

  /** POST /records/:collection/:id/duplicate — copies a record as a draft. */
  r.on('POST', '/records/:collection/:id/duplicate', null, async (ctx) => {
    const collection = perm(ctx, ctx.params.collection, 'write')
    const src = await getRecord(collection, ctx.params.id)
    if (!src) throw new HttpError(404, 'Not found.')
    const { id: _id, createdAt: _c, updatedAt: _u, isDemo: _d, ...rest } = src as Record<string, unknown>
    void _id, _c, _u, _d
    const titleKey = 'title' in rest ? 'title' : 'name' in rest ? 'name' : null
    if (titleKey) rest[titleKey] = `${rest[titleKey]} (copy)`
    if (typeof rest.slug === 'string') rest.slug = `${rest.slug}-copy-${Date.now().toString(36)}`
    const status = RULES[collection].statuses[0]
    rest.status = status
    const { rows } = await db().query(
      `INSERT INTO ${T('records')} (collection, status, data, created_by, updated_by) VALUES ($1, $2, $3, $4, $4) RETURNING *`,
      [collection, status, JSON.stringify(rest), ctx.user.id],
    )
    await audit(ctx, `${collection}.duplicated`, collection, rows[0].id, { from: ctx.params.id })
    return { record: mapRecord(rows[0]) }
  })

  /* ===== Group membership ===== */

  r.on('POST', '/groups/:id/members', ['groups:write'], async (ctx) => {
    const memberId = str(ctx.body.memberId, 40)
    const action = ctx.body.action === 'remove' ? 'remove' : 'add'
    if (!uuidOk(ctx.params.id) || !uuidOk(memberId)) throw new HttpError(404, 'Not found.')
    const group = await getRecord('groups', ctx.params.id)
    if (!group) throw new HttpError(404, 'Group not found.')
    const sql =
      action === 'add'
        ? `UPDATE ${T('records')} SET data = jsonb_set(data, '{groupIds}', coalesce(data->'groupIds', '[]'::jsonb) || to_jsonb($2::text)), updated_at = now()
             WHERE collection = 'members' AND id = $1 AND NOT coalesce(data->'groupIds', '[]'::jsonb) ? $2 RETURNING id`
        : `UPDATE ${T('records')} SET data = jsonb_set(data, '{groupIds}', coalesce(data->'groupIds', '[]'::jsonb) - $2::text), updated_at = now()
             WHERE collection = 'members' AND id = $1 RETURNING id`
    await db().query(sql, [memberId, ctx.params.id])
    await audit(ctx, action === 'add' ? 'group.member_assigned' : 'group.member_removed', 'group', ctx.params.id, { memberId })
    return { ok: true }
  })

  /* ===== Media: direct-to-Cloudinary signed uploads ===== */

  /**
   * Returns a short-lived signature so the browser uploads straight to
   * Cloudinary — files never pass through (or get stored in) this app.
   * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
   */
  r.on('POST', '/media/sign', 'media:write', async () => {
    const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = process.env
    if (!cloudName || !apiKey || !secret) return { configured: false }
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = 'global-harvest'
    const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest('hex')
    return { configured: true, cloudName, apiKey, timestamp, folder, signature }
  })

  /* ===== Public read-only endpoints (no auth) ===== */

  /** GET /public/content/:slug — published CMS blocks for a website page. */
  r.public('GET', '/public/content/:slug', async ({ params, res }) => {
    if (!CONTENT_PAGES.includes(params.slug)) throw new HttpError(404, 'Not found.')
    const { rows } = await db().query(`SELECT * FROM ${T('records')} WHERE collection = 'content_pages' AND status = 'published' AND data->>'slug' = $1 LIMIT 1`, [params.slug])
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    if (!rows[0]) return { page: null }
    const page = mapRecord(rows[0]) as Record<string, any>
    return { page: { slug: page.slug, title: page.title, blocks: (page.blocks ?? []).filter((b: { visible?: boolean }) => b.visible !== false), updatedAt: page.updatedAt } }
  })

  /** GET /public/guides — published study guides (summaries only; pages load per guide). */
  r.public('GET', '/public/guides', async ({ res }) => {
    const { rows } = await db().query(
      `SELECT id, is_demo, updated_at, data->>'slug' AS slug, data->>'title' AS title, data->>'kind' AS kind, data->>'series' AS series,
              data->>'subtitle' AS subtitle, data->>'summary' AS summary, data->>'coverImage' AS "coverImage"
         FROM ${T('records')} WHERE collection = 'guides' AND status = 'published' ORDER BY updated_at DESC LIMIT 200`,
    )
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    return {
      guides: rows.map((g) => ({
        slug: g.slug, title: g.title, kind: g.kind, series: g.series ?? undefined, subtitle: g.subtitle ?? undefined, summary: g.summary ?? undefined,
        coverImage: g.coverImage ?? undefined, isPlaceholder: g.is_demo, pages: [], updatedAt: g.updated_at,
      })),
    }
  })

  /** GET /public/guides/:slug — one published guide with its pages. */
  r.public('GET', '/public/guides/:slug', async ({ params, res }) => {
    const { rows } = await db().query(`SELECT * FROM ${T('records')} WHERE collection = 'guides' AND status = 'published' AND data->>'slug' = $1 LIMIT 1`, [params.slug.slice(0, 120)])
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    if (!rows[0]) return { guide: null }
    const g = mapRecord(rows[0]) as Record<string, any>
    return { guide: { ...g, isPlaceholder: g.isDemo === true, id: undefined, createdAt: undefined } }
  })

  /** GET /public/events — events published from the admin portal. */
  r.public('GET', '/public/events', async ({ res }) => {
    const { rows } = await db().query(
      `SELECT * FROM ${T('records')} WHERE collection = 'events' AND status IN ('published', 'registration-open', 'registration-closed', 'completed')
        ORDER BY data->>'date' ASC LIMIT 200`,
    )
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    return {
      events: rows.map((row) => {
        const e = mapRecord(row) as Record<string, any>
        return {
          slug: e.slug, title: e.title, category: e.category ?? 'special', summary: e.summary ?? '', description: String(e.description ?? '').split(/\n{2,}/).filter(Boolean),
          startsAt: `${e.date}T${e.startTime ?? '00:00'}:00`, endsAt: e.endTime ? `${e.date}T${e.endTime}:00` : undefined,
          timeLabel: [e.startTime, e.endTime].filter(Boolean).join(' – ') + (e.timezone ? ` ${e.timezone}` : ''),
          format: e.format ?? 'in-person', location: e.location ?? 'To be confirmed', speaker: e.speaker ? { name: e.speaker } : undefined,
          image: e.coverImage ?? 'hero-sunset-coast', capacity: e.capacity,
          registrationStatus: e.status === 'registration-open' && e.registrationEnabled !== false ? 'open' : e.status === 'completed' ? 'closed' : e.registrationEnabled ? 'closed' : 'not-required',
          isPlaceholder: e.isDemo === true,
        }
      }),
    }
  })
}
