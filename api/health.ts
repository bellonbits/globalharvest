import { getPool } from './_lib/db'
import { send, type Req, type Res } from './_lib/http'

/** GET /api/health — confirms the API can reach the database. */
export default async function handler(_req: Req, res: Res) {
  try {
    await getPool().query('select 1')
    send(res, 200, { ok: true, database: 'connected' })
  } catch {
    send(res, 503, { ok: false, database: 'unavailable' })
  }
}
