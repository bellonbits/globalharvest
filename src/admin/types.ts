/**
 * Admin portal data models. IDs are UUID strings throughout (audit log IDs are
 * numeric strings). These shapes are the API contract — the Node functions in
 * api/v1 return them today, and a FastAPI backend can implement the same.
 */
import type { Permission, Role } from './rbac'

export type UUID = string
export type ISODate = string

/* ---------- Common ---------- */

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListQuery {
  q?: string
  page?: number
  pageSize?: number
  sort?: string
  dir?: 'asc' | 'desc'
  status?: string
  [filter: string]: string | number | undefined
}

/** Fields every managed record carries (records table). */
export interface RecordMeta {
  id: UUID
  isDemo?: boolean
  createdAt: ISODate
  updatedAt: ISODate
}

/* ---------- Auth ---------- */

export type AdminStatus = 'active' | 'suspended' | 'pending'

export interface AdminUser {
  id: UUID
  email: string
  name: string
  role: Role
  status: AdminStatus
  lastLoginAt: ISODate | null
  createdAt: ISODate
}

export interface CurrentUser extends AdminUser {
  permissions: Permission[]
  sessionExpiresAt: ISODate
}

export type { Permission, Role }

/* ---------- Registrations ---------- */

export type RegistrationStatus = 'new' | 'contacted' | 'active' | 'inactive' | 'archived'

export interface RegistrationRow {
  id: UUID
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  ageRange: string
  preferredLanguage: string
  referralSource: string
  interests: string[]
  participation: 'online' | 'in-person' | 'both'
  church: string | null
  areasOfInterest: string | null
  message: string | null
  status: RegistrationStatus
  isDemo: boolean
  createdAt: ISODate
}

export type NoteKind = 'note' | 'email' | 'call' | 'message' | 'status'

export interface AdminNote {
  id: UUID
  kind: NoteKind
  body: string
  authorName: string | null
  createdAt: ISODate
}

/* ---------- Members ---------- */

export type MemberStatus = 'active' | 'inactive' | 'pending'

export interface Member extends RecordMeta {
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  city?: string
  status: MemberStatus
  groupIds: UUID[]
  bibleStudyIds: UUID[]
  eventSlugs: string[]
  registrationId?: UUID
  joinedAt: ISODate
}

/* ---------- Events ---------- */

export type EventStatus = 'draft' | 'published' | 'registration-open' | 'registration-closed' | 'completed' | 'cancelled'
export type EventCategory = 'bible-study' | 'prayer' | 'community' | 'mission' | 'special'

export interface EventRecord extends RecordMeta {
  title: string
  slug: string
  category: EventCategory
  summary: string
  description: string
  coverImage?: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime?: string
  timezone?: string
  location: string
  format: 'online' | 'in-person' | 'both'
  meetingUrl?: string
  speaker?: string
  capacity?: number
  registrationEnabled: boolean
  registrationDeadline?: string
  status: EventStatus
}

export type Attendance = 'registered' | 'confirmed' | 'attended' | 'no-show' | 'cancelled'

export interface EventRegistrationRow {
  id: UUID
  eventSlug: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  attendees: number
  specialRequirements: string | null
  attendance: Attendance
  isDemo: boolean
  createdAt: ISODate
}

export interface EventStats {
  registrations: number
  people: number
  attended: number
  capacity: number | null
  remaining: number | null
}

/* ---------- Bible studies ---------- */

export type StudyStatus = 'draft' | 'open' | 'active' | 'completed' | 'archived'

export interface BibleStudySession {
  id: UUID
  title: string
  date?: string
  time?: string
  description?: string
  references?: string
  notes?: string
  resources?: string
  meetingLink?: string
}

export interface BibleStudyRecord extends RecordMeta {
  title: string
  slug: string
  description: string
  coverImage?: string
  studyType: 'book' | 'topical' | 'course' | 'devotional'
  leader?: string
  schedule?: string
  startDate?: string
  endDate?: string
  format: 'online' | 'in-person' | 'both'
  location?: string
  meetingLink?: string
  maxParticipants?: number
  registrationEnabled: boolean
  status: StudyStatus
  sessions: BibleStudySession[]
}

/* ---------- Prayer ---------- */

export type PrayerStatus = 'new' | 'being-prayed-for' | 'follow-up' | 'answered' | 'archived'
export type PrayerCategory = 'personal' | 'family' | 'health' | 'work' | 'faith' | 'community' | 'mission' | 'other'

export interface PrayerRequestRow {
  id: UUID
  fullName: string
  email: string
  request: string
  country: string
  category: PrayerCategory
  wantsContact: boolean
  status: PrayerStatus
  isDemo: boolean
  createdAt: ISODate
}

/* ---------- Groups ---------- */

export type GroupStatus = 'active' | 'inactive' | 'full'

export interface GroupRecord extends RecordMeta {
  name: string
  slug: string
  groupType: 'bible-study' | 'prayer' | 'young-adults' | 'men' | 'women' | 'mission' | 'other'
  description: string
  leader?: string
  country?: string
  city?: string
  format: 'online' | 'in-person' | 'both'
  schedule?: string
  capacity?: number
  status: GroupStatus
}

