/**
 * Small composable validators. Each returns an error message or undefined.
 * Mirrors what the backend should also enforce server-side.
 */
export type Validator<V = unknown> = (value: V) => string | undefined

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/

export const v = {
  required:
    (message = 'This field is required.'): Validator =>
    (value) => {
      if (Array.isArray(value)) return value.length ? undefined : message
      if (typeof value === 'boolean') return value ? undefined : message
      return value === undefined || value === null || String(value).trim() === '' ? message : undefined
    },
  email:
    (message = 'Enter a valid email address, like name@example.com.'): Validator =>
    (value) =>
      !value || EMAIL_RE.test(String(value).trim()) ? undefined : message,
  phone:
    (message = 'Enter a valid phone number, including country code if outside your country.'): Validator =>
    (value) =>
      !value || PHONE_RE.test(String(value).trim()) ? undefined : message,
  minLength:
    (min: number, message?: string): Validator =>
    (value) =>
      !value || String(value).trim().length >= min ? undefined : (message ?? `Please enter at least ${min} characters.`),
  maxLength:
    (max: number, message?: string): Validator =>
    (value) =>
      !value || String(value).length <= max ? undefined : (message ?? `Please keep this under ${max} characters.`),
  range:
    (min: number, max: number, message?: string): Validator =>
    (value) => {
      const n = Number(value)
      return Number.isFinite(n) && n >= min && n <= max ? undefined : (message ?? `Enter a number from ${min} to ${max}.`)
    },
  mustBeTrue:
    (message: string): Validator =>
    (value) =>
      value === true ? undefined : message,
}

export type Schema<T> = Partial<Record<keyof T, Validator[]>>

export function validateSchema<T extends object>(values: T, schema: Schema<T>) {
  const errors: Partial<Record<keyof T, string>> = {}
  for (const key of Object.keys(schema) as (keyof T)[]) {
    for (const rule of schema[key] ?? []) {
      const err = rule(values[key])
      if (err) {
        errors[key] = err
        break
      }
    }
  }
  return errors
}
