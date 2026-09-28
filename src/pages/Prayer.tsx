import { m } from 'framer-motion'
import { Icon } from '../components/brand/Icon'
import { PrayerRequestForm } from '../components/forms/PrayerRequestForm'
import { CmsSections } from '../components/sections/CmsSections'
import { PageHero } from '../components/sections/PageHero'
import { ScheduleList } from '../components/sections/ScheduleList'
import { ScriptureBand } from '../components/sections/ScriptureBand'
import { CTAButton } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { PlaceholderBadge, PlaceholderNotice } from '../components/ui/PlaceholderBadge'
import { Reveal, staggerChild, staggerParent } from '../components/ui/Reveal'
import { SectionHeader } from '../components/ui/SectionHeader'
import { answeredPrayers, prayerFocus, prayerGatherings, prayerResources } from '../content/prayer'
import { useSeo } from '../hooks/useSeo'

const focusIcons = ['community', 'pin', 'globe', 'shield'] as const

export default function Prayer() {
  useSeo({
    title: 'Prayer',
    description: 'Pray with Global Harvest: weekly prayer gatherings, a monthly night of prayer for the nations, and a confidential way to request prayer.',
  })

  return (
    <>
      <PageHero
        cms="prayer"
        eyebrow="Prayer"
        title={
          <>
            Seek God
            <br />
            together.
          </>
        }
        description="Prayer is where everything begins. We gather to worship, to intercede for one another and to pray for the nations — and we would be honoured to pray for you."
        image="nugget-point-sunset"
        imagePosition="50% 40%"
      >
        <CTAButton href="#request" size="lg">
          Request Prayer
        </CTAButton>
        <CTAButton to="/register?interest=prayer" variant="outline-light" size="lg" icon={null}>
          Join the prayer group
        </CTAButton>
      </PageHero>

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="gatherings-title">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader id="gatherings-title" eyebrow="Weekly prayer gatherings" title="A rhythm of prayer." description="Join as often as you can. Every gathering is open to everyone." />
          </div>
          <div className="lg:col-span-8">
            <PlaceholderNotice className="mb-8">Days and times shown are a sample rhythm and will be confirmed before launch.</PlaceholderNotice>
            <Reveal>
              <ScheduleList items={prayerGatherings} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="on-dark bg-teal-800 py-24 text-cream-100 sm:py-32" aria-labelledby="calendar-title">
        <div className="container-page">
          <SectionHeader id="calendar-title" tone="light" eyebrow="Prayer calendar" title="This month, we pray for…" description="Each week has a focus, so our whole community prays with one heart." />
          <m.ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {prayerFocus.map((w, i) => (
              <m.li key={w.week} variants={staggerChild} className="relative flex flex-col overflow-hidden rounded-3xl border border-cream-100/12 bg-teal-900/40 p-7">
                <span className="eyebrow text-coral-300">{w.week}</span>
                <Icon name={focusIcons[i % focusIcons.length]} size={30} strokeWidth={1.3} className="mt-8 text-cream-100/80" />
                <h3 className="mt-5 font-display text-2xl font-semibold">{w.focus}</h3>
                <p className="mt-3 leading-relaxed text-cream-100/70">{w.prompt}</p>
              </m.li>
            ))}
          </m.ol>
        </div>
      </section>

      <section id="request" className="scroll-mt-20 bg-cream-100 py-24 sm:py-32" aria-labelledby="request-title">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader id="request-title" eyebrow="Prayer requests" title="How can we pray for you?" description="Share what’s on your heart. Our prayer team will pray for you — privately and with care." />
            <Reveal className="mt-10 space-y-5" delay={0.1}>
              {[
                { icon: 'lock' as const, title: 'Confidential', body: 'Requests are shared only with our prayer team. They are never published on this website.' },
                { icon: 'heart' as const, title: 'Prayed for', body: 'Every request is prayed for at our weekly gathering.' },
                { icon: 'message' as const, title: 'Follow-up if you want it', body: 'Tick the box and someone will get in touch by email.' },
              ].map((it) => (
                <div key={it.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-coral-100 text-coral-700">
                    <Icon name={it.icon} size={20} />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-teal-800">{it.title}</h3>
                    <p className="mt-0.5 leading-relaxed text-teal-900/70">{it.body}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7" delay={0.1}>
            <div className="rounded-[2rem] bg-cream-50 p-6 shadow-soft ring-1 ring-teal-800/10 sm:p-10">
              <PrayerRequestForm />
            </div>
          </Reveal>
        </div>
      </section>

      <ScriptureBand text="Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." reference="Philippians 4:6" />

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="answered-title">
        <div className="container-page">
          <SectionHeader id="answered-title" eyebrow="Answered prayers" title="Stories of God’s faithfulness." description="Shared only with the explicit permission of the people involved." />
          <m.ul className="mt-14 grid gap-5 md:grid-cols-3" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {answeredPrayers.map((a) => (
              <m.li key={a.id} variants={staggerChild} className="flex flex-col items-start rounded-3xl border border-dashed border-teal-800/25 p-8">
                <PlaceholderBadge />
                <h3 className="mt-6 font-display text-xl font-semibold text-teal-800">{a.title}</h3>
                <p className="mt-3 leading-relaxed text-teal-900/70">{a.body}</p>
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      <section className="bg-cream-200/60 py-24 sm:py-32" aria-labelledby="prayer-resources-title">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeader id="prayer-resources-title" eyebrow="Prayer resources" title="Learn to pray." />
            <ul className="mt-10 divide-y divide-teal-800/10 border-y border-teal-800/10">
              {prayerResources.map((r, i) => (
                <Reveal as="li" key={r.title} delay={i * 0.06} className="grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-teal-800">{r.title}</h3>
                    <p className="mt-1 text-teal-900/70">{r.description}</p>
                  </div>
                  <p className="eyebrow text-coral-700">{r.passage}</p>
                </Reveal>
              ))}
            </ul>
            <Reveal className="mt-8">
              <CTAButton to="/resources" variant="link">
                All resources
              </CTAButton>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-5" delay={0.1}>
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-[2rem]">
              <Img name="bible-soft-light" decorative sizes="(min-width: 1024px) 40vw, 100vw" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/95 via-teal-950/40 to-transparent" />
              <div className="on-dark absolute inset-x-0 bottom-0 p-8 text-cream-100 sm:p-10">
                <p className="eyebrow text-coral-300">Join the prayer group</p>
                <p className="mt-4 font-display text-3xl leading-tight font-semibold">Pray with a community that prays for the world.</p>
                <div className="mt-8">
                  <CTAButton to="/register?interest=prayer">Join the Prayer Group</CTAButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <CmsSections slug="prayer" />
    </>
  )
}
