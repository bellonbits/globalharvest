import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { contactCategoryOptions } from '../../content/formOptions'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { NotesPanel } from '../components/NotesPanel'
import { Button, DemoTag, DetailList, Drawer, ErrorState, FilterSelect, LoadingBlock, PageHeader, SearchInput, StatusBadge, TextAreaField } from '../components/ui'
import { formatDateTime, formatDay, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { messageService } from '../services'
import type { ContactMessageRow, MessageStatus } from '../types'

const STATUSES: MessageStatus[] = ['unread', 'read', 'replied', 'archived']

function MessageDetail({ id, onChanged }: { id: string; onChanged: () => void }) {
  const { can } = useAuth()
  const { notify } = useToast()
  const { data, setData, loading, error, reload } = useResource(() => messageService.get(id), [id])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  useEffect(() => {
    if (data) onChanged()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.message.id])
  if (error) return <ErrorState error={error} onRetry={reload} what="this message" />
  if (loading || !data) return <LoadingBlock />
  const m = data.message
  const canWrite = can('messages:write')
  const setStatus = async (status: MessageStatus) => {
    const r = await messageService.setStatus(m.id, status)
    setData({ ...data, message: r.message })
    onChanged()
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={m.status} />
        <span className="text-sm text-teal-900/60">{labelize(m.category)} · {formatDateTime(m.createdAt)}</span>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-teal-900">{m.subject}</h3>
        <p className="mt-3 rounded-xl bg-cream-50 p-4 text-sm whitespace-pre-wrap text-teal-950 ring-1 ring-teal-900/10">{m.message}</p>
      </div>
      <DetailList items={[{ label: 'From', value: m.name }, { label: 'Email', value: <a className="text-teal-700 hover:underline" href={`mailto:${m.email}`}>{m.email}</a> }, { label: 'Phone', value: m.phone }, { label: 'Replied', value: m.repliedAt ? formatDateTime(m.repliedAt) : null }]} />
      {canWrite ? (
        <div className="space-y-3 rounded-xl p-4 ring-1 ring-teal-900/10">
          <TextAreaField label="Reply" rows={5} value={reply} onChange={(e) => setReply(e.target.value)} hint="No email provider is connected: “Send” opens your email app with this text and records the reply here." />
          <div className="flex flex-wrap justify-end gap-2">
            <Button icon="archive" onClick={() => setStatus('archived')}>Archive</Button>
            {m.status !== 'unread' ? <Button onClick={() => setStatus('unread')}>Mark unread</Button> : <Button onClick={() => setStatus('read')}>Mark read</Button>}
            <Button
              variant="primary"
              icon="send"
              loading={sending}
              disabled={!reply.trim()}
              onClick={async () => {
                setSending(true)
                try {
                  const r = await messageService.reply(m.id, reply.trim())
                  setData({ message: r.message, notes: [r.note, ...data.notes] })
                  window.location.href = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}&body=${encodeURIComponent(reply.trim())}`
                  setReply('')
                  onChanged()
                  notify({ tone: 'success', title: 'Reply recorded', message: 'Finish sending it from your email app.' })
                } catch (e) {
                  notify({ tone: 'error', title: 'Reply failed', message: (e as Error).message })
                } finally {
                  setSending(false)
                }
              }}
            >
              Send reply
            </Button>
          </div>
        </div>
      ) : null}
      <NotesPanel title="History" notes={data.notes} canWrite={false} onAdd={async () => undefined} />
    </div>
  )
}

export default function Messages() {
  const { can } = useAuth()
  const { notify } = useToast()
  const { state, update, query } = useListState(['status', 'category'], { sort: 'createdAt' })
  const [params, setParams] = useSearchParams()
  const openId = params.get('open')
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => messageService.list(query), [JSON.stringify(query)])
  const open = (id: string | null) => {
    const n = new URLSearchParams(params)
    if (id) n.set('open', id)
    else n.delete('open')
    setParams(n, { replace: true })
  }
  const columns: Column<ContactMessageRow>[] = [
    { key: 'subject', header: 'Subject', sortable: true, render: (m) => <span className={`inline-flex items-center gap-2 ${m.status === 'unread' ? 'font-semibold' : ''}`}>{m.subject} {m.isDemo ? <DemoTag /> : null}</span> },
    { key: 'name', header: 'Name', sortable: true, render: (m) => m.name, mobile: true },
    { key: 'email', header: 'Email', render: (m) => <span className="text-teal-900/70">{m.email}</span>, optional: true },
    { key: 'category', header: 'Category', sortable: true, render: (m) => labelize(m.category) },
    { key: 'createdAt', header: 'Date', sortable: true, render: (m) => formatDay(m.createdAt), mobile: true },
    { key: 'status', header: 'Status', sortable: true, render: (m) => <StatusBadge status={m.status} />, mobile: true },
  ]
  return (
    <>
      <PageHeader title="Messages" description="Messages submitted through the website’s contact form." />
      <DataTable
        what="messages"
        storageKey="messages"
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
        onRowClick={(m) => open(m.id)}
        selectable={can('messages:write')}
        bulkActions={(ids, clear) => (
          <>
            {(['read', 'archived'] as MessageStatus[]).map((s) => (
              <Button key={s} size="sm" onClick={async () => { await messageService.bulkStatus(ids, s); notify({ tone: 'success', title: `Marked ${ids.length} as ${s}` }); clear(); reload() }}>
                Mark {s}
              </Button>
            ))}
          </>
        )}
        empty={{ title: 'No messages.', body: 'Messages sent through the contact page appear here.', action: <Button to="/contact" icon="arrowUpRight">View contact page</Button> }}
        toolbar={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Search messages…" className="w-full sm:w-64" />
            <FilterSelect label="Status" value={state.filters.status} onChange={(v) => update({ filters: { status: v } })} options={STATUSES.map((s) => ({ value: s, label: labelize(s) }))} allLabel="All (excl. archived)" />
            <FilterSelect label="Category" value={state.filters.category} onChange={(v) => update({ filters: { category: v } })} options={contactCategoryOptions} />
          </>
        }
      />
      <Drawer open={Boolean(openId)} onClose={() => open(null)} title="Message">
        {openId ? <MessageDetail id={openId} onChanged={reload} /> : null}
      </Drawer>
    </>
  )
}
