import { useSearchParams } from 'react-router-dom'
import { contactCategoryOptions } from '../../content/formOptions'
import { useForm } from '../../hooks/useForm'
import { contactSchema as schema } from '../../lib/schemas'
import { contactService } from '../../services'
import type { ContactCategory, ContactMessage } from '../../types'
import { CTAButton } from '../ui/Button'
import { useToast } from '../ui/Toast'
import { FormField, TextAreaField } from './FormField'
import { ErrorSummary, Honeypot, PrivacyNote, SubmitButton } from './FormParts'
import { FormSuccess } from './FormSuccess'
import { SelectField } from './SelectField'


const CATEGORIES = new Set(contactCategoryOptions.map((o) => o.value))

export function ContactForm() {
  const { notify } = useToast()
  const [params] = useSearchParams()
  const preset = params.get('category') as ContactCategory | null
  const form = useForm<ContactMessage>({
    initialValues: { name: '', email: '', phone: '', category: preset && CATEGORIES.has(preset) ? preset : 'general', subject: '', message: '' },
    schema,
    onSubmit: async (values) => {
      try {
        const res = await contactService.send(values)
        if (!res.ok) throw new Error(res.message)
      } catch (err) {
        notify({ tone: 'error', title: 'Message not sent', message: 'Please try again in a moment.' })
        throw err
      }
    },
  })

  if (form.status === 'success') {
    return (
      <FormSuccess
        title="Message received."
        actions={
          <CTAButton variant="dark" onClick={form.reset} icon={null}>
            Send another message
          </CTAButton>
        }
      >
        <p>Thank you for reaching out{form.values.name ? `, ${form.values.name.trim().split(' ')[0]}` : ''}. We’ll reply to {form.values.email} as soon as we can.</p>
      </FormSuccess>
    )
  }

  const { field } = form
  return (
    <form ref={form.formRef} onSubmit={form.handleSubmit} noValidate className="relative grid gap-6" aria-label="Contact form">
      <Honeypot {...form.honeypot} />
      <ErrorSummary count={form.errorCount} show={form.submitCount > 0} />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Name" autoComplete="name" required {...field('name')} />
        <FormField label="Email" type="email" autoComplete="email" inputMode="email" required {...field('email')} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Phone" type="tel" autoComplete="tel" inputMode="tel" optional {...field('phone')} />
        <SelectField label="Category" options={contactCategoryOptions} required {...field('category')} />
      </div>
      <FormField label="Subject" required {...field('subject')} />
      <TextAreaField label="Message" required rows={6} maxLength={3000} showCount {...field('message')} />
      <PrivacyNote>We’ll only use your details to reply to your message.</PrivacyNote>
      <div>
        <SubmitButton submitting={form.status === 'submitting'}>Send Message</SubmitButton>
      </div>
    </form>
  )
}
