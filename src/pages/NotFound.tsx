import { GlobalMap } from '../components/brand/GlobalMap'
import { Whale } from '../components/brand/Whale'
import { CTAButton } from '../components/ui/Button'
import { useSeo } from '../hooks/useSeo'

export default function NotFound() {
  useSeo({ title: 'Page not found', noindex: true })
  return (
    <section className="on-dark relative isolate flex min-h-[90vh] items-center overflow-hidden bg-teal-800 text-cream-100">
      <GlobalMap decorative lights={8} className="pointer-events-none absolute bottom-0 left-1/2 -z-10 w-[150%] max-w-none -translate-x-1/2 text-cream-100/10" />
      <div className="container-page grid items-center gap-12 pt-32 pb-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-coral-300">Error 404</p>
          <h1 className="display-xl mt-6">Lost at sea?</h1>
          <p className="lede mt-6 max-w-md text-cream-100/80">The page you’re looking for has drifted away — or never existed. Let’s get you back to shore.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <CTAButton to="/">Back to home</CTAButton>
            <CTAButton to="/contact" variant="outline-light" icon={null}>
              Contact us
            </CTAButton>
          </div>
        </div>
        <Whale className="motion-safe:animate-drift mx-auto max-w-lg" body="var(--color-teal-500)" shadow="var(--color-teal-900)" />
      </div>
    </section>
  )
}
