import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

const tones = {
  coral: 'bg-coral-100 text-coral-800',
  teal: 'bg-teal-50 text-teal-700',
  cream: 'bg-cream-200 text-teal-800',
  dark: 'bg-teal-800 text-cream-100',
  glass: 'bg-teal-950/45 text-cream-100 backdrop-blur-md',
}

export function Badge({ children, tone = 'teal', className }: { children: ReactNode; tone?: keyof typeof tones; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[0.68rem] font-semibold uppercase tracking-[0.14em]', tones[tone], className)}>
      {children}
    </span>
  )
}
