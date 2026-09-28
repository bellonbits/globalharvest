import { useState } from 'react'
import { Icon, type IconName } from '../../components/brand/Icon'
import { useToast } from '../../components/ui/Toast'
import { formatDateTime } from '../lib/hooks'
import type { AdminNote, NoteKind } from '../types'
import { Button, Card, EmptyState } from './ui'

const KIND_ICON: Record<NoteKind, IconName> = { note: 'file', email: 'mail', call: 'phone', message: 'message', status: 'refresh' }
const KIND_LABEL: Record<NoteKind, string> = { note: 'Note', email: 'Email', call: 'Call', message: 'Message', status: 'Status change' }

/**
 * Internal notes + communication history. Notes are private to admins with
 * access to the record — never shown on the public site.
 */
export function NotesPanel({ notes, onAdd, canWrite, kinds = ['note', 'email', 'call'], title = 'Notes & history' }: { notes: AdminNote[]; onAdd: (body: string, kind: NoteKind) => Promise<void>; canWrite: boolean; kinds?: NoteKind[]; title?: string }) {
  const [body, setBody] = useState('')
  const [kind, setKind] = useState<NoteKind>(kinds[0])
  const [saving, setSaving] = useState(false)
  const { notify } = useToast()
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setSaving(true)
    try {
      await onAdd(body.trim(), kind)
      setBody('')
    } catch (err) {
      notify({ tone: 'error', title: 'Note not saved', message: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }
  return (
    <Card title={title}>
      {canWrite ? (
        <form onSubmit={submit} className="mb-5 space-y-2">
          <label htmlFor="note-body" className="sr-only">
            Add an internal note
          </label>
          <textarea
            id="note-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={5000}
            placeholder="Add an internal note (only visible to admins)…"
            className="block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-inset ring-teal-900/15 focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {kinds.length > 1 ? (
              <div className="flex gap-1" role="radiogroup" aria-label="Entry type">
                {kinds.map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={`rounded-md px-2 py-1 text-xs ${kind === k ? 'bg-teal-800 text-white' : 'text-teal-900/65 hover:bg-teal-900/5'}`}>
                    {KIND_LABEL[k]}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            <Button type="submit" size="sm" variant="primary" loading={saving} disabled={!body.trim()}>
              Add
            </Button>
          </div>
        </form>
      ) : null}
      {notes.length ? (
        <ol className="space-y-4">
          {notes.map((n) => (
            <li key={n.id} className="flex gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-teal-900/6 text-teal-700">
                <Icon name={KIND_ICON[n.kind]} size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-sm whitespace-pre-wrap text-teal-900">{n.body}</p>
                <p className="mt-0.5 text-xs text-teal-900/50">
                  {KIND_LABEL[n.kind]} · {n.authorName ?? 'System'} · {formatDateTime(n.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState icon="file" title="No notes yet" body="Internal notes and communication history will appear here." />
      )}
    </Card>
  )
}
