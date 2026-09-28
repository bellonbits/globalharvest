# Global Harvest — website

Multi-page website for **Global Harvest**, a global Christian community for Bible study, prayer, discipleship, fellowship and mission.

Built with Vite, React 19, TypeScript, Tailwind CSS v4, React Router 7, Framer Motion and anime.js. Ready to deploy on Vercel.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

Copy `.env.example` to `.env` to configure:

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public URL used for canonical links and Open Graph tags |
| `VITE_API_BASE_URL` | `/api` to store submissions in PostgreSQL. When empty, forms use a local mock (browser storage) |
| `DATABASE_URL` | **Server-only.** PostgreSQL connection string used by the functions in `api/` |
| `DATABASE_CA_CERT` | Optional. The provider's CA certificate (PEM) so TLS verifies the database server |

## Project structure

```
src/
  config/site.ts          Site name, navigation, contact details & social links (placeholders marked)
  content/                All page content as typed data — edit here, not in components
  types/                  Domain models (Registration, Event, PrayerRequest, …)
  services/               registration / event / prayer / contact / content services (mock or API)
  hooks/                  useForm (validation), useSeo (meta tags), useAsync
  lib/                    validation, formatting, anime.js helpers
  components/
    brand/                Logo, SENT mark, whale, world map, icon set
    layout/               Navbar, MobileMenu, Footer, Layout
    ui/                   Button, SectionHeader, Img, Modal, Toast, Accordion, badges
    forms/                Field components + Registration / Event / Prayer / Contact forms
    cards/                Event, Pillar, BibleStudy, Group, Testimonial, Resource cards
    sections/             PageHero, FinalCTA, ScheduleList, ScriptureBand
    motion/               anime.js effects: AnimatedWords, Ribbon, useDrawOnView
    posters/              Poster & social media templates (4:5, 9:16, 1:1)
  pages/                  One file per route
scripts/
  optimize-images.mjs     Photos in assets-src/photos → responsive WebP + manifest
  generate-world-map.mjs  Builds the dotted world map data
  fetch-original.sh       Downloads and verifies a licensed original photo
```

## Editing content

- **Events** — `src/content/events.ts`. Each event gets a page at `/events/<slug>` with its own registration form.
- **Bible study** (topics, current study, schedule, FAQ) — `src/content/bibleStudy.ts`
- **Prayer** (gatherings, focus calendar, resources) — `src/content/prayer.ts`
- **Groups** — `src/content/community.ts`
- **Mission** (regions, stories) — `src/content/mission.ts`. Add a region with a `position` and it appears on the map.
- **Testimonials** — `src/content/testimonials.ts`
- **Resources** — `src/content/resources.ts`. Add an `href` to make an item available.

Anything not yet confirmed carries `isPlaceholder: true` and shows a "Placeholder" / "Sample" marker. Set `showPlaceholderMarkers` in `src/config/site.ts` to `false` once all content is real.

### Photos

Drop a `.jpg` into `assets-src/photos`, add alt text and a credit in `scripts/optimize-images.mjs`, then run `npm run images`. Use images by key, e.g. `<Img name="hero-sunset-coast" />`.

## Animation

- **Framer Motion** — scroll reveals, parallax, page transitions, header behaviour, scroll-progress bar, modal/menu/toast transitions.
- **anime.js** — SENT mark intro (letters rise, whale swims in), split-text headlines, self-drawing icons, world-map connection arcs, looping ribbon, scroll-synced SENT headline.

All motion respects the visitor's reduced-motion setting.

## Database & API

Form submissions are stored in PostgreSQL through serverless functions in `api/`:

| Endpoint | Table (`global_harvest` schema) |
| --- | --- |
| `POST /api/registrations` | `registrations` |
| `POST /api/event-registrations` | `event_registrations` |
| `POST /api/prayer-requests` | `prayer_requests` (confidential — no read endpoint) |
| `POST /api/contact` | `contact_messages` |
| `GET /api/health` | database connectivity check |

All Global Harvest tables live in their own `global_harvest` schema so they never collide with other applications sharing the database.

```bash
npm run db:migrate   # create/update tables from db/schema.sql (idempotent)
```

- `npm run dev` serves `api/` locally through a Vite middleware, using `DATABASE_URL` from `.env`.
- On Vercel, `api/*.ts` deploy automatically as Node functions.
- Every endpoint re-validates input with the same schemas as the forms (`src/lib/schemas.ts`), whitelists fields, checks option values, rejects honeypot submissions and applies a basic per-IP rate limit.

See [`src/services/README.md`](src/services/README.md) for how the frontend services switch between the API and the mock.

## Deploying to Vercel

Import the repository in Vercel (framework preset: Vite). `vercel.json` provides SPA rewrites, caching and security headers. In the Vercel project's environment variables set `VITE_SITE_URL`, `VITE_API_BASE_URL=/api` and `DATABASE_URL` (plus `DATABASE_CA_CERT` if you verify TLS).

## Photography

All photos in `assets-src/photos` are clean originals from Freepik (free licence, attribution in the Terms page). To add more: `scripts/fetch-original.sh <name> <licensed-download-url>`, add alt text in `scripts/optimize-images.mjs`, then `npm run images`. Replace stock images with Global Harvest's own photography when available.
