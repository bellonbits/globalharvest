import type { Group } from '../types'

export const audiences = [
  { title: 'Young adults', body: 'Navigating calling, relationships and faith in your twenties and thirties.' },
  { title: 'Students', body: 'Finding community and a steady faith through study and exams.' },
  { title: 'Professionals', body: 'Living out the gospel at work — with integrity, purpose and rest.' },
  { title: 'Families', body: 'Growing in faith together as parents, children and households.' },
  { title: 'Church members', body: 'Already part of a local church? Global Harvest is designed to strengthen it, not replace it.' },
  { title: 'New believers', body: 'Just started following Jesus? We’ll help you take your next steps.' },
  { title: 'People exploring Christianity', body: 'Curious or sceptical? You’re welcome to come and see.' },
]

/** Group types. Meeting times are PLACEHOLDERS until confirmed. */
export const groups: Group[] = [
  {
    slug: 'bible-study-groups',
    interest: 'bible-study',
    name: 'Bible Study Groups',
    audience: 'Everyone',
    description: 'Small groups reading through books of the Bible together, online and in person.',
    meets: 'Weekly · time TBC',
    format: 'both',
    image: 'bible-study-outdoor',
    isPlaceholder: true,
  },
  {
    slug: 'prayer-groups',
    interest: 'prayer',
    name: 'Prayer Groups',
    audience: 'Everyone',
    description: 'Gather to pray for one another, our cities and the nations.',
    meets: 'Weekly · time TBC',
    format: 'both',
    image: 'bible-soft-light',
    isPlaceholder: true,
  },
  {
    slug: 'young-adults',
    interest: 'community',
    name: 'Young Adults',
    audience: 'Ages 18–35',
    description: 'Honest conversations, deep friendships and shared adventures in faith.',
    meets: 'Fortnightly · time TBC',
    format: 'both',
    image: 'students-park-bibles',
    isPlaceholder: true,
  },
  {
    slug: 'mens-groups',
    interest: 'community',
    name: 'Men’s Groups',
    audience: 'Men',
    description: 'Brotherhood, accountability and studying Scripture together.',
    meets: 'Fortnightly · time TBC',
    format: 'both',
    image: 'study-group-table',
    isPlaceholder: true,
  },
  {
    slug: 'womens-groups',
    interest: 'community',
    name: 'Women’s Groups',
    audience: 'Women',
    description: 'Encouragement, prayer and study in a supportive circle of women.',
    meets: 'Fortnightly · time TBC',
    format: 'both',
    image: 'bible-golden-light',
    isPlaceholder: true,
  },
  {
    slug: 'mission-groups',
    interest: 'mission',
    name: 'Mission Groups',
    audience: 'Everyone',
    description: 'Pray, plan and serve together in outreach — locally and globally.',
    meets: 'Monthly · time TBC',
    format: 'both',
    image: 'nugget-point-sunset',
    isPlaceholder: true,
  },
]

export const communityValues = [
  { title: 'Welcome', body: 'Whoever you are and wherever you’re from, there is a seat at the table.' },
  { title: 'Honesty', body: 'Real questions, real struggles and real answers from God’s Word.' },
  { title: 'Care', body: 'We pray for, check in on and show up for one another.' },
  { title: 'Safety', body: 'Leaders follow clear safeguarding and privacy practices.' },
]
