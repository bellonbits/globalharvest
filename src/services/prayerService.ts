import type { PrayerRequest, SubmissionResult } from '../types'
import { http, isApiConfigured, mockDelay, newId } from './http'
import { appendLocal } from './localStore'

/**
 * Prayer requests are private. They are sent only to the backend (never
 * rendered publicly), and the mock adapter keeps a receipt only — it does
 * not store the request text or personal details.
 */
export const prayerService = {
  /** POST /prayer-requests */
  async submit(request: PrayerRequest): Promise<SubmissionResult> {
    const payload = { ...request, submittedAt: new Date().toISOString() }
    if (isApiConfigured) return http.post<SubmissionResult>('/prayer-requests', payload)

    await mockDelay()
    const id = newId('prayer')
    appendLocal('prayerReceipts', { id, submittedAt: payload.submittedAt })
    return { ok: true, id }
  },
}
