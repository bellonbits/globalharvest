# Services

Components never read content files or call `fetch` directly — they go through these services.

| Service | Mock behaviour (no backend) | Backend endpoint (when `VITE_API_BASE_URL` is set) |
| --- | --- | --- |
| `registrationService.submit` | Saves to `localStorage` (`gh:registrations`) | `POST /registrations` |
| `eventService.list / upcoming` | Reads `src/content/events.ts` | `GET /events` (content API only) |
| `eventService.getBySlug` | Reads `src/content/events.ts` | `GET /events/:slug` (content API only) |
| `eventService.register` | Saves to `localStorage` (`gh:eventRegistrations`) | `POST /event-registrations` (slug in body) |
| `prayerService.submit` | Stores **only a receipt id** (request text is never persisted in mock mode) | `POST /prayer-requests` |
| `contactService.send` | Saves to `localStorage` (`gh:contactMessages`) | `POST /contact` |
| `contentService.*`, `eventService.list/getBySlug` | Reads `src/content/*` (also when the API is on, unless `VITE_CONTENT_FROM_API=true`) | `GET /bible-studies/current`, `/bible-studies/topics`, `/bible-studies/schedule`, `/groups`, `/resources`, `/testimonials`, `/mission/regions`, `/mission/stories` |

Payload and response shapes are defined in `src/types/index.ts`. Submissions resolve to `SubmissionResult` (`{ ok, id?, message? }`); a non-2xx response throws `ApiError`, which forms display as an error toast.

The submission endpoints are implemented in `api/` and write to PostgreSQL (see the root README). Still recommended before production: send confirmation emails, add a shared rate limiter or CAPTCHA (the built-in limiter is per serverless instance), and give the prayer team a private admin view — prayer requests must never be exposed publicly.
