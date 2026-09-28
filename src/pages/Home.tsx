import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { animate, onScroll } from 'animejs'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { EventCard } from '../components/cards/EventCard'
import { PillarCard } from '../components/cards/PillarCard'
import { TestimonialCard } from '../components/cards/TestimonialCard'
import { GlobalMap } from '../components/brand/GlobalMap'
import { Icon } from '../components/brand/Icon'
import { SentMark } from '../components/brand/SentMark'
import { Ribbon } from '../components/motion/Ribbon'
import { FinalCTA } from '../components/sections/FinalCTA'
import { CTAButton } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { PlaceholderBadge, PlaceholderNotice } from '../components/ui/PlaceholderBadge'
import { Reveal, staggerChild, staggerParent } from '../components/ui/Reveal'
import { SectionHeader } from '../components/ui/SectionHeader'
import { site } from '../config/site'
import { pillars } from '../content/pillars'
import { prayerGatherings } from '../content/prayer'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { useAnimeOnView } from '../lib/anime'
import { formatDate } from '../lib/format'
import { contentService, eventService } from '../services'
import { useCmsPage } from '../hooks/useCmsPage'
import { CmsSections } from '../components/sections/CmsSections'

const ease = [0.22, 1, 0.36, 1] as const

function Hero() {
  const reduce = useReducedMotion()
  const { hero } = useCmsPage('home')
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%'])
  const markY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-12%'])

  const enter = (delay: number, y = 28) =>
    reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 1.1, delay, ease } }

  return (
    <section ref={ref} className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-teal-900 text-cream-100" aria-labelledby="hero-title">
      <m.div className="absolute inset-0 -z-30" style={{ y: imageY }}>
        <m.div className="size-full" {...(reduce ? {} : { initial: { scale: 1.12 }, animate: { scale: 1.02 }, transition: { duration: 2.4, ease } })}>
          <Img name="hero-sunset-coast" priority decorative sizes="100vw" className="size-full object-cover" style={{ objectPosition: '50% 30%' }} />
        </m.div>
      </m.div>
      {/* Recolour the lower half of the photo toward ocean teal, then deepen it for legible text. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,transparent_30%,var(--color-teal-600)_46%)] mix-blend-color" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(242_138_104/0.35)_0%,rgb(242_138_104/0.06)_30%,rgb(4_39_46/0.5)_58%,rgb(4_39_46/0.96)_90%)]"
      />
      <GlobalMap decorative lights={16} className="pointer-events-none absolute bottom-[-4%] left-1/2 -z-10 w-[190%] max-w-none -translate-x-1/2 text-cream-100/[0.13] sm:w-[130%] lg:w-[105%]" />

      <div className="container-page flex flex-1 flex-col pt-28 pb-10 sm:pt-32 lg:pb-14">
        <m.div className="flex items-center justify-between gap-6" {...enter(0.1, 12)}>
          <p className="eyebrow flex items-center gap-3 text-teal-900">
            <span aria-hidden="true" className="h-px w-8 bg-teal-900/60" />
            Welcome to Global Harvest
          </p>
          <p className="eyebrow hidden text-teal-900/80 md:block">Pray | Study | Share the Gospel</p>
        </m.div>

        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <m.h1 id="hero-title" className="font-display text-[clamp(0.95rem,2.2vw,1.75rem)] font-semibold tracking-[0.42em] whitespace-nowrap text-teal-900 uppercase" {...enter(0.2, 16)}>
            <span className="-mr-[0.42em]">Global Harvest</span>
          </m.h1>
          <m.div className="mt-2 w-full max-w-[min(100%,58rem,calc((100svh-30rem)*1.55))] min-w-[min(100%,20rem)]" style={{ y: markY }}>
            <SentMark letters="var(--color-cream-100)" background="transparent" animated intro introImmediate introDelay={250} title="SENT — the Global Harvest mark: a whale swimming through the word SENT" />
          </m.div>
        </div>

        <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <m.p className="display-md text-cream-100 lg:col-span-6" {...enter(0.55)}>
            {hero?.title ?? (
              <>
                Growing in God’s Word.
                <br />
                <span className="text-coral-300">Reaching our world.</span>
              </>
            )}
          </m.p>
          <m.div className="lg:col-span-6 lg:pl-8" {...enter(0.7)}>
            <p className="max-w-xl text-lg leading-relaxed text-cream-100/85">
              {hero?.body ?? 'Global Harvest is a community committed to studying God’s Word, seeking God in prayer, growing together in faith, and carrying the message of Christ into the world.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <CTAButton to="/register" size="lg">
                Join Global Harvest
              </CTAButton>
              <CTAButton to="/bible-study" variant="outline-light" size="lg" icon={null}>
                Explore Bible Study
              </CTAButton>
            </div>
          </m.div>
        </div>

        <m.div className="mt-12 flex items-center justify-between gap-6 border-t border-cream-100/15 pt-6 [@media(max-height:940px)_and_(min-width:1024px)]:hidden" {...enter(0.9, 0)}>
          <p className="eyebrow text-[0.62rem] text-cream-100/70 sm:text-[0.72rem]">
            One Mission <span aria-hidden="true" className="mx-2 text-coral-300 sm:mx-3">/</span> Many Nations{' '}
            <span aria-hidden="true" className="mx-2 text-coral-300 sm:mx-3">/</span> Global Harvest
          </p>
          <a href="#who-we-are" className="group hidden items-center gap-3 text-sm text-cream-100/70 transition hover:text-cream-100 sm:flex">
            Scroll
            <span className="grid size-9 place-items-center rounded-full border border-cream-100/30 transition group-hover:border-cream-100">
              <Icon name="arrowRight" size={15} className="rotate-90" />
            </span>
          </a>
        </m.div>
      </div>
    </section>
  )
}

function WhoWeAre() {
  return (
    <section id="who-we-are" className="relative overflow-hidden bg-cream-100 py-24 sm:py-32" aria-labelledby="who-title">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <SectionHeader
            id="who-title"
            eyebrow="Who we are"
            size="lg"
            title={
              <>
                One community.
                <br />
                One Word.
                <br />
                <span className="text-coral-600">One mission.</span>
              </>
            }
          />
          <Reveal delay={0.1} className="mt-10 max-w-xl space-y-5 text-lg leading-relaxed text-teal-900/75">
            <p>
              Global Harvest is a Christian community for people who want more than a meeting. We gather — online and in person — to open the Bible, to pray, and to grow as disciples of Jesus together.
            </p>
            <p>
              You are not simply attending a Bible study. You are joining a family of believers who study Scripture, seek God, carry one another’s burdens, and live out the gospel wherever they are sent.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-4">
            <CTAButton to="/about" variant="secondary">
              Our story & beliefs
            </CTAButton>
          </Reveal>
        </div>

        <div className="relative lg:col-span-6">
          <Reveal className="relative ml-auto aspect-[4/5] w-[82%] overflow-hidden rounded-[2rem] shadow-lift">
            <Img name="bible-study-outdoor" sizes="(min-width: 1024px) 40vw, 80vw" className="size-full object-cover" />
          </Reveal>
          <Reveal delay={0.2} className="absolute bottom-[-6%] left-0 aspect-square w-[46%] overflow-hidden rounded-[1.5rem] border-[6px] border-cream-100 shadow-lift">
            <Img name="bible-golden-light" sizes="(min-width: 1024px) 22vw, 45vw" className="size-full object-cover" />
          </Reveal>
          <Reveal delay={0.35} className="absolute top-8 left-[6%] hidden rounded-2xl bg-teal-800 px-5 py-4 text-cream-100 shadow-lift sm:block">
            <p className="eyebrow text-coral-300">Study · Pray · Share</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function WhatWeDo() {
  return (
    <section className="relative bg-cream-200/60 py-24 sm:py-32" aria-labelledby="what-title">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeader id="what-title" eyebrow="What we do" title="Four pillars. One way of life." description="Everything at Global Harvest flows from four simple, deeply rooted practices." />
          <Reveal delay={0.1}>
            <CTAButton to="/join" variant="link">
              Ways to get involved
            </CTAButton>
          </Reveal>
        </div>
        <m.ul
          className="mt-16 grid overflow-hidden rounded-[2rem] border border-teal-800/10 bg-cream-100 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-10% 0px' }}
        >
          {pillars.map((p, i) => (
            <m.li key={p.key} variants={staggerChild} className="border-teal-800/10 not-last:border-b sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:not-last:border-r">
              <PillarCard pillar={p} index={i} />
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  )
}

function SentMovement() {
  const sentTo = [
    { title: 'Sent to our neighbours', body: 'Loving the people next door, down the street and across the table.' },
    { title: 'Sent to our workplaces', body: 'Bringing integrity, excellence and hope into classrooms, offices and markets.' },
    { title: 'Sent to the nations', body: 'Praying, giving and going so every people can hear the good news.' },
  ]
  // anime.js: the giant SENT opens up its letter-spacing as it scrolls through the viewport.
  const titleRef = useAnimeOnView<HTMLHeadingElement>(
    (el) => {
      animate(el, {
        letterSpacing: ['-0.09em', '0.01em'],
        ease: 'linear',
        autoplay: onScroll({ target: el, sync: 0.6, enter: 'bottom top', leave: 'top bottom' }),
      })
    },
    { immediate: true },
  )
  return (
    <section className="on-dark relative isolate overflow-hidden bg-teal-900 py-24 text-cream-100 sm:py-36" aria-labelledby="sent-title">
      <Img name="ocean-dark" decorative sizes="100vw" className="absolute inset-0 -z-20 size-full object-cover opacity-70" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-teal-900)_0%,rgb(4_39_46/0.6)_40%,rgb(4_39_46/0.85)_100%)]" />

      <div className="container-page">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-coral-300">
            <span aria-hidden="true" className="h-px w-8 bg-coral-300/70" />
            The SENT movement
          </p>
          <h2 ref={titleRef} id="sent-title" className="mt-6 font-display text-[clamp(6rem,24vw,22rem)] leading-[0.8] font-extrabold tracking-[-0.05em] text-cream-100/95">
            SENT<span className="text-coral-400">.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5" delay={0.1}>
            <p className="text-xl leading-relaxed text-cream-100/85 sm:text-2xl">
              Every follower of Jesus is sent. Not someday, not only the professionals — every one of us, right where we are.
            </p>
            <p className="mt-6 leading-relaxed text-cream-100/70">
              SENT is the heartbeat of Global Harvest. We study the Word so that it takes root in us; we pray so that we are filled with God’s love; and then we go — carrying that hope into our homes, cities and the nations.
            </p>
            <figure className="mt-10 border-l-2 border-coral-400 pl-6">
              <blockquote className="font-display text-2xl leading-snug font-medium text-cream-100">
                <p>“Go into all the world and preach the gospel to all creation.”</p>
              </blockquote>
              <figcaption className="eyebrow mt-4 text-coral-300">Mark 16:15</figcaption>
            </figure>
          </Reveal>

          <m.ol
            className="grid gap-4 lg:col-span-6 lg:col-start-7"
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-10% 0px' }}
          >
            {sentTo.map((s, i) => (
              <m.li key={s.title} variants={staggerChild} className="group flex gap-6 rounded-3xl border border-cream-100/12 bg-teal-950/30 p-7 backdrop-blur-sm transition hover:border-coral-300/50 hover:bg-teal-950/50">
                <span className="font-display text-4xl font-bold text-coral-400/80 tabular-nums">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-cream-100/70">{s.body}</p>
                </div>
              </m.li>
            ))}
            <m.li variants={staggerChild} className="pt-4">
              <CTAButton to="/mission" variant="outline-light">
                Discover Global Mission
              </CTAButton>
            </m.li>
          </m.ol>
        </div>
      </div>
    </section>
  )
}

function BibleStudySection() {
  const study = useAsync(() => contentService.currentStudy(), [])
  const topics = useAsync(() => contentService.studyTopics(), [])
  const next = useAsync(async () => (await eventService.upcoming()).find((e) => e.category === 'bible-study') ?? null, [])
  const s = study.data

  return (
    <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="study-title">
      <div className="container-page">
        <SectionHeader id="study-title" eyebrow="Bible Study" title="Open the Book. Together." description="Small groups reading Scripture carefully, asking honest questions and learning to live what we read." />

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <Reveal className="group relative overflow-hidden rounded-[2rem] bg-teal-800 text-cream-100 lg:col-span-7">
            <div className="grid h-full sm:grid-cols-2">
              <div className="relative min-h-64 overflow-hidden">
                <Img name={s?.image ?? 'bible-golden-light'} decorative sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col p-8 sm:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="eyebrow text-coral-300">Current study</p>
                  {s?.isPlaceholder ? <PlaceholderBadge label="Sample" tone="light" /> : null}
                </div>
                <h3 className="mt-4 font-display text-3xl font-bold tracking-tight">{s?.title ?? '…'}</h3>
                <p className="mt-1 font-display text-lg text-cream-100/70">{s?.subtitle}</p>
                <p className="mt-5 leading-relaxed text-cream-100/75">{s?.description}</p>
                <p className="mt-6 flex items-center gap-2 text-sm text-cream-100/70">
                  <Icon name="book" size={17} className="text-coral-300" />
                  {s?.cadence}
                </p>
                <div className="mt-auto pt-8">
                  <CTAButton to="/bible-study" variant="link-light">
                    See the full study
                  </CTAButton>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-6 lg:col-span-5">
            <Reveal delay={0.1} className="rounded-[2rem] bg-coral-100 p-8 sm:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow text-coral-800">Upcoming session</p>
                {next.data?.isPlaceholder ? <PlaceholderBadge label="Sample" /> : null}
              </div>
              {next.data ? (
                <>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-teal-800">{next.data.title}</h3>
                  <p className="mt-3 flex items-center gap-2 text-teal-900/75">
                    <Icon name="calendar" size={17} className="text-coral-700" /> {formatDate(next.data.startsAt)}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-teal-900/75">
                    <Icon name="clock" size={17} className="text-coral-700" /> {next.data.timeLabel}
                  </p>
                  <Link to={`/events/${next.data.slug}`} className="mt-6 inline-flex items-center gap-2 font-display text-[0.75rem] font-semibold tracking-[0.14em] text-teal-800 uppercase hover:text-coral-700">
                    Reserve a place <Icon name="arrowRight" size={16} strokeWidth={2} />
                  </Link>
                </>
              ) : (
                <p className="mt-4 text-teal-900/70">{next.loading ? 'Loading…' : 'The next session will be announced soon.'}</p>
              )}
            </Reveal>
            <Reveal delay={0.2} className="rounded-[2rem] border border-teal-800/10 bg-cream-50 p-8 sm:p-10">
              <p className="eyebrow text-coral-700">Study topics</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {(topics.data ?? []).map((t) => (
                  <li key={t.slug} className="rounded-full border border-teal-800/15 px-3.5 py-1.5 text-sm font-medium text-teal-800">
                    {t.title}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-12 flex justify-center">
          <CTAButton to="/register?interest=bible-study" size="lg">
            Join a Bible Study
          </CTAButton>
        </Reveal>
      </div>
    </section>
  )
}

function PrayerSection() {
  const weekly = prayerGatherings.find((g) => g.title.includes('Weekly')) ?? prayerGatherings[0]
  const items = [
    { icon: 'users' as const, title: 'Prayer meetings', body: 'Regular gatherings online and in person to worship and intercede together.' },
    { icon: 'heart' as const, title: 'Prayer requests', body: 'Share what’s on your heart. Requests are held in confidence by our prayer team.' },
    { icon: 'globe' as const, title: 'Praying for the nations', body: 'A monthly night of prayer for global mission and the persecuted church.' },
  ]
  return (
    <section className="relative overflow-hidden bg-cream-200/60 py-24 sm:py-32" aria-labelledby="prayer-title">
      <div className="container-page grid items-center gap-16 lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift">
            <Img name="bible-soft-light" sizes="(min-width: 1024px) 40vw, 100vw" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-transparent" />
            <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-cream-50/95 p-5 backdrop-blur">
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow text-coral-700">Weekly prayer gathering</p>
                {weekly.isPlaceholder ? <PlaceholderBadge label="Sample time" /> : null}
              </div>
              <p className="mt-2 font-display text-xl font-semibold text-teal-800">
                {weekly.day}s · {weekly.time}
              </p>
            </div>
          </Reveal>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <SectionHeader id="prayer-title" eyebrow="Prayer" title="Seek God. Trust Him. Walk together." description="Prayer is where everything begins. We pray for each other, for our cities and for the nations — and we’d be honoured to pray for you." />
          <m.ul className="mt-10 grid gap-5" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {items.map((it) => (
              <m.li key={it.title} variants={staggerChild} className="flex gap-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-teal-800 text-coral-300">
                  <Icon name={it.icon} size={22} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-teal-800">{it.title}</h3>
                  <p className="mt-1 leading-relaxed text-teal-900/70">{it.body}</p>
                </div>
              </m.li>
            ))}
          </m.ul>
          <Reveal className="mt-10 flex flex-wrap gap-4">
            <CTAButton to="/prayer#request" size="lg">
              Request Prayer
            </CTAButton>
            <CTAButton to="/prayer" variant="secondary" size="lg" icon={null}>
              Prayer gatherings
            </CTAButton>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function GlobalCommunity() {
  const features = [
    { icon: 'monitor' as const, title: 'Online, across time zones', body: 'Join a group from wherever you are, in a time slot that works for you.' },
    { icon: 'pin' as const, title: 'Local, in person', body: 'Gather with believers near you in homes, campuses and shared spaces.' },
    { icon: 'globe' as const, title: 'One family, many nations', body: 'Different languages and cultures, one Lord and one mission.' },
  ]
  return (
    <section className="on-dark relative overflow-hidden bg-teal-800 py-24 text-cream-100 sm:py-32" aria-labelledby="global-title">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHeader
            id="global-title"
            tone="light"
            eyebrow="Global community"
            className="lg:col-span-7"
            size="lg"
            title={
              <>
                Across countries.
                <br />
                <span className="text-coral-300">Across communities.</span>
              </>
            }
          />
          <Reveal className="lg:col-span-5" delay={0.1}>
            <p className="text-lg leading-relaxed text-cream-100/75">
              Global Harvest exists to connect believers everywhere — so that no one has to grow in faith alone, and every community can play its part in God’s global story.
            </p>
          </Reveal>
        </div>

        <Reveal className="relative mt-16">
          <GlobalMap className="text-cream-100/30" lights={22} connect label="World map illustrating Global Harvest's vision to connect believers across the nations" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--color-teal-800)_78%)]" />
        </Reveal>
        <p className="mt-4 text-center text-sm text-cream-100/55">Illustrative map. Locations will be shown as local groups are confirmed.</p>

        <m.ul className="mt-14 grid gap-4 md:grid-cols-3" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {features.map((f) => (
            <m.li key={f.title} variants={staggerChild} className="rounded-3xl border border-cream-100/12 p-7">
              <Icon name={f.icon} size={28} className="text-coral-300" strokeWidth={1.3} />
              <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-cream-100/70">{f.body}</p>
            </m.li>
          ))}
        </m.ul>
        <Reveal className="mt-12 flex justify-center">
          <CTAButton to="/community" variant="outline-light">
            Find your community
          </CTAButton>
        </Reveal>
      </div>
    </section>
  )
}

function UpcomingEvents() {
  const { data, loading } = useAsync(() => eventService.upcoming(3), [])
  return (
    <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="events-title">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeader id="events-title" eyebrow="Upcoming events" title="Gather with us." description="Studies, prayer nights, fellowship and mission evenings — online and in person." />
          <Reveal delay={0.1}>
            <CTAButton to="/events" variant="secondary">
              All events
            </CTAButton>
          </Reveal>
        </div>
        {data?.some((e) => e.isPlaceholder) ? (
          <PlaceholderNotice className="mt-10">These are sample events that show how listings will look. Confirmed dates will be published here.</PlaceholderNotice>
        ) : null}
        <m.ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-5% 0px' }}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <li key={i} className="h-[520px] animate-pulse rounded-[1.75rem] bg-cream-200" />)
            : data?.map((e) => (
                <m.li key={e.slug} variants={staggerChild} className="flex">
                  <EventCard event={e} className="w-full" />
                </m.li>
              ))}
        </m.ul>
      </div>
    </section>
  )
}

function Testimonials() {
  const { data } = useAsync(() => contentService.testimonials(), [])
  if (!data?.length) return null
  const [featured, ...rest] = data
  return (
    <section className="bg-cream-200/60 py-24 sm:py-32" aria-labelledby="stories-title">
      <div className="container-page">
        <SectionHeader id="stories-title" eyebrow="Stories" title="Lives shaped by the Word." description="Real stories from our community will be shared here, with permission." />
        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <TestimonialCard testimonial={featured} featured />
          </Reveal>
          <div className="grid gap-6 lg:col-span-5">
            {rest.map((t, i) => (
              <Reveal key={t.id} delay={0.1 * (i + 1)}>
                <TestimonialCard testimonial={t} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  useSeo({
    description: site.description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site.name,
      url: site.url,
      logo: `${site.url}/favicon.svg`,
      description: site.description,
      slogan: site.tagline,
    },
  })
  return (
    <>
      <Hero />
      <WhoWeAre />
      <WhatWeDo />
      <Ribbon />
      <SentMovement />
      <BibleStudySection />
      <PrayerSection />
      <GlobalCommunity />
      <UpcomingEvents />
      <Testimonials />
      <CmsSections slug="home" />
      <FinalCTA />
    </>
  )
}
