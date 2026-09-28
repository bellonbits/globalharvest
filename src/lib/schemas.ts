/**
 * Validation schemas shared by the browser forms and the server API (api/),
 * so both sides always enforce identical rules.
 */
import type { ContactMessage, EventRegistration, PrayerRequest, Registration } from '../types'
import { v, type Schema } from './validation'

export const registrationSchema: Schema<Registration> = {
  firstName: [v.required('Please enter your first name.'), v.maxLength(60)],
  lastName: [v.required('Please enter your last name.'), v.maxLength(60)],
  email: [v.required('Please enter your email address.'), v.email(), v.maxLength(254)],
  phone: [v.required('Please enter a phone number so we can reach you.'), v.phone()],
  country: [v.required('Please select your country.'), v.maxLength(80)],
  city: [v.required('Please enter your city or town.'), v.maxLength(80)],
  ageRange: [v.required('Please select your age range.')],
  preferredLanguage: [v.required('Please select a preferred language.'), v.maxLength(40)],
  referralSource: [v.required('Please tell us how you heard about us.'), v.maxLength(60)],
  interests: [v.required('Choose at least one thing you would like to join.')],
  participation: [v.required('Please choose how you would like to take part.')],
  message: [v.maxLength(1000)],
  areasOfInterest: [v.maxLength(300)],
  church: [v.maxLength(120)],
  consent: [v.mustBeTrue('Please agree so we can contact you about Global Harvest.')],
}

/** `attendees` arrives as a string from the form input and as a number in the API payload. */
export type EventRegistrationInput = Omit<EventRegistration, 'attendees'> & { attendees: string | number }

export const eventRegistrationSchema: Schema<EventRegistrationInput> = {
  firstName: [v.required('Please enter your first name.'), v.maxLength(60)],
  lastName: [v.required('Please enter your last name.'), v.maxLength(60)],
  email: [v.required('Please enter your email address.'), v.email(), v.maxLength(254)],
  phone: [v.required('Please enter a phone number.'), v.phone()],
  country: [v.required('Please select your country.'), v.maxLength(80)],
  attendees: [v.required('How many people are attending?'), v.range(1, 10, 'Enter between 1 and 10 attendees. For larger groups, please contact us.')],
  specialRequirements: [v.maxLength(500)],
  consent: [v.mustBeTrue('Please agree so we can send you event details.')],
}

export const prayerRequestSchema: Schema<PrayerRequest> = {
  fullName: [v.required('Please enter your name (a first name is fine).'), v.maxLength(80)],
  email: [v.required('Please enter your email address.'), v.email(), v.maxLength(254)],
  request: [v.required('Please share what you would like us to pray for.'), v.minLength(10, 'Please share a little more so we can pray well.'), v.maxLength(2000)],
  country: [v.required('Please select your country.'), v.maxLength(80)],
  consent: [v.mustBeTrue('Please confirm you’re happy for our prayer team to see this request.')],
}

export const contactSchema: Schema<ContactMessage> = {
  name: [v.required('Please enter your name.'), v.maxLength(80)],
  email: [v.required('Please enter your email address.'), v.email(), v.maxLength(254)],
  phone: [v.phone()],
  category: [v.required('Please choose a category.')],
  subject: [v.required('Please add a subject.'), v.maxLength(120)],
  message: [v.required('Please write a message.'), v.minLength(10, 'Please add a little more detail.'), v.maxLength(3000)],
}
