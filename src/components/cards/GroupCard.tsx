import { participationLabel } from '../../lib/format'
import type { Group } from '../../types'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'
import { CTAButton } from '../ui/Button'
import { Img } from '../ui/Img'
import { PlaceholderBadge } from '../ui/PlaceholderBadge'

export function GroupCard({ group, className }: { group: Group; className?: string }) {
  return (
    <article className={cn('group flex h-full flex-col', className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
        {group.image ? (
          <Img name={group.image} decorative sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="size-full object-cover transition duration-700 ease-(--ease-out-soft) group-hover:scale-[1.05]" />
        ) : (
          <div className="size-full bg-teal-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/70 via-teal-950/10 to-transparent" />
        <p className="absolute bottom-5 left-5 eyebrow text-cream-100">{group.audience}</p>
      </div>
      <div className="flex flex-1 flex-col pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-teal-800">{group.name}</h3>
          {group.isPlaceholder ? <PlaceholderBadge label="Times TBC" /> : null}
        </div>
        <p className="mt-3 leading-relaxed text-teal-900/70">{group.description}</p>
        <p className="mt-4 flex items-center gap-2 text-sm text-teal-900/70">
          <Icon name="calendar" size={16} className="text-coral-600" />
          {group.meets} · {participationLabel[group.format]}
        </p>
        <div className="mt-auto pt-6">
          <CTAButton to={`/register?interest=${group.interest}`} variant="link">
            Join this group
          </CTAButton>
        </div>
      </div>
    </article>
  )
}
