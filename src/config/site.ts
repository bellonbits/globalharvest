/**
 * Central site configuration.
 *
 * Anything marked `null` or `PLACEHOLDER` has not been supplied yet.
 * The UI renders a clear "to be announced" state instead of inventing data.
 * Replace these values before launch.
 */

export const site = {
  name: 'Global Harvest',
  shortName: 'Global Harvest',
  tagline: "Growing in God's Word. Reaching our world.",
  motto: 'Study. Pray. Share.',
  mission: 'One Mission. Many Nations.',
  description:
    'Global Harvest is a global Christian community committed to Bible study, prayer, fellowship, discipleship, and sharing the Gospel.',
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://globalharvest.org',
  locale: 'en',
  ogImage: '/og-image.jpg',

  /** Show "Placeholder" markers on unconfirmed content (events, schedules, testimonials…). */
  showPlaceholderMarkers: true,

  contact: {
    // PLACEHOLDER — no official contact details have been supplied yet.
    email: null as string | null,
    phone: null as string | null,
    address: null as string | null,
    responseTime: 'We aim to reply within a few working days.',
  },

  social: [
    // PLACEHOLDER — add the official profile URLs when accounts are live.
    { platform: 'instagram', label: 'Instagram', url: null as string | null },
    { platform: 'youtube', label: 'YouTube', url: null as string | null },
    { platform: 'facebook', label: 'Facebook', url: null as string | null },
    { platform: 'tiktok', label: 'TikTok', url: null as string | null },
    { platform: 'whatsapp', label: 'WhatsApp', url: null as string | null },
  ],
} as const

export type SocialPlatform = (typeof site.social)[number]['platform']

export interface NavItem {
  label: string
  to: string
}

/** Primary navigation (desktop header + mobile menu). */
export const primaryNav: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Bible Study', to: '/bible-study' },
  { label: 'Prayer', to: '/prayer' },
  { label: 'Community', to: '/community' },
  { label: 'Mission', to: '/mission' },
  { label: 'Events', to: '/events' },
  { label: 'Join', to: '/join' },
]

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Grow',
    items: [
      { label: 'Bible Study', to: '/bible-study' },
      { label: 'Prayer', to: '/prayer' },
      { label: 'Resources', to: '/resources' },
      { label: 'Events', to: '/events' },
    ],
  },
  {
    title: 'Belong',
    items: [
      { label: 'About', to: '/about' },
      { label: 'Community', to: '/community' },
      { label: 'Global Mission', to: '/mission' },
      { label: 'Media Kit', to: '/media-kit' },
    ],
  },
  {
    title: 'Take a step',
    items: [
      { label: 'Join', to: '/join' },
      { label: 'Register', to: '/register' },
      { label: 'Request Prayer', to: '/prayer#request' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]
