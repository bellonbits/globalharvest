import { m } from 'framer-motion'
import { Icon, type IconName } from '../components/brand/Icon'
import { SentMark } from '../components/brand/SentMark'
import { FinalCTA } from '../components/sections/FinalCTA'
import { CmsSections } from '../components/sections/CmsSections'
import { PageHero } from '../components/sections/PageHero'
import { CTAButton } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { PlaceholderBadge } from '../components/ui/PlaceholderBadge'
import { Reveal, staggerChild, staggerParent } from '../components/ui/Reveal'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useSeo } from '../hooks/useSeo'

const values: { icon: IconName; title: string; body: string }[] = [
  { icon: 'book', title: 'Scripture-centred', body: 'The Bible is our shared foundation. We read it carefully, humbly and together.' },
  { icon: 'prayer', title: 'Prayer-fuelled', body: 'We depend on God. Prayer is not an add-on — it is where our work begins.' },
  { icon: 'community', title: 'Community-shaped', body: 'Discipleship happens in relationships where people are known and cared for.' },
  { icon: 'globe', title: 'Mission-driven', body: 'We are sent. Everything we learn is meant to be lived and shared.' },
]

/** Summary statement of faith — DRAFT until confirmed by Global Harvest leadership. */
const beliefs = [
  { title: 'God', body: 'One God, eternally existing as Father, Son and Holy Spirit.' },
  { title: 'Jesus Christ', body: 'Fully God and fully man, who lived, died for our sins, rose again and will return.' },
  { title: 'The Holy Spirit', body: 'Who gives new life, lives in believers and empowers the church for mission.' },
  { title: 'Scripture', body: 'The Bible is God’s inspired Word, trustworthy and authoritative for faith and life.' },
  { title: 'Salvation', body: 'A gift of grace, received through faith in Jesus Christ alone.' },
  { title: 'The Church', body: 'The worldwide family of believers, called to worship, fellowship and mission.' },
]

