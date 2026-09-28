import { m, useReducedMotion } from 'framer-motion'
import { GlobalMap } from '../components/brand/GlobalMap'
import { Icon } from '../components/brand/Icon'
import { SentMark } from '../components/brand/SentMark'
import { RegistrationForm } from '../components/forms/RegistrationForm'
import { useSeo } from '../hooks/useSeo'

const next = [
  { icon: 'mail' as const, text: 'You’ll receive a welcome message from the team.' },
  { icon: 'users' as const, text: 'We’ll connect you with a group that fits your time zone and interests.' },
  { icon: 'calendar' as const, text: 'You’ll hear first about upcoming studies, prayer nights and events.' },
]

export default function Register() {
  useSeo({
    title: 'Register',
    description: 'Join Global Harvest. Take the next step and become part of a growing global community of Bible study, prayer and mission.',
  })
  const reduce = useReducedMotion()

  return (
    <section className="bg-cream-100" aria-labelledby="register-title">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Brand panel */}
        <div className="on-dark relative isolate overflow-hidden bg-teal-800 text-cream-100">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgb(242_138_104/0.35),transparent_60%)]" />
          <GlobalMap decorative lights={10} className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 w-[180%] max-w-none -translate-x-1/2 text-cream-100/10" />
          <div className="container-page lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:flex-col lg:px-12 xl:px-16 pt-36 pb-16 lg:pt-40">
            <m.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
              <p className="eyebrow flex items-center gap-3 text-coral-300">
                <span aria-hidden="true" className="h-px w-8 bg-coral-300/70" />
                Registration
              </p>
              <h1 id="register-title" className="display-lg mt-6">
                Join Global Harvest
              </h1>
              <p className="lede mt-6 max-w-md text-cream-100/80">Take the next step and become part of our growing community.</p>
            </m.div>

            <SentMark className="mt-12 hidden w-full max-w-md lg:block" letters="var(--color-coral-400)" background="var(--color-teal-800)" whale={{ body: 'var(--color-teal-500)', shadow: 'var(--color-teal-900)' }} animated intro introImmediate introDelay={400} />

            <div className="mt-12 lg:mt-auto">
              <h2 className="eyebrow text-cream-100/70">What happens next</h2>
              <ul className="mt-5 space-y-4">
                {next.map((n) => (
                  <li key={n.text} className="flex items-start gap-3 text-cream-100/85">
                    <Icon name={n.icon} size={20} className="mt-0.5 shrink-0 text-coral-300" />
                    {n.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="container-page py-16 sm:py-20 lg:px-12 lg:pt-36 xl:px-20">
          <p className="mb-10 text-sm text-teal-900/60">
            Fields marked <span className="text-coral-600">*</span> are required.
          </p>
          <RegistrationForm />
        </div>
      </div>
    </section>
  )
}
