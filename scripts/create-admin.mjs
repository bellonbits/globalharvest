/**
 * Creates (or re-activates) an admin account — used to bootstrap the first Super Admin.
 * The password is typed interactively (hidden) and stored only as a scrypt hash.
 *
 *   npm run admin:create
 *
 * Non-interactive (CI/testing): ADMIN_EMAIL, ADMIN_NAME, ADMIN_ROLE, ADMIN_PASSWORD env vars.
 */
import { randomBytes, scrypt as scryptCb } from 'node:crypto'
import readline from 'node:readline'
import { promisify } from 'node:util'
import { connect } from './_env.mjs'

const scrypt = promisify(scryptCb)
const ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'EVENT_MANAGER', 'BIBLE_STUDY_LEADER', 'PRAYER_COORDINATOR', 'CONTENT_MANAGER']

// Must match api/_lib/auth.ts
async function hashPassword(pw) {
  const salt = randomBytes(16)
  const hash = await scrypt(pw, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
  return `scrypt$16384$8$1$${salt.toString('base64')}$${hash.toString('base64')}`
}
function strength(pw) {
  if (!pw || pw.length < 12) return 'Password must be at least 12 characters.'
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length
  return classes < 3 ? 'Use at least three of: lowercase, uppercase, numbers, symbols.' : null
}

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    if (hidden) {
      rl._writeToOutput = (s) => rl.output.write(s.includes(question) ? s : '')
    }
    rl.question(question, (answer) => {
      rl.close()
      if (hidden) process.stdout.write('\n')
      resolve(answer.trim())
    })
  })
}

const email = (process.env.ADMIN_EMAIL ?? (await ask('Admin email: '))).toLowerCase()
const name = process.env.ADMIN_NAME ?? (await ask('Full name: '))
const role = process.env.ADMIN_ROLE ?? 'SUPER_ADMIN'
let password = process.env.ADMIN_PASSWORD
if (!password) {
  password = await ask('Password (min 12 chars, hidden): ', true)
  const confirm = await ask('Confirm password: ', true)
  if (confirm !== password) {
    console.error('Passwords do not match.')
    process.exit(1)
  }
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !name) {
  console.error('A valid email and name are required.')
  process.exit(1)
}
if (!ROLES.includes(role)) {
  console.error(`Role must be one of ${ROLES.join(', ')}`)
  process.exit(1)
}
const weak = strength(password)
if (weak) {
  console.error(weak)
  process.exit(1)
}

const client = await connect()
const hash = await hashPassword(password)
const { rows } = await client.query(
  `INSERT INTO global_harvest.admin_users (email, name, role, status, password_hash)
   VALUES ($1, $2, $3, 'active', $4)
   ON CONFLICT (lower(email)) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, status = 'active',
     password_hash = EXCLUDED.password_hash, failed_attempts = 0, locked_until = NULL, updated_at = now()
   RETURNING id, (xmax = 0) AS inserted`,
  [email, name, role, hash],
)
await client.query(
  `INSERT INTO global_harvest.audit_logs (user_email, action, resource, resource_id, details) VALUES ($1, $2, 'admin_user', $3, $4)`,
  [email, rows[0].inserted ? 'admin_user.created_cli' : 'admin_user.reset_cli', rows[0].id, JSON.stringify({ role })],
)
console.log(`${rows[0].inserted ? 'Created' : 'Updated'} ${role} ${email}. Sign in at /admin/login`)
await client.end()
