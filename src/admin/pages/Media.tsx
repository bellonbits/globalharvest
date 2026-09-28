import { useEffect, useRef, useState } from 'react'
import { Icon, type IconName } from '../../components/brand/Icon'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, ConfirmDialog, DemoTag, DetailList, Dialog, Drawer, EmptyState, ErrorState, FilterSelect, PageHeader, SearchInput, SelectField, Skeleton, TextField } from '../components/ui'
import { formatDateTime, labelize, useDebounced, useListState, useResource } from '../lib/hooks'
import { mediaService } from '../services'
import type { MediaAsset, MediaKind } from '../types'

const KINDS: MediaKind[] = ['image', 'document', 'pdf', 'video', 'audio', 'other']
const KIND_ICON: Record<MediaKind, IconName> = { image: 'image', document: 'file', pdf: 'file', video: 'play', audio: 'headphones', other: 'file' }
const MAX_UPLOAD_MB = 100

const size = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b > 1e3 ? `${Math.round(b / 1e3)} KB` : `${b} B`)
const kindOf = (mime: string): MediaKind => (mime.startsWith('image/') ? 'image' : mime === 'application/pdf' ? 'pdf' : mime.startsWith('video/') ? 'video' : mime.startsWith('audio/') ? 'audio' : mime.includes('word') || mime.includes('text') ? 'document' : 'other')

/** Uploads straight to Cloudinary with a server-issued signature (never through our API). */
async function uploadToCloudinary(file: File, sig: { cloudName?: string; apiKey?: string; timestamp?: number; folder?: string; signature?: string }) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.apiKey!)
  fd.append('timestamp', String(sig.timestamp))
  fd.append('folder', sig.folder!)
  fd.append('signature', sig.signature!)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Upload to Cloudinary failed.')
  return (await res.json()) as { secure_url: string; bytes: number }
}

