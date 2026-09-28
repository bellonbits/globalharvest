import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const inputBase =
  'block w-full rounded-xl border bg-cream-50 px-4 py-3.5 text-base text-teal-900 placeholder:text-teal-900/40 shadow-[inset_0_1px_2px_rgb(6_52_61/0.04)] transition focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-600/12'

export const inputState = (error?: string) =>
  error ? 'border-coral-600 ring-2 ring-coral-500/15' : 'border-teal-800/15 hover:border-teal-800/30'

interface FieldShellProps {
  id: string
  label: ReactNode
  required?: boolean
  optional?: boolean
  hint?: ReactNode
  error?: string
  children: ReactNode
  className?: string
}

/** Label + hint + error wrapper shared by every field type. */
export function FieldShell({ id, label, required, optional, hint, error, children, className }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 font-display text-[0.92rem] font-medium text-teal-800">
        <span>
          {label}
          {required ? (
            <span className="ml-0.5 text-coral-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </span>
        {optional ? <span className="text-xs font-normal text-teal-900/55">Optional</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-1 text-sm text-teal-900/60">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-coral-700">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0" fill="currentColor">
            <path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm-.75 4.5h1.5v5.5h-1.5V6Zm.75 8.75a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const describedBy = (id: string, hint?: unknown, error?: string) =>
  [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
  label: ReactNode
  name: string
  value: unknown
  error?: string
  hint?: ReactNode
  optional?: boolean
  className?: string
}

export function FormField({ label, name, value, error, hint, optional, required, className, id, ...rest }: FormFieldProps) {
  const autoId = useId()
  const fieldId = id ?? `${name}-${autoId}`
  return (
    <FieldShell id={fieldId} label={label} required={required} optional={optional} hint={hint} error={error} className={className}>
      <input
        id={fieldId}
        name={name}
        value={(value as string | number | undefined) ?? ''}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(inputBase, inputState(error))}
        {...rest}
      />
    </FieldShell>
  )
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  label: ReactNode
  name: string
  value: unknown
  error?: string
  hint?: ReactNode
  optional?: boolean
  className?: string
  showCount?: boolean
}

export function TextAreaField({ label, name, value, error, hint, optional, required, className, id, maxLength, showCount, rows = 5, ...rest }: TextAreaFieldProps) {
  const autoId = useId()
  const fieldId = id ?? `${name}-${autoId}`
  const length = String(value ?? '').length
  return (
    <FieldShell id={fieldId} label={label} required={required} optional={optional} hint={hint} error={error} className={className}>
      <textarea
        id={fieldId}
        name={name}
        rows={rows}
        maxLength={maxLength}
        value={(value as string) ?? ''}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(inputBase, inputState(error), 'min-h-32 resize-y leading-relaxed')}
        {...rest}
      />
      {showCount && maxLength ? (
        <p className="-mt-1 text-right text-xs text-teal-900/50" aria-hidden="true">
          {length} / {maxLength}
        </p>
      ) : null}
    </FieldShell>
  )
}
