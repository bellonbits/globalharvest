import { useMemo } from 'react'
import { countryOptions } from '../../content/formOptions'
import { useForm } from '../../hooks/useForm'
import { prayerRequestSchema as schema } from '../../lib/schemas'
import { prayerService } from '../../services'
import type { PrayerRequest } from '../../types'
import { CTAButton } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { CheckboxField } from './CheckboxField'
import { FormField, TextAreaField } from './FormField'
import { ErrorSummary, Honeypot, PrivacyNote, SubmitButton } from './FormParts'
import { FormSuccess } from './FormSuccess'
import { SelectField } from './SelectField'


export function PrayerRequestForm() {
  const { notify } = useToast()
  const countries = useMemo(countryOptions, [])
  const form = useForm<PrayerRequest>({
    initialValues: { fullName: '', email: '', request: '', country: '', category: '', wantsContact: false, consent: false },
    schema,
    onSubmit: async (values) => {
      try {
        const res = await prayerService.submit(values)
        if (!res.ok) throw new Error(res.message)
      } catch (err) {
        notify({ tone: 'error', title: 'Your request wasn’t sent', message: 'Please try again in a moment.' })
        throw err
      }
    },
  })

  if (form.status === 'success') {
    return (
      <FormSuccess
        title="We’re praying with you."
        actions={
          <>
            <CTAButton variant="dark" onClick={form.reset} icon={null}>
              Send another request
            </CTAButton>
            <CTAButton to="/register?interest=prayer" variant="secondary">
              Join the prayer group
            </CTAButton>
          </>
        }
      >
        <p>Thank you for trusting us with your request. It has been shared privately with our prayer team — never publicly.</p>
        {form.values.wantsContact ? <p className="mt-3">Someone from the team will be in touch by email.</p> : null}
      </FormSuccess>
    )
  }

  const { field } = form
  return (
    <form ref={form.formRef} onSubmit={form.handleSubmit} noValidate className="relative grid gap-6" aria-label="Prayer request form">
      <Honeypot {...form.honeypot} />
      <ErrorSummary count={form.errorCount} show={form.submitCount > 0} />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Full name" autoComplete="name" required {...field('fullName')} />
        <FormField label="Email" type="email" autoComplete="email" inputMode="email" required {...field('email')} />
      </div>
      <TextAreaField label="Prayer request" required rows={6} maxLength={2000} showCount hint="Share as much or as little as you like." {...field('request')} />
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField label="Country" options={countries} placeholder="Select your country" required {...field('country')} />
        <SelectField
          label="Category"
          optional
          placeholder="Choose a category"
          options={['personal', 'family', 'health', 'work', 'faith', 'community', 'mission', 'other'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
          {...field('category')}
        />
      </div>
      <CheckboxField label="I would like someone from the prayer team to contact me." {...field('wantsContact')} />
      <CheckboxField
        label="I understand this request will be shared privately with the Global Harvest prayer team and will not be published."
        required
        {...field('consent')}
      />
      <PrivacyNote>Prayer requests are confidential. They are never displayed on this website.</PrivacyNote>
      <div>
        <SubmitButton submitting={form.status === 'submitting'}>Request Prayer</SubmitButton>
      </div>
    </form>
  )
}
