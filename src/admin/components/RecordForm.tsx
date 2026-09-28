import { useState, type FormEvent, type ReactNode } from 'react'
import { AdminApiError } from '../api/client'
import { cn } from '../../lib/cn'
import { Button, Card, SelectField, TextAreaField, TextField, Toggle } from './ui'

export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'time' | 'number' | 'url' | 'email' | 'toggle' | 'tags'

export interface FieldConfig {
  name: string
  label: string
  type?: FieldType
  required?: boolean
  options?: { value: string; label: string }[]
  hint?: string
  placeholder?: string
  /** Full-width field on a 2-column grid. */
  wide?: boolean
  /** Show only when this returns true. */
  when?: (values: Record<string, unknown>) => boolean
}

export interface FormSectionConfig {
  title: string
  description?: string
  fields: FieldConfig[]
}

interface RecordFormProps {
  sections: FormSectionConfig[]
  initial: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => Promise<void>
  submitLabel?: string
  onCancel?: () => void
  extra?: (values: Record<string, unknown>, set: (name: string, v: unknown) => void) => ReactNode
  readOnly?: boolean
}

/**
 * Config-driven record editor used by Events, Bible studies, Groups,
 * Resources and Members. Client checks are for convenience only —
 * the API re-validates everything.
 */
export function RecordForm({ sections, initial, onSubmit, submitLabel = 'Save', onCancel, extra, readOnly }: RecordFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const set = (name: string, v: unknown) => {
    setValues((s) => ({ ...s, [name]: v }))
    setErrors((e) => ({ ...e, [name]: '' }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const missing: Record<string, string> = {}
    for (const s of sections)
      for (const f of s.fields) {
        if (f.when && !f.when(values)) continue
        const v = values[f.name]
        if (f.required && (v === undefined || v === null || v === '')) missing[f.name] = 'This field is required.'
        if (f.type === 'url' && typeof v === 'string' && v && !/^(https?:\/\/|\/)/.test(v)) missing[f.name] = 'Use a full address starting with https:// or /.'
      }
    if (Object.keys(missing).length) {
      setErrors(missing)
      setFormError('Please fix the highlighted fields.')
      document.querySelector<HTMLElement>(`[name="${Object.keys(missing)[0]}"]`)?.focus()
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      await onSubmit(values)
    } catch (err) {
      if (err instanceof AdminApiError && err.fields) setErrors(err.fields)
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const renderField = (f: FieldConfig) => {
    if (f.when && !f.when(values)) return null
    const v = values[f.name]
    const common = { name: f.name, label: f.label, required: f.required, hint: f.hint, error: errors[f.name], disabled: readOnly, placeholder: f.placeholder }
    const wrap = (node: ReactNode) => (
      <div key={f.name} className={cn(f.wide || f.type === 'textarea' ? 'sm:col-span-2' : undefined)}>
        {node}
      </div>
    )
    switch (f.type) {
      case 'textarea':
        return wrap(<TextAreaField {...common} value={(v as string) ?? ''} onChange={(e) => set(f.name, e.target.value)} rows={5} />)
      case 'select':
        return wrap(<SelectField {...common} options={f.options ?? []} value={(v as string) ?? ''} onChange={(e) => set(f.name, e.target.value)} placeholder={f.required ? undefined : 'Not set'} />)
      case 'toggle':
        return wrap(<Toggle label={f.label} hint={f.hint} checked={Boolean(v)} onChange={(c) => set(f.name, c)} />)
      case 'number':
        return wrap(<TextField {...common} type="number" min={0} value={v === undefined || v === null ? '' : String(v)} onChange={(e) => set(f.name, e.target.value === '' ? undefined : Number(e.target.value))} />)
      case 'tags':
        return wrap(<TextField {...common} value={Array.isArray(v) ? (v as string[]).join(', ') : ''} onChange={(e) => set(f.name, e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} hint={f.hint ?? 'Separate with commas'} />)
      default:
        return wrap(<TextField {...common} type={f.type ?? 'text'} value={(v as string) ?? ''} onChange={(e) => set(f.name, e.target.value)} />)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {formError ? (
        <p role="alert" className="rounded-lg bg-coral-50 px-4 py-3 text-sm font-medium text-coral-800 ring-1 ring-coral-300">
          {formError}
        </p>
      ) : null}
      {sections.map((s) => (
        <Card key={s.title} title={s.title}>
          {s.description ? <p className="-mt-1 mb-4 text-sm text-teal-900/60">{s.description}</p> : null}
          <div className="grid gap-5 sm:grid-cols-2">{s.fields.map(renderField)}</div>
        </Card>
      ))}
      {extra?.(values, set)}
      {!readOnly ? (
        <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-teal-900/8 bg-[#f4f2ee]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-4">
          {onCancel ? <Button onClick={onCancel}>Cancel</Button> : null}
          <Button type="submit" variant="primary" loading={saving}>
            {submitLabel}
          </Button>
        </div>
      ) : null}
    </form>
  )
}
