import type { MissionRegion, MissionStory } from '../types'

export const whyWeGo = [
  {
    title: 'Because God loves the world',
    body: 'From Abraham to Revelation, Scripture tells of a God whose blessing is meant for every nation, tribe and language.',
    reference: 'Genesis 12:1–3 · Revelation 7:9',
  },
  {
    title: 'Because Jesus sends us',
    body: 'The risen Jesus did not leave his followers with a building but a commission — to go and make disciples.',
    reference: 'Matthew 28:18–20',
  },
  {
    title: 'Because the gospel is good news',
    body: 'Hope, forgiveness and new life in Christ are too good to keep to ourselves.',
    reference: 'Romans 10:14–15',
  },
]

/**
 * Where we serve.
 * PLACEHOLDER — no regions, countries or partners have been confirmed.
 * Add confirmed regions here (with optional map position) and they will
 * appear on the map and in the list automatically.
 */
export const missionRegions: MissionRegion[] = []

/** PLACEHOLDER — mission stories will be published once supplied. */
export const missionStories: MissionStory[] = [
  {
    id: 'story-1',
    isPlaceholder: true,
    title: 'Story coming soon',
    excerpt: 'First-hand accounts from members serving in their neighbourhoods and beyond will be shared here.',
    image: 'cliff-sea-sunset',
  },
  {
    id: 'story-2',
    isPlaceholder: true,
    title: 'Story coming soon',
    excerpt: 'Reports from outreach, partnership and prayer initiatives will appear here as they are confirmed.',
    image: 'ocean-teal',
  },
  {
    id: 'story-3',
    isPlaceholder: true,
    title: 'Story coming soon',
    excerpt: 'Have you been sent? We would love to hear what God is doing where you are.',
    image: 'nugget-point-sunset',
  },
]

export const getInvolved = [
  {
    key: 'pray',
    title: 'Pray',
    body: 'Join the monthly Night of Prayer for the Nations and receive prayer updates.',
    cta: { label: 'Join the prayer group', to: '/register?interest=prayer' },
  },
  {
    key: 'give',
    title: 'Give / Support',
    body: 'Giving options will be published once the organisation’s giving channels are established.',
    cta: { label: 'Ask about supporting', to: '/contact?category=partnership' },
  },
  {
    key: 'serve',
    title: 'Serve',
    body: 'Use your gifts in outreach, hospitality, media, teaching or mission trips.',
    cta: { label: 'Register interest', to: '/register?interest=mission' },
  },
] as const
