import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../../components/brand/Icon'
import { cn } from '../../lib/cn'
import { useAuth } from '../auth/AuthContext'
import { useDebounced, useResource, timeAgo } from '../lib/hooks'
import { ROLE_LABELS, type Permission } from '../rbac'
import { adminService, notificationService } from '../services'
import type { AdminNotification } from '../types'
import { Button, EmptyState, IconButton, Spinner } from './ui'

interface NavItem {
  to: string
  label: string
  icon: IconName
  permission: Permission
}

export const NAV: { section?: string; items: NavItem[] }[] = [
  { items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: 'grid', permission: 'dashboard:read' }] },
  {
    section: 'People',
    items: [
      { to: '/admin/registrations', label: 'Registrations', icon: 'users', permission: 'registrations:read' },
      { to: '/admin/members', label: 'Members', icon: 'user', permission: 'members:read' },
      { to: '/admin/groups', label: 'Groups', icon: 'community', permission: 'groups:read' },
      { to: '/admin/prayer', label: 'Prayer', icon: 'prayer', permission: 'prayer:read' },
      { to: '/admin/messages', label: 'Messages', icon: 'inbox', permission: 'messages:read' },
    ],
  },
  {
    section: 'Ministry',
    items: [
      { to: '/admin/events', label: 'Events', icon: 'calendar', permission: 'events:read' },
      { to: '/admin/bible-studies', label: 'Bible Studies', icon: 'book', permission: 'bible_studies:read' },
      { to: '/admin/guides', label: 'Study Guides', icon: 'bookmark', permission: 'guides:read' },
      { to: '/admin/resources', label: 'Resources', icon: 'file', permission: 'resources:read' },
    ],
  },
  {
    section: 'Website',
    items: [
      { to: '/admin/content', label: 'Content', icon: 'file', permission: 'content:read' },
      { to: '/admin/media', label: 'Media', icon: 'image', permission: 'media:read' },
      { to: '/admin/communications', label: 'Communications', icon: 'send', permission: 'communications:read' },
    ],
  },
  {
    section: 'Insights',
    items: [
      { to: '/admin/analytics', label: 'Analytics', icon: 'chart', permission: 'analytics:read' },
      { to: '/admin/audit-log', label: 'Audit Log', icon: 'shield', permission: 'audit:read' },
      { to: '/admin/settings', label: 'Settings', icon: 'settings', permission: 'settings:read' },
    ],
  },
]

/** Redirects to login when signed out; shows the session-expired notice. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, expired } = useAuth()
  const location = useLocation()
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f2ee]" role="status">
        <Spinner className="size-8 text-teal-700" />
        <span className="sr-only">Checking your session…</span>
      </div>
    )
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search, expired }} />
  return <>{children}</>
}

/** UI-level permission gate (the API enforces the same permission independently). */
export function Guard({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can } = useAuth()
  if (!can(permission))
    return (
      <div className="rounded-xl bg-white ring-1 ring-teal-900/10">
        <EmptyState icon="lock" title="You don’t have access to this area" body="Your role doesn’t include this permission. Ask a Super Admin if you need it." action={<Button to="/admin/dashboard">Back to dashboard</Button>} />
      </div>
    )
  return <>{children}</>
}

