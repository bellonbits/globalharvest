import { m } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'

interface FormSuccessProps {
  title: string
  children: ReactNode
  actions?: ReactNode
  className?: string
  tone?: 'light' | 'dark'
}

/** Confirmation state shown in place of a form. Receives focus so it is announced. */
export function FormSuccess({ title, children, actions, className, tone = 'light' }: FormSuccessProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <m.div
      ref={ref}
      tabIndex={-1}
      role="status"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-3xl p-8 outline-none sm:p-10',
        tone === 'light' ? 'bg-cream-50 text-teal-900 shadow-soft ring-1 ring-teal-800/10' : 'bg-teal-700 text-cream-100',
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-coral-400 text-teal-950">
        <Icon name="check" size={28} strokeWidth={2.2} />
      </span>
      <h2 className={cn('mt-6 font-display text-3xl font-bold tracking-tight', tone === 'light' ? 'text-teal-800' : 'text-cream-100')}>{title}</h2>
      <div className={cn('mt-3 max-w-lg leading-relaxed', tone === 'light' ? 'text-teal-900/75' : 'text-cream-100/80')}>{children}</div>
      {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
    </m.div>
  )
}
