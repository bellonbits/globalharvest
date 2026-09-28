import { useId, type ChangeEvent, type ReactNode } from 'react'
import type { Option } from '../../content/formOptions'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'

interface CheckboxFieldProps {
  name: string
  label: ReactNode
  value: unknown
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: { target: { name: string } }) => void
  error?: string
  required?: boolean
  className?: string
  tone?: 'default' | 'card'
}

/** Single checkbox — used for consent and yes/no questions. */
export function CheckboxField({ name, label, value, onChange, onBlur, error, required, className }: CheckboxFieldProps) {
  const id = `${name}-${useId()}`
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="group flex cursor-pointer items-start gap-3.5">
        <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
          <input
            id={id}
            type="checkbox"
            name={name}
            checked={Boolean(value)}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={error ? true : undefined}
            aria-required={required || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              'peer size-6 cursor-pointer appearance-none rounded-md border-2 bg-cream-50 transition checked:border-teal-600 checked:bg-teal-600',
              error ? 'border-coral-600' : 'border-teal-800/30 group-hover:border-teal-600',
            )}
          />
          <Icon name="check" size={16} strokeWidth={2.6} className="pointer-events-none absolute text-cream-50 opacity-0 transition peer-checked:opacity-100" />
        </span>
        <span className="text-[0.95rem] leading-relaxed text-teal-900/85">
          {label}
          {required ? (
            <span className="ml-0.5 text-coral-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p id={`${id}-error`} className="pl-9.5 text-sm font-medium text-coral-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface ChoiceGroupProps<T extends string> {
  name: string
  legend: ReactNode
  options: Option<T>[]
  error?: string
  hint?: ReactNode
  required?: boolean
  columns?: 2 | 3
  className?: string
}

interface MultiChoiceProps<T extends string> extends ChoiceGroupProps<T> {
  value: T[]
  onChange: (next: T[]) => void
}

/** Multi-select as tappable cards (checkbox semantics inside a fieldset). */
export function CheckboxGroup<T extends string>({ name, legend, options, value, onChange, error, hint, required, columns = 3, className }: MultiChoiceProps<T>) {
  const id = `${name}-${useId()}`
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <fieldset
      className={cn('flex flex-col gap-3', className)}
      aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-error` : ''].join(' ').trim() || undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-1 font-display text-[0.92rem] font-medium text-teal-800">
        {legend}
        {required ? (
          <span className="ml-0.5 text-coral-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-2 text-sm text-teal-900/60">
          {hint}
        </p>
      ) : null}
      <div className={cn('grid gap-3 sm:grid-cols-2', columns === 3 && 'lg:grid-cols-3')}>
        {options.map((o) => {
          const checked = value.includes(o.value)
          return (
            <label
              key={o.value}
              className={cn(
                'group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-coral-400/40',
                checked ? 'border-teal-600 bg-teal-600 text-cream-50 shadow-soft' : 'border-teal-800/15 bg-cream-50 hover:border-teal-600/60',
              )}
            >
              <input
                type="checkbox"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => toggle(o.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition',
                  checked ? 'border-coral-300 bg-coral-300 text-teal-950' : 'border-teal-800/30',
                )}
              >
                {checked ? <Icon name="check" size={13} strokeWidth={3} /> : null}
              </span>
              <span>
                <span className="block font-display font-semibold">{o.label}</span>
                {o.hint ? <span className={cn('mt-0.5 block text-sm', checked ? 'text-cream-50/80' : 'text-teal-900/60')}>{o.hint}</span> : null}
              </span>
            </label>
          )
        })}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-coral-700">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

interface RadioGroupProps<T extends string> extends ChoiceGroupProps<T> {
  value: T | ''
  onChange: (next: T) => void
}

/** Segmented single-choice control (native radios for full keyboard support). */
export function RadioGroup<T extends string>({ name, legend, options, value, onChange, error, hint, required, className }: RadioGroupProps<T>) {
  const id = `${name}-${useId()}`
  return (
    <fieldset
      className={cn('flex flex-col gap-3', className)}
      aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-error` : ''].join(' ').trim() || undefined}
    >
      <legend className="mb-1 font-display text-[0.92rem] font-medium text-teal-800">
        {legend}
        {required ? (
          <span className="ml-0.5 text-coral-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-2 text-sm text-teal-900/60">
          {hint}
        </p>
      ) : null}
      <div className={cn('grid grid-cols-3 gap-1.5 rounded-2xl border bg-cream-50 p-1.5', error ? 'border-coral-600' : 'border-teal-800/15')}>
        {options.map((o) => {
          const checked = value === o.value
          return (
            <label
              key={o.value}
              className={cn(
                'relative cursor-pointer rounded-xl px-3 py-3 text-center font-display text-sm font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-coral-400/40',
                checked ? 'bg-teal-800 text-cream-50 shadow-soft' : 'text-teal-800 hover:bg-teal-800/5',
              )}
            >
              <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="sr-only" aria-invalid={error ? true : undefined} />
              {o.label}
            </label>
          )
        })}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-coral-700">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
