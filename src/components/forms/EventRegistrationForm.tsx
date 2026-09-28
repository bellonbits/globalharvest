import { useMemo } from 'react'
import { countryOptions } from '../../content/formOptions'
import { useForm } from '../../hooks/useForm'
import { formatDate } from '../../lib/format'
import { eventRegistrationSchema as schema } from '../../lib/schemas'
import type { Schema } from '../../lib/validation'
import { eventService } from '../../services'
import type { Event, EventRegistration } from '../../types'
import { CTAButton } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { CheckboxField } from './CheckboxField'
import { FormField, TextAreaField } from './FormField'
import { ErrorSummary, Honeypot, PrivacyNote, SubmitButton } from './FormParts'
import { FormSuccess } from './FormSuccess'
import { SelectField } from './SelectField'

type Values = Omit<EventRegistration, 'eventSlug' | 'attendees'> & { attendees: string }

// Shared schema also validates eventSlug server-side; the form supplies it at submit time.
const formSchema = schema as unknown as Schema<Values>


export function EventRegistrationForm({ event }: { event: Event }) {
  const { notify } = useToast()
  const countries = useMemo(countryOptions, [])
  const waitlist = event.registrationStatus === 'waitlist'

  const form = useForm<Values>({
    initialValues: { firstName: '', lastName: '', email: '', phone: '', country: '', attendees: '1', specialRequirements: '', consent: false },
    schema: formSchema,
    onSubmit: async (values) => {
      try {
        const res = await eventService.register({ ...values, attendees: Number(values.attendees), eventSlug: event.slug })
        if (!res.ok) throw new Error(res.message)
      } catch (err) {
        notify({ tone: 'error', title: 'Registration didn’t go through', message: 'Please try again in a moment.' })
        throw err
      }
    },
  })

  if (form.status === 'success') {
    return (
      <FormSuccess
        title={waitlist ? 'You’re on the waitlist.' : 'Registration successful.'}
        actions={
          <>
            <CTAButton to="/events" variant="dark">
              More events
            </CTAButton>
            <CTAButton to="/register" variant="secondary">
              Join Global Harvest
            </CTAButton>
          </>
        }
      >
        <p>
          Thank you{form.values.firstName ? `, ${form.values.firstName.trim()}` : ''}. {waitlist ? 'We’ll let you know if a place opens up for' : 'Your place is reserved for'}{' '}
          <strong className="font-semibold text-teal-800">{event.title}</strong> on {formatDate(event.startsAt)}.
        </p>
        <p className="mt-3">Event details will be sent to {form.values.email}.</p>
      </FormSuccess>
    )
  }

  const { field } = form
  return (
    <form ref={form.formRef} onSubmit={form.handleSubmit} noValidate className="relative grid gap-6" aria-label={`Register for ${event.title}`}>
      <Honeypot {...form.honeypot} />
      <ErrorSummary count={form.errorCount} show={form.submitCount > 0} />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="First name" autoComplete="given-name" required {...field('firstName')} />
        <FormField label="Last name" autoComplete="family-name" required {...field('lastName')} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Email" type="email" autoComplete="email" inputMode="email" required {...field('email')} />
        <FormField label="Phone" type="tel" autoComplete="tel" inputMode="tel" required {...field('phone')} />
      </div>
      <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
        <SelectField label="Country" options={countries} placeholder="Select your country" required {...field('country')} />
        <FormField label="Number of attendees" type="number" min={1} max={10} inputMode="numeric" required {...field('attendees')} />
      </div>
      <TextAreaField
        label="Special requirements"
        optional
        hint="Accessibility needs, dietary requirements, childcare questions…"
        rows={3}
        maxLength={500}
        {...field('specialRequirements')}
      />
      <CheckboxField label="I agree to receive information about this event and Global Harvest activities." required {...field('consent')} />
      <PrivacyNote>We only use these details to manage your registration.</PrivacyNote>
      <div>
        <SubmitButton submitting={form.status === 'submitting'}>{waitlist ? 'Join the waitlist' : 'Register for this event'}</SubmitButton>
      </div>
    </form>
  )
}
