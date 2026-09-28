import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { Role } from '../../src/admin/rbac.js'
import { getPool, SCHEMA } from './db.js'
import { HttpError, type Req, type Res } from './http.js'

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number, opts: object) => Promise<Buffer>

/* ------------------------------------------------------------------ */
/* Passwords — scrypt (memory-hard), per-user random salt.            */
/* Format: scrypt$N$r$p$saltB64$hashB64                                */
/* ------------------------------------------------------------------ */

const N = 16384
const R = 8
const P = 1
const KEYLEN = 64

export const PASSWORD_MIN_LENGTH = 12

export function validatePasswordStrength(pw: unknown): string | null {
  if (typeof pw !== 'string' || pw.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
  if (pw.length > 200) return 'Password is too long.'
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length
  if (classes < 3) return 'Use at least three of: lowercase, uppercase, numbers, symbols.'
  return null
}

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scrypt(pw, salt, KEYLEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 })
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`
}

export async function verifyPassword(pw: string, stored: string | null): Promise<boolean> {
  // Always do the work, even when there's no stored hash, so timing doesn't reveal which accounts exist.
  const parts = (stored ?? DUMMY_HASH).split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, n, r, p, saltB64, hashB64] = parts
  const expected = Buffer.from(hashB64, 'base64')
  const actual = await scrypt(pw, Buffer.from(saltB64, 'base64'), expected.length, { N: +n, r: +r, p: +p, maxmem: 64 * 1024 * 1024 })
  return stored !== null && timingSafeEqual(actual, expected)
}
const DUMMY_HASH = `scrypt$${N}$${R}$${P}$${Buffer.alloc(16).toString('base64')}$${Buffer.alloc(KEYLEN).toString('base64')}`

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

export const newToken = () => randomBytes(32).toString('base64url')
export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

/* ------------------------------------------------------------------ */
/* Sessions — opaque token in an httpOnly cookie; only its hash is     */
/* stored. Short idle timeout unless "remember me" was chosen.         */
/* ------------------------------------------------------------------ */

export const COOKIE = 'gh_admin'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours
const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours without activity (non-remembered sessions)

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
  status: string
  lastLoginAt: string | null
  createdAt: string
  sessionId: string
  sessionExpiresAt: string
}

export function clientInfo(req: Req) {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() || req.socket?.remoteAddress || null
  const ua = (req.headers['user-agent'] as string | undefined)?.slice(0, 300) ?? null
  return { ip, ua }
}

function isHttps(req: Req) {
  return req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production'
}

export function setSessionCookie(req: Req, res: Res, token: string, maxAgeMs: number) {
  const parts = [
    `${COOKIE}=${token}`,
    'Path=/api',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ]
  if (isHttps(req)) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

export function clearSessionCookie(req: Req, res: Res) {
  const parts = [`${COOKIE}=`, 'Path=/api', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0']
  if (isHttps(req)) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

function readCookie(req: Req, name: string): string | null {
  const header = req.headers.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

export async function createSession(req: Req, res: Res, userId: string, remember: boolean) {
  const token = newToken()
  const ttl = remember ? REMEMBER_TTL_MS : SESSION_TTL_MS
  const { ip, ua } = clientInfo(req)
  const { rows } = await getPool().query<{ expires_at: string }>(
    `INSERT INTO ${SCHEMA}.admin_sessions (user_id, token_hash, remember, ip, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, now() + ($6 || ' milliseconds')::interval) RETURNING expires_at`,
    [userId, sha256(token), remember, ip, ua, String(ttl)],
  )
  setSessionCookie(req, res, token, ttl)
  return rows[0].expires_at
}

/**
 * Very short in-memory cache of validated sessions (per server instance) to
 * avoid a database round trip on every request. Revoking a session on this
 * instance clears it immediately; other instances pick it up within the TTL.
 */
const SESSION_CACHE_TTL_MS = 15_000
const sessionCache = new Map<string, { user: SessionUser; until: number }>()
const forgetSessions = (match: (u: SessionUser) => boolean) => {
  for (const [k, v] of sessionCache) if (match(v.user)) sessionCache.delete(k)
}

export async function getSessionUser(req: Req): Promise<SessionUser | null> {
  const token = readCookie(req, COOKIE)
  if (!token || token.length > 100) return null
  const key = sha256(token)
  const cached = sessionCache.get(key)
  if (cached && cached.until > Date.now()) return cached.user
  const user = await loadSessionUser(key)
  if (user) sessionCache.set(key, { user, until: Date.now() + SESSION_CACHE_TTL_MS })
  else sessionCache.delete(key)
  return user
}

async function loadSessionUser(tokenHash: string): Promise<SessionUser | null> {
  const { rows } = await getPool().query(
    `SELECT s.id AS session_id, s.expires_at, s.last_seen_at, s.remember,
            u.id, u.email, u.name, u.role, u.status, u.last_login_at, u.created_at
       FROM ${SCHEMA}.admin_sessions s JOIN ${SCHEMA}.admin_users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()`,
    [tokenHash],
  )
  const row = rows[0]
  if (!row || row.status !== 'active') return null
  const idle = Date.now() - new Date(row.last_seen_at).getTime()
  if (!row.remember && idle > IDLE_TIMEOUT_MS) {
    await getPool().query(`UPDATE ${SCHEMA}.admin_sessions SET revoked_at = now() WHERE id = $1`, [row.session_id])
    return null
  }
  if (idle > 60_000) {
    // Bookkeeping only — don't make the request wait for it.
    getPool().query(`UPDATE ${SCHEMA}.admin_sessions SET last_seen_at = now() WHERE id = $1`, [row.session_id]).catch(() => undefined)
  }
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    sessionId: row.session_id,
    sessionExpiresAt: row.expires_at,
  }
}

/**
 * Extends the current session (sliding expiry) and re-issues the same cookie.
 * The token is not rotated, so requests already in flight never fail.
 */
export async function extendSession(req: Req, res: Res, sessionId: string) {
  const token = readCookie(req, COOKIE)
  const { rows } = await getPool().query<{ expires_at: string; remember: boolean }>(
    `UPDATE ${SCHEMA}.admin_sessions
        SET expires_at = now() + (CASE WHEN remember THEN $2 ELSE $3 END || ' milliseconds')::interval, last_seen_at = now()
      WHERE id = $1 AND revoked_at IS NULL RETURNING expires_at, remember`,
    [sessionId, String(REMEMBER_TTL_MS), String(SESSION_TTL_MS)],
  )
  if (!rows[0] || !token) return null
  setSessionCookie(req, res, token, rows[0].remember ? REMEMBER_TTL_MS : SESSION_TTL_MS)
  return rows[0].expires_at
}

export async function revokeSession(sessionId: string) {
  forgetSessions((u) => u.sessionId === sessionId)
  await getPool().query(`UPDATE ${SCHEMA}.admin_sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL`, [sessionId])
}

export async function revokeAllSessions(userId: string, exceptSessionId?: string) {
  forgetSessions((u) => u.id === userId && u.sessionId !== exceptSessionId)
  await getPool().query(
    `UPDATE ${SCHEMA}.admin_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL AND ($2::uuid IS NULL OR id <> $2::uuid)`,
    [userId, exceptSessionId ?? null],
  )
}

/* ------------------------------------------------------------------ */
/* CSRF — the session cookie is SameSite=Strict, and every state-      */
/* changing request must also carry a custom header (which forces a    */
/* CORS preflight) and a same-origin Origin header when present.       */
/* ------------------------------------------------------------------ */

export const CSRF_HEADER = 'x-gh-admin'

export function assertCsrf(req: Req) {
  if (req.method === 'GET' || req.method === 'HEAD') return
  if (req.headers[CSRF_HEADER] !== '1') throw new HttpError(403, 'Missing security header.')
  const origin = req.headers.origin
  if (origin) {
    const host = req.headers['x-forwarded-host'] ?? req.headers.host
    try {
      if (new URL(origin).host !== host) throw new HttpError(403, 'Cross-origin request blocked.')
    } catch (e) {
      if (e instanceof HttpError) throw e
      throw new HttpError(403, 'Invalid origin.')
    }
  }
}

/* ------------------------------------------------------------------ */
/* Login throttling — per-IP (in memory) + per-account lockout (DB).   */
/* ------------------------------------------------------------------ */

export const MAX_FAILED_ATTEMPTS = 5
export const LOCKOUT_MINUTES = 15

const loginHits = new Map<string, number[]>()
export function throttleLogin(ip: string | null) {
  const key = ip ?? 'unknown'
  const now = Date.now()
  const recent = (loginHits.get(key) ?? []).filter((t) => now - t < 15 * 60_000)
  recent.push(now)
  loginHits.set(key, recent)
  if (recent.length > 20) throw new HttpError(429, 'Too many sign-in attempts. Please wait 15 minutes and try again.')
}
