import type { IncomingMessage, ServerResponse } from 'node:http'
import { validateSchema, type Schema } from '../../src/lib/validation'

export type Req = IncomingMessage & { body?: unknown }
export type Res = ServerResponse

const MAX_BODY_BYTES = 32 * 1024

export function send(res: Res, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

/** Reads a JSON body (Vercel pre-parses it; the dev server does not). */
export async function readJson(req: Req): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>
  if (typeof req.body === 'string') return JSON.parse(req.body)
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'Request too large.')
    chunks.push(chunk as Buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  return text ? JSON.parse(text) : {}
}

export class HttpError extends Error {
  status: number
  fields?: Record<string, string>
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

/** Best-effort per-instance rate limit (serverless instances don't share memory). */
const hits = new Map<string, number[]>()
export function rateLimit(req: Req, limit = 8, windowMs = 60_000) {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (recent.length > limit) throw new HttpError(429, 'Too many submissions. Please wait a minute and try again.')
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : v)

/** Picks only known fields, trims strings, and validates with the shared schema. */
export function parse<T extends object>(body: Record<string, unknown>, schema: Schema<T>, fields: (keyof T)[]): T {
  const out = {} as T
  for (const f of fields) (out as Record<string, unknown>)[f as string] = str(body[f as string])
  const errors = validateSchema(out, schema)
  const bad = Object.entries(errors).filter(([, msg]) => msg) as [string, string][]
  if (bad.length) throw new HttpError(422, 'Some fields are invalid.', Object.fromEntries(bad))
  return out
}

export const oneOf = <T extends string>(value: unknown, allowed: readonly T[], field: string): T => {
  if (!allowed.includes(value as T)) throw new HttpError(422, 'Some fields are invalid.', { [field]: 'Invalid option.' })
  return value as T
}

/** Wraps a POST handler with method check, honeypot, rate limiting and error handling. */
export function postHandler(handle: (body: Record<string, unknown>) => Promise<{ id: string }>) {
  return async (req: Req, res: Res) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return send(res, 405, { ok: false, message: 'Method not allowed.' })
    }
    try {
      rateLimit(req)
      const body = await readJson(req)
      // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
      if (typeof body.website === 'string' && body.website.trim()) return send(res, 200, { ok: true })
      const { id } = await handle(body)
      return send(res, 201, { ok: true, id })
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { ok: false, message: err.message, fields: err.fields })
      if (err instanceof SyntaxError) return send(res, 400, { ok: false, message: 'Invalid JSON.' })
      console.error('[api] unexpected error', err)
      return send(res, 500, { ok: false, message: 'Something went wrong. Please try again.' })
    }
  }
}
