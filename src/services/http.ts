/**
 * Minimal HTTP client. When VITE_API_BASE_URL is set every service talks to
 * the backend; otherwise services fall back to their local mock adapters.
 */
const BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/$/, '')

/** Form submissions go to the API (e.g. "/api", served by Vercel functions in api/). */
export const isApiConfigured = BASE_URL.length > 0

/**
 * Content (events, studies, groups…) is read from src/content by default.
 * Set VITE_CONTENT_FROM_API=true once the backend also serves content.
 */
export const isContentApiConfigured = isApiConfigured && import.meta.env.VITE_CONTENT_FROM_API === 'true'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.message) message = data.message
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
}

/** Simulated network latency for mock adapters so loading states are exercised. */
export const mockDelay = (ms = 650) => new Promise((r) => setTimeout(r, ms))

export const newId = (prefix: string) =>
  `${prefix}_${(globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 12)}`