function Sidebar({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { can } = useAuth()
  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
      {NAV.map((group, gi) => {
        const items = group.items.filter((i) => can(i.permission))
        if (!items.length) return null
        return (
          <div key={gi} className="mb-5">
            {group.section && !collapsed ? <p className="mb-1.5 px-3 text-[0.65rem] font-semibold tracking-[0.14em] text-cream-100/40 uppercase">{group.section}</p> : null}
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        collapsed && 'justify-center px-0',
                        isActive ? 'bg-white/10 font-medium text-white' : 'text-cream-100/70 hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? <span aria-hidden="true" className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-coral-400" /> : null}
                        <Icon name={item.icon} size={18} className={isActive ? 'text-coral-300' : undefined} />
                        <span className={collapsed ? 'sr-only' : undefined}>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link to="/admin/dashboard" className={cn('flex h-16 items-center gap-3 border-b border-white/10 px-5', collapsed && 'justify-center px-0')}>
      <span className="grid size-8 place-items-center rounded-lg bg-coral-400 font-display text-sm font-bold text-teal-950">GH</span>
      {!collapsed ? (
        <span className="leading-tight">
          <span className="block font-display text-sm font-bold tracking-[0.08em] text-white uppercase">Global Harvest</span>
          <span className="block text-[0.7rem] text-cream-100/50">Admin portal</span>
        </span>
      ) : null}
    </Link>
  )
}

function GlobalSearch() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const debounced = useDebounced(q, 250)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { data, loading } = useResource(() => (debounced.length >= 2 ? adminService.search(debounced) : Promise.resolve({ results: [] })), [debounced])
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const results = data?.results ?? []
  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Icon name="search" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-teal-900/40" />
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
          if (e.key === 'Enter' && results[0]) {
            navigate(results[0].href)
            setOpen(false)
          }
        }}
        placeholder="Search people, events, groups…"
        aria-label="Search the admin portal"
        className="h-10 w-full rounded-lg border-0 bg-cream-50 pl-9 pr-3 text-sm text-teal-950 ring-1 ring-inset ring-teal-900/10 placeholder:text-teal-900/40 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
      />
      {open && q.length >= 2 ? (
        <div className="absolute inset-x-0 top-12 z-40 max-h-96 overflow-y-auto rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-teal-900/10" role="listbox" aria-label="Search results">
          {loading ? (
            <p className="px-3 py-3 text-sm text-teal-900/55">Searching…</p>
          ) : results.length ? (
            results.map((r) => (
              <Link key={`${r.type}-${r.id}`} to={r.href} onClick={() => setOpen(false)} role="option" className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-cream-50">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-teal-900">{r.title}</span>
                  <span className="block truncate text-xs text-teal-900/55">{r.subtitle}</span>
                </span>
                <span className="shrink-0 rounded-md bg-teal-900/6 px-1.5 py-0.5 text-[0.7rem] text-teal-900/70">{r.type}</span>
              </Link>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-teal-900/55">No results for “{q}”.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

const notifHref = (n: AdminNotification) => {
  switch (n.type) {
    case 'registration':
      return n.entityId ? `/admin/registrations/${n.entityId}` : '/admin/registrations'
    case 'prayer_request':
      return n.entityId ? `/admin/prayer?open=${n.entityId}` : '/admin/prayer'
    case 'contact_message':
      return n.entityId ? `/admin/messages?open=${n.entityId}` : '/admin/messages'
    case 'event_registration':
      return '/admin/events'
    default:
      return n.entityType === 'event' && n.entityId ? `/admin/events/${n.entityId}` : '/admin/dashboard'
  }
}

function Notifications() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data, reload, setData } = useResource(() => notificationService.list(), [])
  // Poll for new activity every 60s while the tab is visible.
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === 'visible' && reload(), 60_000)
    return () => clearInterval(t)
  }, [reload])
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const unread = data?.unread ?? 0
  const markAll = async () => {
    await notificationService.markRead('all')
    setData((d) => (d ? { unread: 0, items: d.items.map((i) => ({ ...i, read: true })) } : d))
  }
  const openOne = async (n: AdminNotification) => {
    setOpen(false)
    if (!n.read) {
      await notificationService.markRead([n.id]).catch(() => undefined)
      setData((d) => (d ? { unread: Math.max(0, d.unread - 1), items: d.items.map((i) => (i.id === n.id ? { ...i, read: true } : i)) } : d))
    }
  }
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`} className="relative grid size-10 place-items-center rounded-lg text-teal-800 hover:bg-teal-900/5">
        <Icon name="bell" size={20} />
        {unread ? <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-coral-500 px-1 text-[0.6rem] font-bold text-white">{unread > 9 ? '9+' : unread}</span> : null}
      </button>
      <AnimatePresence>
        {open ? (
          <m.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 z-40 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-teal-900/10">
            <div className="flex items-center justify-between border-b border-teal-900/8 px-4 py-3">
              <h2 className="font-display text-sm font-semibold text-teal-900">Notifications</h2>
              {unread ? (
                <button type="button" onClick={markAll} className="text-xs font-medium text-teal-700 hover:underline">
                  Mark all read
                </button>
              ) : null}
            </div>
            <ul className="max-h-[60vh] divide-y divide-teal-900/[0.06] overflow-y-auto">
              {data?.items.length ? (
                data.items.map((n) => (
                  <li key={n.id}>
                    <Link to={notifHref(n)} onClick={() => openOne(n)} className={cn('flex gap-3 px-4 py-3 hover:bg-cream-50', !n.read && 'bg-teal-50/40')}>
                      <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-coral-500')} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-sm text-teal-900">{n.title}</span>
                        <span className="text-xs text-teal-900/50">
                          {timeAgo(n.createdAt)}
                          {!n.read ? <span className="sr-only"> (unread)</span> : null}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <EmptyState icon="bell" title="You’re all caught up" body="New registrations, prayer requests and messages will appear here." />
                </li>
              )}
            </ul>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function ProfileMenu({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  if (!user) return null
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-2.5 rounded-lg p-1 pr-2 hover:bg-teal-900/5">
        <span className="grid size-8 place-items-center rounded-full bg-teal-800 text-xs font-semibold text-white">{initials}</span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-sm font-medium text-teal-900">{user.name}</span>
          <span className="block text-xs text-teal-900/55">{ROLE_LABELS[user.role]}</span>
        </span>
        <Icon name="chevronDown" size={16} className="hidden text-teal-900/50 lg:block" />
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-teal-900/10">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-teal-900">{user.name}</p>
            <p className="truncate text-xs text-teal-900/55">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-teal-900/8" />
          <p className="px-3 pt-1 pb-1 text-[0.65rem] font-semibold tracking-wider text-teal-900/45 uppercase">Preferences</p>
          <button type="button" onClick={() => setCollapsed(!collapsed)} className="hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-teal-900 hover:bg-cream-50 lg:flex">
            <Icon name="sidebar" size={16} /> {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </button>
          <Link to="/admin/settings?tab=security" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-teal-900 hover:bg-cream-50">
            <Icon name="key" size={16} /> Change password
          </Link>
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-teal-900 hover:bg-cream-50">
            <Icon name="arrowUpRight" size={16} /> View website
          </a>
          <div className="my-1 h-px bg-teal-900/8" />
          <button
            type="button"
            onClick={async () => {
              await logout()
              navigate('/admin/login', { replace: true })
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-coral-700 hover:bg-coral-50"
          >
            <Icon name="logout" size={16} /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function AdminLayout() {
  const [drawer, setDrawer] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('gh-admin-collapsed') === '1'
    } catch {
      return false
    }
  })
  const { pathname } = useLocation()
  useEffect(() => setDrawer(false), [pathname])
  useEffect(() => {
    try {
      localStorage.setItem('gh-admin-collapsed', collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  return (
    <div className="min-h-screen bg-[#f4f2ee] font-sans text-teal-950">
      <a href="#admin-main" className="sr-only-focusable top-3 left-3 z-[100] rounded-lg bg-coral-400 px-4 py-2 font-medium text-teal-950">
        Skip to content
      </a>

      {/* Desktop / tablet sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden flex-col bg-teal-900 text-white transition-[width] duration-300 md:flex', collapsed ? 'w-[72px]' : 'w-[72px] lg:w-64')}>
        <Brand collapsed={collapsed} />
        <div className={cn(collapsed ? 'contents' : 'contents lg:hidden')}>
          <Sidebar collapsed />
        </div>
        {!collapsed ? (
          <div className="hidden flex-1 flex-col overflow-hidden lg:flex">
            <Sidebar collapsed={false} />
          </div>
        ) : null}
        <p className={cn('border-t border-white/10 px-5 py-3 text-[0.65rem] text-cream-100/40', collapsed ? 'hidden' : 'hidden lg:block')}>Admin area · not indexed · all actions are logged</p>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer ? (
          <m.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-teal-950/50" onClick={() => setDrawer(false)} aria-hidden="true" />
            <m.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.25 }} className="absolute inset-y-0 left-0 flex w-72 flex-col bg-teal-900" role="dialog" aria-modal="true" aria-label="Admin navigation">
              <div className="flex items-center justify-between pr-3">
                <Brand collapsed={false} />
                <IconButton icon="close" label="Close menu" onClick={() => setDrawer(false)} className="text-white hover:bg-white/10" />
              </div>
              <Sidebar collapsed={false} onNavigate={() => setDrawer(false)} />
            </m.aside>
          </m.div>
        ) : null}
      </AnimatePresence>

      <div className={cn('transition-[padding] duration-300', collapsed ? 'md:pl-[72px]' : 'md:pl-[72px] lg:pl-64')}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-teal-900/8 bg-white/90 px-4 backdrop-blur sm:px-6">
          <IconButton icon="menu" label="Open navigation" onClick={() => setDrawer(true)} className="md:hidden" />
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-1">
            <Notifications />
            <ProfileMenu collapsed={collapsed} setCollapsed={setCollapsed} />
          </div>
        </header>
        <main id="admin-main" tabIndex={-1} className="mx-auto max-w-[1400px] px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
