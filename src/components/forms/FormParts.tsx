import type { ChangeEvent, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'
import { CTAButton } from '../ui/Button'

/** Hidden field bots tend to fill in. Real users never see or reach it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
      </label>
    </div>
  )
}

/** Announces validation problems after a failed submit. */
export function ErrorSummary({ count, show }: { count: number; show: boolean }) {
  return (
    <div role="alert" aria-live="assertive" className={cn(show && count > 0 ? 'block' : 'sr-only')}>
      {show && count > 0 ? (
        <p className="flex items-center gap-3 rounded-2xl border border-coral-300 bg-coral-50 px-5 py-4 text-sm font-medium text-coral-800">
          <Icon name="close" size={18} strokeWidth={2} className="shrink-0 rounded-full bg-coral-200 p-0.5" />
          {count === 1 ? 'One field needs your attention.' : `${count} fields need your attention.`} Please review the highlighted fields.
        </p>
      ) : null}
    </div>
  )
}

export function SubmitButton({ children, submitting, className }: { children: ReactNode; submitting: boolean; className?: string }) {
  return (
    <CTAButton type="submit" size="lg" disabled={submitting} aria-disabled={submitting} className={cn('w-full sm:w-auto', className)} icon={submitting ? null : 'arrowRight'}>
      {submitting ? (
        <span className="inline-flex items-center gap-3">
          <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-teal-950/25 border-t-teal-950" />
          Sending…
        </span>
      ) : (
        children
      )}
    </CTAButton>
  )
}

export function FormSection({ title, description, children, index }: { title: string; description?: string; children: ReactNode; index?: number }) {
  return (
    <section className="grid gap-6 border-t border-teal-800/10 pt-10 first:border-t-0 first:pt-0 lg:grid-cols-[220px_1fr] lg:gap-10">
      <div>
        {index ? <p className="font-display text-sm font-semibold text-coral-700">{String(index).padStart(2, '0')}</p> : null}
        <h2 className="mt-1 font-display text-xl font-semibold text-teal-800">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-relaxed text-teal-900/60">{description}</p> : null}
      </div>
      <div className="grid gap-6">{children}</div>
    </section>
  )
}

export function PrivacyNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 text-sm leading-relaxed text-teal-900/60">
      <Icon name="lock" size={16} className="mt-0.5 shrink-0 text-teal-600" />
      <span>{children}</span>
    </p>
  )
}
