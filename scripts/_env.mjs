import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

export const ROOT = path.resolve(import.meta.dirname, '..')

export function loadEnv() {
  const file = path.join(ROOT, '.env')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
  }
}

export async function connect() {
  loadEnv()
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set (add it to .env).')
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.delete('sslmode')
  const client = new pg.Client({
    connectionString: url.toString(),
    ssl: process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n') } : { rejectUnauthorized: false },
  })
  await client.connect()
  return client
}
