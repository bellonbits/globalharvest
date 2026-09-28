import { resourceTypeLabel } from '../../content/resources'
import type { Resource, ResourceType } from '../../types'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from '../brand/Icon'
import { PlaceholderBadge } from '../ui/PlaceholderBadge'

const typeIcon: Record<ResourceType, IconName> = {
  'reading-plan': 'bookmark',
  guide: 'compass',
  article: 'file',
  audio: 'headphones',
  video: 'play',
  download: 'download',
}

export function ResourceCard({ resource, className }: { resource: Resource; className?: string }) {
  const available = Boolean(resource.href)
  return (
    <article className={cn('group relative flex h-full flex-col rounded-3xl border border-teal-800/10 bg-cream-50 p-7 transition duration-500 hover:border-teal-600/30 hover:shadow-soft', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-teal-800 text-coral-300">
          <Icon name={typeIcon[resource.type]} size={22} />
        </span>
        <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-teal-900/55">{resourceTypeLabel[resource.type]}</span>
      </div>
      <p className="mt-7 eyebrow text-coral-700">{resource.topic}</p>
      <h3 className="mt-2 font-display text-xl font-semibold text-teal-800">
        {available ? (
          <a href={resource.href} className="after:absolute after:inset-0 after:content-['']">
            {resource.title}
          </a>
        ) : (
          resource.title
        )}
      </h3>
      <p className="mt-3 leading-relaxed text-teal-900/70">{resource.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        {available ? (
          <span className="inline-flex items-center gap-2 font-display text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-teal-800">
            Open <Icon name="arrowUpRight" size={16} strokeWidth={2} />
          </span>
        ) : (
          <span className="text-sm font-medium text-teal-900/55">Coming soon</span>
        )}
        {resource.isPlaceholder ? <PlaceholderBadge /> : null}
      </div>
    </article>
  )
}
