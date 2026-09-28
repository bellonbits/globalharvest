import type { ContactMessage, SubmissionResult } from '../types'
import { http, isApiConfigured, mockDelay, newId } from './http'
import { appendLocal } from './localStore'

export const contactService = {
  /** POST /contact */
  async send(message: ContactMessage): Promise<SubmissionResult> {
    const payload = { ...message, submittedAt: new Date().toISOString() }
    if (isApiConfigured) return http.post<SubmissionResult>('/contact', payload)

    await mockDelay()
    const id = newId('msg')
    appendLocal('contactMessages', { id, ...payload })
    return { ok: true, id }
  },
}
