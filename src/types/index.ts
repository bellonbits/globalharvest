/**
 * Domain models for Global Harvest.
 *
 * These interfaces are the contract between the UI and the data layer.
 * Today they are satisfied by local content files and mock services;
 * a future backend (REST, headless CMS, Supabase, etc.) only needs to
 * return data in these shapes.
 */

export type ISODateString = string

/** Content that has not been confirmed by the Global Harvest team. */
export interface Placeholderable {
  /** When true the UI shows a "Placeholder" marker so it is never mistaken for real information. */
  isPlaceholder?: boolean
}

export type Participation = 'online' | 'in-person' | 'both'

export type InterestArea =
  | 'bible-study'
  | 'prayer'
  | 'community'
  | 'mission'
  | 'events'
  | 'membership'

export type AgeRange = 'under-18' | '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+'

export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  city?: string
  createdAt: ISODateString
}

export interface Registration {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  ageRange: AgeRange | ''
  preferredLanguage: string
  referralSource: string
  interests: InterestArea[]
  participation: Participation | ''
  church?: string
  areasOfInterest?: string
  message?: string
  consent: boolean
  submittedAt?: ISODateString
}

export type EventCategory = 'bible-study' | 'prayer' | 'community' | 'mission' | 'special'

export type RegistrationStatus = 'open' | 'waitlist' | 'closed' | 'not-required'

export interface Speaker {
  name: string
  role?: string
}

export interface Event extends Placeholderable {
  slug: string
  title: string
  category: EventCategory
  summary: string
  description: string[]
  /** Start date/time in ISO-8601. */
  startsAt: ISODateString
  endsAt?: ISODateString
  /** Human readable time label, e.g. "7:00 – 8:30 PM (time zone TBC)". */
  timeLabel: string
  format: Participation
  location: string
  speaker?: Speaker
  image: ImageKey
  registrationStatus: RegistrationStatus
  capacity?: number
}

export interface EventRegistration {
  eventSlug: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  attendees: number
  specialRequirements?: string
  consent: boolean
  submittedAt?: ISODateString
}

export interface StudyTopic {
  slug: string
  title: string
  description: string
  keyPassage?: string
}

export interface BibleStudy extends Placeholderable {
  slug: string
  title: string
  subtitle: string
  description: string
  book?: string
  format: Participation
  /** e.g. "Weekly · 8 sessions" */
  cadence: string
  sessions: BibleStudySession[]
  image: ImageKey
}

export interface BibleStudySession extends Placeholderable {
  number: number
  title: string
  passage: string
  date?: ISODateString
}

export interface ScheduleItem extends Placeholderable {
  day: string
  time: string
  title: string
  format: Participation
  description: string
}

export interface PrayerRequest {
  fullName: string
  category?: 'personal' | 'family' | 'health' | 'work' | 'faith' | 'community' | 'mission' | 'other' | ''
  email: string
  request: string
  country: string
  wantsContact: boolean
  consent: boolean
  submittedAt?: ISODateString
}

export interface Group extends Placeholderable {
  slug: string
  name: string
  audience: string
  description: string
  meets: string
  format: Participation
  /** Pre-selects this interest on the registration form. */
  interest: InterestArea
  image?: ImageKey
}

export interface Testimonial extends Placeholderable {
  id: string
  quote: string
  name: string
  context: string
}

export type ResourceType = 'reading-plan' | 'guide' | 'article' | 'audio' | 'video' | 'download'

export interface Resource extends Placeholderable {
  slug: string
  title: string
  type: ResourceType
  description: string
  topic: string
  href?: string
}

export type ContactCategory = 'general' | 'bible-study' | 'prayer' | 'events' | 'mission' | 'partnership'

export interface ContactMessage {
  name: string
  email: string
  phone?: string
  category: ContactCategory
  subject: string
  message: string
  submittedAt?: ISODateString
}

export interface MissionRegion extends Placeholderable {
  id: string
  name: string
  description: string
  /** Map position in percentages of the map width/height. */
  position?: { x: number; y: number }
}

export interface MissionStory extends Placeholderable {
  id: string
  title: string
  excerpt: string
  image: ImageKey
}

export interface FAQItem {
  question: string
  answer: string
}

/** Keys of the optimised image manifest (see src/content/images.ts). */
export type ImageKey = string

/** Standard result of a service call that submits data. */
export interface SubmissionResult {
  ok: boolean
  id?: string
  message?: string
}