export interface GroupMembership {
  groupId: UUID
  memberId: UUID
}

/* ---------- Resources, media, content ---------- */

export type PublishStatus = 'draft' | 'published' | 'archived'
export type ResourceType = 'study-notes' | 'devotional' | 'prayer-guide' | 'sermon' | 'article' | 'pdf' | 'video' | 'audio' | 'reading-plan'

export interface ResourceRecord extends RecordMeta {
  title: string
  slug: string
  description: string
  type: ResourceType
  author?: string
  coverImage?: string
  fileUrl?: string
  externalUrl?: string
  category?: string
  tags: string[]
  publishedDate?: string
  status: PublishStatus
}

export type MediaKind = 'image' | 'document' | 'pdf' | 'video' | 'audio' | 'other'

export interface MediaAsset extends RecordMeta {
  filename: string
  kind: MediaKind
  mimeType: string
  size: number
  url: string
  alt?: string
  uploadedBy?: string
  storage: 'external' | 'cloudinary' | 's3'
}

export type ContentBlockType = 'hero' | 'heading' | 'paragraph' | 'image' | 'cta' | 'feature-cards' | 'testimonials' | 'faq' | 'statistics' | 'banner'

export interface ContentBlock {
  id: UUID
  type: ContentBlockType
  /** Block-specific fields (title, body, imageUrl, items…). */
  fields: Record<string, unknown>
  visible: boolean
}

export type ContentPageKey = 'home' | 'about' | 'bible-study' | 'prayer' | 'community' | 'mission' | 'contact' | 'join'

export interface ContentPage extends RecordMeta {
  slug: ContentPageKey
  title: string
  blocks: ContentBlock[]
  status: 'draft' | 'published'
  publishedAt?: ISODate
}

/* ---------- Messages & communications ---------- */

export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived'

export interface ContactMessageRow {
  id: UUID
  name: string
  email: string
  phone: string | null
  category: string
  subject: string
  message: string
  status: MessageStatus
  repliedAt: ISODate | null
  isDemo: boolean
  createdAt: ISODate
}

export interface NewsletterSubscriber extends RecordMeta {
  email: string
  name?: string
  source?: string
  status: 'subscribed' | 'unsubscribed'
}

export interface Campaign extends RecordMeta {
  subject: string
  kind: 'newsletter' | 'announcement'
  body: string
  audience: string
  status: 'draft' | 'scheduled' | 'sent'
  sentAt?: ISODate
}

/* ---------- Notifications & audit ---------- */

export interface AdminNotification {
  id: UUID
  type: 'registration' | 'event_registration' | 'prayer_request' | 'contact_message' | 'system'
  title: string
  entityType: string | null
  entityId: string | null
  read: boolean
  createdAt: ISODate
}

export interface AuditLogEntry {
  id: string
  userId: UUID | null
  userEmail: string | null
  action: string
  resource: string
  resourceId: string | null
  details: Record<string, unknown> | null
  ip: string | null
  userAgent: string | null
  createdAt: ISODate
}

/* ---------- Dashboard & analytics ---------- */

export interface StatValue {
  value: number
  /** % change vs the previous period; null when there isn't enough history. */
  trend: number | null
}

export interface DashboardData {
  stats: {
    members: StatValue
    registrations: StatValue
    upcomingEvents: StatValue
    activeBibleStudies: StatValue
    prayerRequests: StatValue | null // null = no permission
    activeGroups: StatValue
  }
  recentRegistrations: Pick<RegistrationRow, 'id' | 'firstName' | 'lastName' | 'country' | 'status' | 'createdAt'>[]
  upcomingEvents: Pick<EventRecord, 'id' | 'title' | 'date' | 'startTime' | 'status'>[]
  demoRecords: number
}

export interface SeriesPoint {
  label: string
  value: number
}

export interface AnalyticsData {
  range: { from: ISODate; to: ISODate }
  registrationsOverTime: SeriesPoint[]
  byCountry: { country: string; code: string | null; count: number }[]
  byParticipation: SeriesPoint[]
  byInterest: SeriesPoint[]
  eventRegistrations: SeriesPoint[]
  prayerRequests: SeriesPoint[] | null
  groupsByCountry: SeriesPoint[]
  studiesByFormat: SeriesPoint[]
  eventsByCountry: SeriesPoint[]
  totals: { registrations: number; eventRegistrations: number; prayerRequests: number | null; messages: number }
}

export interface OrgSettings {
  organizationName: string
  logoUrl?: string
  description?: string
  contactEmail?: string
  phone?: string
  website?: string
  social: Record<string, string>
  notifications: { newRegistration: boolean; newPrayerRequest: boolean; newMessage: boolean; eventRegistration: boolean }
  integrations: { emailProvider?: string; storageProvider?: 'cloudinary' | 's3' | 'none'; analyticsId?: string }
}
