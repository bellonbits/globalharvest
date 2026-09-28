import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import type { Option } from '../../content/formOptions'
import { cn } from '../../lib/cn'
import { Icon } from '../brand/Icon'
import { FieldShell, describedBy, inputBase, inputState } from './FormField'

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  label: ReactNode
  name: string
  value: unknown
  options: Option[]
  placeholder?: string
  error?: string
  hint?: ReactNode
  optional?: boolean
  className?: string
}

export function SelectField({ label, name, value, options, placeholder = 'Select…', error, hint, optional, required, className, id, ...rest }: SelectFieldProps) {
  const autoId = useId()
  const fieldId = id ?? `${name}-${autoId}`
  return (
    <FieldShell id={fieldId} label={label} required={required} optional={optional} hint={hint} error={error} className={className}>
      <div className="relative">
        <select
          id={fieldId}
          name={name}
          value={(value as string) ?? ''}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy(fieldId, hint, error)}
          className={cn(inputBase, inputState(error), 'appearance-none pr-11', !value && 'text-teal-900/45')}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-teal-900">
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={18} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-teal-800/60" />
      </div>
    </FieldShell>
  )
}
