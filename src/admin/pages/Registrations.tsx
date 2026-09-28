import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { countryOptions, interestOptions, participationOptions } from '../../content/formOptions'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { NotesPanel } from '../components/NotesPanel'
import { Button, Card, DemoTag, DetailList, ErrorState, FilterSelect, LoadingBlock, PageHeader, SearchInput, StatusBadge, Tag } from '../components/ui'
import { formatDateTime, formatDay, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { registrationService } from '../services'
import type { RegistrationRow, RegistrationStatus } from '../types'
import { useEffect } from 'react'

export const REG_STATUSES: RegistrationStatus[] = ['new', 'contacted', 'active', 'inactive', 'archived']
const interestLabel = (v: string) => interestOptions.find((o) => o.value === v)?.label ?? labelize(v)

export default function Registrations() {
  const { can } = useAuth()
  const { notify } = useToast()
  const { state, update, query } = useListState(['status', 'country', 'interest', 'participation'], { sort: 'createdAt' })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => registrationService.list(query), [JSON.stringify(query)])
  const [exporting, setExporting] = useState(false)

  const columns: Column<RegistrationRow>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          {r.firstName} {r.lastName} {r.isDemo ? <DemoTag /> : null}
        </span>
      ),
    },
    { key: 'email', header: 'Email', sortable: true, render: (r) => <span className="text-teal-900/75">{r.email}</span>, mobile: true },
    { key: 'phone', header: 'Phone', render: (r) => r.phone, optional: true },
    { key: 'country', header: 'Country', sortable: true, render: (r) => r.country, mobile: true },
    { key: 'city', header: 'City', sortable: true, render: (r) => r.city, optional: true },
    { key: 'interests', header: 'Interests', render: (r) => <span className="flex flex-wrap gap-1">{r.interests.map((i) => <Tag key={i}>{interestLabel(i)}</Tag>)}</span> },
    { key: 'participation', header: 'Participation', render: (r) => labelize(r.participation) },
    { key: 'createdAt', header: 'Registered', sortable: true, render: (r) => <span className="whitespace-nowrap">{formatDay(r.createdAt)}</span>, mobile: true },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} />, mobile: true },
  ]

  const bulk = (ids: string[], clear: () => void) => (
    <>
      <label htmlFor="bulk-status" className="sr-only">
        Set status
      </label>
      <select
        id="bulk-status"
        defaultValue=""
        onChange={async (e) => {
          const status = e.target.value as RegistrationStatus
          e.target.value = ''
          if (!status) return
          try {
            const r = await registrationService.bulkStatus(ids, status)
            notify({ tone: 'success', title: `Updated ${r.updated} registration${r.updated === 1 ? '' : 's'}`, message: `Status set to ${labelize(status)}.` })
            clear()
            reload()
          } catch (err) {
            notify({ tone: 'error', title: 'Bulk update failed', message: (err as Error).message })
          }
        }}
        className="h-8 rounded-lg border-0 bg-white px-2 text-sm ring-1 ring-teal-900/15"
      >
        <option value="">Set status…</option>
        {REG_STATUSES.map((s) => (
          <option key={s} value={s}>
            {labelize(s)}
          </option>
        ))}
      </select>
    </>
  )

  return (
    <>
      <PageHeader
        title="Registrations"
        description="Everyone who has registered through the public “Join Global Harvest” form."
        actions={
          <>
            <Button icon="download" loading={exporting} onClick={async () => {
              setExporting(true)
              try { await registrationService.exportCsv(query) } catch (e) { notify({ tone: 'error', title: 'Export failed', message: (e as Error).message }) } finally { setExporting(false) }
            }}>
              Export CSV
            </Button>
            <Button icon="arrowUpRight" to="/register">
              Registration form
            </Button>
          </>
        }
      />
      <DataTable
        what="registrations"
        storageKey="registrations"
        columns={columns}
        rows={data?.items ?? null}
        total={data?.total}
        loading={loading}
        error={error}
        onRetry={reload}
        page={state.page}
        pageSize={state.pageSize}
        onPage={(page) => update({ page }, false)}
        sort={state.sort}
        dir={state.dir}
        onSort={(sort, dir) => update({ sort, dir })}
        selectable={can('registrations:write')}
        bulkActions={bulk}
        rowHref={(r) => `/admin/registrations/${r.id}`}
        empty={
          state.q || Object.values(state.filters).some(Boolean)
            ? { title: 'No registrations match these filters.', body: 'Try a different search or clear the filters.', action: <Button onClick={() => { setSearch(''); update({ q: '', filters: { status: '', country: '', interest: '', participation: '' } }) }}>Clear filters</Button> }
            : { title: 'No registrations yet.', body: 'Once people register for Global Harvest, they will appear here.', action: <Button to="/register" icon="arrowUpRight">View registration form</Button> }
        }
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, city…" className="w-full sm:w-64" />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={REG_STATUSES.map((s) => ({ value: s, label: labelize(s) }))} allLabel="All (excl. archived)" />
            <FilterSelect label="Interest" value={state.filters.interest} onChange={(v) => update({ filters: { interest: v } })} options={interestOptions} />
            <FilterSelect label="Participation" value={state.filters.participation} onChange={(v) => update({ filters: { participation: v } })} options={participationOptions} />
            <FilterSelect label="Country" value={state.filters.country} onChange={(v) => update({ filters: { country: v } })} options={countryOptions()} />
          </>
        }
      />
    </>
  )
}

