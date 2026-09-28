import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ageRangeOptions,
  countryOptions,
  interestOptions,
  languageOptions,
  participationOptions,
  referralOptions,
} from '../../content/formOptions'
import { useForm } from '../../hooks/useForm'
import { registrationSchema as schema } from '../../lib/schemas'
import { registrationService } from '../../services'
import type { InterestArea, Registration } from '../../types'
import { useToast } from '../ui/Toast'
import { CheckboxField, CheckboxGroup, RadioGroup } from './CheckboxField'
import { FormField, TextAreaField } from './FormField'
import { ErrorSummary, FormSection, Honeypot, PrivacyNote, SubmitButton } from './FormParts'
import { SelectField } from './SelectField'


const INTERESTS = new Set(interestOptions.map((o) => o.value))

export function RegistrationForm() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [params] = useSearchParams()
  const countries = useMemo(countryOptions, [])

  const preselected = (params.get('interest') ?? '')
    .split(',')
    .filter((x): x is InterestArea => INTERESTS.has(x as InterestArea))

  const form = useForm<Registration>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      ageRange: '',
      preferredLanguage: '',
      referralSource: '',
      interests: preselected,
      participation: '',
      church: '',
      areasOfInterest: '',
      message: '',
      consent: false,
    },
    schema,
    onSubmit: async (values) => {
      try {
        const res = await registrationService.submit(values)
        if (!res.ok) throw new Error(res.message ?? 'Registration could not be completed.')
        navigate('/register/welcome', { state: { firstName: values.firstName.trim(), interests: values.interests } })
      } catch (err) {
        notify({ tone: 'error', title: 'We couldn’t complete your registration', message: 'Please check your connection and try again.' })
        throw err
      }
    },
  })

  const { field, values, errors, setFieldValue } = form
  const submitting = form.status === 'submitting'

  return (
    <form ref={form.formRef} onSubmit={form.handleSubmit} noValidate className="relative grid gap-12" aria-label="Registration form">
      <Honeypot {...form.honeypot} />
      <ErrorSummary count={form.errorCount} show={form.submitCount > 0} />

      <FormSection index={1} title="About you" description="So we know who we’re welcoming.">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="First name" autoComplete="given-name" required {...field('firstName')} />
          <FormField label="Last name" autoComplete="family-name" required {...field('lastName')} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Email" type="email" autoComplete="email" inputMode="email" required {...field('email')} />
          <FormField label="Phone number" type="tel" autoComplete="tel" inputMode="tel" hint="Include your country code, e.g. +44" required {...field('phone')} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <SelectField label="Country" autoComplete="country-name" options={countries} placeholder="Select your country" required {...field('country')} />
          <FormField label="City" autoComplete="address-level2" required {...field('city')} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <SelectField label="Age range" options={ageRangeOptions} required {...field('ageRange')} />
          <SelectField label="Preferred language" options={languageOptions} required {...field('preferredLanguage')} />
        </div>
        <SelectField label="How did you hear about Global Harvest?" options={referralOptions} required {...field('referralSource')} />
      </FormSection>

      <FormSection index={2} title="Getting involved" description="Choose as many as you like — you can change this later.">
        <CheckboxGroup
          name="interests"
          legend="What would you like to join?"
          options={interestOptions}
          value={values.interests}
          onChange={(next) => setFieldValue('interests', next)}
          error={errors.interests}
          required
        />
        <RadioGroup
          name="participation"
          legend="Preferred participation"
          options={participationOptions}
          value={values.participation}
          onChange={(next) => setFieldValue('participation', next)}
          error={errors.participation}
          required
        />
      </FormSection>

      <FormSection index={3} title="A little more" description="Optional — but it helps us connect you well.">
        <FormField label="Church / fellowship" optional hint="If you’re part of a local church, let us know which one." {...field('church')} />
        <FormField label="Areas of interest" optional hint="e.g. worship, youth, media, teaching, hospitality" {...field('areasOfInterest')} />
        <TextAreaField label="Additional message" optional maxLength={1000} showCount rows={4} {...field('message')} />
      </FormSection>

      <div className="grid gap-6 border-t border-teal-800/10 pt-10 lg:pl-[260px]">
        <CheckboxField
          label="I agree to receive information about Global Harvest activities and events."
          required
          {...field('consent')}
        />
        <PrivacyNote>
          Your details are used only to connect you with Global Harvest. Read our{' '}
          <Link to="/privacy" className="font-medium text-teal-700 underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </PrivacyNote>
        <div>
          <SubmitButton submitting={submitting}>Complete Registration</SubmitButton>
        </div>
      </div>
    </form>
  )
}
