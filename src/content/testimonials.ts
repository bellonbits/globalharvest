import type { Testimonial } from '../types'

/**
 * PLACEHOLDER TESTIMONIALS.
 * No real testimonials have been supplied. These entries reserve the space
 * and describe what belongs there. Replace with genuine, consented stories.
 */
export const testimonials: Testimonial[] = [
  {
    id: 't1',
    isPlaceholder: true,
    quote:
      'This space is reserved for a member’s story — how reading Scripture with others has changed the way they understand God.',
    name: 'Member name',
    context: 'Bible Study participant',
  },
  {
    id: 't2',
    isPlaceholder: true,
    quote:
      'A real testimony will appear here: what it has meant to be prayed for, and to pray for others, as part of a global community.',
    name: 'Member name',
    context: 'Prayer group',
  },
  {
    id: 't3',
    isPlaceholder: true,
    quote:
      'Reserved for a story of being sent — someone who has stepped out to serve their neighbourhood or the nations.',
    name: 'Member name',
    context: 'Mission group',
  },
]
