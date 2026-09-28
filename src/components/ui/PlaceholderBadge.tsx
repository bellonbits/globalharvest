import { site } from '../../config/site'
import { cn } from '../../lib/cn'

interface PlaceholderBadgeProps {
  label?: string
  tone?: 'dark' | 'light'
  className?: string
}

/** Marks unconfirmed content so it is never mistaken for real information. */
export function PlaceholderBadge({ label = 'Placeholder', tone = 'dark', className }: PlaceholderBadgeProps) {
  if (!site.showPlaceholderMarkers) return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-0.5 font-display text-[0.62rem] font-semibold uppercase tracking-[0.16em]',
        tone === 'dark' ? 'border-teal-800/35 bg-cream-50/80 text-teal-800' : 'border-cream-100/50 bg-teal-950/30 text-cream-100',
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-coral-500" />
      {label}
    </span>
  )
}

/** A full-width notice explaining that a section contains sample content. */
export function PlaceholderNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  if (!site.showPlaceholderMarkers) return null
  return (
    <p
      role="note"
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-dashed border-teal-800/25 bg-cream-50/70 px-5 py-4 text-sm leading-relaxed text-teal-900/80',
        className,
      )}
    >
      <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-coral-500" />
      <span>{children}</span>
    </p>
  )
}
