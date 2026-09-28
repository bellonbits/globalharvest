import { participationLabel } from '../../lib/format'
import type { ScheduleItem } from '../../types'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'
import { PlaceholderBadge } from '../ui/PlaceholderBadge'

/** Weekly rhythm list used by Bible Study and Prayer. */
export function ScheduleList({ items, tone = 'light', className }: { items: ScheduleItem[]; tone?: 'light' | 'dark'; className?: string }) {
  const dark = tone === 'dark'
  return (
    <ol className={cn('divide-y', dark ? 'divide-cream-100/12 border-y border-cream-100/12' : 'divide-teal-800/10 border-y border-teal-800/10', className)}>
      {items.map((item) => (
        <li key={item.title} className="grid gap-3 py-7 sm:grid-cols-[180px_1fr_auto] sm:items-center sm:gap-8">
          <div>
            <p className={cn('font-display text-2xl font-semibold', dark ? 'text-cream-100' : 'text-teal-800')}>{item.day}</p>
            <p className={cn('mt-1 flex items-center gap-2 text-sm', dark ? 'text-cream-100/65' : 'text-teal-900/60')}>
              <Icon name="clock" size={15} /> {item.time}
            </p>
          </div>
          <div>
            <h3 className={cn('font-display text-lg font-semibold', dark ? 'text-cream-100' : 'text-teal-800')}>{item.title}</h3>
            <p className={cn('mt-1 leading-relaxed', dark ? 'text-cream-100/70' : 'text-teal-900/70')}>{item.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            <span className={cn('rounded-full px-3 py-1 font-display text-xs font-semibold uppercase tracking-[0.12em]', dark ? 'bg-cream-100/10 text-cream-100' : 'bg-teal-50 text-teal-700')}>
              {participationLabel[item.format]}
            </span>
            {item.isPlaceholder ? <PlaceholderBadge label="Sample time" tone={dark ? 'light' : 'dark'} /> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
