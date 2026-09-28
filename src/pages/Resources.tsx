import { useMemo, useState } from 'react'
import { ResourceCard } from '../components/cards/ResourceCard'
import { GuideShelf } from '../components/sections/GuideShelf'
import { PageHero } from '../components/sections/PageHero'
import { CTAButton } from '../components/ui/Button'
import { PlaceholderNotice } from '../components/ui/PlaceholderBadge'
import { Reveal } from '../components/ui/Reveal'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { cn } from '../lib/cn'
import { contentService } from '../services'

export default function Resources() {
  useSeo({
    title: 'Resources',
    description: 'Reading plans, study guides, prayer resources and teaching from Global Harvest to help you grow in God’s Word.',
  })
  const { data } = useAsync(() => contentService.resources(), [])
  const [topic, setTopic] = useState('All')
  const topics = useMemo(() => ['All', ...Array.from(new Set((data ?? []).map((r) => r.topic)))], [data])
  const list = (data ?? []).filter((r) => topic === 'All' || r.topic === topic)

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title={
          <>
            Tools for
            <br />
            the journey.
          </>
        }
        description="Reading plans, study guides, prayer helps and teaching to help you grow — on your own, with your family or in your group."
        image="bible-golden-light"
      />

      <section className="bg-cream-100 py-16 sm:py-24" aria-label="Resource library">
        <div className="container-page">
          <div role="group" aria-label="Filter by topic" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={topic === t}
                onClick={() => setTopic(t)}
                className={cn(
                  'shrink-0 rounded-full border px-5 py-2.5 font-display text-sm font-semibold transition',
                  topic === t ? 'border-teal-800 bg-teal-800 text-cream-100' : 'border-teal-800/15 text-teal-800 hover:border-teal-800/50',
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <PlaceholderNotice className="mt-8">The resource library is being prepared. Titles below show what’s planned. Files and links will be added as they’re published.</PlaceholderNotice>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r, i) => (
              <Reveal as="li" key={r.slug} delay={(i % 3) * 0.06}>
                <ResourceCard resource={r} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <GuideShelf eyebrow="Study guides" title="Guides for study and prayer." className="bg-cream-100 pt-0" />

      <section className="bg-cream-200/60 py-20" aria-labelledby="suggest-title">
        <div className="container-page flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <h2 id="suggest-title" className="display-md text-teal-800">
              Looking for something specific?
            </h2>
            <p className="mt-3 text-lg text-teal-900/70">Tell us what would help you grow and we’ll point you in the right direction.</p>
          </div>
          <CTAButton to="/contact">Ask us</CTAButton>
        </div>
      </section>
    </>
  )
}
