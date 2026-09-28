import { GuideCard } from '../cards/GuideCard'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/SectionHeader'
import { useAsync } from '../../hooks/useAsync'
import { guideService } from '../../services/guideService'
import type { GuideKind } from '../../types'

/** A shelf of study-guide booklets (Bible Study, Prayer, Resources pages). */
export function GuideShelf({ kind, eyebrow, title, description, className = 'bg-cream-100' }: { kind?: GuideKind; eyebrow: string; title: string; description?: string; className?: string }) {
  const { data } = useAsync(() => guideService.list(kind), [kind])
  if (!data?.length) return null
  return (
    <section className={`${className} py-24 sm:py-32`} aria-label={title}>
      <div className="container-page">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((g, i) => (
            <Reveal as="li" key={g.slug} delay={(i % 4) * 0.06}>
              <GuideCard guide={g} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
