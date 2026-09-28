import pg from 'pg'

/**
 * Shared connection pool. Serverless instances reuse it between invocations.
 * All Global Harvest tables live in the `global_harvest` schema.
 */
let pool: pg.Pool | null = null

export function getPool(): pg.Pool {
  if (pool) return pool
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL is not configured')
  const url = new URL(raw)
  url.searchParams.delete('sslmode') // TLS is configured explicitly below
  pool = new pg.Pool({
    connectionString: url.toString(),
    // Provide the provider's CA certificate (DATABASE_CA_CERT) to verify the server; otherwise encrypt without verification.
    ssl: process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n') } : { rejectUnauthorized: false },
    // Queries run in parallel on separate connections; keep them open because
    // each new TLS connection to a remote database costs seconds, not milliseconds.
    max: 10,
    idleTimeoutMillis: 5 * 60_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  })
  // Open a connection straight away so the first request doesn't pay the handshake.
  pool.query('select 1').catch(() => undefined)
  return pool
}

export const SCHEMA = 'global_harvest'
