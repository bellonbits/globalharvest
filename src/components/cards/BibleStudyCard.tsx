import type { StudyTopic } from '../../types'
import { cn } from '../../lib/cn'

/** A Bible study topic tile. */
export function BibleStudyCard({ topic, index, className }: { topic: StudyTopic; index: number; className?: string }) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-teal-800/10 bg-cream-50 p-7 transition duration-500 ease-(--ease-out-soft) hover:-translate-y-1 hover:border-teal-600/30 hover:shadow-lift',
        className,
      )}
    >
      <span aria-hidden="true" className="absolute -top-6 -right-2 font-display text-[7rem] leading-none font-bold text-teal-800/[0.04] transition group-hover:text-coral-400/15">
        {String(index + 1).padStart(2, '0')}
      </span>
      <h3 className="relative font-display text-xl font-semibold text-teal-800">{topic.title}</h3>
      <p className="relative mt-3 leading-relaxed text-teal-900/70">{topic.description}</p>
      {topic.keyPassage ? (
        <p className="relative mt-auto pt-6 font-display text-xs font-semibold uppercase tracking-[0.18em] text-coral-700">{topic.keyPassage}</p>
      ) : null}
    </article>
  )
}
