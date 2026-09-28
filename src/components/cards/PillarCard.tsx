import { Link } from 'react-router-dom'
import type { Pillar } from '../../content/pillars'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'
import { useDrawOnView } from '../motion/useDrawOnView'

interface PillarCardProps {
  pillar: Pillar
  index: number
  tone?: 'light' | 'dark'
  className?: string
}

/** One of the four pillars: Bible Study · Prayer · Community · Global Mission. */
export function PillarCard({ pillar, index, tone = 'light', className }: PillarCardProps) {
  const dark = tone === 'dark'
  const ref = useDrawOnView<HTMLElement>({ delay: index * 180 })
  return (
    <article
      ref={ref}
      className={cn(
        'group relative flex h-full flex-col p-7 transition duration-500 ease-(--ease-out-soft) sm:p-8',
        dark ? 'text-cream-100 hover:bg-teal-700/60' : 'text-teal-800 hover:bg-cream-50',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'grid size-16 place-items-center rounded-full border transition duration-500',
            dark ? 'border-cream-100/25 text-coral-300 group-hover:border-coral-300 group-hover:bg-coral-400 group-hover:text-teal-950' : 'border-teal-800/15 text-teal-700 group-hover:border-coral-400 group-hover:bg-coral-400 group-hover:text-teal-950',
          )}
        >
          <Icon name={pillar.icon} size={30} strokeWidth={1.3} data-draw />
        </span>
        <span className={cn('font-display text-sm font-semibold tabular-nums', dark ? 'text-cream-100/40' : 'text-teal-800/35')}>0{index + 1}</span>
      </div>
      <h3 className="mt-10 font-display text-2xl font-semibold tracking-tight">
        <Link to={pillar.to} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {pillar.title}
        </Link>
      </h3>
      <p className={cn('mt-1 font-display text-sm font-medium uppercase tracking-[0.16em]', dark ? 'text-coral-300' : 'text-coral-700')}>{pillar.tagline}</p>
      <p className={cn('mt-5 leading-relaxed', dark ? 'text-cream-100/70' : 'text-teal-900/70')}>{pillar.description}</p>
      <span className={cn('mt-auto inline-flex items-center gap-2 pt-8 font-display text-[0.75rem] font-semibold uppercase tracking-[0.14em]', dark ? 'text-cream-100' : 'text-teal-800')}>
        Explore
        <Icon name="arrowRight" size={16} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1.5" />
      </span>
    </article>
  )
}
