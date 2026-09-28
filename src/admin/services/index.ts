/**
 * Admin services — the only layer that knows API paths.
 * Pages call these; swapping the backend (e.g. to FastAPI) means changing
 * paths here, not rewriting the UI.
 */
import { api } from '../api/client'
import type { Collection } from '../rbac'
import type {
  AdminNote,
  AdminNotification,
  AdminUser,
  AnalyticsData,
  Attendance,
  AuditLogEntry,
  BibleStudyRecord,
  Campaign,
  ContactMessageRow,
  ContentPage,
  CurrentUser,
  DashboardData,
  EventRecord,
  EventRegistrationRow,
  EventStats,
  GroupRecord,
  ListQuery,
  MediaAsset,
  Member,
  MessageStatus,
  NewsletterSubscriber,
  OrgSettings,
  Paginated,
  PrayerCategory,
  PrayerRequestRow,
  PrayerStatus,
  RegistrationRow,
  RegistrationStatus,
  ResourceRecord,
} from '../types'
import type { StudyGuide } from '../../types'

type Q = ListQuery & Record<string, string | number | boolean | undefined>

/* ---------- Auth ---------- */
export const authService = {
  login: (email: string, password: string, remember: boolean) => api.post<{ user: CurrentUser }>('/auth/login', { email, password, remember }, { quiet401: true }),
  logout: () => api.post<{ ok: true }>('/auth/logout', {}, { quiet401: true }),
  getCurrentUser: () => api.get<{ user: CurrentUser }>('/auth/me', undefined, { quiet401: true }),
  refreshToken: () => api.post<{ user: CurrentUser }>('/auth/refresh'),
  forgotPassword: (email: string) => api.post<{ message: string }>('/auth/forgot', { email }, { quiet401: true }),
  resetPassword: (token: string, password: string) => api.post<{ ok: true }>('/auth/reset', { token, password }, { quiet401: true }),
  changePassword: (currentPassword: string, newPassword: string) => api.post<{ ok: true }>('/auth/change-password', { currentPassword, newPassword }),
}

/* ---------- Generic managed records ---------- */
export function recordsService<T>(collection: Collection) {
  const base = `/records/${collection}`
  return {
    list: (q?: Q) => api.get<Paginated<T>>(base, q),
    get: (id: string) => api.get<{ record: T }>(`${base}/${id}`).then((r) => r.record),
    create: (data: Partial<T>) => api.post<{ record: T }>(base, data).then((r) => r.record),
    update: (id: string, data: Partial<T>) => api.patch<{ record: T }>(`${base}/${id}`, data).then((r) => r.record),
    remove: (id: string) => api.delete<{ ok: true }>(`${base}/${id}`),
    duplicate: (id: string) => api.post<{ record: T }>(`${base}/${id}/duplicate`).then((r) => r.record),
  }
}

/* ---------- Dashboard, search, analytics ---------- */
export const adminService = {
  dashboard: () => api.get<DashboardData & { visible: Record<string, boolean> }>('/admin/dashboard'),
  search: (q: string) => api.get<{ results: { type: string; id: string; title: string; subtitle: string; href: string }[] }>('/search', { q }),
}

export const analyticsService = {
  get: (range: { days?: number; from?: string; to?: string }) => api.get<AnalyticsData & { bucket: string }>('/analytics', range),
}

/* ---------- Registrations ---------- */
export const registrationService = {
  list: (q: Q) => api.get<Paginated<RegistrationRow>>('/registrations', q),
  get: (id: string) => api.get<{ registration: RegistrationRow; notes: AdminNote[]; memberId: string | null }>(`/registrations/${id}`),
  setStatus: (id: string, status: RegistrationStatus) => api.patch<{ registration: RegistrationRow }>(`/registrations/${id}`, { status }),
  bulkStatus: (ids: string[], status: RegistrationStatus) => api.post<{ updated: number }>('/registrations/bulk', { ids, status }),
  addNote: (id: string, body: string, kind: AdminNote['kind'] = 'note') => api.post<{ note: AdminNote }>(`/registrations/${id}/notes`, { body, kind }),
  convertToMember: (id: string) => api.post<{ memberId: string }>(`/registrations/${id}/convert`),
  exportCsv: (q: Q) => api.download('/registrations/export', q),
}

/* ---------- Members ---------- */
export const memberService = {
  ...recordsService<Member>('members'),
  notes: (id: string) => api.get<{ notes: AdminNote[] }>(`/notes/member/${id}`).then((r) => r.notes),
  addNote: (id: string, body: string) => api.post<{ note: AdminNote }>(`/notes/member/${id}`, { body }),
}

