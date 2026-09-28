import type { BibleStudy, FAQItem, ScheduleItem, StudyTopic } from '../types'

/**
 * Bible Study content.
 * Topics, schedule and the current study are data — edit here (or replace with
 * a CMS/API via bibleStudyService) without touching components.
 */

export const studyTopics: StudyTopic[] = [
  {
    slug: 'understanding-scripture',
    title: 'Understanding Scripture',
    description: 'How the Bible fits together, how to read it well, and why it can be trusted.',
    keyPassage: '2 Timothy 3:16–17',
  },
  {
    slug: 'faith',
    title: 'Faith',
    description: 'What it means to trust God — in the big decisions and the ordinary days.',
    keyPassage: 'Hebrews 11',
  },
  {
    slug: 'prayer',
    title: 'Prayer',
    description: 'Learning to pray from Jesus, the Psalms and the early church.',
    keyPassage: 'Matthew 6:5–15',
  },
  {
    slug: 'discipleship',
    title: 'Discipleship',
    description: 'Following Jesus as a whole-life apprenticeship, not a weekend activity.',
    keyPassage: 'Luke 9:23–25',
  },
  {
    slug: 'the-gospel',
    title: 'The Gospel',
    description: 'The good news of Jesus — his life, death and resurrection — and why it changes everything.',
    keyPassage: '1 Corinthians 15:1–8',
  },
  {
    slug: 'christian-living',
    title: 'Christian Living',
    description: 'Character, relationships, work, rest and money in the light of God’s Word.',
    keyPassage: 'Romans 12',
  },
  {
    slug: 'purpose',
    title: 'Purpose',
    description: 'Discovering the calling God gives every believer and the gifts He provides.',
    keyPassage: 'Ephesians 2:8–10',
  },
  {
    slug: 'mission',
    title: 'Mission',
    description: 'God’s heart for the nations from Genesis to Revelation — and our part in it.',
    keyPassage: 'Matthew 28:18–20',
  },
  {
    slug: 'leadership',
    title: 'Leadership',
    description: 'Servant leadership shaped by Jesus, for those leading groups, families and teams.',
    keyPassage: 'Mark 10:42–45',
  },
]

/** The study currently running. PLACEHOLDER — sample curriculum until the team confirms. */
export const currentStudy: BibleStudy = {
  isPlaceholder: true,
  slug: 'the-gospel-of-mark',
  title: 'The Gospel of Mark',
  subtitle: 'Following the One who sends',
  description:
    'A fast-moving account of the life of Jesus that ends with a commission. Over eight sessions we read Mark together and ask what it means to follow — and be sent by — the Son of God.',
  book: 'Mark',
  format: 'both',
  cadence: 'Weekly · 8 sessions',
  image: 'bible-golden-light',
  sessions: [
    { number: 1, title: 'The beginning of the good news', passage: 'Mark 1:1–20', isPlaceholder: true },
    { number: 2, title: 'Authority and compassion', passage: 'Mark 1:21–2:12', isPlaceholder: true },
    { number: 3, title: 'Parables of the kingdom', passage: 'Mark 4:1–34', isPlaceholder: true },
    { number: 4, title: 'Who do you say I am?', passage: 'Mark 8:27–9:1', isPlaceholder: true },
    { number: 5, title: 'The way of the servant', passage: 'Mark 10:32–52', isPlaceholder: true },
    { number: 6, title: 'The last supper', passage: 'Mark 14:12–42', isPlaceholder: true },
    { number: 7, title: 'The cross', passage: 'Mark 15:1–41', isPlaceholder: true },
    { number: 8, title: 'He is risen — go', passage: 'Mark 16', isPlaceholder: true },
  ],
}

/** PLACEHOLDER — sample weekly rhythm. Replace with the confirmed schedule. */
export const weeklySchedule: ScheduleItem[] = [
  {
    isPlaceholder: true,
    day: 'Tuesday',
    time: '7:00 – 8:30 PM',
    title: 'Online Bible Study',
    format: 'online',
    description: 'Video call in small breakout groups. Join from anywhere.',
  },
  {
    isPlaceholder: true,
    day: 'Thursday',
    time: '6:30 – 8:00 PM',
    title: 'In-Person Study Groups',
    format: 'in-person',
    description: 'Local groups meeting in homes and shared spaces.',
  },
  {
    isPlaceholder: true,
    day: 'Saturday',
    time: '9:00 – 10:00 AM',
    title: 'Deep Dive',
    format: 'online',
    description: 'A slower, verse-by-verse look at the week’s passage.',
  },
]

export const howItWorks = [
  {
    title: 'Register',
    body: 'Tell us a little about yourself and whether you’d prefer to join online or in person.',
  },
  {
    title: 'Get placed in a group',
    body: 'We connect you with a small group that fits your time zone, language and stage of life.',
  },
  {
    title: 'Read ahead',
    body: 'Each week has a short passage and a few questions. No preparation is too little.',
  },
  {
    title: 'Discuss & pray',
    body: 'Groups read together, talk honestly, and close by praying for one another.',
  },
]

export const bibleStudyFaqs: FAQItem[] = [
  {
    question: 'Do I need to know the Bible already?',
    answer:
      'Not at all. Groups welcome people who are brand new to the Bible alongside those who have read it for years. Questions are encouraged.',
  },
  {
    question: 'Which Bible translation do you use?',
    answer:
      'Bring whatever Bible you have. Leaders usually read from a widely used modern translation, and study notes list the passage so you can follow along in any version.',
  },
  {
    question: 'Is there a cost?',
    answer: 'No. Bible study groups are free to join.',
  },
  {
    question: 'Can I join if I’m not a Christian?',
    answer:
      'Yes. If you are exploring Christianity, a Bible study is a great place to read the source for yourself and ask questions in a respectful setting.',
  },
  {
    question: 'How big are the groups?',
    answer:
      'We aim for small groups — typically enough people for a good conversation while still giving everyone space to take part.',
  },
  {
    question: 'What if I miss a week?',
    answer: 'That’s fine. Each session stands on its own and your group leader can help you catch up.',
  },
]