export function RegistrationDetail() {
  const { id = '' } = useParams()
  const { can } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const { data, setData, loading, error, reload } = useResource(() => registrationService.get(id), [id])
  const [converting, setConverting] = useState(false)

  if (error) return <Card><ErrorState error={error} onRetry={reload} what="this registration" /></Card>
  if (loading || !data) return <Card><LoadingBlock /></Card>
  const r = data.registration

  const setStatus = async (status: RegistrationStatus) => {
    try {
      const res = await registrationService.setStatus(r.id, status)
      setData({ ...data, registration: res.registration })
      reload()
      notify({ tone: 'success', title: 'Status updated', message: labelize(status) })
    } catch (e) {
      notify({ tone: 'error', title: 'Update failed', message: (e as Error).message })
    }
  }

  return (
    <>
      <PageHeader
        back={{ to: '/admin/registrations', label: 'Registrations' }}
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {r.firstName} {r.lastName} <StatusBadge status={r.status} /> {r.isDemo ? <DemoTag /> : null}
          </span>
        }
        description={`Registered ${formatDateTime(r.createdAt)}`}
        actions={
          <>
            <Button icon="mail" onClick={() => (window.location.href = `mailto:${r.email}`)}>Email</Button>
            {data.memberId ? (
              <Button icon="user" to={`/admin/members/${data.memberId}`}>View member</Button>
            ) : can('members:write') ? (
              <Button variant="primary" icon="plus" loading={converting} onClick={async () => {
                setConverting(true)
                try {
                  const res = await registrationService.convertToMember(r.id)
                  notify({ tone: 'success', title: 'Member created' })
                  navigate(`/admin/members/${res.memberId}`)
                } catch (e) { notify({ tone: 'error', title: 'Could not create member', message: (e as Error).message }) } finally { setConverting(false) }
              }}>
                Convert to member
              </Button>
            ) : null}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Personal information">
            <DetailList
              items={[
                { label: 'Email', value: <a className="text-teal-700 hover:underline" href={`mailto:${r.email}`}>{r.email}</a> },
                { label: 'Phone', value: <a className="text-teal-700 hover:underline" href={`tel:${r.phone.replace(/\s/g, '')}`}>{r.phone}</a> },
                { label: 'Country', value: r.country },
                { label: 'City', value: r.city },
                { label: 'Age range', value: r.ageRange },
                { label: 'Preferred language', value: r.preferredLanguage },
                { label: 'Heard about us via', value: r.referralSource },
                { label: 'Church / fellowship', value: r.church },
              ]}
            />
          </Card>
          <Card title="Participation & interests">
            <DetailList
              items={[
                { label: 'Preferred participation', value: labelize(r.participation) },
                { label: 'Wants to join', value: <span className="flex flex-wrap gap-1">{r.interests.map((i) => <Tag key={i}>{interestLabel(i)}</Tag>)}</span> },
                { label: 'Areas of interest', value: r.areasOfInterest },
                { label: 'Message', value: r.message ? <span className="whitespace-pre-wrap">{r.message}</span> : null },
              ]}
            />
          </Card>
          <NotesPanel
            notes={data.notes}
            canWrite={can('registrations:write')}
            kinds={['note', 'email', 'call']}
            onAdd={async (body, kind) => {
              const res = await registrationService.addNote(r.id, body, kind)
              setData({ ...data, notes: [res.note, ...data.notes] })
            }}
          />
        </div>
        <div className="space-y-6">
          <Card title="Status">
            <div className="grid gap-2">
              {REG_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={!can('registrations:write')}
                  aria-pressed={r.status === s}
                  onClick={() => r.status !== s && setStatus(s)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm ring-1 transition disabled:cursor-not-allowed ${r.status === s ? 'bg-teal-800 text-white ring-teal-800' : 'bg-white text-teal-900 ring-teal-900/12 hover:ring-teal-900/30'}`}
                >
                  {labelize(s)}
                  {r.status === s ? <span className="text-xs text-white/70">Current</span> : null}
                </button>
              ))}
            </div>
          </Card>
          <Card title="Record">
            <DetailList items={[{ label: 'Registration ID', value: <code className="text-xs">{r.id}</code> }, { label: 'Submitted', value: formatDateTime(r.createdAt) }]} />
          </Card>
        </div>
      </div>
    </>
  )
}
