import { forwardRef, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { GlobalMap } from '../brand/GlobalMap'
import { Icon } from '../brand/Icon'
import { SentMark } from '../brand/SentMark'
import { Img } from '../ui/Img'

/**
 * Marketing templates for posters and social media.
 * Every size is expressed in container-query units (cqw) so a template
 * renders identically as a thumbnail or at 1080px for export.
 */

export type PosterFormat = 'portrait' | 'story' | 'square'

export const posterFormats: Record<PosterFormat, { label: string; aspect: string; px: [number, number]; use: string }> = {
  portrait: { label: 'Post 4:5', aspect: 'aspect-[4/5]', px: [1080, 1350], use: 'Instagram / Facebook feed' },
  story: { label: 'Story 9:16', aspect: 'aspect-[9/16]', px: [1080, 1920], use: 'Instagram / TikTok / WhatsApp Status' },
  square: { label: 'Square 1:1', aspect: 'aspect-square', px: [1080, 1080], use: 'WhatsApp / feed' },
}

interface FrameProps {
  format?: PosterFormat
  className?: string
  children: ReactNode
  label: string
}

export const PosterFrame = forwardRef<HTMLDivElement, FrameProps>(function PosterFrame({ format = 'portrait', className, children, label }, ref) {
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={cn('@container relative isolate w-full overflow-hidden', posterFormats[format].aspect, className)}
    >
      {children}
    </div>
  )
})

const Brand = ({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) => (
  <p
    className={cn(
      'font-display text-[4.2cqw] leading-[0.92] font-bold tracking-[0.08em] uppercase',
      tone === 'light' ? 'text-cream-100' : 'text-teal-800',
      className,
    )}
  >
    Global
    <br />
    Harvest
  </p>
)

const Pill = ({ children, tone = 'coral', icon = true }: { children: ReactNode; tone?: 'coral' | 'teal' | 'cream'; icon?: boolean }) => (
  <span
    className={cn(
      'inline-flex items-center gap-[1.6cqw] rounded-full px-[6cqw] py-[2.6cqw] font-display text-[3.2cqw] font-semibold tracking-[0.16em] uppercase',
      tone === 'coral' && 'bg-coral-400 text-teal-950',
      tone === 'teal' && 'bg-teal-800 text-cream-100',
      tone === 'cream' && 'bg-cream-100 text-teal-800',
    )}
  >
    {children}
    {icon ? <Icon name="arrowRight" className="size-[3.4cqw]" strokeWidth={2.2} /> : null}
  </span>
)

export interface PosterProps {
  format?: PosterFormat
  className?: string
}

/** 1 — Bible Study invitation. */
export const BibleStudyInvitePoster = forwardRef<HTMLDivElement, PosterProps & { title?: string; line?: string; cta?: string }>(function BibleStudyInvitePoster(
  { format = 'portrait', className, title = 'Bible Study & Prayer Group', line = 'Growing in God’s Word.\nReaching our world.', cta = 'Join us' },
  ref,
) {
  return (
    <PosterFrame ref={ref} format={format} className={cn('bg-teal-800', className)} label={`Global Harvest poster: SENT — ${title}`}>
      <Img name="hero-sunset-coast" decorative sizes="600px" className="absolute inset-0 -z-20 size-full object-cover" style={{ objectPosition: '50% 40%' }} />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(242_138_104/0.35)_0%,rgb(242_138_104/0.1)_30%,rgb(6_75_87/0.75)_62%,rgb(4_39_46/0.97)_100%)]" />
      <div className="flex h-full flex-col items-center px-[8cqw] py-[8cqw] text-center">
        <Brand className="self-start text-left" />
        <p className="mt-[7cqw] font-display text-[4.6cqw] font-semibold tracking-[0.42em] text-teal-900 uppercase">Global Harvest</p>
        <SentMark className="mt-[1cqw] w-[92%]" letters="var(--color-cream-100)" background="transparent" />
        <div className="mt-auto flex flex-col items-center">
          <p className="font-display text-[3.4cqw] font-semibold tracking-[0.36em] text-cream-100 uppercase">{title}</p>
          <p className="mt-[4cqw] font-display text-[5.4cqw] leading-[1.2] font-medium whitespace-pre-line text-cream-100">{line}</p>
          <div className="mt-[6cqw]">
            <Pill>{cta}</Pill>
          </div>
        </div>
      </div>
    </PosterFrame>
  )
})

/** 2 — Registration poster ("You're Invited"). */
export const RegistrationPoster = forwardRef<HTMLDivElement, PosterProps & { cta?: string }>(function RegistrationPoster({ format = 'portrait', className, cta = 'Register today' }, ref) {
  return (
    <PosterFrame ref={ref} format={format} className={cn('grain bg-coral-400', className)} label="Global Harvest poster: You're invited — Study, Pray, Share — Register today">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_0%,rgb(255_247_238/0.4),transparent_60%)]" />
      <div className="flex h-full flex-col items-center px-[8cqw] py-[9cqw] text-center">
        <Brand tone="dark" className="text-center text-teal-900" />
        <SentMark className="mt-[6cqw] w-[78%]" letters="var(--color-cream-100)" background="var(--color-coral-400)" />
        <p className="font-display text-[3.2cqw] font-semibold tracking-[0.34em] text-teal-900 uppercase">Bible Study & Prayer Group</p>
        <p className="mt-[5cqw] font-script text-[17cqw] leading-[0.85] text-teal-900">You’re Invited</p>
        <p className="mt-[5cqw] font-display text-[3.6cqw] font-semibold tracking-[0.34em] text-teal-900 uppercase">
          Study <span className="text-cream-100">|</span> Pray <span className="text-cream-100">|</span> Share
        </p>
        <div className="mt-auto">
          <Pill tone="teal">{cta}</Pill>
        </div>
      </div>
    </PosterFrame>
  )
})

