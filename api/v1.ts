import type { Req, Res } from './_lib/http'
import { Router } from './_lib/router'
import { registerAuthRoutes } from './_lib/v1/auth-routes'
import { registerInsightRoutes } from './_lib/v1/insight-routes'
import { registerRecordRoutes } from './_lib/v1/record-routes'
import { registerSubmissionRoutes } from './_lib/v1/submission-routes'

/**
 * /api/v1/* — admin API: one Vercel function with an internal router
 * (vercel.json rewrites every /api/v1/* path to this file).
 * Every route except the explicitly public ones requires a valid session,
 * and permissions are enforced here, server-side, from src/admin/rbac.ts.
 */
const router = new Router()
registerAuthRoutes(router)
registerSubmissionRoutes(router)
registerRecordRoutes(router)
registerInsightRoutes(router)

export default async function handler(req: Req, res: Res) {
  const url = new URL(req.url ?? '/', 'http://local')
  // On Vercel, vercel.json rewrites /api/v1/<path> to /api/v1?__path=<path>.
  // In local dev (Vite middleware) the original URL arrives unchanged.
  const rewritten = url.searchParams.get('__path')
  const path = rewritten !== null ? `/${rewritten.replace(/^\/+/, '')}` : url.pathname.replace(/^\/api\/v1/, '') || '/'
  await router.handle(req, res, path)
}
