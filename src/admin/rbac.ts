/**
 * Role-based access control — the single source of truth.
 *
 * Imported by BOTH the API (api/v1) and the admin UI. The API enforces every
 * permission on every request; the UI only uses it to hide what a user
 * can't do. Never rely on the UI check alone.
 */

export const ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'EDITOR',
  'EVENT_MANAGER',
  'BIBLE_STUDY_LEADER',
  'PRAYER_COORDINATOR',
  'CONTENT_MANAGER',
] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  EVENT_MANAGER: 'Event Manager',
  BIBLE_STUDY_LEADER: 'Bible Study Leader',
  PRAYER_COORDINATOR: 'Prayer Coordinator',
  CONTENT_MANAGER: 'Content Manager',
}

export const PERMISSIONS = [
  'dashboard:read',
  'registrations:read',
  'registrations:write',
  'members:read',
  'members:write',
  'events:read',
  'events:write',
  'event_registrations:read',
  'event_registrations:write',
  'bible_studies:read',
  'bible_studies:write',
  'prayer:read',
  'prayer:write',
  'groups:read',
  'groups:write',
  'resources:read',
  'resources:write',
  'content:read',
  'content:write',
  'media:read',
  'media:write',
  'messages:read',
  'messages:write',
  'communications:read',
  'communications:write',
  'analytics:read',
  'audit:read',
  'settings:read',
  'settings:write',
  'users:read',
  'users:write',
] as const
export type Permission = (typeof PERMISSIONS)[number]

const rw = (...modules: string[]) => modules.flatMap((m) => [`${m}:read`, `${m}:write`]) as Permission[]

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: PERMISSIONS,
  ADMIN: [
    'dashboard:read',
    ...rw('registrations', 'members', 'events', 'event_registrations', 'groups', 'content', 'resources', 'messages', 'communications', 'bible_studies', 'media'),
    'analytics:read',
    'audit:read',
    'settings:read',
  ],
  EDITOR: ['dashboard:read', ...rw('content', 'resources', 'media')],
  EVENT_MANAGER: ['dashboard:read', ...rw('events', 'event_registrations'), 'media:read'],
  BIBLE_STUDY_LEADER: ['dashboard:read', ...rw('bible_studies'), 'registrations:read', 'groups:read', 'resources:read'],
  // Prayer requests are visible ONLY to Super Admins and Prayer Coordinators.
  PRAYER_COORDINATOR: ['dashboard:read', ...rw('prayer')],
  CONTENT_MANAGER: ['dashboard:read', ...rw('content', 'resources', 'media')],
}

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export const isRole = (value: unknown): value is Role => ROLES.includes(value as Role)

/** Managed record collections and the permission prefix that guards each one. */
export const COLLECTIONS = {
  events: 'events',
  bible_studies: 'bible_studies',
  groups: 'groups',
  members: 'members',
  resources: 'resources',
  content_pages: 'content',
  media: 'media',
  subscribers: 'communications',
  campaigns: 'communications',
  settings: 'settings',
} as const
export type Collection = keyof typeof COLLECTIONS

export const collectionPermission = (collection: Collection, mode: 'read' | 'write') =>
  `${COLLECTIONS[collection]}:${mode}` as Permission

export const isCollection = (value: unknown): value is Collection => typeof value === 'string' && value in COLLECTIONS
