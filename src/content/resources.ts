import type { Resource, ResourceType } from '../types'

/**
 * Resources library. Items without an `href` are shown as "coming soon".
 * PLACEHOLDER — files and links have not been supplied yet.
 */
export const resources: Resource[] = [
  {
    isPlaceholder: true,
    slug: 'reading-plan-gospels',
    title: '30-Day Gospels Reading Plan',
    type: 'reading-plan',
    topic: 'Understanding Scripture',
    description: 'Read through the life of Jesus in a month with a short daily reflection question.',
  },
  {
    isPlaceholder: true,
    slug: 'how-to-study-a-passage',
    title: 'How to Study a Passage',
    type: 'guide',
    topic: 'Understanding Scripture',
    description: 'A simple observe–interpret–apply method you can use alone or in a group.',
  },
  {
    isPlaceholder: true,
    slug: 'leading-a-small-group',
    title: 'Leading a Small Group',
    type: 'guide',
    topic: 'Leadership',
    description: 'Practical help for hosting discussion, handling hard questions and praying together.',
  },
  {
    isPlaceholder: true,
    slug: 'prayer-rhythm',
    title: 'A Weekly Prayer Rhythm',
    type: 'download',
    topic: 'Prayer',
    description: 'A printable one-page guide to praying for your community, city and the nations.',
  },
  {
    isPlaceholder: true,
    slug: 'what-is-the-gospel',
    title: 'What Is the Gospel?',
    type: 'article',
    topic: 'The Gospel',
    description: 'A clear, short explanation of the good news of Jesus for sharing with friends.',
  },
  {
    isPlaceholder: true,
    slug: 'sent-teaching-series',
    title: 'SENT Teaching Series',
    type: 'video',
    topic: 'Mission',
    description: 'Teaching on being sent into everyday life and to the nations.',
  },
  {
    isPlaceholder: true,
    slug: 'psalms-for-prayer',
    title: 'Praying the Psalms',
    type: 'audio',
    topic: 'Prayer',
    description: 'Guided audio prayers that walk through selected Psalms.',
  },
  {
    isPlaceholder: true,
    slug: 'first-steps',
    title: 'First Steps for New Believers',
    type: 'guide',
    topic: 'Discipleship',
    description: 'Six short sessions on prayer, the Bible, church, baptism and sharing your faith.',
  },
]

export const resourceTypeLabel: Record<ResourceType, string> = {
  'reading-plan': 'Reading plan',
  guide: 'Guide',
  article: 'Article',
  audio: 'Audio',
  video: 'Video',
  download: 'Download',
}
