import { ROLE_PERMISSIONS } from '../../../src/admin/rbac.js'
import {
  clearSessionCookie,
  createSession,
  extendSession,
  hashPassword,
  LOCKOUT_MINUTES,
  MAX_FAILED_ATTEMPTS,
  newToken,
  revokeAllSessions,
  revokeSession,
  sha256,
  throttleLogin,
  validatePasswordStrength,
  verifyPassword,
  type SessionUser,
} from '../auth.js'
import { getPool, SCHEMA } from '../db.js'
import { HttpError } from '../http.js'
import { audit, str, type Router } from '../router.js'

export const publicUser = (u: SessionUser) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  status: u.status,
  lastLoginAt: u.lastLoginAt,
  createdAt: u.createdAt,
  permissions: ROLE_PERMISSIONS[u.role],
  sessionExpiresAt: u.sessionExpiresAt,
})

/** Creates a single-use password reset token (1 hour) and returns the raw token. */
export async function createResetToken(userId: string, hours = 1) {
  const token = newToken()
  await getPool().query(`UPDATE ${SCHEMA}.password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL`, [userId])
  await getPool().query(
    `INSERT INTO ${SCHEMA}.password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + ($3 || ' hours')::interval)`,
    [userId, sha256(token), String(hours)],
  )
  return token
}

