import { Link } from 'react-router-dom'
import type { StudyGuide } from '../../types'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'
import { GUIDE_KIND_LABEL } from '../guide/guideMeta'
import { Img } from '../ui/Img'
import { PlaceholderBadge } from '../ui/PlaceholderBadge'

/** Booklet-cover card linking to a study guide. */
export function GuideCard({ guide, className }: { guide: StudyGuide; className?: string }) {
  return (
    <article className={cn('group relative flex h-full flex-col', className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-teal-950 shadow-[0_24px_40px_-24px_rgb(4_39_46/0.6)] ring-1 ring-teal-950/10 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_30px_50px_-24px_rgb(4_39_46/0.7)]">
        {guide.coverImage ? <Img name={guide.coverImage} decorative sizes="(min-width: 1024px) 25vw, 50vw" className="absolute inset-0 size-full object-cover grayscale-[35%] transition duration-700 group-hover:scale-105" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(2_27_32/0.5),rgb(2_27_32/0.15)_40%,rgb(2_27_32/0.88))]" />
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 to-transparent" />
        <div className="absolute inset-0 flex flex-col p-6 text-cream-100">
          <p className="font-display text-[0.6rem] font-semibold tracking-[0.26em] uppercase opacity-85">{guide.series ?? GUIDE_KIND_LABEL[guide.kind]}</p>
          <p className="mt-auto text-[1.7rem] leading-[1.02] font-semibold" style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif" }}>
            {guide.title}
          </p>
          {guide.subtitle ? <p className="mt-2 text-sm italic opacity-80" style={{ fontFamily: "'Source Serif 4 Variable', Georgia, serif" }}>{guide.subtitle}</p> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow text-coral-700">{GUIDE_KIND_LABEL[guide.kind]}</span>
          {guide.isPlaceholder ? <PlaceholderBadge label="Sample" /> : null}
        </div>
        <h3 className="mt-1.5 font-display text-lg font-semibold text-teal-800">
          <Link to={`/guides/${guide.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {guide.title}
          </Link>
        </h3>
        {guide.summary ? <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-teal-900/70">{guide.summary}</p> : null}
        <span className="mt-3 inline-flex items-center gap-1.5 font-display text-[0.72rem] font-semibold tracking-[0.14em] text-teal-800 uppercase">
          Open guide <Icon name="arrowRight" size={14} strokeWidth={2} className="transition group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  )
}
