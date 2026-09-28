import { m } from 'framer-motion'
import { BibleStudyCard } from '../components/cards/BibleStudyCard'
import { Icon } from '../components/brand/Icon'
import { FinalCTA } from '../components/sections/FinalCTA'
import { CmsSections } from '../components/sections/CmsSections'
import { PageHero } from '../components/sections/PageHero'
import { ScheduleList } from '../components/sections/ScheduleList'
import { Accordion } from '../components/ui/Accordion'
import { CTAButton } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { PlaceholderBadge, PlaceholderNotice } from '../components/ui/PlaceholderBadge'
import { Reveal, staggerChild, staggerParent } from '../components/ui/Reveal'
import { SectionHeader } from '../components/ui/SectionHeader'
import { bibleStudyFaqs, howItWorks } from '../content/bibleStudy'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { participationLabel } from '../lib/format'
import { contentService } from '../services'

export default function BibleStudy() {
  useSeo({
    title: 'Bible Study',
    description: 'Join a Global Harvest Bible study — small groups online and in person reading Scripture together, asking honest questions and growing as disciples.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: bibleStudyFaqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    },
  })
  const study = useAsync(() => contentService.currentStudy(), [])
  const topics = useAsync(() => contentService.studyTopics(), [])
  const schedule = useAsync(() => contentService.studySchedule(), [])
  const s = study.data

  return (
    <>
      <PageHero
        cms="bible-study"
        eyebrow="Bible Study"
        title={
          <>
            Understand
            <br />
            God’s Word.
          </>
        }
        description="Small groups reading Scripture carefully and honestly — so that it takes root, changes us, and sends us out."
        image="study-group-table"
        imagePosition="50% 35%"
        aside={
          <div className="rounded-3xl border border-cream-100/15 bg-teal-950/40 p-7 backdrop-blur-md">
            <p className="eyebrow text-coral-300">At a glance</p>
            <ul className="mt-5 space-y-4 text-cream-100/85">
              {(
                [
                  ['users', 'Small groups, all welcome'],
                  ['monitor', 'Online & in person'],
                  ['calendar', 'Weekly rhythm'],
                  ['heart', 'Free to join'],
                ] as const
              ).map(([icon, label]) => (
                <li key={label} className="flex items-center gap-3">
                  <Icon name={icon} size={20} className="text-coral-300" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <CTAButton to="/register?interest=bible-study" size="lg">
          Join a Bible Study
        </CTAButton>
        <CTAButton href="#current-study" variant="outline-light" size="lg" icon={null}>
          Current study
        </CTAButton>
      </PageHero>

      <section id="current-study" className="scroll-mt-24 bg-cream-100 py-24 sm:py-32" aria-labelledby="current-title">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift">
              <Img name={s?.image ?? 'bible-golden-light'} sizes="(min-width: 1024px) 40vw, 100vw" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/85 via-teal-950/10" />
              <div className="absolute inset-x-8 bottom-8 text-cream-100">
                <p className="eyebrow text-coral-300">{s?.cadence}</p>
                <p className="mt-3 font-display text-4xl font-bold tracking-tight">{s?.book}</p>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow flex items-center gap-3 text-coral-700">
                <span aria-hidden="true" className="h-px w-8 bg-coral-600/60" />
                Current study
              </p>
              {s?.isPlaceholder ? <PlaceholderBadge label="Sample curriculum" /> : null}
            </div>
            <Reveal>
              <h2 id="current-title" className="display-md mt-5 text-teal-800">
                {s?.title}
                <span className="block text-coral-600">{s?.subtitle}</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-teal-900/75">{s?.description}</p>
              <p className="mt-4 text-sm font-medium text-teal-900/60">Format: {s ? participationLabel[s.format] : ''}</p>
            </Reveal>
            <m.ol className="mt-10 grid gap-3 sm:grid-cols-2" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {s?.sessions.map((session) => (
                <m.li key={session.number} variants={staggerChild} className="flex gap-4 rounded-2xl border border-teal-800/10 bg-cream-50 p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-800 font-display text-sm font-semibold text-cream-100">{session.number}</span>
                  <div>
                    <p className="font-display font-semibold text-teal-800">{session.title}</p>
                    <p className="mt-0.5 text-sm text-coral-700">{session.passage}</p>
                  </div>
                </m.li>
              ))}
            </m.ol>
          </div>
        </div>
      </section>

      <section className="bg-cream-200/60 py-24 sm:py-32" aria-labelledby="topics-title">
        <div className="container-page">
          <SectionHeader id="topics-title" eyebrow="Study topics" title="Themes we explore together." description="Alongside books of the Bible, our groups work through topical series that build a strong foundation for life and faith." />
          <m.ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-5% 0px' }}>
            {topics.data?.map((t, i) => (
              <m.li key={t.slug} variants={staggerChild}>
                <BibleStudyCard topic={t} index={i} />
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="schedule-title">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader id="schedule-title" eyebrow="Weekly schedule" title="Find a time that fits." description="Groups meet at different times so people in many time zones can take part." />
          </div>
          <div className="lg:col-span-8">
            <PlaceholderNotice className="mb-8">These times are a sample weekly rhythm. The confirmed schedule will be published here and sent to registered members.</PlaceholderNotice>
            <Reveal>{schedule.data ? <ScheduleList items={schedule.data} /> : null}</Reveal>
          </div>
        </div>
      </section>

      <section className="on-dark bg-teal-800 py-24 text-cream-100 sm:py-32" aria-labelledby="how-title">
        <div className="container-page">
          <SectionHeader id="how-title" tone="light" eyebrow="How it works" title="Four simple steps." align="center" />
          <m.ol className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {howItWorks.map((step, i) => (
              <m.li key={step.title} variants={staggerChild} className="relative rounded-3xl border border-cream-100/12 p-8">
                <span className="font-display text-6xl font-bold text-coral-400/90">{i + 1}</span>
                <h3 className="mt-6 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-cream-100/70">{step.body}</p>
              </m.li>
            ))}
          </m.ol>
        </div>
      </section>

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="options-title">
        <div className="container-page">
          <SectionHeader id="options-title" eyebrow="Online or in person" title="Join the way that works for you." />
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {[
              {
                icon: 'monitor' as const,
                title: 'Online groups',
                image: 'students-park-bibles',
                points: ['Join from anywhere with an internet connection', 'Groups across multiple time zones', 'Video call with small breakout discussions'],
              },
              {
                icon: 'pin' as const,
                title: 'In-person groups',
                image: 'bible-study-outdoor',
                points: ['Meet face to face in homes and shared spaces', 'Share a meal and build deep friendships', 'Local groups announced as they launch'],
              },
            ].map((opt, i) => (
              <Reveal key={opt.title} delay={i * 0.1} className="group overflow-hidden rounded-[2rem] bg-cream-50 ring-1 ring-teal-800/10">
                <div className="aspect-[16/8] overflow-hidden">
                  <Img name={opt.image} decorative sizes="(min-width: 1024px) 50vw, 100vw" className="size-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-8 sm:p-10">
                  <div className="flex items-center gap-3">
                    <Icon name={opt.icon} size={26} className="text-coral-600" />
                    <h3 className="font-display text-2xl font-semibold text-teal-800">{opt.title}</h3>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {opt.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-teal-900/75">
                        <Icon name="check" size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-teal-600" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-100 pb-24 sm:pb-32" aria-labelledby="study-register-title">
        <div className="container-page">
          <Reveal className="grain relative overflow-hidden rounded-[2.5rem] bg-coral-400 px-8 py-14 sm:px-14 sm:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="eyebrow text-teal-900">Bible Study registration</p>
                <h2 id="study-register-title" className="display-md mt-4 text-teal-900">
                  Save your seat at the table.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-teal-900/80">
                  Register once and we’ll match you with a group — online or in person — that fits your time zone and stage of life.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
                <CTAButton to="/register?interest=bible-study" variant="dark" size="lg">
                  Join a Bible Study
                </CTAButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream-200/60 py-24 sm:py-32" aria-labelledby="faq-title">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader id="faq-title" eyebrow="FAQ" title="Questions, answered." description="Can’t find what you’re looking for?" />
            <Reveal className="mt-6">
              <CTAButton to="/contact?category=bible-study" variant="link">
                Contact us
              </CTAButton>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-8">
            <Accordion items={bibleStudyFaqs} />
          </Reveal>
        </div>
      </section>

      <CmsSections slug="bible-study" />
      <FinalCTA />
    </>
  )
}
