import { m } from 'framer-motion'
import { GroupCard } from '../components/cards/GroupCard'
import { FinalCTA } from '../components/sections/FinalCTA'
import { CmsSections } from '../components/sections/CmsSections'
import { PageHero } from '../components/sections/PageHero'
import { CTAButton } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { Reveal, staggerChild, staggerParent } from '../components/ui/Reveal'
import { SectionHeader } from '../components/ui/SectionHeader'
import { audiences, communityValues } from '../content/community'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { contentService } from '../services'

export default function Community() {
  useSeo({
    title: 'Community',
    description: 'Find your people at Global Harvest — Bible study groups, prayer groups, young adults, men’s and women’s groups and mission groups, online and in person.',
  })
  const groups = useAsync(() => contentService.groups(), [])

  return (
    <>
      <PageHero
        cms="community"
        eyebrow="Community"
        title={
          <>
            Grow together.
            <br />
            Nobody walks alone.
          </>
        }
        description="Faith grows best in friendship. Our groups are places where you are known, prayed for, encouraged and challenged."
        image="students-park-bibles"
        imagePosition="50% 40%"
      >
        <CTAButton to="/register?interest=community" size="lg">
          Join a Group
        </CTAButton>
        <CTAButton href="#groups" variant="outline-light" size="lg" icon={null}>
          Explore groups
        </CTAButton>
      </PageHero>

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="who-join-title">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader id="who-join-title" eyebrow="Who can join?" title="There’s a place for you." description="Global Harvest brings together people at every stage of life and faith." />
            <Reveal className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-[2rem] lg:block">
              <Img name="bible-study-outdoor" sizes="40vw" className="size-full object-cover" />
            </Reveal>
          </div>
          <m.ul className="grid gap-px self-start overflow-hidden rounded-[2rem] bg-teal-800/10 sm:grid-cols-2 lg:col-span-7" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {audiences.map((a, i) => (
              <m.li key={a.title} variants={staggerChild} className={`bg-cream-50 p-7 ${i === audiences.length - 1 ? 'sm:col-span-2' : ''}`}>
                <h3 className="font-display text-xl font-semibold text-teal-800">{a.title}</h3>
                <p className="mt-2 leading-relaxed text-teal-900/70">{a.body}</p>
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      <section id="groups" className="scroll-mt-20 bg-cream-200/60 py-24 sm:py-32" aria-labelledby="groups-title">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeader id="groups-title" eyebrow="Community groups" title="Find your group." description="Every group is built around Scripture, prayer and genuine friendship." />
            <Reveal>
              <CTAButton to="/register?interest=community" variant="secondary">
                Register interest
              </CTAButton>
            </Reveal>
          </div>
          <m.ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-5% 0px' }}>
            {groups.data?.map((g) => (
              <m.li key={g.slug} variants={staggerChild}>
                <GroupCard group={g} />
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      <section className="on-dark bg-teal-800 py-24 text-cream-100 sm:py-32" aria-labelledby="culture-title">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader id="culture-title" tone="light" eyebrow="Our culture" title="What you can expect." />
          </div>
          <m.dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {communityValues.map((v) => (
              <m.div key={v.title} variants={staggerChild} className="border-t border-cream-100/15 pt-6">
                <dt className="font-display text-2xl font-semibold text-coral-300">{v.title}</dt>
                <dd className="mt-3 leading-relaxed text-cream-100/75">{v.body}</dd>
              </m.div>
            ))}
          </m.dl>
        </div>
      </section>

      <CmsSections slug="community" />
      <FinalCTA title="Come as you are" subtitle="Belong. Believe. Become." ctaLabel="Join a Group" ctaTo="/register?interest=community" />
    </>
  )
}
