import { SentMark } from '../brand/SentMark'
import { CTAButton } from '../ui/Button'
import { Reveal } from '../ui/Reveal'

interface FinalCTAProps {
  eyebrow?: string
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaTo?: string
}

/** Closing invitation — coral field, script "You are invited", SENT mark. */
export function FinalCTA({
  eyebrow = 'Global Harvest',
  title = 'You are invited',
  subtitle = 'Study. Pray. Grow. Go.',
  ctaLabel = 'Join Global Harvest',
  ctaTo = '/register',
}: FinalCTAProps) {
  return (
    <section aria-labelledby="final-cta-title" className="grain relative overflow-hidden bg-coral-400 text-teal-900">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,rgb(255_247_238/0.35),transparent_55%),radial-gradient(ellipse_at_100%_100%,rgb(194_79_45/0.35),transparent_50%)]" />
      <div className="container-page grid items-center gap-12 py-24 lg:grid-cols-2 lg:py-32">
        <Reveal>
          <p className="eyebrow text-teal-900/80">{eyebrow}</p>
          <h2 id="final-cta-title" className="mt-4 font-script text-[clamp(4rem,11vw,8.5rem)] leading-[0.9] font-normal tracking-normal text-teal-900">
            {title}
          </h2>
          <p className="mt-6 font-display text-2xl font-semibold tracking-[0.2em] text-teal-900 uppercase sm:text-3xl">{subtitle}</p>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-teal-900/80">
            Take your next step into a community that studies Scripture, prays together, grows in faith and lives out the gospel.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <CTAButton to={ctaTo} variant="dark" size="lg">
              {ctaLabel}
            </CTAButton>
            <CTAButton to="/contact" variant="link" className="text-teal-900">
              Ask a question
            </CTAButton>
          </div>
        </Reveal>
        <Reveal delay={0.15} className="mx-auto w-full max-w-xl">
          <SentMark letters="var(--color-cream-100)" background="var(--color-coral-400)" animated intro />
        </Reveal>
      </div>
    </section>
  )
}
