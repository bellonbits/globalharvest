import type { SVGProps } from 'react'

/**
 * Global Harvest line icon set (24×24, 1.5 stroke). Drawn to match the
 * brand's thin editorial strokes rather than a generic icon library.
 */
const paths = {
  book: (
    <>
      <path d="M12 6.5C10.2 5 7.6 4.5 3.5 4.75v13.5c4.1-.25 6.7.25 8.5 1.75 1.8-1.5 4.4-2 8.5-1.75V4.75C16.4 4.5 13.8 5 12 6.5Z" />
      <path d="M12 6.5V20" />
      <path d="M6 8.25c1.6 0 2.9.25 4 .75M6 11.25c1.6 0 2.9.25 4 .75M14 9c1.1-.5 2.4-.75 4-.75M14 12c1.1-.5 2.4-.75 4-.75" opacity=".55" />
    </>
  ),
  prayer: (
    <>
      <path d="M11.6 3.2c-1.3 1.1-2.2 3.2-2.7 5.5l-1.5 4.6c-.5 1.4-1 2.3-2 3.3l3 3 2.9-2.7c.5-.5.7-1.2.7-1.9V3.9" />
      <path d="M12.4 3.2c1.3 1.1 2.2 3.2 2.7 5.5l1.5 4.6c.5 1.4 1 2.3 2 3.3l-3 3-2.9-2.7c-.5-.5-.7-1.2-.7-1.9" />
      <path d="M9.9 9.4l.8 3M14.1 9.4l-.8 3M4.2 17.7l3 3M19.8 17.7l-3 3" />
    </>
  ),
  community: (
    <>
      <circle cx="12" cy="7" r="2.75" />
      <circle cx="5.75" cy="9" r="2.25" />
      <circle cx="18.25" cy="9" r="2.25" />
      <path d="M7.5 19.5v-1.75a4.5 4.5 0 0 1 9 0v1.75" />
      <path d="M2.25 18.5v-1a3.5 3.5 0 0 1 5.1-3.1M21.75 18.5v-1a3.5 3.5 0 0 0-5.1-3.1" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M2.75 12h18.5M12 2.75c2.6 2.6 3.9 5.7 3.9 9.25S14.6 18.65 12 21.25C9.4 18.65 8.1 15.55 8.1 12S9.4 5.35 12 2.75Z" />
      <path d="M4.5 7h15M4.5 17h15" opacity=".55" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9.25" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2" opacity=".6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.25 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.75-5.6-6.75-11.25a6.75 6.75 0 0 1 13.5 0C18.75 15.4 12 21 12 21Z" />
      <circle cx="12" cy="9.75" r="2.5" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="1.75" />
      <path d="M8.5 20h7M12 16.5V20" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M2.75 19.5a6.25 6.25 0 0 1 12.5 0" />
      <path d="M15.5 4.9a3.25 3.25 0 0 1 0 6.2M18 13.9a6.25 6.25 0 0 1 3.25 5.6" />
    </>
  ),
  arrowRight: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7M8.5 7H17v8.5" />,
  arrowLeft: <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h11" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  heart: <path d="M12 20s-7.75-4.6-7.75-10.1A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.75 2.8C19.75 15.4 12 20 12 20Z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  phone: (
    <path d="M5.5 3.75h3l1.5 4.5-2 1.25a11 11 0 0 0 6.5 6.5l1.25-2 4.5 1.5v3a2 2 0 0 1-2 2A16.25 16.25 0 0 1 3.5 5.75a2 2 0 0 1 2-2Z" />
  ),
  message: <path d="M4 5.5h16v10.5H9.5L5 20v-4H4V5.5Z" />,
  download: <path d="M12 3.5v12M7 10.5l5 5 5-5M4.5 20h15" />,
  play: (
    <>
      <circle cx="12" cy="12" r="9.25" />
      <path d="m10 8.5 5.5 3.5-5.5 3.5v-7Z" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 16v-3.5a8 8 0 0 1 16 0V16" />
      <rect x="3" y="14.5" width="4.5" height="6" rx="1.5" />
      <rect x="16.5" y="14.5" width="4.5" height="6" rx="1.5" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4.5 4.5V21H6V3Z" />
      <path d="M14 3v4.5h4.5M9 12.5h6M9 16h6" />
    </>
  ),
  bookmark: <path d="M6.5 3.5h11V21L12 17l-5.5 4V3.5Z" />,
  quote: (
    <path d="M9.5 7C6.5 7.9 5 10 5 13v4h5v-5H7.5c0-1.7.9-2.8 2.5-3.4L9.5 7ZM18.5 7c-3 .9-4.5 3-4.5 6v4h5v-5h-2.5c0-1.7.9-2.8 2.5-3.4L18.5 7Z" />
  ),
  sparkle: <path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5ZM18.5 16c.25 1.5.9 2.25 2.25 2.5-1.35.25-2 1-2.25 2.5-.25-1.5-.9-2.25-2.25-2.5 1.35-.25 2-1 2.25-2.5Z" />,
  wave: <path d="M2.5 9c2.4 0 2.4-2 4.75-2S9.6 9 12 9s2.4-2 4.75-2S19.1 9 21.5 9M2.5 15c2.4 0 2.4-2 4.75-2s2.35 2 4.75 2 2.4-2 4.75-2 2.35 2 4.75 2" />,
  shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.75a4 4 0 0 1 8 0v2.75" />
    </>
  ),
  hand: <path d="M8 13V5.75a1.25 1.25 0 0 1 2.5 0V11m0-5.75V4.25a1.25 1.25 0 0 1 2.5 0V11m0-5.5a1.25 1.25 0 0 1 2.5 0V11m0-3.75a1.25 1.25 0 0 1 2.5 0v6.5A7.25 7.25 0 0 1 10.75 21 6.4 6.4 0 0 1 5 17.4l-2-4a1.3 1.3 0 0 1 2.2-1.3L8 15" />,
  gift: (
    <>
      <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
      <path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5C10.5 5 7 4.5 7 6.75S10 8.5 12 8.5ZM12 8.5c1.5-3.5 5-4 5-1.75S14 8.5 12 8.5Z" />
    </>
  ),
  filter: <path d="M3.5 5.5h17M6.5 12h11M10 18.5h4" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="17.1" cy="6.9" r=".6" fill="currentColor" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.75" y="5.5" width="18.5" height="13" rx="3.5" />
      <path d="m10.25 9.25 4.75 2.75-4.75 2.75v-5.5Z" />
    </>
  ),
  facebook: <path d="M14.5 21v-7.5h2.75l.5-3.25H14.5V8.4c0-.95.45-1.9 1.95-1.9h1.4V3.75S16.6 3.5 15.4 3.5c-2.55 0-4.15 1.55-4.15 4.3v2.45H8.5v3.25h2.75V21" />,
  tiktok: <path d="M14 3.5v11.75a3.75 3.75 0 1 1-3.75-3.75M14 3.5c.4 2.75 2.2 4.4 5 4.6" />,
  whatsapp: (
    <>
      <path d="M4 20.25 5.2 16A8.6 8.6 0 1 1 8.4 19.1L4 20.25Z" />
      <path d="M9.2 8.4c.2-.4.5-.4.8-.4.2 0 .4 0 .5.4l.6 1.5c.1.2 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.7-.1l1.4.7c.3.1.4.4.3.7-.2.9-1.1 1.6-2.1 1.5-2.9-.4-5.3-2.8-5.7-5.7-.1-.8.3-1.6.7-2Z" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 13.5 6 5h12l2.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19v-5.5Z" />
      <path d="M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  bell: (
    <>
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  logout: <path d="M9.5 20.5H5a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 5 3.5h4.5M15.5 16.5 20 12l-4.5-4.5M20 12H9" />,
  edit: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" />,
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h3.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: <path d="M3 3l18 18M10.6 5.6A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.5 6.9C3.9 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.2" fill="currentColor" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m20.5 16-5-5-8.5 8.5" />
    </>
  ),
  link: <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M4.5 20h15" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronUp: <path d="m6 15 6-6 6 6" />,
  archive: (
    <>
      <rect x="3" y="4" width="18" height="4.5" rx="1" />
      <path d="M5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5M10 12.5h4" />
    </>
  ),
  refresh: <path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4" />,
  sidebar: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2" />
      <path d="M9.5 4v16" />
    </>
  ),
  send: <path d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5-7.5-4L21 3Z" />,
  key: (
    <>
      <circle cx="8" cy="15" r="4.5" />
      <path d="m11.2 11.8 8.8-8.8M16.5 6.5l2.5 2.5M14 9l2 2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 2.5 20h19L12 3.5Z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </>
  ),
} as const

export type IconName = keyof typeof paths

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
  strokeWidth?: number
  /** Accessible label. Omit for decorative icons (default). */
  title?: string
}

export function Icon({ name, size = 24, strokeWidth = 1.5, title, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  )
}
