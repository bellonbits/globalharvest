import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Icon } from '../../components/brand/Icon'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { Guard } from '../components/Layout'
import { Button, Card, ConfirmDialog, Dialog, EmptyState, ErrorState, LoadingBlock, PageHeader, SelectField, StatusBadge, Tag, TextAreaField, TextField, Toggle } from '../components/ui'
import { formatDateTime, formatDay, useResource } from '../lib/hooks'
import { PERMISSIONS, ROLE_LABELS, ROLE_PERMISSIONS, ROLES, type Role } from '../rbac'
import { authService, settingsService, userService } from '../services'
import type { AdminUser, OrgSettings } from '../types'

type Tab = 'organization' | 'users' | 'roles' | 'email' | 'notifications' | 'website' | 'social' | 'security' | 'integrations'

const TABS: { value: Tab; label: string; perm?: 'users:read' | 'settings:read' }[] = [
  { value: 'organization', label: 'Organization', perm: 'settings:read' },
  { value: 'users', label: 'Users', perm: 'users:read' },
  { value: 'roles', label: 'Roles & Permissions' },
  { value: 'email', label: 'Email', perm: 'settings:read' },
  { value: 'notifications', label: 'Notifications', perm: 'settings:read' },
  { value: 'website', label: 'Website', perm: 'settings:read' },
  { value: 'social', label: 'Social Media', perm: 'settings:read' },
  { value: 'security', label: 'Security' },
  { value: 'integrations', label: 'Integrations', perm: 'settings:read' },
]

const DEFAULTS: OrgSettings = {
  organizationName: 'Global Harvest',
  social: {},
  notifications: { newRegistration: true, newPrayerRequest: true, newMessage: true, eventRegistration: true },
  integrations: { storageProvider: 'none' },
}

