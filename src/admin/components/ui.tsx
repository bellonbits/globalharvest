/**
 * Admin UI kit — compact SaaS styling on the Global Harvest palette
 * (deep teal/navy surfaces, cream canvas, coral used sparingly as accent).
 */
import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../../components/brand/Icon'
import { cn } from '../../lib/cn'
import { labelize } from '../lib/hooks'

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
const btn: Record<BtnVariant, string> = {
  primary: 'bg-teal-800 text-white hover:bg-teal-700 shadow-sm',
  secondary: 'bg-white text-teal-900 ring-1 ring-inset ring-teal-900/15 hover:bg-cream-50 hover:ring-teal-900/25',
  ghost: 'text-teal-800 hover:bg-teal-900/5',
  danger: 'bg-white text-coral-700 ring-1 ring-inset ring-coral-600/30 hover:bg-coral-50',
  accent: 'bg-coral-400 text-teal-950 hover:bg-coral-300 shadow-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: 'sm' | 'md'
  icon?: IconName
  loading?: boolean
  to?: string
}

export function Button({ variant = 'secondary', size = 'md', icon, loading, to, className, children, disabled, type = 'button', ...rest }: ButtonProps) {
  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    size === 'sm' ? 'h-8 px-3 text-[0.8rem]' : 'h-10 px-4 text-sm',
    btn[variant],
    className,
  )
  const content = (
    <>
      {loading ? <Spinner className="size-4" /> : icon ? <Icon name={icon} size={size === 'sm' ? 15 : 17} /> : null}
      {children}
    </>
  )
  if (to) return <Link to={to} className={cls}>{content}</Link>
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  )
}

export function IconButton({ icon, label, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={cn('grid size-9 place-items-center rounded-lg text-teal-800 transition hover:bg-teal-900/5 disabled:opacity-40', className)} {...rest}>
      <Icon name={icon} size={18} />
    </button>
  )
}

export const Spinner = ({ className }: { className?: string }) => (
  <span aria-hidden="true" className={cn('inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70', className)} />
)

/* ------------------------------------------------------------------ */
/* Layout pieces                                                       */
/* ------------------------------------------------------------------ */

export function PageHeader({ title, description, actions, back, children }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: { to: string; label: string }; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {back ? (
          <Link to={back.to} className="mb-2 inline-flex items-center gap-1 text-sm text-teal-900/60 hover:text-teal-900">
            <Icon name="chevronLeft" size={16} /> {back.label}
          </Link>
        ) : null}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-teal-900 sm:text-[1.75rem]">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-teal-900/60">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function Card({ title, actions, children, className, padded = true }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn('min-w-0 rounded-xl bg-white ring-1 ring-teal-900/10', className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-teal-900/8 px-5 py-3.5">
          <h2 className="font-display text-[0.95rem] font-semibold text-teal-900">{title}</h2>
          {actions}
        </div>
      ) : null}
      <div className={padded ? 'p-5' : undefined}>{children}</div>
    </section>
  )
}

export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-xs font-medium tracking-wide text-teal-900/50 uppercase">{it.label}</dt>
          <dd className="mt-1 text-sm break-words text-teal-900">{it.value || <span className="text-teal-900/35">—</span>}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ------------------------------------------------------------------ */
/* Status badges — neutral by default; colour only carries state       */
/* ------------------------------------------------------------------ */

type Tone = 'neutral' | 'info' | 'good' | 'warn' | 'bad' | 'muted' | 'accent'
const tones: Record<Tone, string> = {
  neutral: 'bg-teal-900/6 text-teal-900 ring-teal-900/10',
  info: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  good: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  warn: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  bad: 'bg-coral-50 text-coral-800 ring-coral-600/25',
  muted: 'bg-slate-100 text-slate-600 ring-slate-400/25',
  accent: 'bg-coral-100 text-coral-800 ring-coral-500/25',
}

const STATUS_TONE: Record<string, Tone> = {
  new: 'accent', unread: 'accent', pending: 'warn', draft: 'muted', contacted: 'info', read: 'neutral',
  active: 'good', open: 'good', published: 'good', 'registration-open': 'good', subscribed: 'good', confirmed: 'info', attended: 'good', answered: 'good', replied: 'good', sent: 'good',
  'being-prayed-for': 'info', 'follow-up': 'warn', scheduled: 'info', registered: 'neutral', full: 'warn', 'registration-closed': 'warn',
  inactive: 'muted', archived: 'muted', completed: 'muted', unsubscribed: 'muted', 'no-show': 'bad', cancelled: 'bad', suspended: 'bad',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? 'neutral'
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset', tones[tone], className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      {labelize(status)}
    </span>
  )
}

export function Tag({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone], className)}>{children}</span>
}

export const DemoTag = () => (
  <Tag tone="warn" className="uppercase tracking-wide">
    Demo
  </Tag>
)

