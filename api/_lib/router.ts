import { can, type Permission } from '../../src/admin/rbac'
import { assertCsrf, clientInfo, getSessionUser, type SessionUser } from './auth'
import { getPool, SCHEMA } from './db'
import { HttpError, readJson, send, type Req, type Res } from './http'

export interface Ctx {
  req: Req
  res: Res
  params: Record<string, string>
  query: URLSearchParams
  body: Record<string, unknown>
  user: SessionUser | null
  ip: string | null
  ua: string | null
}

/** Authenticated context — `user` is guaranteed. */
export type AuthedCtx = Ctx & { user: SessionUser }

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
type Handler = (ctx: AuthedCtx) => Promise<unknown>
type PublicHandler = (ctx: Ctx) => Promise<unknown>

interface Route {
  method: Method
  parts: string[]
  permission: Permission | Permission[] | null // null → any signed-in user
  isPublic: boolean
  handler: Handler | PublicHandler
}

export class Router {
  private routes: Route[] = []

  /** Authenticated route. `permission` may be a list (any of). */
  on(method: Method, path: string, permission: Permission | Permission[] | null, handler: Handler) {
    this.routes.push({ method, parts: split(path), permission, isPublic: false, handler })
    return this
  }

  /** Unauthenticated route (login, password reset, public content). */
  public(method: Method, path: string, handler: PublicHandler) {
    this.routes.push({ method, parts: split(path), permission: null, isPublic: true, handler })
    return this
  }

  async handle(req: Req, res: Res, path: string) {
    // Admin API responses must never be cached or indexed.
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    try {
      const url = new URL(req.url ?? '/', 'http://local')
      const segments = split(path)
      let allowed: string[] = []
      for (const route of this.routes) {
        const params = match(route.parts, segments)
        if (!params) continue
        if (route.method !== req.method) {
          allowed.push(route.method)
          continue
        }
        allowed = []
        const { ip, ua } = clientInfo(req)
        if (route.isPublic) {
          assertCsrf(req)
          const body = req.method === 'GET' ? {} : await readJson(req)
          const out = await (route.handler as PublicHandler)({ req, res, params, query: url.searchParams, body, user: null, ip, ua })
          return send(res, 200, out ?? { ok: true })
        }
        const user = await getSessionUser(req)
        if (!user) throw new HttpError(401, 'Please sign in.')
        assertCsrf(req)
        const perms = route.permission === null ? [] : Array.isArray(route.permission) ? route.permission : [route.permission]
        if (perms.length && !perms.some((p) => can(user.role, p))) {
          await audit({ user, ip, ua } as AuthedCtx, 'access.denied', 'api', path, { method: req.method })
          throw new HttpError(403, 'You don’t have permission to do that.')
        }
        const body = req.method === 'GET' || req.method === 'DELETE' ? {} : await readJson(req)
        const out = await (route.handler as Handler)({ req, res, params, query: url.searchParams, body, user, ip, ua })
        if (!res.headersSent && !res.writableEnded) send(res, req.method === 'POST' ? 201 : 200, out ?? { ok: true })
        return
      }
      if (allowed.length) {
        res.setHeader('Allow', allowed.join(', '))
        throw new HttpError(405, 'Method not allowed.')
      }
      throw new HttpError(404, 'Not found.')
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { ok: false, message: err.message, fields: err.fields })
      if (err instanceof SyntaxError) return send(res, 400, { ok: false, message: 'Invalid JSON.' })
      const pgErr = err as { code?: string }
      if (pgErr.code === '23505') return send(res, 409, { ok: false, message: 'That value is already in use (duplicate).' })
      if (pgErr.code === '23514' || pgErr.code === '22P02') return send(res, 422, { ok: false, message: 'Some values are invalid.' })
      console.error('[api/v1] unexpected error', err)
      return send(res, 500, { ok: false, message: 'Something went wrong. Please try again.' })
    }
  }
}

const split = (p: string) => p.split('/').filter(Boolean)

function match(pattern: string[], segments: string[]): Record<string, string> | null {
  if (pattern.length !== segments.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i].startsWith(':')) params[pattern[i].slice(1)] = decodeURIComponent(segments[i])
    else if (pattern[i] !== segments[i]) return null
  }
  return params
}

/* ------------------------------------------------------------------ */

/** Append-only audit trail. Never throws — auditing must not break the action. */
export async function audit(ctx: Pick<AuthedCtx, 'user' | 'ip' | 'ua'> | { user: null; ip: string | null; ua: string | null }, action: string, resource: string, resourceId?: string | null, details?: Record<string, unknown>) {
  try {
    await getPool().query(
      `INSERT INTO ${SCHEMA}.audit_logs (user_id, user_email, action, resource, resource_id, details, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [ctx.user?.id ?? null, ctx.user?.email ?? null, action, resource, resourceId ?? null, details ? JSON.stringify(details) : null, ctx.ip, ctx.ua],
    )
  } catch (e) {
    console.error('[audit] failed', e)
  }
}

/** Creates an admin notification visible to users holding `permission`. */
export async function notify(type: string, title: string, permission: Permission, entityType?: string, entityId?: string) {
  try {
    await getPool().query(
      `INSERT INTO ${SCHEMA}.notifications (type, title, entity_type, entity_id, permission) VALUES ($1, $2, $3, $4, $5)`,
      [type, title.slice(0, 200), entityType ?? null, entityId ?? null, permission],
    )
  } catch (e) {
    console.error('[notify] failed', e)
  }
}

/* ------------------------------------------------------------------ */
/* Query helpers                                                       */
/* ------------------------------------------------------------------ */

export function pageParams(q: URLSearchParams) {
  const page = Math.max(1, Number(q.get('page')) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(q.get('pageSize')) || 25))
  return { page, pageSize, offset: (page - 1) * pageSize }
}

/** Only allows whitelisted sort columns. */
export function sortClause(q: URLSearchParams, allowed: Record<string, string>, fallback: string) {
  const key = q.get('sort') ?? ''
  const col = allowed[key] ?? fallback
  const dir = q.get('dir') === 'asc' ? 'ASC' : 'DESC'
  return `${col} ${dir}`
}

export function toCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]) {
  const esc = (v: unknown) => {
    let s = v === null || v === undefined ? '' : v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.join('; ') : String(v)
    // Neutralise spreadsheet formula injection.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [columns.map((c) => esc(c.label)).join(','), ...rows.map((r) => columns.map((c) => esc(r[c.key])).join(','))].join('\r\n')
}

export function sendCsv(res: Res, filename: string, csv: string) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/[^a-z0-9._-]/gi, '_')}"`)
  res.setHeader('Cache-Control', 'no-store')
  res.end('﻿' + csv)
}

export const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
export const oneOfOr = <T extends string>(v: unknown, allowed: readonly T[]): T | null => (allowed.includes(v as T) ? (v as T) : null)
export const uuidOk = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