export default function About() {
  useSeo({
    title: 'About',
    description: 'Global Harvest is a new global Christian community for Bible study, prayer, discipleship, fellowship and outreach. Learn our story, beliefs and values.',
  })

  return (
    <>
      <PageHero
        cms="about"
        eyebrow="About Global Harvest"
        title={
          <>
            A community
            <br />
            sent into the world.
          </>
        }
        description="Global Harvest is a new Christian community bringing people together around Scripture, prayer and mission — across cities, countries and cultures."
        image="cliff-sea-sunset"
        imagePosition="60% 50%"
      />

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="story-title">
        <div className="container-page grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader id="story-title" eyebrow="Our story" title="Why Global Harvest?" />
          </div>
          <Reveal className="space-y-6 text-lg leading-relaxed text-teal-900/80 lg:col-span-7" delay={0.1}>
            <p className="font-display text-2xl leading-snug text-teal-800 sm:text-[1.7rem]">
              Jesus looked at the crowds and said, “The harvest is plentiful, but the workers are few.” Global Harvest is our response.
            </p>
            <p>
              We believe there are people everywhere who are hungry for truth, for hope and for real community. And we believe God is raising up ordinary believers — students, professionals, parents, retirees — to meet that hunger with the good news of Jesus.
            </p>
            <p>
              So we gather. We open the Bible together and let it shape us. We pray, because nothing lasting happens without God. We build friendships where faith can grow. And then we go — into our neighbourhoods, workplaces and the nations — as people who have been sent.
            </p>
            <p className="text-base text-teal-900/60">Scripture reference: Matthew 9:37–38.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-teal-800 py-24 text-cream-100 sm:py-32 on-dark" aria-label="Vision and mission">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-[2rem] border border-cream-100/12 p-10 sm:p-12">
            <p className="eyebrow text-coral-300">Our vision</p>
            <p className="mt-6 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              A global family of believers, rooted in God’s Word and sent to every nation.
            </p>
          </Reveal>
          <Reveal className="rounded-[2rem] bg-coral-400 p-10 text-teal-950 sm:p-12" delay={0.1}>
            <p className="eyebrow text-teal-900">Our mission</p>
            <p className="mt-6 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              To help people study Scripture, seek God in prayer, grow together in faith and carry the message of Christ into the world.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="values-title">
        <div className="container-page">
          <SectionHeader id="values-title" eyebrow="Our values" title="What shapes us." />
          <m.ul className="mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-teal-800/10 sm:grid-cols-2 lg:grid-cols-4" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {values.map((v) => (
              <m.li key={v.title} variants={staggerChild} className="bg-cream-50 p-8">
                <Icon name={v.icon} size={32} strokeWidth={1.3} className="text-coral-600" />
                <h3 className="mt-8 font-display text-xl font-semibold text-teal-800">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-teal-900/70">{v.body}</p>
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      <section className="bg-cream-200/60 py-24 sm:py-32" aria-labelledby="beliefs-title">
        <div className="container-page grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader id="beliefs-title" eyebrow="What we believe" title="Historic faith. Living hope." description="A short summary of the core Christian beliefs we hold in common." />
            <Reveal className="mt-6">
              <PlaceholderBadge label="Draft — to be confirmed by leadership" />
            </Reveal>
          </div>
          <m.dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-8" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {beliefs.map((b) => (
              <m.div key={b.title} variants={staggerChild} className="border-t border-teal-800/15 pt-6">
                <dt className="font-display text-xl font-semibold text-teal-800">{b.title}</dt>
                <dd className="mt-2 leading-relaxed text-teal-900/70">{b.body}</dd>
              </m.div>
            ))}
          </m.dl>
        </div>
      </section>

      <section className="relative overflow-hidden bg-cream-100 py-24 sm:py-32" aria-labelledby="whale-title">
        <div className="container-page grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <SentMark letters="var(--color-coral-400)" background="var(--color-cream-100)" animated intro />
          </Reveal>
          <div>
            <SectionHeader id="whale-title" eyebrow="Behind the mark" title="Why SENT — and why a whale?" />
            <Reveal className="mt-8 space-y-5 text-lg leading-relaxed text-teal-900/75" delay={0.1}>
              <p>
                <strong className="font-semibold text-teal-800">SENT</strong> names who we are. Jesus sends his followers into the world, just as the Father sent him. Being sent is not a programme — it is an identity.
              </p>
              <p>
                <strong className="font-semibold text-teal-800">The whale</strong> recalls the story of Jonah: a reluctant messenger whom God pursued through the depths of the sea and sent, in mercy, to a great city. It reminds us that God’s heart reaches further than ours — to every nation, across every ocean.
              </p>
              <p>
                <strong className="font-semibold text-teal-800">The colours</strong> come from the horizon at the edge of the sea — the warmth of sunrise and the depth of the ocean. Hope and mission, together.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-cream-200/60 py-24 sm:py-32" aria-labelledby="leaders-title">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeader id="leaders-title" eyebrow="Leadership" title="The people who serve." description="Our leadership team will be introduced here." />
            <Reveal>
              <PlaceholderBadge label="To be announced" />
            </Reveal>
          </div>
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {['Leader', 'Leader', 'Leader'].map((_, i) => (
              <Reveal as="li" key={i} delay={i * 0.08} className="flex items-center gap-5 rounded-3xl border border-dashed border-teal-800/25 p-6">
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-cream-50 text-teal-800/40">
                  <Icon name="user" size={28} />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-teal-800/70">Name to be announced</p>
                  <p className="text-sm text-teal-900/50">Role to be announced</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-cream-100 py-20" aria-label="Next steps">
        <div className="container-page grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="relative aspect-[16/9] overflow-hidden rounded-[2rem] lg:col-span-6">
            <Img name="students-park-bibles" sizes="(min-width: 1024px) 50vw, 100vw" className="size-full object-cover" />
          </Reveal>
          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.1}>
            <h2 className="display-md text-teal-800">Come and see.</h2>
            <p className="mt-5 text-lg leading-relaxed text-teal-900/75">
              Whether you have followed Jesus for decades or are just curious, there’s a place for you here.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <CTAButton to="/join">Ways to join</CTAButton>
              <CTAButton to="/contact" variant="secondary" icon={null}>
                Ask a question
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </section>

      <CmsSections slug="about" />
      <FinalCTA />
    </>
  )
}
