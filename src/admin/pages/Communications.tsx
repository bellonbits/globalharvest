import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/brand/Icon'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { RecordForm, type FormSectionConfig } from '../components/RecordForm'
import { Button, DemoTag, Drawer, FilterSelect, PageHeader, SearchInput, StatusBadge, Tabs } from '../components/ui'
import { formatDay, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { communicationsService } from '../services'
import type { Campaign, NewsletterSubscriber } from '../types'

const campaignForm: FormSectionConfig[] = [
  {
    title: 'Campaign',
    fields: [
      { name: 'subject', label: 'Subject', required: true, wide: true },
      { name: 'kind', label: 'Type', type: 'select', required: true, options: [{ value: 'newsletter', label: 'Newsletter' }, { value: 'announcement', label: 'Announcement' }] },
      { name: 'audience', label: 'Audience', placeholder: 'e.g. All subscribers, Prayer group' },
      { name: 'body', label: 'Message', type: 'textarea' },
    ],
  },
]

function csvEscape(v: string) {
  const s = /^[=+\-@]/.test(v) ? `'${v}` : v
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function Subscribers() {
  const { can } = useAuth()
  const { notify } = useToast()
  const { state, update, query } = useListState(['status'], { sort: 'updatedAt' })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => communicationsService.subscribers.list(query), [JSON.stringify(query)])
  const fileRef = useRef<HTMLInputElement>(null)
  const [adding, setAdding] = useState(false)

  const importCsv = async (file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    const emails = [...new Set(text.split(/[\r\n,;]+/).map((s) => s.trim().toLowerCase()).filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)))].slice(0, 2000)
    let ok = 0
    for (const email of emails) {
      try {
        await communicationsService.subscribers.create({ email, source: 'CSV import', status: 'subscribed' })
        ok++
      } catch {
        /* skip duplicates / invalid */
      }
    }
    notify({ tone: 'success', title: `Imported ${ok} subscriber${ok === 1 ? '' : 's'}`, message: emails.length - ok ? `${emails.length - ok} skipped (duplicates or invalid).` : undefined })
    reload()
    if (fileRef.current) fileRef.current.value = ''
  }

  const exportCsv = async () => {
    const all = await communicationsService.subscribers.list({ pageSize: 100, status: state.filters.status || undefined })
    const rows = [['Email', 'Name', 'Source', 'Status', 'Added'], ...all.items.map((s) => [s.email, s.name ?? '', s.source ?? '', s.status, s.createdAt])]
    const blob = new Blob(['﻿' + rows.map((r) => r.map(csvEscape).join(',')).join('\r\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'subscribers.csv'
    a.click()
  }

  const columns: Column<NewsletterSubscriber>[] = [
    { key: 'email', header: 'Email', sortable: true, render: (s) => <span className="inline-flex items-center gap-2">{s.email} {s.isDemo ? <DemoTag /> : null}</span> },
    { key: 'name', header: 'Name', render: (s) => s.name ?? '—', mobile: true },
    { key: 'source', header: 'Source', render: (s) => s.source ?? '—' },
    { key: 'createdAt', header: 'Added', sortable: true, render: (s) => formatDay(s.createdAt), mobile: true },
    { key: 'status', header: 'Status', sortable: true, render: (s) => <StatusBadge status={s.status} />, mobile: true },
  ]
  return (
    <>
      <DataTable
        what="subscribers"
        storageKey="subscribers"
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
        selectable={can('communications:write')}
        bulkActions={(ids, clear) => (
          <Button size="sm" onClick={async () => { for (const id of ids) await communicationsService.subscribers.update(id, { status: 'unsubscribed' }); clear(); reload() }}>Mark unsubscribed</Button>
        )}
        empty={{ title: 'No subscribers yet.', body: 'Import a CSV of email addresses or add subscribers individually.' }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search subscribers…" className="w-full sm:w-64" />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={[{ value: 'subscribed', label: 'Subscribed' }, { value: 'unsubscribed', label: 'Unsubscribed' }]} />
            <span className="ml-auto flex gap-2">
              <Button size="sm" icon="download" onClick={exportCsv}>Export</Button>
              {can('communications:write') ? (
                <>
                  <Button size="sm" icon="upload" onClick={() => fileRef.current?.click()}>Import CSV</Button>
                  <Button size="sm" variant="primary" icon="plus" onClick={() => setAdding(true)}>Add</Button>
                  <input ref={fileRef} type="file" accept=".csv,text/csv,text/plain" hidden onChange={(e) => importCsv(e.target.files?.[0])} />
                </>
              ) : null}
            </span>
          </>
        }
      />
      <Drawer open={adding} onClose={() => setAdding(false)} title="Add subscriber">
        <RecordForm
          sections={[{ title: 'Subscriber', fields: [{ name: 'email', label: 'Email', type: 'email', required: true }, { name: 'name', label: 'Name' }, { name: 'source', label: 'Source', placeholder: 'e.g. Event sign-up sheet' }] }]}
          initial={{ status: 'subscribed' }}
          onCancel={() => setAdding(false)}
          onSubmit={async (v) => { await communicationsService.subscribers.create(v as Partial<NewsletterSubscriber>); setAdding(false); reload() }}
        />
      </Drawer>
    </>
  )
}

function Campaigns() {
  const { can } = useAuth()
  const { notify } = useToast()
  const { data, loading, error, reload } = useResource(() => communicationsService.campaigns.list({ pageSize: 50 }), [])
  const [editing, setEditing] = useState<Campaign | 'new' | null>(null)
  const columns: Column<Campaign>[] = [
    { key: 'subject', header: 'Subject', render: (c) => <span className="inline-flex items-center gap-2">{c.subject} {c.isDemo ? <DemoTag /> : null}</span> },
    { key: 'kind', header: 'Type', render: (c) => labelize(c.kind), mobile: true },
    { key: 'audience', header: 'Audience', render: (c) => c.audience ?? '—' },
    { key: 'updatedAt', header: 'Updated', render: (c) => formatDay(c.updatedAt), mobile: true },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} />, mobile: true },
  ]
  return (
    <>
      <p role="note" className="mb-4 flex items-start gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900 ring-1 ring-teal-200">
        <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
        Sending is disabled until an email provider (e.g. Postmark, SendGrid, Resend) is connected on the server. Drafts and campaign history are saved here.
      </p>
      <DataTable
        what="campaigns"
        columns={columns}
        rows={data?.items ?? null}
        total={data?.total}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={(c) => setEditing(c)}
        empty={{ title: 'No campaigns yet.', body: 'Draft newsletters and announcements here.' }}
        toolbar={can('communications:write') ? <Button size="sm" variant="primary" icon="plus" onClick={() => setEditing('new')}>New campaign</Button> : null}
      />
      <Drawer open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'New campaign' : 'Edit campaign'}>
        {editing ? (
          <RecordForm
            key={editing === 'new' ? 'new' : editing.id}
            sections={campaignForm}
            readOnly={!can('communications:write') || (editing !== 'new' && editing.status === 'sent')}
            initial={editing === 'new' ? { kind: 'newsletter', status: 'draft' } : (editing as unknown as Record<string, unknown>)}
            submitLabel="Save draft"
            onCancel={() => setEditing(null)}
            onSubmit={async (v) => {
              if (editing === 'new') await communicationsService.campaigns.create({ ...(v as Partial<Campaign>), status: 'draft' })
              else await communicationsService.campaigns.update(editing.id, v as Partial<Campaign>)
              notify({ tone: 'success', title: 'Draft saved' })
              setEditing(null)
              reload()
            }}
          />
        ) : null}
      </Drawer>
    </>
  )
}

export default function Communications() {
  const [tab, setTab] = useState<'subscribers' | 'campaigns'>('subscribers')
  return (
    <>
      <PageHeader title="Communications" description="Newsletter subscribers, email campaigns and announcements." />
      <Tabs tabs={[{ value: 'subscribers', label: 'Subscribers' }, { value: 'campaigns', label: 'Campaigns' }]} value={tab} onChange={setTab} />
      <div className="mt-5">{tab === 'subscribers' ? <Subscribers /> : <Campaigns />}</div>
    </>
  )
}
