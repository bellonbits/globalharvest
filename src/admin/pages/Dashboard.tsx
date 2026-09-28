import { Link } from 'react-router-dom'
import { Icon } from '../../components/brand/Icon'
import { useAuth } from '../auth/AuthContext'
import { StatCard } from '../components/Charts'
import { Button, Card, EmptyState, ErrorState, Skeleton, StatusBadge } from '../components/ui'
import { formatDay, timeAgo, useResource } from '../lib/hooks'
import { adminService } from '../services'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Dashboard() {
  const { user, can } = useAuth()
  const { data, loading, error, reload } = useResource(() => adminService.dashboard(), [])
  const first = user?.name.split(' ')[0] ?? ''

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-teal-950 sm:text-3xl">
          {greeting()}, {first}
        </h1>
        <p className="mt-1 text-teal-900/60">Here’s what’s happening across Global Harvest.</p>
      </header>

      {data && data.demoRecords > 0 ? (
        <div role="note" className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-300">
          <Icon name="alert" size={18} />
          <span>
            <strong>{data.demoRecords} demo records</strong> are in the database for development. Figures below include them. Remove with <code className="rounded bg-amber-100 px-1">npm run db:demo -- clear</code>.
          </span>
        </div>
      ) : null}

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={reload} what="the dashboard" />
        </Card>
      ) : (
        <>
          <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading && !data
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[124px] rounded-xl" />)
              : data && (
                  <>
                    {data.visible.members ? <StatCard label="Total members" value={data.stats.members.value} trend={data.stats.members.trend} href="/admin/members" /> : null}
                    {data.visible.registrations ? <StatCard label="Total registrations" value={data.stats.registrations.value} trend={data.stats.registrations.trend} href="/admin/registrations" /> : null}
                    {data.visible.events ? <StatCard label="Upcoming events" value={data.stats.upcomingEvents.value} hint="Scheduled and not cancelled" href="/admin/events" /> : null}
                    {data.visible.bibleStudies ? <StatCard label="Active Bible studies" value={data.stats.activeBibleStudies.value} hint="Open or in progress" href="/admin/bible-studies" /> : null}
                    {data.visible.prayer && data.stats.prayerRequests ? <StatCard label="Prayer requests" value={data.stats.prayerRequests.value} trend={data.stats.prayerRequests.trend} href="/admin/prayer" /> : null}
                    {data.visible.groups ? <StatCard label="Active groups" value={data.stats.activeGroups.value} hint="Active or full" href="/admin/groups" /> : null}
                  </>
                )}
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-5">
            {can('registrations:read') ? (
              <Card title="Recent registrations" className="xl:col-span-3" padded={false} actions={<Button size="sm" variant="ghost" to="/admin/registrations">View all</Button>}>
                {data?.recentRegistrations.length ? (
                  <ul className="divide-y divide-teal-900/[0.06]">
                    {data.recentRegistrations.map((r) => (
                      <li key={r.id}>
                        <Link to={`/admin/registrations/${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-cream-50">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-teal-900">
                              {r.firstName} {r.lastName}
                            </span>
                            <span className="text-xs text-teal-900/55">
                              {r.country} · {timeAgo(r.createdAt)}
                            </span>
                          </span>
                          <StatusBadge status={r.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : loading ? (
                  <div className="space-y-2 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                ) : (
                  <EmptyState icon="users" title="No registrations yet." body="Once people register for Global Harvest, they will appear here." action={<Button to="/register" icon="arrowUpRight">View registration form</Button>} />
                )}
              </Card>
            ) : null}

            {can('events:read') ? (
              <Card title="Upcoming events" className="xl:col-span-2" padded={false} actions={<Button size="sm" variant="ghost" to="/admin/events">All events</Button>}>
                {data?.upcomingEvents.length ? (
                  <ul className="divide-y divide-teal-900/[0.06]">
                    {data.upcomingEvents.map((e) => (
                      <li key={e.id}>
                        <Link to={`/admin/events/${e.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream-50">
                          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-teal-900/5 text-center leading-none">
                            <span>
                              <span className="block text-[0.6rem] font-semibold text-coral-700 uppercase">{new Date(`${e.date}T00:00:00`).toLocaleString('en', { month: 'short' })}</span>
                              <span className="block font-display text-base font-semibold text-teal-900">{new Date(`${e.date}T00:00:00`).getDate()}</span>
                            </span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-teal-900">{e.title}</span>
                            <span className="text-xs text-teal-900/55">
                              {formatDay(e.date)} · {e.startTime}
                            </span>
                          </span>
                          <StatusBadge status={e.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : loading ? (
                  <div className="space-y-2 p-5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                ) : (
                  <EmptyState icon="calendar" title="No upcoming events" body="Create an event to start taking registrations." action={can('events:write') ? <Button to="/admin/events/new" variant="primary" icon="plus">Create event</Button> : undefined} />
                )}
              </Card>
            ) : null}
          </div>

          <section aria-label="Quick actions" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: '/admin/events/new', label: 'Create an event', icon: 'calendar' as const, perm: 'events:write' as const },
              { to: '/admin/bible-studies/new', label: 'Start a Bible study', icon: 'book' as const, perm: 'bible_studies:write' as const },
              { to: '/admin/prayer', label: 'Review prayer requests', icon: 'prayer' as const, perm: 'prayer:read' as const },
              { to: '/admin/content', label: 'Edit website content', icon: 'file' as const, perm: 'content:write' as const },
            ]
              .filter((a) => can(a.perm))
              .map((a) => (
                <Link key={a.to} to={a.to} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-medium text-teal-900 ring-1 ring-teal-900/10 transition hover:ring-teal-900/25">
                  <span className="grid size-9 place-items-center rounded-lg bg-coral-100 text-coral-800">
                    <Icon name={a.icon} size={18} />
                  </span>
                  {a.label}
                  <Icon name="arrowRight" size={16} className="ml-auto text-teal-900/35" />
                </Link>
              ))}
          </section>
        </>
      )}
    </>
  )
}
