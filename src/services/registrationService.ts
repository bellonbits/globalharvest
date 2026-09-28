import type { Registration, SubmissionResult } from '../types'
import { http, isApiConfigured, mockDelay, newId } from './http'
import { appendLocal } from './localStore'

export const registrationService = {
  /** POST /registrations */
  async submit(registration: Registration): Promise<SubmissionResult> {
    const payload: Registration = { ...registration, submittedAt: new Date().toISOString() }
    if (isApiConfigured) return http.post<SubmissionResult>('/registrations', payload)

    await mockDelay()
    const id = newId('reg')
    appendLocal('registrations', { id, ...payload })
    return { ok: true, id }
  },
}
