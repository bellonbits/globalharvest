import { m } from 'framer-motion'
import { GlobalMap } from '../components/brand/GlobalMap'
import { Icon, type IconName } from '../components/brand/Icon'
import { FinalCTA } from '../components/sections/FinalCTA'
import { CmsSections } from '../components/sections/CmsSections'
import { PageHero } from '../components/sections/PageHero'
import { CTAButton } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { PlaceholderBadge, PlaceholderNotice } from '../components/ui/PlaceholderBadge'
import { Reveal, staggerChild, staggerParent } from '../components/ui/Reveal'
import { SectionHeader } from '../components/ui/SectionHeader'
import { getInvolved, whyWeGo } from '../content/mission'
import { useAsync } from '../hooks/useAsync'
import { useSeo } from '../hooks/useSeo'
import { contentService } from '../services'

const involveIcons: Record<(typeof getInvolved)[number]['key'], IconName> = { pray: 'prayer', give: 'gift', serve: 'hand' }

export default function Mission() {
  useSeo({
    title: 'Global Mission',
    description: 'One mission. Many nations. Discover the Global Harvest vision for mission — why we go, where we serve and how you can pray, give and serve.',
  })
  const regions = useAsync(() => contentService.missionRegions(), [])
  const stories = useAsync(() => contentService.missionStories(), [])

  return (
    <>
      <PageHero
        cms="mission"
        eyebrow="Global Mission"
        size="lg"
        title={
          <>
            One mission.
            <br />
            <span className="text-coral-300">Many nations.</span>
          </>
        }
        description="The gospel is good news for every people and place. We are sent — to our neighbours and to the ends of the earth."
        image="cliff-sea-sunset"
        imagePosition="50% 45%"
        showMap
      >
        <CTAButton href="#get-involved" size="lg">
          Get Involved
        </CTAButton>
      </PageHero>

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="our-mission-title">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader id="our-mission-title" eyebrow="Our mission" title="Rooted in the Word. Sent into the world." />
          </div>
          <Reveal className="space-y-6 text-lg leading-relaxed text-teal-900/80 lg:col-span-7" delay={0.1}>
            <p className="font-display text-2xl leading-snug text-teal-800">
              Mission isn’t a department of Global Harvest. It is the reason we study, pray and gather at all.
            </p>
            <p>
              We want every member to discover their part in God’s global story — whether that means praying faithfully for a nation, welcoming the stranger next door, serving on a short-term outreach, or being sent long-term.
            </p>
            <p>
              As our community grows, we will partner with local churches and trusted mission organisations. Every partnership and location will be shared here once confirmed.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="on-dark relative overflow-hidden bg-teal-900 py-24 text-cream-100 sm:py-32" aria-labelledby="why-title">
        <Img name="ocean-teal" decorative sizes="100vw" className="absolute inset-0 size-full object-cover opacity-25" />
        <div className="container-page relative">
          <SectionHeader id="why-title" tone="light" eyebrow="Why we go" title="Because of who God is." />
          <m.ol className="mt-16 grid gap-6 lg:grid-cols-3" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {whyWeGo.map((w, i) => (
              <m.li key={w.title} variants={staggerChild} className="flex flex-col rounded-3xl border border-cream-100/12 bg-teal-950/40 p-8 backdrop-blur-sm">
                <span className="font-display text-sm font-semibold text-coral-300">0{i + 1}</span>
                <h3 className="mt-6 font-display text-2xl font-semibold">{w.title}</h3>
                <p className="mt-3 leading-relaxed text-cream-100/75">{w.body}</p>
                <p className="eyebrow mt-auto pt-8 text-coral-300">{w.reference}</p>
              </m.li>
            ))}
          </m.ol>
        </div>
      </section>

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="where-title">
        <div className="container-page">
          <SectionHeader id="where-title" eyebrow="Where we serve" title="Our map is still being drawn." description="Global Harvest is just beginning. Confirmed regions, local groups and partners will appear on this map as they are established." />
          <Reveal className="relative mt-14 overflow-hidden rounded-[2rem] bg-teal-800 p-6 sm:p-12">
            <GlobalMap className="text-cream-100/35" regions={regions.data ?? []} lights={18} connect label="World map of Global Harvest mission regions" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,var(--color-teal-800)_85%)]" />
          </Reveal>
          {regions.data && regions.data.length > 0 ? (
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {regions.data.map((r) => (
                <li key={r.id} className="rounded-3xl border border-teal-800/10 bg-cream-50 p-7">
                  <h3 className="font-display text-xl font-semibold text-teal-800">{r.name}</h3>
                  <p className="mt-2 text-teal-900/70">{r.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <PlaceholderNotice className="mt-8">
              No regions have been confirmed yet, so none are shown. Glowing lights on the map are decorative. They don’t mark real locations.
            </PlaceholderNotice>
          )}
        </div>
      </section>

      <section className="bg-cream-200/60 py-24 sm:py-32" aria-labelledby="stories-title">
        <div className="container-page">
          <SectionHeader id="stories-title" eyebrow="Mission stories" title="What God is doing." />
          <m.ul className="mt-14 grid gap-6 md:grid-cols-3" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {stories.data?.map((s) => (
              <m.li key={s.id} variants={staggerChild} className="overflow-hidden rounded-3xl bg-cream-50 ring-1 ring-teal-800/10">
                <div className="aspect-[4/3] overflow-hidden">
                  <Img name={s.image} decorative sizes="(min-width: 768px) 33vw, 100vw" className="size-full object-cover" />
                </div>
                <div className="p-7">
                  {s.isPlaceholder ? <PlaceholderBadge /> : null}
                  <h3 className="mt-4 font-display text-xl font-semibold text-teal-800">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-teal-900/70">{s.excerpt}</p>
                </div>
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      <section id="get-involved" className="scroll-mt-20 bg-cream-100 py-24 sm:py-32" aria-labelledby="involved-title">
        <div className="container-page">
          <SectionHeader id="involved-title" eyebrow="Get involved" title="Pray. Give. Serve." align="center" description="Everyone has a part to play in the mission." />
          <m.ul className="mt-16 grid gap-6 lg:grid-cols-3" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {getInvolved.map((g, i) => (
              <m.li
                key={g.key}
                variants={staggerChild}
                className={`flex flex-col rounded-[2rem] p-9 ${i === 1 ? 'bg-coral-400 text-teal-950' : 'on-dark bg-teal-800 text-cream-100'}`}
              >
                <Icon name={involveIcons[g.key]} size={36} strokeWidth={1.3} className={i === 1 ? 'text-teal-900' : 'text-coral-300'} />
                <h3 className="mt-8 font-display text-3xl font-bold tracking-tight">{g.title}</h3>
                <p className={`mt-3 leading-relaxed ${i === 1 ? 'text-teal-950/80' : 'text-cream-100/75'}`}>{g.body}</p>
                <div className="mt-auto pt-8">
                  <CTAButton to={g.cta.to} variant={i === 1 ? 'dark' : 'primary'}>
                    {g.cta.label}
                  </CTAButton>
                </div>
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      <CmsSections slug="mission" />
      <FinalCTA title="You are sent" subtitle="Study. Pray. Grow. Go." ctaLabel="Get Involved" ctaTo="/register?interest=mission" />
    </>
  )
}