/** 3 — Prayer poster. */
export const PrayerPoster = forwardRef<HTMLDivElement, PosterProps & { cta?: string }>(function PrayerPoster({ format = 'portrait', className, cta = 'Join the prayer group' }, ref) {
  return (
    <PosterFrame ref={ref} format={format} className={cn('bg-teal-900', className)} label="Global Harvest poster: Pray together — Seek God. Trust Him. Walk together.">
      <Img name="ocean-teal" decorative sizes="600px" className="absolute inset-0 -z-20 size-full object-cover opacity-55 mix-blend-luminosity" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(4_39_46/0.55)_0%,rgb(6_52_61/0.85)_55%,rgb(2_27_32/0.98)_100%)]" />
      <div className="flex h-full flex-col px-[8cqw] py-[8cqw]">
        <Brand />
        <span className="mt-auto grid size-[16cqw] place-items-center rounded-full border border-coral-300/60 text-coral-300">
          <Icon name="prayer" className="size-[9cqw]" strokeWidth={1.2} />
        </span>
        <p className="mt-[6cqw] font-display text-[15cqw] leading-[0.88] font-bold tracking-[-0.03em] text-cream-100 uppercase">
          Pray
          <br />
          Together
        </p>
        <div className="mt-[5cqw] h-[0.6cqw] w-[14cqw] bg-coral-400" />
        <p className="mt-[5cqw] font-display text-[5.2cqw] leading-[1.25] text-cream-100/90">
          “Seek God. Trust Him.
          <br />
          Walk Together.”
        </p>
        <div className="mt-[8cqw]">
          <Pill>{cta}</Pill>
        </div>
      </div>
    </PosterFrame>
  )
})

/** 4 — Global Mission poster. */
export const MissionPoster = forwardRef<HTMLDivElement, PosterProps & { cta?: string }>(function MissionPoster({ format = 'portrait', className, cta = 'Get involved' }, ref) {
  return (
    <PosterFrame ref={ref} format={format} className={cn('bg-cream-100', className)} label="Global Harvest poster: One mission. Many nations. SENT — Get involved">
      <GlobalMap decorative lights={10} className="absolute top-[34%] left-1/2 -z-10 w-[150%] max-w-none -translate-x-1/2 text-teal-800/15" />
      <div className="flex h-full flex-col px-[8cqw] py-[8cqw]">
        <Brand tone="dark" />
        <p className="mt-[8cqw] font-display text-[11.5cqw] leading-[0.92] font-bold tracking-[-0.03em] text-teal-800 uppercase">
          One mission.
          <br />
          <span className="text-coral-600">Many nations.</span>
        </p>
        <SentMark className="mt-auto w-full" letters="var(--color-coral-400)" background="var(--color-cream-100)" />
        <div className="mt-[4cqw] flex items-center justify-between gap-[4cqw]">
          <p className="font-display text-[3cqw] font-semibold tracking-[0.3em] text-teal-800/70 uppercase">Go into all the world · Mark 16:15</p>
          <Pill tone="teal" icon={false}>
            {cta}
          </Pill>
        </div>
      </div>
    </PosterFrame>
  )
})

/** 5 — Social media card. */
export const SocialCard = forwardRef<HTMLDivElement, PosterProps & { cta?: string }>(function SocialCard({ format = 'portrait', className, cta = 'Register now' }, ref) {
  return (
    <PosterFrame ref={ref} format={format} className={cn('bg-teal-900', className)} label="Global Harvest social card: Real faith. Global impact. Register now.">
      <Img name="ocean-dark" decorative sizes="600px" className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgb(6_75_87/0.55)_0%,rgb(4_39_46/0.85)_70%)]" />
      <div className="flex h-full flex-col px-[8cqw] py-[8cqw]">
        <Brand />
        <p className="mt-auto font-display text-[14.5cqw] leading-[0.9] font-bold tracking-[-0.035em] text-cream-100 uppercase">
          Real
          <br />
          faith.
          <br />
          Global
          <br />
          impact.
        </p>
        <div className="mt-[6cqw] h-[0.6cqw] w-[14cqw] bg-coral-400" />
        <p className="mt-[5cqw] max-w-[80%] font-display text-[5cqw] leading-[1.25] text-cream-100/90">Join our Bible Study and Prayer Group.</p>
        <div className="mt-[7cqw]">
          <Pill>{cta}</Pill>
        </div>
      </div>
    </PosterFrame>
  )
})

export const posterTemplates = [
  { key: 'bible-study-invite', name: 'Bible Study Invitation', Component: BibleStudyInvitePoster },
  { key: 'registration', name: 'Registration Poster', Component: RegistrationPoster },
  { key: 'prayer', name: 'Prayer Poster', Component: PrayerPoster },
  { key: 'mission', name: 'Global Mission Poster', Component: MissionPoster },
  { key: 'social-card', name: 'Social Media Card', Component: SocialCard },
] as const
