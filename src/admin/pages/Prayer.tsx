import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/brand/Icon'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { NotesPanel } from '../components/NotesPanel'
import { Button, DemoTag, DetailList, Drawer, ErrorState, FilterSelect, LoadingBlock, PageHeader, SearchInput, SelectField, StatusBadge, Tag } from '../components/ui'
import { formatDateTime, formatDay, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { prayerService } from '../services'
import type { PrayerCategory, PrayerRequestRow, PrayerStatus } from '../types'

const STATUSES: PrayerStatus[] = ['new', 'being-prayed-for', 'follow-up', 'answered', 'archived']
const CATEGORIES: PrayerCategory[] = ['personal', 'family', 'health', 'work', 'faith', 'community', 'mission', 'other']

function PrayerDetail({ id, onChanged }: { id: string; onChanged: () => void }) {
  const { can } = useAuth()
  const { notify } = useToast()
  const { data, setData, loading, error, reload } = useResource(() => prayerService.get(id), [id])
  if (error) return <ErrorState error={error} onRetry={reload} what="this prayer request" />
  if (loading || !data) return <LoadingBlock />
  const r = data.request
  const canWrite = can('prayer:write')
  const update = async (patch: { status?: PrayerStatus; category?: PrayerCategory }) => {
    const res = await prayerService.update(r.id, patch)
    setData({ ...data, request: res.request })
    onChanged()
    notify({ tone: 'success', title: 'Prayer request updated' })
  }
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-cream-50 p-4 ring-1 ring-teal-900/10">
        <p className="text-sm whitespace-pre-wrap text-teal-950">{r.request}</p>
      </div>
      <DetailList
        items={[
          { label: 'Name', value: r.fullName },
          { label: 'Email', value: r.wantsContact ? <a className="text-teal-700 hover:underline" href={`mailto:${r.email}`}>{r.email}</a> : <span className="text-teal-900/55">Hidden — contact not requested</span> },
          { label: 'Country', value: r.country },
          { label: 'Submitted', value: formatDateTime(r.createdAt) },
          { label: 'Contact requested', value: r.wantsContact ? 'Yes' : 'No' },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Status" value={r.status} disabled={!canWrite} onChange={(e) => update({ status: e.target.value as PrayerStatus })} options={STATUSES.map((s) => ({ value: s, label: labelize(s) }))} />
        <SelectField label="Category" value={r.category} disabled={!canWrite} onChange={(e) => update({ category: e.target.value as PrayerCategory })} options={CATEGORIES.map((s) => ({ value: s, label: labelize(s) }))} />
      </div>
      <NotesPanel
        title="Private coordinator notes"
        notes={data.notes}
        canWrite={canWrite}
        kinds={['note']}
        onAdd={async (body) => {
          const res = await prayerService.addNote(r.id, body)
          setData({ ...data, notes: [res.note, ...data.notes] })
        }}
      />
    </div>
  )
}

export default function Prayer() {
  const { state, update, query } = useListState(['status', 'category', 'contact'], { sort: 'createdAt' })
  const [params, setParams] = useSearchParams()
  const openId = params.get('open')
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => prayerService.list(query), [JSON.stringify(query)])
  const open = (id: string | null) => {
    const n = new URLSearchParams(params)
    if (id) n.set('open', id)
    else n.delete('open')
    setParams(n, { replace: true })
  }
  const columns: Column<PrayerRequestRow>[] = [
    { key: 'createdAt', header: 'Date', sortable: true, render: (r) => <span className="inline-flex items-center gap-2 whitespace-nowrap">{formatDay(r.createdAt)} {r.isDemo ? <DemoTag /> : null}</span> },
    { key: 'name', header: 'Name', sortable: true, render: (r) => r.fullName, mobile: true },
    { key: 'category', header: 'Category', sortable: true, render: (r) => <Tag>{labelize(r.category)}</Tag>, mobile: true },
    { key: 'request', header: 'Request', render: (r) => <span className="line-clamp-1 max-w-md text-teal-900/75">{r.request}</span> },
    { key: 'contact', header: 'Contact', render: (r) => (r.wantsContact ? <Tag tone="accent">Requested</Tag> : '—') },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} />, mobile: true },
  ]
  return (
    <>
      <PageHeader title="Prayer requests" description="Confidential. Visible only to Prayer Coordinators and Super Admins.">
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-800 ring-1 ring-teal-200">
          <Icon name="lock" size={14} /> Lists show only a short excerpt. Opening a request is recorded in the audit log. Never share requests outside the prayer team.
        </p>
      </PageHeader>
      <DataTable
        what="prayer requests"
        storageKey="prayer"
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
        onRowClick={(r) => open(r.id)}
        empty={{ title: 'No prayer requests.', body: 'Requests submitted through the website’s prayer form appear here.', action: <Button to="/prayer#request" icon="arrowUpRight">View prayer form</Button> }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search requests…" className="w-full sm:w-64" />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={STATUSES.map((s) => ({ value: s, label: labelize(s) }))} allLabel="All (excl. archived)" />
            <FilterSelect label="Category" value={state.filters.category} onChange={(v) => update({ filters: { category: v } })} options={CATEGORIES.map((s) => ({ value: s, label: labelize(s) }))} />
            <FilterSelect label="Contact" value={state.filters.contact} onChange={(v) => update({ filters: { contact: v } })} options={[{ value: 'true', label: 'Contact requested' }]} allLabel="Any" />
          </>
        }
      />
      <Drawer open={Boolean(openId)} onClose={() => open(null)} title="Prayer request">
        {openId ? <PrayerDetail id={openId} onChanged={reload} /> : null}
      </Drawer>
    </>
  )
}
