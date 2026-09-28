import { m } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/brand/Icon'
import { FinalCTA } from '../components/sections/FinalCTA'
import { CmsSections } from '../components/sections/CmsSections'
import { PageHero } from '../components/sections/PageHero'
import { Accordion } from '../components/ui/Accordion'
import { CTAButton } from '../components/ui/Button'
import { Reveal, staggerChild, staggerParent } from '../components/ui/Reveal'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useSeo } from '../hooks/useSeo'
import type { InterestArea } from '../types'

const steps = [
  { title: 'Register', body: 'Tell us who you are and what you’d like to be part of. It takes about three minutes.' },
  { title: 'Get connected', body: 'Someone from the team will welcome you and answer any questions.' },
  { title: 'Join a group', body: 'Start studying, praying and growing with a small group — online or in person.' },
  { title: 'Get sent', body: 'Discover how God wants to use you in your community and beyond.' },
]

const ways: { interest: InterestArea; icon: IconName; title: string; body: string }[] = [
  { interest: 'bible-study', icon: 'book', title: 'Study', body: 'Join a weekly Bible study group.' },
  { interest: 'prayer', icon: 'prayer', title: 'Pray', body: 'Pray with others and receive prayer updates.' },
  { interest: 'community', icon: 'community', title: 'Connect', body: 'Find friendship in a small group.' },
  { interest: 'mission', icon: 'globe', title: 'Serve', body: 'Take part in outreach and mission.' },
  { interest: 'events', icon: 'calendar', title: 'Attend', body: 'Hear about gatherings and special events.' },
  { interest: 'membership', icon: 'heart', title: 'Belong', body: 'Become a member of Global Harvest.' },
]

const faqs = [
  { question: 'Who can join Global Harvest?', answer: 'Anyone. Christians at every stage, new believers and people who are exploring faith are all welcome.' },
  { question: 'Does it cost anything?', answer: 'No. Registering and joining groups is free.' },
  { question: 'Do I have to leave my church?', answer: 'Not at all. Global Harvest is designed to strengthen local churches, not replace them. Many members are active in their own church.' },
  { question: 'What happens to my details?', answer: 'We use them only to connect you with Global Harvest activities. You can ask us to update or delete them at any time — see our Privacy Policy.' },
]

export default function Join() {
  useSeo({
    title: 'Join',
    description: 'Take your next step with Global Harvest. Study, pray, connect and serve with a global Christian community — register in a few minutes.',
  })

  return (
    <>
      <PageHero
        cms="join"
        eyebrow="Join"
        title={
          <>
            Take your
            <br />
            next step.
          </>
        }
        description="You’re not just signing up for a meeting. You’re joining a community that studies Scripture, prays together, grows in faith and lives out the gospel."
        image="students-park-bibles"
        imagePosition="50% 30%"
      >
        <CTAButton to="/register" size="lg">
          Join Global Harvest
        </CTAButton>
      </PageHero>

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="steps-title">
        <div className="container-page">
          <SectionHeader id="steps-title" eyebrow="How to start" title="Four steps. One journey." />
          <m.ol className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {steps.map((s, i) => (
              <m.li key={s.title} variants={staggerChild} className="relative">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-coral-400 font-display text-xl font-bold text-teal-950">{i + 1}</span>
                  {i < steps.length - 1 ? <span aria-hidden="true" className="hidden h-px flex-1 bg-teal-800/15 lg:block" /> : null}
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold text-teal-800">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-teal-900/70">{s.body}</p>
              </m.li>
            ))}
          </m.ol>
        </div>
      </section>

      <section className="on-dark bg-teal-800 py-24 text-cream-100 sm:py-32" aria-labelledby="ways-title">
        <div className="container-page">
          <SectionHeader id="ways-title" tone="light" eyebrow="What can I do?" title="Join. Study. Pray. Connect. Serve." />
          <m.ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {ways.map((w) => (
              <m.li key={w.interest} variants={staggerChild}>
                <Link
                  to={`/register?interest=${w.interest}`}
                  className="group flex h-full items-start gap-5 rounded-3xl border border-cream-100/12 p-7 transition hover:border-coral-300/60 hover:bg-teal-700/50"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-cream-100/20 text-coral-300 transition group-hover:bg-coral-400 group-hover:text-teal-950">
                    <Icon name={w.icon} size={22} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-xl font-semibold">{w.title}</span>
                    <span className="mt-1 block text-cream-100/70">{w.body}</span>
                  </span>
                  <Icon name="arrowUpRight" size={20} className="mt-1 text-cream-100/40 transition group-hover:text-coral-300" />
                </Link>
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      <section className="bg-cream-100 py-24 sm:py-32" aria-labelledby="join-faq-title">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader id="join-faq-title" eyebrow="Before you join" title="Good questions." />
          </div>
          <Reveal className="lg:col-span-8">
            <Accordion items={faqs} />
          </Reveal>
        </div>
      </section>

      <CmsSections slug="join" />
      <FinalCTA />
    </>
  )
}