/* ---------- Events ---------- */
export const eventService = {
  ...recordsService<EventRecord>('events'),
  registrations: (slug: string, q: Q) => api.get<Paginated<EventRegistrationRow> & { stats: Omit<EventStats, 'capacity' | 'remaining'> }>('/event-registrations', { ...q, event: slug }),
  setAttendance: (id: string, attendance: Attendance) => api.patch(`/event-registrations/${id}`, { attendance }),
  bulkAttendance: (ids: string[], attendance: Attendance) => api.post<{ updated: number }>('/event-registrations/bulk', { ids, attendance }),
  exportCsv: (slug: string, q: Q) => api.download('/event-registrations/export', { ...q, event: slug }),
}

/* ---------- Bible studies, groups, resources, content, media ---------- */
export const bibleStudyService = recordsService<BibleStudyRecord>('bible_studies')

/** Booklet-style study guides (Bible studies, prayer guides, devotionals). */
export const guideService = recordsService<StudyGuide & { id: string; isDemo?: boolean; createdAt: string; updatedAt: string }>('guides')

export const groupService = {
  ...recordsService<GroupRecord>('groups'),
  members: (groupId: string) => api.get<Paginated<Member>>('/records/members', { groupId, pageSize: 100 }),
  assign: (groupId: string, memberId: string, action: 'add' | 'remove' = 'add') => api.post(`/groups/${groupId}/members`, { memberId, action }),
}

export const resourceService = recordsService<ResourceRecord>('resources')
export const contentService = recordsService<ContentPage>('content_pages')

export const mediaService = {
  ...recordsService<MediaAsset>('media'),
  /** Returns Cloudinary upload credentials when configured; files upload directly from the browser. */
  sign: () => api.post<{ configured: boolean; cloudName?: string; apiKey?: string; timestamp?: number; folder?: string; signature?: string }>('/media/sign'),
}

/* ---------- Prayer ---------- */
export const prayerService = {
  list: (q: Q) => api.get<Paginated<PrayerRequestRow>>('/prayer-requests', q),
  get: (id: string) => api.get<{ request: PrayerRequestRow; notes: AdminNote[] }>(`/prayer-requests/${id}`),
  update: (id: string, patch: { status?: PrayerStatus; category?: PrayerCategory }) => api.patch<{ request: PrayerRequestRow }>(`/prayer-requests/${id}`, patch),
  addNote: (id: string, body: string) => api.post<{ note: AdminNote }>(`/prayer-requests/${id}/notes`, { body }),
}

/* ---------- Messages & communications ---------- */
export const messageService = {
  list: (q: Q) => api.get<Paginated<ContactMessageRow>>('/messages', q),
  get: (id: string) => api.get<{ message: ContactMessageRow; notes: AdminNote[] }>(`/messages/${id}`),
  setStatus: (id: string, status: MessageStatus) => api.patch<{ message: ContactMessageRow }>(`/messages/${id}`, { status }),
  bulkStatus: (ids: string[], status: MessageStatus) => api.post<{ updated: number }>('/messages/bulk', { ids, status }),
  reply: (id: string, body: string) => api.post<{ message: ContactMessageRow; note: AdminNote; emailSent: boolean }>(`/messages/${id}/reply`, { body }),
}

export const communicationsService = {
  subscribers: recordsService<NewsletterSubscriber>('subscribers'),
  campaigns: recordsService<Campaign>('campaigns'),
}

/* ---------- Notifications, audit, settings, users ---------- */
export const notificationService = {
  list: () => api.get<{ items: AdminNotification[]; unread: number }>('/notifications'),
  markRead: (ids: string[] | 'all') => api.post('/notifications/read', ids === 'all' ? { all: true } : { ids }),
}

export const auditService = {
  list: (q: Q) => api.get<Paginated<AuditLogEntry> & { resources: string[] }>('/audit-logs', q),
}

const settingsRecords = recordsService<OrgSettings & { id: string }>('settings')
export const settingsService = {
  get: () => api.get<{ settings: (OrgSettings & { id: string }) | null }>('/settings').then((r) => r.settings),
  save: async (id: string | null, data: Partial<OrgSettings>) => (id ? settingsRecords.update(id, data) : settingsRecords.create(data)),
}

export const userService = {
  list: () => api.get<{ items: (AdminUser & { locked: boolean })[] }>('/users').then((r) => r.items),
  create: (data: { name: string; email: string; role: string }) => api.post<{ user: AdminUser; setupPath: string }>('/users', data),
  update: (id: string, data: Partial<Pick<AdminUser, 'name' | 'role' | 'status'>>) => api.patch<{ user: AdminUser }>(`/users/${id}`, data),
  resetLink: (id: string) => api.post<{ resetPath: string }>(`/users/${id}/reset-link`),
  revokeSessions: (id: string) => api.post(`/users/${id}/revoke-sessions`),
}