function OrgSettingsForm({ tab }: { tab: Tab }) {
  const { can } = useAuth()
  const { notify } = useToast()
  const { data, loading, error, reload } = useResource(() => settingsService.get(), [])
  const [values, setValues] = useState<OrgSettings>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (data) setValues({ ...DEFAULTS, ...data, social: data.social ?? {}, notifications: { ...DEFAULTS.notifications, ...data.notifications }, integrations: { ...DEFAULTS.integrations, ...data.integrations } })
  }, [data])
  if (error) return <Card><ErrorState error={error} onRetry={reload} what="settings" /></Card>
  if (loading) return <Card><LoadingBlock /></Card>
  const readOnly = !can('settings:write')
  const set = <K extends keyof OrgSettings>(k: K, v: OrgSettings[K]) => setValues((s) => ({ ...s, [k]: v }))
  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsService.save(data?.id ?? null, values)
      notify({ tone: 'success', title: 'Settings saved' })
      reload()
    } catch (err) {
      notify({ tone: 'error', title: 'Save failed', message: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {tab === 'organization' ? (
        <Card title="Organization">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Organization name" required value={values.organizationName} disabled={readOnly} onChange={(e) => set('organizationName', e.target.value)} />
            <TextField label="Logo URL" type="url" value={values.logoUrl ?? ''} disabled={readOnly} onChange={(e) => set('logoUrl', e.target.value)} hint="Upload in the Media library and paste the URL." />
            <TextAreaField label="Description" className="sm:col-span-2" value={values.description ?? ''} disabled={readOnly} onChange={(e) => set('description', e.target.value)} />
            <TextField label="Contact email" type="email" value={values.contactEmail ?? ''} disabled={readOnly} onChange={(e) => set('contactEmail', e.target.value)} />
            <TextField label="Phone" value={values.phone ?? ''} disabled={readOnly} onChange={(e) => set('phone', e.target.value)} />
            <TextField label="Website" type="url" value={values.website ?? ''} disabled={readOnly} onChange={(e) => set('website', e.target.value)} />
          </div>
        </Card>
      ) : null}
      {tab === 'social' ? (
        <Card title="Social media links">
          <div className="grid gap-5 sm:grid-cols-2">
            {['instagram', 'youtube', 'facebook', 'tiktok', 'whatsapp', 'x'].map((p) => (
              <TextField key={p} label={p === 'x' ? 'X (Twitter)' : p[0].toUpperCase() + p.slice(1)} type="url" placeholder="https://…" value={values.social[p] ?? ''} disabled={readOnly} onChange={(e) => set('social', { ...values.social, [p]: e.target.value })} />
            ))}
          </div>
        </Card>
      ) : null}
      {tab === 'notifications' ? (
        <Card title="Admin notifications">
          <div className="space-y-5">
            <Toggle label="New registrations" checked={values.notifications.newRegistration} onChange={(v) => set('notifications', { ...values.notifications, newRegistration: v })} />
            <Toggle label="New event registrations" checked={values.notifications.eventRegistration} onChange={(v) => set('notifications', { ...values.notifications, eventRegistration: v })} />
            <Toggle label="New prayer requests" hint="Only Prayer Coordinators and Super Admins are notified." checked={values.notifications.newPrayerRequest} onChange={(v) => set('notifications', { ...values.notifications, newPrayerRequest: v })} />
            <Toggle label="New contact messages" checked={values.notifications.newMessage} onChange={(v) => set('notifications', { ...values.notifications, newMessage: v })} />
            <p className="text-xs text-teal-900/55">In-app notifications are always recorded. Email alerts will use these preferences once an email provider is connected.</p>
          </div>
        </Card>
      ) : null}
      {tab === 'email' ? (
        <Card title="Email delivery">
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Email provider" value={values.integrations.emailProvider ?? ''} disabled={readOnly} onChange={(e) => set('integrations', { ...values.integrations, emailProvider: e.target.value })} placeholder="Not connected" options={['Postmark', 'SendGrid', 'Resend', 'Amazon SES', 'Mailgun'].map((v) => ({ value: v, label: v }))} />
            <TextField label="Sender address" value={values.contactEmail ?? ''} disabled={readOnly} onChange={(e) => set('contactEmail', e.target.value)} hint="Must be verified with the provider." />
          </div>
          <p className="mt-4 text-sm text-teal-900/60">API keys are never entered here. Add the provider’s key as a server environment variable (e.g. <code className="rounded bg-cream-50 px-1">EMAIL_API_KEY</code>) in Vercel.</p>
        </Card>
      ) : null}
      {tab === 'website' ? (
        <Card title="Website">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Public site URL" type="url" value={values.website ?? ''} disabled={readOnly} onChange={(e) => set('website', e.target.value)} />
          </div>
          <p className="mt-4 text-sm text-teal-900/60">
            Page content is edited under <Link to="/admin/content" className="font-medium text-teal-700 hover:underline">Content</Link>. Placeholder markers and SEO defaults are configured in the codebase (<code className="rounded bg-cream-50 px-1">src/config/site.ts</code>).
          </p>
        </Card>
      ) : null}
      {tab === 'integrations' ? (
        <Card title="Integrations">
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="File storage" value={values.integrations.storageProvider ?? 'none'} disabled={readOnly} onChange={(e) => set('integrations', { ...values.integrations, storageProvider: e.target.value as OrgSettings['integrations']['storageProvider'] })} options={[{ value: 'none', label: 'Not connected' }, { value: 'cloudinary', label: 'Cloudinary' }, { value: 's3', label: 'Amazon S3' }]} hint="Credentials are server environment variables only." />
            <TextField label="Analytics site ID" value={values.integrations.analyticsId ?? ''} disabled={readOnly} onChange={(e) => set('integrations', { ...values.integrations, analyticsId: e.target.value })} hint="e.g. Plausible or Umami (privacy-friendly)." />
          </div>
          <ul className="mt-5 space-y-2 text-sm text-teal-900/70">
            <li className="flex items-center gap-2"><Icon name="check" size={16} className="text-emerald-600" /> PostgreSQL — connected</li>
            <li className="flex items-center gap-2"><Icon name="close" size={16} className="text-teal-900/35" /> Email provider — {values.integrations.emailProvider ? `${values.integrations.emailProvider} selected (add key on server)` : 'not connected'}</li>
            <li className="flex items-center gap-2"><Icon name="close" size={16} className="text-teal-900/35" /> FastAPI backend — optional future migration (same /api/v1 contract)</li>
          </ul>
        </Card>
      ) : null}
      {!readOnly ? (
        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={saving}>Save settings</Button>
        </div>
      ) : (
        <p className="text-sm text-teal-900/55">You have read-only access to settings.</p>
      )}
    </form>
  )
}

function SecurityTab() {
  const { user, logout } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Change your password">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (next !== confirm) return setErr('New passwords don’t match.')
            setBusy(true)
            setErr(null)
            try {
              await authService.changePassword(current, next)
              notify({ tone: 'success', title: 'Password changed', message: 'Other sessions were signed out.' })
              setCurrent('')
              setNext('')
              setConfirm('')
            } catch (e2) {
              setErr((e2 as Error).message)
            } finally {
              setBusy(false)
            }
          }}
        >
          {err ? <p role="alert" className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-800">{err}</p> : null}
          <TextField label="Current password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          <TextField label="New password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required hint="At least 12 characters, using three of: lowercase, uppercase, numbers, symbols." />
          <TextField label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <Button type="submit" variant="primary" loading={busy}>Update password</Button>
        </form>
      </Card>
      <Card title="Session & security policy">
        <ul className="space-y-3 text-sm text-teal-900/75">
          {[
            'Passwords are stored only as scrypt hashes — never in plain text.',
            'Sessions use an httpOnly, SameSite=Strict cookie; tokens are hashed in the database.',
            'Sessions expire after 12 hours (30 days with “Remember me”) and after 2 hours of inactivity.',
            'Accounts lock for 15 minutes after 5 failed sign-in attempts; sign-in is rate-limited per IP.',
            'Every request is authorised on the server by role; the portal UI only hides what you can’t use.',
            'Admin actions and prayer-request views are written to the audit log.',
          ].map((t) => (
            <li key={t} className="flex gap-2"><Icon name="shield" size={16} className="mt-0.5 shrink-0 text-teal-600" /> {t}</li>
          ))}
        </ul>
        <div className="mt-5 border-t border-teal-900/8 pt-4 text-sm text-teal-900/65">
          Signed in as <strong className="text-teal-900">{user?.email}</strong> · session expires {formatDateTime(user?.sessionExpiresAt)}
          <div className="mt-3">
            <Button icon="logout" onClick={async () => { await logout(); navigate('/admin/login') }}>Sign out</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function UsersTab() {
  const { can, user: me } = useAuth()
  const { notify } = useToast()
  const { data, loading, error, reload } = useResource(() => userService.list(), [])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'EDITOR' as Role })
  const [link, setLink] = useState<{ title: string; path: string } | null>(null)
  const [suspend, setSuspend] = useState<AdminUser | null>(null)
  const canWrite = can('users:write')
  const showLink = (title: string, path: string) => setLink({ title, path })

  return (
    <Guard permission="users:read">
      <Card title={`Admin users (${data?.length ?? 0})`} padded={false} actions={canWrite ? <Button size="sm" variant="primary" icon="plus" onClick={() => setCreating(true)}>Invite admin</Button> : null}>
        {error ? (
          <ErrorState error={error} onRetry={reload} what="users" />
        ) : loading ? (
          <LoadingBlock />
        ) : !data?.length ? (
          <EmptyState title="No admin users" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-50/70 text-xs font-medium tracking-wide text-teal-900/55 uppercase">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Last login', 'Created', ''].map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-900/[0.06]">
                {data.map((u) => {
                  const self = u.id === me?.id
                  return (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium text-teal-900">{u.name} {self ? <Tag>You</Tag> : null}</td>
                      <td className="px-4 py-3 text-teal-900/75">{u.email}</td>
                      <td className="px-4 py-3">
                        {canWrite && !self ? (
                          <select aria-label={`Role for ${u.name}`} value={u.role} onChange={async (e) => { try { await userService.update(u.id, { role: e.target.value as Role }); notify({ tone: 'success', title: 'Role updated', message: 'Their sessions were signed out.' }); reload() } catch (x) { notify({ tone: 'error', title: 'Could not change role', message: (x as Error).message }) } }} className="h-8 rounded-lg border-0 bg-white px-2 text-sm ring-1 ring-teal-900/15">
                            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                          </select>
                        ) : (
                          ROLE_LABELS[u.role]
                        )}
                      </td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><StatusBadge status={u.status} />{u.locked ? <Tag tone="bad">Locked</Tag> : null}</span></td>
                      <td className="px-4 py-3 whitespace-nowrap text-teal-900/70">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-teal-900/70">{formatDay(u.createdAt)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {canWrite && !self ? (
                          <span className="inline-flex gap-1">
                            <Button size="sm" variant="ghost" icon="key" onClick={async () => { const r = await userService.resetLink(u.id); showLink(`Password reset link for ${u.name}`, r.resetPath) }}>Reset link</Button>
                            {u.status === 'suspended' ? (
                              <Button size="sm" variant="ghost" onClick={async () => { await userService.update(u.id, { status: 'active' }); reload() }}>Reactivate</Button>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => setSuspend(u)}>Deactivate</Button>
                            )}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="Invite an admin"
        footer={
          <>
            <Button onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" disabled={!form.name || !form.email} onClick={async () => {
              try {
                const r = await userService.create(form)
                setCreating(false)
                setForm({ name: '', email: '', role: 'EDITOR' })
                reload()
                showLink(`Account setup link for ${r.user.name}`, r.setupPath)
              } catch (e) { notify({ tone: 'error', title: 'Could not create admin', message: (e as Error).message }) }
            }}>Create & get setup link</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <TextField label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <SelectField label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))} hint="Grant the least access needed." />
          <p className="text-xs text-teal-900/55">The account stays “Pending” until they open the setup link (valid 72 hours) and choose a password. You never see or set their password.</p>
        </div>
      </Dialog>
      <Dialog open={Boolean(link)} onClose={() => setLink(null)} title={link?.title ?? ''} footer={<Button variant="primary" onClick={() => setLink(null)}>Done</Button>}>
        <p className="text-sm text-teal-900/75">Send this one-time link privately (it’s shown only once). No email provider is connected yet.</p>
        <div className="mt-3 flex gap-2">
          <input readOnly value={link ? `${window.location.origin}${link.path}` : ''} className="block w-full rounded-lg border-0 bg-cream-50 px-3 py-2 font-mono text-xs ring-1 ring-teal-900/15" onFocus={(e) => e.target.select()} aria-label="One-time link" />
          <Button icon="copy" onClick={() => link && navigator.clipboard.writeText(`${window.location.origin}${link.path}`).then(() => notify({ tone: 'success', title: 'Link copied' }))}>Copy</Button>
        </div>
      </Dialog>
      <ConfirmDialog open={Boolean(suspend)} onClose={() => setSuspend(null)} danger title="Deactivate admin?" body={<>{suspend?.name} will be signed out immediately and can’t sign in until reactivated.</>} confirmLabel="Deactivate" onConfirm={async () => { if (suspend) { try { await userService.update(suspend.id, { status: 'suspended' }); reload() } catch (e) { notify({ tone: 'error', title: 'Could not deactivate', message: (e as Error).message }) } setSuspend(null) } }} />
    </Guard>
  )
}