export function registerAuthRoutes(r: Router) {
  /** POST /auth/login */
  r.public('POST', '/auth/login', async (ctx) => {
    throttleLogin(ctx.ip)
    const email = str(ctx.body.email, 254).toLowerCase()
    const password = typeof ctx.body.password === 'string' ? ctx.body.password.slice(0, 200) : ''
    const remember = ctx.body.remember === true
    const generic = new HttpError(401, 'Invalid email or password.')
    if (!email || !password) throw generic

    const { rows } = await getPool().query(`SELECT * FROM ${SCHEMA}.admin_users WHERE lower(email) = $1`, [email])
    const user = rows[0]
    const ok = await verifyPassword(password, user?.password_hash ?? null)
    if (!user) throw generic

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await audit({ user: null, ip: ctx.ip, ua: ctx.ua }, 'auth.login_locked', 'admin_user', user.id)
      throw new HttpError(423, `This account is temporarily locked after too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes or reset your password.`)
    }
    if (!ok) {
      const attempts = user.failed_attempts + 1
      const lock = attempts >= MAX_FAILED_ATTEMPTS
      await getPool().query(
        `UPDATE ${SCHEMA}.admin_users SET failed_attempts = $2, locked_until = CASE WHEN $3 THEN now() + ($4 || ' minutes')::interval ELSE locked_until END WHERE id = $1`,
        [user.id, lock ? 0 : attempts, lock, String(LOCKOUT_MINUTES)],
      )
      await audit({ user: null, ip: ctx.ip, ua: ctx.ua }, lock ? 'auth.account_locked' : 'auth.login_failed', 'admin_user', user.id)
      throw generic
    }
    if (user.status !== 'active') throw new HttpError(403, user.status === 'suspended' ? 'This account has been suspended.' : 'This account has not been activated yet.')

    await getPool().query(`UPDATE ${SCHEMA}.admin_users SET failed_attempts = 0, locked_until = NULL, last_login_at = now() WHERE id = $1`, [user.id])
    const expiresAt = await createSession(ctx.req, ctx.res, user.id, remember)
    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      lastLoginAt: new Date().toISOString(),
      createdAt: user.created_at,
      sessionId: '',
      sessionExpiresAt: expiresAt,
    }
    await audit({ user: sessionUser, ip: ctx.ip, ua: ctx.ua }, 'auth.login', 'admin_user', user.id, { remember })
    return { user: publicUser(sessionUser) }
  })

  /** POST /auth/logout */
  r.on('POST', '/auth/logout', null, async (ctx) => {
    await revokeSession(ctx.user.sessionId)
    clearSessionCookie(ctx.req, ctx.res)
    await audit(ctx, 'auth.logout', 'admin_user', ctx.user.id)
    return { ok: true }
  })

  /** GET /auth/me */
  r.on('GET', '/auth/me', null, async (ctx) => ({ user: publicUser(ctx.user) }))

  /** POST /auth/refresh — extends the current session (sliding expiry). */
  r.on('POST', '/auth/refresh', null, async (ctx) => {
    const expiresAt = await extendSession(ctx.req, ctx.res, ctx.user.sessionId)
    if (!expiresAt) throw new HttpError(401, 'Please sign in.')
    return { user: publicUser({ ...ctx.user, sessionExpiresAt: expiresAt }) }
  })

  /** POST /auth/forgot — always answers the same way (no account enumeration). */
  r.public('POST', '/auth/forgot', async (ctx) => {
    throttleLogin(ctx.ip)
    const email = str(ctx.body.email, 254).toLowerCase()
    const { rows } = await getPool().query(`SELECT id, status FROM ${SCHEMA}.admin_users WHERE lower(email) = $1`, [email])
    if (rows[0] && rows[0].status !== 'suspended') {
      const token = await createResetToken(rows[0].id)
      await audit({ user: null, ip: ctx.ip, ua: ctx.ua }, 'auth.reset_requested', 'admin_user', rows[0].id)
      // No email provider is connected yet. In development only, surface the link in the server log.
      if (process.env.NODE_ENV !== 'production') console.info(`[auth] Password reset link: /admin/reset-password?token=${token}`)
      // TODO(email): send `${siteUrl}/admin/reset-password?token=${token}` via the email provider.
    }
    return { ok: true, message: 'If that email belongs to an admin account, a reset link has been sent.' }
  })

  /** POST /auth/reset — sets a new password with a single-use token. */
  r.public('POST', '/auth/reset', async (ctx) => {
    throttleLogin(ctx.ip)
    const token = str(ctx.body.token, 200)
    const password = typeof ctx.body.password === 'string' ? ctx.body.password : ''
    const weak = validatePasswordStrength(password)
    if (weak) throw new HttpError(422, weak, { password: weak })
    const { rows } = await getPool().query(
      `SELECT t.id, t.user_id FROM ${SCHEMA}.password_reset_tokens t
        WHERE t.token_hash = $1 AND t.used_at IS NULL AND t.expires_at > now()`,
      [sha256(token)],
    )
    if (!rows[0]) throw new HttpError(400, 'This reset link is invalid or has expired. Please request a new one.')
    const hash = await hashPassword(password)
    await getPool().query(`UPDATE ${SCHEMA}.password_reset_tokens SET used_at = now() WHERE id = $1`, [rows[0].id])
    await getPool().query(
      `UPDATE ${SCHEMA}.admin_users SET password_hash = $2, failed_attempts = 0, locked_until = NULL,
              status = CASE WHEN status = 'pending' THEN 'active' ELSE status END, updated_at = now() WHERE id = $1`,
      [rows[0].user_id, hash],
    )
    await revokeAllSessions(rows[0].user_id)
    await audit({ user: null, ip: ctx.ip, ua: ctx.ua }, 'auth.password_reset', 'admin_user', rows[0].user_id)
    return { ok: true }
  })

  /** POST /auth/change-password — signed-in user changes their own password. */
  r.on('POST', '/auth/change-password', null, async (ctx) => {
    const current = typeof ctx.body.currentPassword === 'string' ? ctx.body.currentPassword : ''
    const next = typeof ctx.body.newPassword === 'string' ? ctx.body.newPassword : ''
    const { rows } = await getPool().query(`SELECT password_hash FROM ${SCHEMA}.admin_users WHERE id = $1`, [ctx.user.id])
    if (!(await verifyPassword(current, rows[0]?.password_hash ?? null))) throw new HttpError(422, 'Current password is incorrect.', { currentPassword: 'Current password is incorrect.' })
    const weak = validatePasswordStrength(next)
    if (weak) throw new HttpError(422, weak, { newPassword: weak })
    await getPool().query(`UPDATE ${SCHEMA}.admin_users SET password_hash = $2, updated_at = now() WHERE id = $1`, [ctx.user.id, await hashPassword(next)])
    await revokeAllSessions(ctx.user.id, ctx.user.sessionId)
    await audit(ctx, 'auth.password_changed', 'admin_user', ctx.user.id)
    return { ok: true }
  })
}
