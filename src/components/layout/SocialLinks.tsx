import { site } from '../../config/site'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'

/** Social icons. Platforms without a URL render as "coming soon" (not links). */
export function SocialLinks({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-2', className)} aria-label="Social media">
      {site.social.map((s) => {
        const cls = cn(
          'grid size-11 place-items-center rounded-full border transition',
          tone === 'light' ? 'border-cream-100/20 text-cream-100/85' : 'border-teal-800/15 text-teal-800',
        )
        return (
          <li key={s.platform}>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(cls, tone === 'light' ? 'hover:bg-cream-100 hover:text-teal-800' : 'hover:bg-teal-800 hover:text-cream-100')}
                aria-label={`${s.label} (opens in a new tab)`}
              >
                <Icon name={s.platform} size={19} />
              </a>
            ) : (
              <span className={cn(cls, 'cursor-default opacity-45')} title={`${s.label} — coming soon`}>
                <Icon name={s.platform} size={19} />
                <span className="sr-only">{s.label} — coming soon</span>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