export default function Media() {
  const { can, user } = useAuth()
  const { notify } = useToast()
  const { state, update, query } = useListState(['kind'], { sort: 'updatedAt', pageSize: 48 })
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounced(search)
  useEffect(() => {
    if (debounced !== state.q) update({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  const { data, loading, error, reload } = useResource(() => mediaService.list(query), [JSON.stringify(query)])
  const sign = useResource(() => (can('media:write') ? mediaService.sign() : Promise.resolve({ configured: false })), [])
  const [selected, setSelected] = useState<MediaAsset | null>(null)
  const [adding, setAdding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [replaceTarget, setReplaceTarget] = useState<MediaAsset | null>(null)
  const [toDelete, setToDelete] = useState<MediaAsset | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ filename: '', url: '', kind: 'image' as MediaKind, alt: '' })
  const canWrite = can('media:write')
  const cloudinary = sign.data?.configured === true

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !sign.data?.configured) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_UPLOAD_MB * 1e6) throw new Error(`${file.name} is larger than ${MAX_UPLOAD_MB} MB.`)
        const fresh = await mediaService.sign() // new signature per file
        const up = await uploadToCloudinary(file, fresh)
        const data = { filename: file.name, kind: kindOf(file.type), mimeType: file.type, size: up.bytes, url: up.secure_url, uploadedBy: user?.name, storage: 'cloudinary' as const }
        if (replaceTarget) await mediaService.update(replaceTarget.id, data)
        else await mediaService.create(data)
      }
      notify({ tone: 'success', title: replaceTarget ? 'File replaced' : 'Upload complete' })
      setReplaceTarget(null)
      setSelected(null)
      reload()
    } catch (e) {
      notify({ tone: 'error', title: 'Upload failed', message: (e as Error).message })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const copy = async (url: string) => {
    const abs = url.startsWith('/') ? `${window.location.origin}${url}` : url
    try {
      await navigator.clipboard.writeText(abs)
      notify({ tone: 'success', title: 'URL copied' })
    } catch {
      notify({ tone: 'error', title: 'Couldn’t copy', message: abs })
    }
  }

  return (
    <>
      <PageHeader
        title="Media library"
        description="Images, documents, PDFs and video used across the website."
        actions={
          canWrite ? (
            <>
              <Button icon="link" onClick={() => setAdding(true)}>Add by URL</Button>
              <Button variant="primary" icon="upload" loading={uploading} disabled={!cloudinary} title={cloudinary ? undefined : 'Connect Cloudinary to enable uploads'} onClick={() => fileRef.current?.click()}>
                Upload
              </Button>
              <input ref={fileRef} type="file" multiple hidden accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.txt" onChange={(e) => handleFiles(e.target.files)} />
            </>
          ) : null
        }
      />
      {canWrite && sign.data && !cloudinary ? (
        <p role="note" className="mb-5 flex items-start gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900 ring-1 ring-teal-200">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          <span>
            File storage isn’t connected yet, so uploads are disabled. Set <code className="rounded bg-white px-1">CLOUDINARY_CLOUD_NAME</code>, <code className="rounded bg-white px-1">CLOUDINARY_API_KEY</code> and <code className="rounded bg-white px-1">CLOUDINARY_API_SECRET</code> on the server to upload directly to Cloudinary. Meanwhile you can register files hosted elsewhere with “Add by URL”.
          </span>
        </p>
      ) : null}

      <div className="rounded-xl bg-white ring-1 ring-teal-900/10">
        <div className="flex flex-wrap items-center gap-2 border-b border-teal-900/8 p-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search files…" className="w-full sm:w-64" />
          <FilterSelect label="Type" value={state.filters.kind} onChange={(v) => update({ filters: { kind: v } })} options={KINDS.map((k) => ({ value: k, label: labelize(k) }))} />
        </div>
        {error ? (
          <ErrorState error={error} onRetry={reload} what="media" />
        ) : loading && !data ? (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div>
        ) : !data?.items.length ? (
          <EmptyState icon="image" title="No media yet." body="Upload images and documents, or add files by URL." />
        ) : (
          <ul className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-5">
            {data.items.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => setSelected(a)} className="group block w-full text-left">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-cream-50 ring-1 ring-teal-900/10 transition group-hover:ring-teal-600">
                    {a.kind === 'image' ? <img src={a.url} alt={a.alt ?? ''} loading="lazy" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-teal-700"><Icon name={KIND_ICON[a.kind]} size={34} /></span>}
                    {a.isDemo ? <span className="absolute top-2 left-2"><DemoTag /></span> : null}
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-teal-900">{a.filename}</p>
                  <p className="text-xs text-teal-900/55">{labelize(a.kind)} · {size(a.size ?? 0)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.filename ?? ''}
        footer={
          selected && canWrite ? (
            <>
              <Button variant="danger" icon="trash" onClick={() => setToDelete(selected)}>Delete</Button>
              {cloudinary ? <Button icon="upload" onClick={() => { setReplaceTarget(selected); fileRef.current?.click() }}>Replace file</Button> : null}
              <Button variant="primary" icon="copy" onClick={() => copy(selected.url)}>Copy URL</Button>
            </>
          ) : selected ? <Button variant="primary" icon="copy" onClick={() => copy(selected.url)}>Copy URL</Button> : null
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl bg-cream-50 ring-1 ring-teal-900/10">
              {selected.kind === 'image' ? <img src={selected.url} alt={selected.alt ?? ''} className="max-h-80 w-full object-contain" /> : selected.kind === 'video' ? <video src={selected.url} controls className="w-full" /> : <a href={selected.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-6 text-sm text-teal-700 hover:underline"><Icon name="arrowUpRight" size={16} /> Open file</a>}
            </div>
            <DetailList
              items={[
                { label: 'Filename', value: selected.filename },
                { label: 'Type', value: `${labelize(selected.kind)} (${selected.mimeType})` },
                { label: 'Size', value: size(selected.size ?? 0) },
                { label: 'Storage', value: labelize(selected.storage ?? 'external') },
                { label: 'Uploaded by', value: selected.uploadedBy },
                { label: 'Upload date', value: formatDateTime(selected.createdAt) },
                { label: 'Alt text', value: selected.alt },
                { label: 'URL', value: <code className="break-all text-xs">{selected.url}</code> },
              ]}
            />
          </div>
        ) : null}
      </Drawer>

      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        title="Add file by URL"
        footer={
          <>
            <Button onClick={() => setAdding(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!form.filename || !form.url}
              onClick={async () => {
                try {
                  await mediaService.create({ ...form, mimeType: form.kind === 'image' ? 'image/*' : form.kind === 'pdf' ? 'application/pdf' : 'application/octet-stream', size: 0, uploadedBy: user?.name, storage: 'external' })
                  setAdding(false)
                  setForm({ filename: '', url: '', kind: 'image', alt: '' })
                  notify({ tone: 'success', title: 'File added' })
                  reload()
                } catch (e) {
                  notify({ tone: 'error', title: 'Could not add file', message: (e as Error).message })
                }
              }}
            >
              Add file
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <TextField label="Name" required value={form.filename} onChange={(e) => setForm({ ...form, filename: e.target.value })} />
          <TextField label="URL" type="url" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} hint="https://… or a site path like /images/…" />
          <SelectField label="Type" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as MediaKind })} options={KINDS.map((k) => ({ value: k, label: labelize(k) }))} />
          {form.kind === 'image' ? <TextField label="Alt text" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} hint="Describe the image for screen-reader users." /> : null}
        </div>
      </Dialog>
      <ConfirmDialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} danger title="Delete file?" body="This removes it from the library. Pages still linking to its URL may break." confirmLabel="Delete" onConfirm={async () => { if (toDelete) { await mediaService.remove(toDelete.id); setToDelete(null); setSelected(null); reload() } }} />
      {!canWrite ? <Card className="mt-4"><p className="text-sm text-teal-900/60">You have read-only access to media.</p></Card> : null}
    </>
  )
}
