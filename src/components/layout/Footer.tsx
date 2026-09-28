import { Link } from 'react-router-dom'
import { footerNav, site } from '../../config/site'
import { GlobalMap } from '../brand/GlobalMap'
import { Logo } from '../brand/Logo'
import { Whale } from '../brand/Whale'
import { CTAButton } from '../ui/Button'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="on-dark relative overflow-hidden bg-teal-900 text-cream-100 print:hidden">
      <GlobalMap className="pointer-events-none absolute -top-10 right-[-20%] w-[90%] max-w-none text-cream-100/[0.07] lg:right-[-8%] lg:w-[70%]" lights={6} decorative />
      <div className="container-page relative pt-20 pb-10 lg:pt-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo tone="light" withTagline size="lg" />
            <p className="mt-8 max-w-sm leading-relaxed text-cream-100/70">{site.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <CTAButton to="/register">Join Global Harvest</CTAButton>
            </div>
            <SocialLinks className="mt-10" />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:pl-10">
            {footerNav.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="eyebrow mb-5 text-coral-300">{col.title}</h2>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className="text-cream-100/80 transition hover:text-cream-100 hover:underline hover:decoration-coral-300 hover:underline-offset-4">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div className="col-span-2 sm:col-span-3">
              <h2 className="eyebrow mb-4 text-coral-300">Get in touch</h2>
              <p className="max-w-md text-cream-100/70">
                {site.contact.email ? (
                  <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
                    {site.contact.email}
                  </a>
                ) : (
                  <>
                    Official contact details will be published soon. Until then, please use our{' '}
                    <Link to="/contact" className="text-cream-100 underline decoration-coral-300 underline-offset-4">
                      contact form
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-end justify-between gap-6 border-t border-cream-100/10 pt-8">
          <p className="eyebrow text-[0.62rem] text-cream-100/55 sm:text-[0.7rem]">
            One Mission <span aria-hidden="true" className="mx-2 text-coral-300">/</span> Many Nations{' '}
            <span aria-hidden="true" className="mx-2 text-coral-300">/</span> Global Harvest
          </p>
          <Whale className="w-28 shrink-0 opacity-90 sm:w-36" body="var(--color-teal-500)" shadow="var(--color-teal-700)" belly="var(--color-cream-200)" />
        </div>
        <div className="mt-6 flex flex-col gap-3 text-sm text-cream-100/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Global Harvest. All rights reserved.</p>
          <ul className="flex gap-6">
            <li>
              <Link to="/privacy" className="hover:text-cream-100">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-cream-100">Terms</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-cream-100">Contact</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