function RolesTab() {
  const groups = [...new Set(PERMISSIONS.map((p) => p.split(':')[0]))]
  return (
    <Card title="Roles & permissions" padded={false}>
      <p className="px-5 pt-4 text-sm text-teal-900/60">Permissions are enforced by the server on every request. This table reflects <code className="rounded bg-cream-50 px-1">src/admin/rbac.ts</code>.</p>
      <div className="overflow-x-auto p-5">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-xs text-teal-900/55 uppercase">
              <th scope="col" className="py-2 pr-4 font-medium">Module</th>
              {ROLES.map((r) => <th key={r} scope="col" className="px-2 py-2 text-center font-medium">{ROLE_LABELS[r]}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-900/[0.06]">
            {groups.map((g) => (
              <tr key={g}>
                <th scope="row" className="py-2.5 pr-4 text-left font-medium text-teal-900 capitalize">{g.replace('_', ' ')}</th>
                {ROLES.map((r) => {
                  const perms = ROLE_PERMISSIONS[r]
                  const read = perms.includes(`${g}:read` as never)
                  const write = perms.includes(`${g}:write` as never)
                  return (
                    <td key={r} className="px-2 py-2.5 text-center">
                      {write ? <Tag tone="good">Manage</Tag> : read ? <Tag tone="info">View</Tag> : <span className="text-teal-900/25" aria-label="No access">—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default function Settings({ initialTab }: { initialTab?: Tab }) {
  const { can } = useAuth()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = (initialTab ?? (params.get('tab') as Tab | null) ?? 'organization') as Tab
  const visible = TABS.filter((t) => !t.perm || can(t.perm))
  const go = (t: Tab) => {
    if (t === 'users') return navigate('/admin/settings/users')
    if (t === 'roles') return navigate('/admin/settings/roles')
    if (initialTab) return navigate(`/admin/settings?tab=${t}`)
    setParams({ tab: t }, { replace: true })
  }
  return (
    <>
      <PageHeader title="Settings" description="Organization, people, security and integrations." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Settings sections" className="min-w-0 rounded-xl bg-white p-2 ring-1 ring-teal-900/10 lg:self-start">
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {visible.map((t) => (
              <li key={t.value}>
                <button type="button" aria-current={tab === t.value ? 'page' : undefined} onClick={() => go(t.value)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${tab === t.value ? 'bg-teal-800 text-white' : 'text-teal-900 hover:bg-cream-50'}`}>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">
          {tab === 'users' ? <UsersTab /> : tab === 'roles' ? <RolesTab /> : tab === 'security' ? <SecurityTab /> : <Guard permission="settings:read"><OrgSettingsForm tab={tab} /></Guard>}
        </div>
      </div>
    </>
  )
}