/* ------------------------------------------------------------------ */
/* States                                                              */
/* ------------------------------------------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-teal-900/[0.07]', className)} />
}

export function LoadingBlock({ label = 'Loading…', rows = 5 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3 p-5">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, body, action }: { icon?: IconName; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-teal-900/5 text-teal-700">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-teal-900">{title}</h3>
      {body ? <p className="mt-1 max-w-md text-sm text-teal-900/60">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ error, onRetry, what = 'this data' }: { error: Error; onRetry?: () => void; what?: string }) {
  const forbidden = (error as { status?: number }).status === 403
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-coral-50 text-coral-700">
        <Icon name={forbidden ? 'lock' : 'alert'} size={22} />
      </span>
      <h3 className="mt-4 font-display text-base font-semibold text-teal-900">{forbidden ? 'You don’t have access' : `Something went wrong while loading ${what}.`}</h3>
      <p className="mt-1 max-w-md text-sm text-teal-900/60">{forbidden ? 'Ask a Super Admin if you need this permission.' : error.message}</p>
      {onRetry && !forbidden ? (
        <Button className="mt-5" icon="refresh" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

const control =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-teal-950 ring-1 ring-inset ring-teal-900/15 placeholder:text-teal-900/35 focus:ring-2 focus:ring-teal-600 focus:outline-none disabled:bg-cream-50 disabled:text-teal-900/50'

interface FieldProps {
  label: string
  hint?: ReactNode
  error?: string
  required?: boolean
  className?: string
}

function Field({ id, label, hint, error, required, className, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-teal-900">
        {label}
        {required ? <span aria-hidden="true" className="ml-0.5 text-coral-600">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="text-xs font-medium text-coral-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-teal-900/55">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function TextField({ label, hint, error, required, className, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input id={id} required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} className={cn(control, error && 'ring-coral-500')} {...rest} />
    </Field>
  )
}

export function TextAreaField({ label, hint, error, required, className, rows = 4, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea id={id} rows={rows} required={required} aria-invalid={error ? true : undefined} className={cn(control, 'resize-y leading-relaxed', error && 'ring-coral-500')} {...rest} />
    </Field>
  )
}

export function SelectField({ label, hint, error, required, className, options, placeholder, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; placeholder?: string }) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select id={id} required={required} aria-invalid={error ? true : undefined} className={cn(control, 'pr-8', error && 'ring-coral-500')} {...rest}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

/** Compact select used in table toolbars (label is visually hidden). */
export function FilterSelect({ label, value, onChange, options, allLabel = 'All' }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; allLabel?: string }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(control, 'h-9 w-auto min-w-[8.5rem] py-1.5 pr-8')}>
        <option value="">
          {label}: {allLabel}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-teal-900">
          {label}
        </label>
        {hint ? <p className="text-xs text-teal-900/55">{hint}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-teal-600' : 'bg-teal-900/20')}
      >
        <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
      </button>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Icon name="search" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-teal-900/40" />
      <input type="search" aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(control, 'h-9 pl-9')} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Overlays: dialog + side drawer (focus-trapped, Esc to close)       */
/* ------------------------------------------------------------------ */

function useOverlay(open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])')?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !ref.current) return
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      if (!items.length) return
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault()
        items[items.length - 1].focus()
      } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
        e.preventDefault()
        items[0].focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      opener?.focus()
    }
  }, [open, onClose, ref])
}

export function Dialog({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useOverlay(open, onClose, ref)
  return createPortal(
    <AnimatePresence>
      {open ? (
        <m.div className="fixed inset-0 z-[80] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-teal-950/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
          <m.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn('relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl', size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl')}
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-teal-900/8 px-5 py-4">
              <h2 id={titleId} className="font-display text-lg font-semibold text-teal-900">
                {title}
              </h2>
              <IconButton icon="close" label="Close" onClick={onClose} data-close />
            </div>
            <div className="p-5">{children}</div>
            {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-teal-900/8 px-5 py-4">{footer}</div> : null}
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, children, footer, width = 'max-w-xl' }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; width?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useOverlay(open, onClose, ref)
  return createPortal(
    <AnimatePresence>
      {open ? (
        <m.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-teal-950/40" onClick={onClose} aria-hidden="true" />
          <m.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn('absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl', width)}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-teal-900/8 px-5 py-4">
              <h2 id={titleId} className="min-w-0 truncate font-display text-lg font-semibold text-teal-900">
                {title}
              </h2>
              <IconButton icon="close" label="Close" onClick={onClose} data-close />
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-teal-900/8 px-5 py-4">{footer}</div> : null}
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = 'Confirm', danger, loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; body: ReactNode; confirmLabel?: string; danger?: boolean; loading?: boolean }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm text-teal-900/75">{body}</div>
    </Dialog>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="-mx-1 flex gap-1 overflow-x-auto border-b border-teal-900/10 px-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            '-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
            value === t.value ? 'border-teal-700 text-teal-900' : 'border-transparent text-teal-900/55 hover:text-teal-900',
          )}
        >
          {t.label}
          {t.count !== undefined ? <span className="ml-1.5 rounded-full bg-teal-900/6 px-1.5 py-0.5 text-xs">{t.count}</span> : null}
        </button>
      ))}
    </div>
  )
}
