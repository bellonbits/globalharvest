import type { IconName } from '../components/brand/Icon'

export interface Pillar {
  key: 'bible-study' | 'prayer' | 'community' | 'mission'
  title: string
  tagline: string
  description: string
  icon: IconName
  to: string
  image: string
}

export const pillars: Pillar[] = [
  {
    key: 'bible-study',
    title: 'Bible Study',
    tagline: "Understand God's Word",
    description:
      'Read Scripture carefully and together — asking honest questions, learning its story, and letting it shape how we live.',
    icon: 'book',
    to: '/bible-study',
    image: 'study-group-table',
  },
  {
    key: 'prayer',
    title: 'Prayer',
    tagline: 'Seek God Together',
    description:
      'Gather to worship, intercede and listen. We pray for one another, for our cities and for the nations.',
    icon: 'prayer',
    to: '/prayer',
    image: 'bible-soft-light',
  },
  {
    key: 'community',
    title: 'Community',
    tagline: 'Grow Together',
    description:
      'Faith grows best in friendship. Small groups and gatherings where you are known, encouraged and challenged.',
    icon: 'community',
    to: '/community',
    image: 'students-park-bibles',
  },
  {
    key: 'mission',
    title: 'Global Mission',
    tagline: 'Reach the Nations',
    description:
      'Everyone is sent. We carry the hope of Christ into our neighbourhoods, workplaces and to the ends of the earth.',
    icon: 'globe',
    to: '/mission',
    image: 'cliff-sea-sunset',
  },
]
