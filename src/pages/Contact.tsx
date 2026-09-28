import { Icon } from '../components/brand/Icon'
import { ContactForm } from '../components/forms/ContactForm'
import { SocialLinks } from '../components/layout/SocialLinks'
import { CmsSections } from '../components/sections/CmsSections'
import { PageHero } from '../components/sections/PageHero'
import { PlaceholderBadge } from '../components/ui/PlaceholderBadge'
import { Reveal } from '../components/ui/Reveal'
import { site } from '../config/site'
import { contactCategoryOptions } from '../content/formOptions'
import { useSeo } from '../hooks/useSeo'

const categoryHelp: Record<string, string> = {
  general: 'Questions about Global Harvest',
  'bible-study': 'Joining or leading a study',
  prayer: 'Prayer ministry (for requests, use the prayer form)',
  events: 'Event details and registrations',
  mission: 'Outreach and serving',
  partnership: 'Churches and organisations',
}

export default function Contact() {
  useSeo({ title: 'Contact', description: 'Get in touch with Global Harvest about Bible study, prayer, events, mission or partnership.' })

  const details = [
    { icon: 'mail' as const, label: 'Email', value: site.contact.email },
    { icon: 'phone' as const, label: 'Phone', value: site.contact.phone },
    { icon: 'pin' as const, label: 'Address', value: site.contact.address },
  ]

  return (
    <>
      <PageHero
        cms="contact"
        eyebrow="Contact"
        title={
          <>
            We’d love to
            <br />
            hear from you.
          </>
        }
        description="Questions, ideas, partnership enquiries or just saying hello — send us a message and we’ll get back to you."
        image="nugget-point-sunset"
      />

      <section className="bg-cream-100 py-20 sm:py-28" aria-label="Contact form and details">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="rounded-[2rem] bg-cream-50 p-6 shadow-soft ring-1 ring-teal-800/10 sm:p-10">
              <h2 className="font-display text-3xl font-bold tracking-tight text-teal-800">Send a message</h2>
              <p className="mt-2 mb-8 text-teal-900/70">{site.contact.responseTime}</p>
              <ContactForm />
            </div>
          </Reveal>

          <aside className="space-y-12 lg:col-span-5" aria-label="Contact information">
            <Reveal delay={0.1}>
              <h2 className="eyebrow text-coral-700">How can we help?</h2>
              <dl className="mt-6 divide-y divide-teal-800/10 border-y border-teal-800/10">
                {contactCategoryOptions.map((c) => (
                  <div key={c.value} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="font-display font-semibold text-teal-800">{c.label}</dt>
                    <dd className="text-right text-sm text-teal-900/65">{categoryHelp[c.value]}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex items-center gap-3">
                <h2 className="eyebrow text-coral-700">Contact details</h2>
                {details.some((d) => !d.value) ? <PlaceholderBadge label="Coming soon" /> : null}
              </div>
              <ul className="mt-6 space-y-4">
                {details.map((d) => (
                  <li key={d.label} className="flex items-center gap-4">
                    <span className="grid size-11 place-items-center rounded-full bg-teal-800 text-coral-300">
                      <Icon name={d.icon} size={19} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold tracking-[0.14em] text-teal-900/55 uppercase">{d.label}</p>
                      <p className="text-teal-800">{d.value ?? 'To be announced'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <h2 className="eyebrow text-coral-700">Follow along</h2>
              <p className="mt-3 text-sm text-teal-900/65">Social channels are launching soon.</p>
              <SocialLinks tone="dark" className="mt-5" />
            </Reveal>
          </aside>
        </div>
      </section>
      <CmsSections slug="contact" />
    </>
  )
}
