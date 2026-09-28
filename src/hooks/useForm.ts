import { useCallback, useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { validateSchema, type Schema } from '../lib/validation'

type Errors<T> = Partial<Record<keyof T, string>>
type Status = 'idle' | 'submitting' | 'success' | 'error'

interface UseFormOptions<T> {
  initialValues: T
  schema: Schema<T>
  onSubmit: (values: T) => Promise<void>
}

/**
 * Lightweight form state + validation.
 * - validates on blur and (after first submit) on change
 * - on a failed submit, focuses the first invalid field
 * - exposes a `website` honeypot; if filled, submission is silently skipped
 */
export function useForm<T extends object>({ initialValues, schema, onSubmit }: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Errors<T>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitCount, setSubmitCount] = useState(0)
  const [honeypot, setHoneypot] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const validateField = useCallback(
    (name: keyof T, next: T) => {
      const fieldErrors = validateSchema(next, { [name]: schema[name] } as Schema<T>)
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }))
    },
    [schema],
  )

  // Ref mirrors the latest values so rapid successive changes never read stale state.
  const valuesRef = useRef(values)
  useLayoutEffect(() => {
    valuesRef.current = values
  }, [values])

  const setFieldValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      const next = { ...valuesRef.current, [name]: value }
      valuesRef.current = next
      setValues(next)
      if (touched[name] || submitCount > 0) validateField(name, next)
    },
    [touched, submitCount, validateField],
  )

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target
    const next = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFieldValue(name as keyof T, next as T[keyof T])
  }

  const handleBlur = (e: { target: { name: string } }) => {
    const name = e.target.name as keyof T
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, values)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitCount((c) => c + 1)
    const all = validateSchema(values, schema)
    setErrors(all)
    const invalid = Object.keys(all).filter((k) => all[k as keyof T])
    if (invalid.length) {
      requestAnimationFrame(() => {
        const el = formRef.current?.querySelector<HTMLElement>(`[name="${invalid[0]}"]`)
        el?.focus()
      })
      return
    }
    if (honeypot) {
      setStatus('success') // bot trap: pretend success, send nothing
      return
    }
    setStatus('submitting')
    setSubmitError(null)
    try {
      await onSubmit(values)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setStatus('idle')
    setSubmitCount(0)
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  return {
    values,
    errors,
    status,
    submitError,
    submitCount,
    errorCount,
    formRef,
    honeypot: { value: honeypot, onChange: (e: ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value) },
    setFieldValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    /** Spread onto FormField / SelectField / CheckboxField. */
    field: <K extends keyof T>(name: K) => ({
      name: name as string,
      value: values[name],
      error: errors[name],
      onChange: handleChange,
      onBlur: handleBlur,
    }),
  }
}
