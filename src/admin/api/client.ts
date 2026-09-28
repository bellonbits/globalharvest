/**
 * Admin API client.
 * - Talks to /api/v1 (Node functions today; a FastAPI backend can serve the same contract).
 * - Sends cookies (httpOnly session) and the CSRF header on every request.
 * - A 401 anywhere broadcasts "session expired" so the app returns to the login page.
 */
const BASE = ((import.meta.env.VITE_ADMIN_API_URL as string | undefined) ?? '/api/v1').replace(/\/$/, '')

export class AdminApiError extends Error {
  status: number
  fields?: Record<string, string>
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export const SESSION_EXPIRED_EVENT = 'gh-admin:session-expired'

type Query = Record<string, string | number | boolean | undefined | null>

export function toQuery(q?: Query) {
  if (!q) return ''
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  const s = p.toString()
  return s ? `?${s}` : ''
}

async function request<T>(method: string, path: string, body?: unknown, opts: { quiet401?: boolean } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-GH-Admin': '1',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new AdminApiError(0, 'Can’t reach the server. Check your connection and try again.')
  }
  if (res.status === 401 && !opts.quiet401) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json().catch(() => ({})) : {}
  if (!res.ok) throw new AdminApiError(res.status, (data as { message?: string }).message ?? `Request failed (${res.status})`, (data as { fields?: Record<string, string> }).fields)
  return data as T
}

/**
 * Short-lived GET cache. Revisiting a screen shows data instantly, and
 * identical requests fired at the same moment share one network call.
 * Any write (POST/PATCH/PUT/DELETE) clears it so edits are always visible.
 */
const CACHE_TTL_MS = 20_000
const cache = new Map<string, { at: number; promise: Promise<unknown> }>()
const NO_CACHE = ['/auth/', '/notifications', '/search']

function cachedGet<T>(url: string, opts?: { quiet401?: boolean }): Promise<T> {
  if (NO_CACHE.some((p) => url.startsWith(p))) return request<T>('GET', url, undefined, opts)
  const hit = cache.get(url)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.promise as Promise<T>
  const promise = request<T>('GET', url, undefined, opts)
  cache.set(url, { at: Date.now(), promise })
  promise.catch(() => cache.delete(url))
  return promise
}

async function write<T>(method: string, path: string, body?: unknown, opts?: { quiet401?: boolean }) {
  try {
    return await request<T>(method, path, body, opts)
  } finally {
    cache.clear()
  }
}

export const clearApiCache = () => cache.clear()

export const api = {
  get: <T>(path: string, query?: Query, opts?: { quiet401?: boolean }) => cachedGet<T>(`${path}${toQuery(query)}`, opts),
  post: <T>(path: string, body: unknown = {}, opts?: { quiet401?: boolean }) => write<T>('POST', path, body, opts),
  patch: <T>(path: string, body: unknown) => write<T>('PATCH', path, body),
  put: <T>(path: string, body: unknown) => write<T>('PUT', path, body),
  delete: <T>(path: string) => write<T>('DELETE', path),
  /** Downloads a CSV export (session cookie is sent automatically). */
  download: async (path: string, query?: Query) => {
    const res = await fetch(`${BASE}${path}${toQuery(query)}`, { credentials: 'same-origin', headers: { 'X-GH-Admin': '1' } })
    if (res.status === 401) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    if (!res.ok) throw new AdminApiError(res.status, 'Export failed.')
    const blob = await res.blob()
    const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? 'export.csv'
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },
}
