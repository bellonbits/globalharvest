import { m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { GlobalMap } from '../components/brand/GlobalMap'
import { Icon, type IconName } from '../components/brand/Icon'
import { SentMark } from '../components/brand/SentMark'
import { CTAButton } from '../components/ui/Button'
import { interestOptions } from '../content/formOptions'
import { useSeo } from '../hooks/useSeo'
import type { InterestArea } from '../types'

const nextSteps: { icon: IconName; title: string; body: string; to: string; cta: string }[] = [
  { icon: 'book', title: 'Explore Bible Study', body: 'See the current study and weekly rhythm.', to: '/bible-study', cta: 'Bible Study' },
  { icon: 'prayer', title: 'Share a prayer request', body: 'Let our prayer team pray with you.', to: '/prayer#request', cta: 'Request prayer' },
  { icon: 'calendar', title: 'Find an event', body: 'Join a gathering online or in person.', to: '/events', cta: 'Upcoming events' },
]

export default function RegisterWelcome() {
  useSeo({ title: 'Welcome', description: 'Your Global Harvest registration has been received.', noindex: true })
  const reduce = useReducedMotion()
  const { state } = useLocation() as { state: { firstName?: string; interests?: InterestArea[] } | null }
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [])

  const chosen = interestOptions.filter((o) => state?.interests?.includes(o.value))

  return (
    <>
      <section className="on-dark relative isolate overflow-hidden bg-teal-800 text-cream-100">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgb(242_138_104/0.4),transparent_60%)]" />
        <GlobalMap decorative lights={20} className="pointer-events-none absolute bottom-0 left-1/2 -z-10 w-[160%] max-w-none -translate-x-1/2 text-cream-100/10 lg:w-[110%]" />
        <div className="container-page flex flex-col items-center pt-36 pb-24 text-center sm:pt-44">
          <m.div
            className="w-full max-w-2xl"
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <SentMark letters="var(--color-coral-400)" background="var(--color-teal-800)" whale={{ body: 'var(--color-teal-500)', shadow: 'var(--color-teal-900)' }} animated intro introImmediate introDelay={200} />
          </m.div>
          <m.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <span className="mx-auto mt-4 grid size-14 place-items-center rounded-full bg-coral-400 text-teal-950">
              <Icon name="check" size={28} strokeWidth={2.2} />
            </span>
            <h1 ref={headingRef} tabIndex={-1} className="display-lg mt-8 outline-none">
              Welcome to Global Harvest{state?.firstName ? `, ${state.firstName}` : ''}.
            </h1>
            <p className="lede mx-auto mt-6 max-w-xl text-cream-100/80">Your registration has been received. We will be in touch with you soon.</p>
            {chosen.length ? (
              <ul className="mt-8 flex flex-wrap justify-center gap-2" aria-label="You registered interest in">
                {chosen.map((c) => (
                  <li key={c.value} className="rounded-full border border-cream-100/25 px-4 py-1.5 text-sm">
                    {c.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </m.div>
        </div>
      </section>

      <section className="bg-cream-100 py-20 sm:py-28" aria-labelledby="next-title">
        <div className="container-page">
          <h2 id="next-title" className="display-md text-center text-teal-800">
            While you wait…
          </h2>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {nextSteps.map((s) => (
              <li key={s.title} className="flex flex-col rounded-3xl bg-cream-50 p-8 ring-1 ring-teal-800/10">
                <Icon name={s.icon} size={30} strokeWidth={1.3} className="text-coral-600" />
                <h3 className="mt-6 font-display text-xl font-semibold text-teal-800">{s.title}</h3>
                <p className="mt-2 text-teal-900/70">{s.body}</p>
                <div className="mt-auto pt-6">
                  <CTAButton to={s.to} variant="link">
                    {s.cta}
                  </CTAButton>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-14 text-center font-display text-lg tracking-[0.2em] text-teal-800 uppercase">Study. Pray. Grow. Go.</p>
        </div>
      </section>
    </>
  )
}
