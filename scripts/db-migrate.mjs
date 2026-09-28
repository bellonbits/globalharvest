/**
 * Applies db/schema.sql to the database in DATABASE_URL.
 * Usage: npm run db:migrate
 */
import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const ROOT = path.resolve(import.meta.dirname, '..')
if (!process.env.DATABASE_URL && fs.existsSync(path.join(ROOT, '.env'))) {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.')
  process.exit(1)
}

const url = new URL(process.env.DATABASE_URL)
url.searchParams.delete('sslmode')
const client = new pg.Client({
  connectionString: url.toString(),
  ssl: process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT } : { rejectUnauthorized: false },
})
await client.connect()
await client.query(fs.readFileSync(path.join(ROOT, 'db/schema.sql'), 'utf8'))
const { rows } = await client.query(
  `select table_name from information_schema.tables where table_schema = 'global_harvest' order by table_name`,
)
console.log('Schema applied. Tables:', rows.map((r) => r.table_name).join(', '))
await client.end()
