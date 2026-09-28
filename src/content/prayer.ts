import type { ScheduleItem } from '../types'

/** PLACEHOLDER — sample prayer rhythm. Replace with the confirmed schedule. */
export const prayerGatherings: ScheduleItem[] = [
  {
    isPlaceholder: true,
    day: 'Monday',
    time: '6:30 – 7:00 AM',
    title: 'Morning Prayer',
    format: 'online',
    description: 'A short, focused start to the week: Scripture, silence and intercession.',
  },
  {
    isPlaceholder: true,
    day: 'Wednesday',
    time: '7:30 – 8:30 PM',
    title: 'Weekly Prayer Gathering',
    format: 'both',
    description: 'Our main prayer meeting — worship, prayer for requests received and prayer for the nations.',
  },
  {
    isPlaceholder: true,
    day: 'First Friday',
    time: '8:00 – 10:00 PM',
    title: 'Night of Prayer for the Nations',
    format: 'both',
    description: 'A longer monthly evening dedicated to praying for global mission.',
  },
]

/** Monthly prayer focus calendar — themes rather than dated claims. */
export const prayerFocus = [
  { week: 'Week 1', focus: 'Our community', prompt: 'Pray for members, new believers and those exploring faith.' },
  { week: 'Week 2', focus: 'Our cities', prompt: 'Pray for neighbours, workplaces, schools and local churches.' },
  { week: 'Week 3', focus: 'The nations', prompt: 'Pray for people and places yet to hear the gospel.' },
  { week: 'Week 4', focus: 'The persecuted church', prompt: 'Pray for believers who follow Jesus at great cost.' },
]

export const prayerResources = [
  {
    title: 'Praying the Psalms',
    description: 'A guided way to pray using the prayer book of the Bible.',
    passage: 'Psalm 23 · 46 · 139',
  },
  {
    title: 'The Lord’s Prayer',
    description: 'Learning to pray line by line from the prayer Jesus taught.',
    passage: 'Matthew 6:9–13',
  },
  {
    title: 'Praying for the nations',
    description: 'A simple weekly rhythm for intercession around the world.',
    passage: 'Psalm 67',
  },
]

/**
 * Answered prayers are only published with explicit written permission.
 * PLACEHOLDER — no stories have been supplied yet.
 */
export const answeredPrayers: { id: string; title: string; body: string; isPlaceholder: true }[] = [
  {
    id: 'ap-1',
    isPlaceholder: true,
    title: 'Story to be shared',
    body: 'With permission, we will share stories here of how God has answered the prayers of our community.',
  },
  {
    id: 'ap-2',
    isPlaceholder: true,
    title: 'Story to be shared',
    body: 'Every story is published only with the consent of the person involved, and names may be withheld.',
  },
  {
    id: 'ap-3',
    isPlaceholder: true,
    title: 'Your story could be here',
    body: 'Has God answered a prayer we prayed together? Let us know through the contact page.',
  },
]
