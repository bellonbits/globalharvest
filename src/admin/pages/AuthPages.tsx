import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/brand/Icon'
import { SentMark } from '../../components/brand/SentMark'
import { useAuth } from '../auth/AuthContext'
import { Button, Spinner } from '../components/ui'
import { authService } from '../services'

const input =
  'block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-teal-950 ring-1 ring-inset ring-teal-900/15 placeholder:text-teal-900/35 focus:ring-2 focus:ring-teal-600 focus:outline-none'

function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#f4f2ee] font-sans lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-teal-900 p-12 text-white lg:flex lg:flex-col">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(242_138_104/0.3),transparent_55%)]" />
        <p className="relative font-display text-sm font-bold tracking-[0.1em] uppercase">Global Harvest</p>
        <div className="relative my-auto">
          <SentMark className="max-w-md" letters="var(--color-coral-400)" background="var(--color-teal-900)" whale={{ body: 'var(--color-teal-500)', shadow: 'var(--color-teal-950)' }} />
          <p className="mt-8 max-w-sm text-lg text-cream-100/75">The operational home for members, events, Bible studies, prayer and everything behind the website.</p>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-cream-100/50">
          <Icon name="lock" size={14} /> Restricted area. Access is logged.
        </p>
      </div>
      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <p className="mb-8 font-display text-sm font-bold tracking-[0.1em] text-teal-900 uppercase lg:hidden">Global Harvest · Admin</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-teal-950">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-teal-900/60">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  )
}

function ErrorBox({ message }: { message: string | null }) {
  return message ? (
    <p role="alert" className="mb-5 flex items-start gap-2 rounded-lg bg-coral-50 px-3.5 py-3 text-sm text-coral-800 ring-1 ring-coral-300">
      <Icon name="alert" size={16} className="mt-0.5 shrink-0" /> {message}
    </p>
  ) : null
}

function PasswordInput({ id, value, onChange, autoComplete, label }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; label: string }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-teal-900">
        {label}
      </label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} required autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} className={`${input} pr-11`} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-teal-900/55 hover:bg-teal-900/5 hover:text-teal-900">
          <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
        </button>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state: { from?: string; expired?: boolean } | null }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner className="size-8 text-teal-700" /></div>
  if (user) return <Navigate to={location.state?.from ?? '/admin/dashboard'} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email.trim(), password, remember)
      navigate(location.state?.from?.startsWith('/admin') ? location.state.from : '/admin/dashboard', { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setPassword('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Global Harvest admin portal">
      {location.state?.expired ? (
        <p role="status" className="mb-5 rounded-lg bg-amber-50 px-3.5 py-3 text-sm text-amber-900 ring-1 ring-amber-300">Your session expired. Please sign in again.</p>
      ) : null}
      <ErrorBox message={error} />
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-teal-900">
            Email
          </label>
          <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </div>
        <PasswordInput id="password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-teal-900">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-teal-700" />
            Remember me for 30 days
          </label>
          <Link to="/admin/forgot-password" className="text-sm font-medium text-teal-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="primary" loading={busy} className="h-11 w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-8 text-center text-xs text-teal-900/50">Only use “Remember me” on a private device.</p>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const r = await authService.forgotPassword(email.trim())
      setSent(r.message)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthShell title="Reset your password" subtitle="Enter your admin email and we’ll send a reset link.">
      <ErrorBox message={error} />
      {sent ? (
        <div role="status" className="rounded-lg bg-teal-50 px-4 py-4 text-sm text-teal-900 ring-1 ring-teal-200">
          <p>{sent}</p>
          <p className="mt-2 text-teal-900/65">If no email arrives, ask a Super Admin to generate a reset link for you from Settings → Users.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="fp-email" className="mb-1.5 block text-sm font-medium text-teal-900">
              Email
            </label>
            <input id="fp-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </div>
          <Button type="submit" variant="primary" loading={busy} className="h-11 w-full">
            Send reset link
          </Button>
        </form>
      )}
      <Link to="/admin/login" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline">
        <Icon name="chevronLeft" size={16} /> Back to sign in
      </Link>
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const welcome = params.get('welcome') === '1'
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return setError('Passwords don’t match.')
    setBusy(true)
    setError(null)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthShell title={welcome ? 'Set up your account' : 'Choose a new password'} subtitle="At least 12 characters, using three of: lowercase, uppercase, numbers, symbols.">
      <ErrorBox message={!token ? 'This link is missing its token. Request a new reset link.' : error} />
      {done ? (
        <div role="status">
          <p className="rounded-lg bg-emerald-50 px-4 py-4 text-sm text-emerald-900 ring-1 ring-emerald-200">Your password has been set. All other sessions were signed out.</p>
          <Button to="/admin/login" variant="primary" className="mt-6 h-11 w-full">
            Sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <PasswordInput id="np" label="New password" value={password} onChange={setPassword} autoComplete="new-password" />
          <PasswordInput id="np2" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          <Button type="submit" variant="primary" loading={busy} disabled={!token} className="h-11 w-full">
            Save password
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
