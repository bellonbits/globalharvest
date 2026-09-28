/**
 * DEMO DATA — for development only.
 *
 *   npm run db:demo            # insert demo data (flagged is_demo = true)
 *   npm run db:demo -- clear   # remove ALL demo data (real data is never touched)
 *
 * Every demo row carries is_demo = true, is labelled "Demo" in the admin portal,
 * and the dashboard shows a banner while any demo data exists.
 */
import { connect } from './_env.mjs'

const mode = process.argv[2] === 'clear' ? 'clear' : 'seed'
const c = await connect()
const S = 'global_harvest'

async function clear() {
  const tables = ['registrations', 'event_registrations', 'prayer_requests', 'contact_messages', 'records']
  for (const t of tables) {
    const r = await c.query(`DELETE FROM ${S}.${t} WHERE is_demo`)
    console.log(`  ${t}: removed ${r.rowCount}`)
  }
  const n = await c.query(`DELETE FROM ${S}.notifications WHERE title LIKE '[Demo]%'`)
  console.log(`  notifications: removed ${n.rowCount}`)
}

if (mode === 'clear') {
  console.log('Removing demo data…')
  await clear()
  await c.end()
  process.exit(0)
}

console.log('Seeding demo data (is_demo = true)…')
await clear()

const day = 864e5
const ago = (d) => new Date(Date.now() - d * day).toISOString()
const ahead = (d) => new Date(Date.now() + d * day).toISOString().slice(0, 10)
const pick = (arr, i) => arr[i % arr.length]

/* ---- Registrations ---- */
const people = [
  ['Grace', 'Wanjiru', 'Kenya', 'Nairobi'], ['Daniel', 'Okello', 'Uganda', 'Kampala'], ['Sarah', 'Mitchell', 'United States', 'Dallas'],
  ['James', 'Carter', 'United Kingdom', 'Manchester'], ['Amara', 'Nwosu', 'Nigeria', 'Lagos'], ['Esther', 'Mensah', 'Ghana', 'Accra'],
  ['Thabo', 'Mokoena', 'South Africa', 'Johannesburg'], ['Priya', 'Thomas', 'India', 'Kochi'], ['Lucas', 'Silva', 'Brazil', 'São Paulo'],
  ['Hannah', 'Becker', 'Germany', 'Hamburg'], ['Joy', 'Santos', 'Philippines', 'Manila'], ['Samuel', 'Kiprono', 'Kenya', 'Eldoret'],
  ['Ruth', 'Achieng', 'Kenya', 'Kisumu'], ['Michael', 'Brown', 'Canada', 'Toronto'], ['Faith', 'Nakato', 'Uganda', 'Jinja'],
  ['David', 'Mwangi', 'Kenya', 'Nakuru'], ['Naomi', 'Adeyemi', 'Nigeria', 'Abuja'], ['Peter', 'Johnson', 'United States', 'Atlanta'],
  ['Mercy', 'Chebet', 'Kenya', 'Nairobi'], ['Isaac', 'Tembo', 'Zambia', 'Lusaka'], ['Lydia', 'Kamau', 'Kenya', 'Mombasa'],
  ['Andrew', 'Wilson', 'Australia', 'Brisbane'], ['Rebecca', 'Osei', 'Ghana', 'Kumasi'], ['John', 'Mutua', 'Kenya', 'Machakos'],
]
const interests = [['bible-study'], ['prayer'], ['bible-study', 'prayer'], ['community', 'events'], ['mission'], ['bible-study', 'community'], ['membership']]
const statuses = ['new', 'new', 'contacted', 'active', 'active', 'inactive']
const regIds = []
for (let i = 0; i < people.length; i++) {
  const [first, last, country, city] = people[i]
  const { rows } = await c.query(
    `INSERT INTO ${S}.registrations (first_name, last_name, email, phone, country, city, age_range, preferred_language, referral_source,
       interests, participation, church, status, consent, is_demo, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'English',$8,$9,$10,$11,$12,true,true,$13,$13) RETURNING id`,
    [
      first, last, `${first}.${last}.demo@example.com`.toLowerCase(), '+000 000 0000', country, city,
      pick(['18-24', '25-34', '25-34', '35-44', '45-54'], i), pick(['A friend or family member', 'My church', 'Instagram', 'WhatsApp', 'An event'], i),
      pick(interests, i), pick(['online', 'in-person', 'both'], i), i % 3 === 0 ? 'Demo Fellowship' : null, pick(statuses, i), ago(3 + i * 5),
    ],
  )
  regIds.push(rows[0].id)
}

/* ---- Records ---- */
async function rec(collection, status, data, createdDaysAgo = 10) {
  const { rows } = await c.query(
    `INSERT INTO ${S}.records (collection, status, data, is_demo, created_at, updated_at) VALUES ($1,$2,$3,true,$4,$4) RETURNING id`,
    [collection, status, JSON.stringify({ ...data, status }), ago(createdDaysAgo)],
  )
  return rows[0].id
}

const groupDefs = [
  ['Demo — Nairobi Young Adults', 'young-adults', 'Kenya', 'Nairobi', 'in-person', 'Fridays 6:30 PM'],
  ['Demo — Online Bible Study (Africa/Europe)', 'bible-study', '', '', 'online', 'Tuesdays 7:00 PM EAT'],
  ['Demo — Kampala Prayer Group', 'prayer', 'Uganda', 'Kampala', 'in-person', 'Wednesdays 7:30 PM'],
  ['Demo — Women of the Word', 'women', 'United States', 'Dallas', 'both', 'Saturdays 9:00 AM CT'],
  ['Demo — Mission Team', 'mission', 'Kenya', 'Mombasa', 'both', 'Monthly, first Saturday'],
]
const groupIds = []
for (const [name, groupType, country, city, format, schedule] of groupDefs) {
  groupIds.push(
    await rec('groups', 'active', {
      name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), groupType, description: 'Demo group for development.',
      leader: 'Demo Leader', country, city, format, schedule, capacity: 20,
    }),
  )
}

for (let i = 0; i < 10; i++) {
  const [first, last, country, city] = people[i]
  await rec('members', pick(['active', 'active', 'pending', 'inactive'], i), {
    firstName: first, lastName: last, email: `${first}.${last}.demo@example.com`.toLowerCase(), phone: '+000 000 0000', country, city,
    groupIds: [pick(groupIds, i)], bibleStudyIds: [], eventSlugs: [], registrationId: regIds[i], joinedAt: ago(2 + i * 6),
  }, 2 + i * 6)
}

const eventDefs = [
  ['Demo — Foundations Bible Study Night', 'bible-study', 12, 'registration-open', 'online', 60],
  ['Demo — Night of Prayer', 'prayer', 20, 'registration-open', 'both', 120],
  ['Demo — Community Picnic', 'community', 34, 'published', 'in-person', 80],
  ['Demo — Mission Vision Evening', 'mission', -14, 'completed', 'both', 100],
]
const eventSlugs = []
for (const [title, category, offset, status, format, capacity] of eventDefs) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  eventSlugs.push(slug)
  await rec('events', status, {
    title, slug, category, summary: 'Demo event for development.', description: 'This is demo content created by the seed script.',
    coverImage: '/images/hero-sunset-coast-1200.webp', date: offset > 0 ? ahead(offset) : new Date(Date.now() + offset * day).toISOString().slice(0, 10),
    startTime: '18:30', endTime: '20:30', timezone: 'EAT', location: format === 'online' ? 'Online' : 'Demo venue, Nairobi', format,
    meetingUrl: format !== 'in-person' ? 'https://example.com/demo-meeting' : '', speaker: 'Demo Speaker', capacity, registrationEnabled: status === 'registration-open',
    registrationDeadline: offset > 2 ? ahead(offset - 1) : '',
  })
}
for (let i = 0; i < 14; i++) {
  const [first, last, country] = people[i + 3]
  await c.query(
    `INSERT INTO ${S}.event_registrations (event_slug, first_name, last_name, email, phone, country, attendees, attendance, consent, is_demo, created_at)
     VALUES ($1,$2,$3,$4,'+000 000 0000',$5,$6,$7,true,true,$8)`,
    [pick(eventSlugs, i), first, last, `${first}.${last}.demo@example.com`.toLowerCase(), country, 1 + (i % 3), pick(['registered', 'confirmed', 'attended', 'registered', 'no-show'], i), ago(1 + i * 2)],
  )
}

await rec('bible_studies', 'active', {
  title: 'Demo — Understanding the Gospel', slug: 'demo-understanding-the-gospel', description: 'Demo four-week study.', studyType: 'topical',
  leader: 'Demo Leader', schedule: 'Tuesdays 7:00 PM EAT', startDate: ahead(-7), endDate: ahead(21), format: 'online', meetingLink: 'https://example.com/demo-study',
  maxParticipants: 30, registrationEnabled: true,
  sessions: [
    ['The Gospel', 'Mark 1:1–15'], ['Faith', 'Hebrews 11'], ['Grace', 'Ephesians 2:1–10'], ['Discipleship', 'Luke 9:23–27'],
  ].map(([t, ref], i) => ({ id: crypto.randomUUID(), title: `Week ${i + 1} — ${t}`, date: ahead(-7 + i * 7), time: '19:00', references: ref, description: 'Demo session.' })),
})
await rec('bible_studies', 'open', {
  title: 'Demo — The Book of Acts', slug: 'demo-the-book-of-acts', description: 'Demo in-person study.', studyType: 'book', leader: 'Demo Leader',
  schedule: 'Thursdays 6:30 PM', startDate: ahead(14), format: 'in-person', location: 'Demo venue, Kampala', maxParticipants: 15, registrationEnabled: true, sessions: [],
})

for (const [title, type, status] of [
  ['Demo — 30-Day Gospels Reading Plan', 'reading-plan', 'published'], ['Demo — Prayer Guide', 'prayer-guide', 'published'],
  ['Demo — Study Notes: Mark 1', 'study-notes', 'draft'], ['Demo — Sermon: Sent', 'sermon', 'published'], ['Demo — Devotional', 'devotional', 'archived'],
]) {
  await rec('resources', status, { title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), description: 'Demo resource.', type, author: 'Demo Author', category: 'Demo', tags: ['demo'], publishedDate: ahead(-5) })
}
for (const [filename, url] of [['hero-sunset-coast.webp', '/images/hero-sunset-coast-1200.webp'], ['study-group.webp', '/images/study-group-table-1200.webp'], ['ocean.webp', '/images/ocean-teal-1200.webp']]) {
  await rec('media', 'active', { filename: `demo-${filename}`, kind: 'image', mimeType: 'image/webp', size: 180000, url, alt: 'Demo image', uploadedBy: 'Demo seed', storage: 'external' })
}
for (let i = 0; i < 6; i++) {
  const [first, last] = people[i + 8]
  await rec('subscribers', 'subscribed', { email: `${first}.${last}.demo@example.com`.toLowerCase(), name: `${first} ${last}`, source: 'Demo seed' })
}
await rec('campaigns', 'draft', { subject: 'Demo — Welcome to Global Harvest', kind: 'newsletter', body: 'Demo newsletter draft.', audience: 'All subscribers' })
await rec('campaigns', 'draft', { subject: 'Demo — Night of Prayer announcement', kind: 'announcement', body: 'Demo announcement draft.', audience: 'Prayer group' })

/* ---- Prayer & messages ---- */
const prayers = [
  ['personal', 'Please pray for peace and direction as I make an important decision this month.'],
  ['family', 'Praying for my family to be restored and for healing between my siblings.'],
  ['health', 'My mother is recovering from surgery. Please pray for full healing.'],
  ['work', 'I am looking for work. Please pray for provision and the right opportunity.'],
  ['faith', 'Pray that I would grow in faith and consistency in reading the Word.'],
  ['mission', 'Please pray for our outreach team travelling next month.'],
  ['community', 'Pray for unity and growth in our new small group.'],
  ['other', 'Please pray for my exams next week.'],
]
for (let i = 0; i < prayers.length; i++) {
  await c.query(
    `INSERT INTO ${S}.prayer_requests (full_name, email, request, country, category, wants_contact, consent, status, is_demo, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,true,$7,true,$8)`,
    [`${people[i][0]} (Demo)`, `${people[i][0]}.demo@example.com`.toLowerCase(), `[Demo] ${prayers[i][1]}`, people[i][2], prayers[i][0], i % 3 === 0, pick(['new', 'being-prayed-for', 'follow-up', 'answered'], i), ago(i * 4 + 1)],
  )
}
const msgs = [
  ['general', 'Question about joining'], ['bible-study', 'Starting a group in my city'], ['events', 'Accessibility at the picnic'],
  ['partnership', 'Church partnership enquiry'], ['mission', 'Volunteering on the mission team'], ['prayer', 'Thank you for praying'],
]
for (let i = 0; i < msgs.length; i++) {
  await c.query(
    `INSERT INTO ${S}.contact_messages (name, email, category, subject, message, status, is_demo, created_at) VALUES ($1,$2,$3,$4,$5,$6,true,$7)`,
    [`${people[i + 5][0]} ${people[i + 5][1]}`, `${people[i + 5][0]}.demo@example.com`.toLowerCase(), msgs[i][0], `[Demo] ${msgs[i][1]}`, 'This is a demo message created by the seed script.', pick(['unread', 'unread', 'read', 'replied', 'archived'], i), ago(i * 3 + 1)],
  )
}
await c.query(
  `INSERT INTO ${S}.notifications (type, title, entity_type, permission) VALUES
   ('registration', '[Demo] 3 new registrations this week', 'registration', 'registrations:read'),
   ('prayer_request', '[Demo] New prayer request (health)', 'prayer_request', 'prayer:read'),
   ('contact_message', '[Demo] New message: Church partnership enquiry', 'contact_message', 'messages:read')`,
)

// Organization settings (real defaults, not demo) — created once.
const settings = await c.query(`SELECT 1 FROM ${S}.records WHERE collection = 'settings' LIMIT 1`)
if (!settings.rows[0]) {
  await c.query(`INSERT INTO ${S}.records (collection, status, data) VALUES ('settings', 'active', $1)`, [
    JSON.stringify({
      organizationName: 'Global Harvest', description: 'A global Christian community committed to Bible study, prayer, fellowship, discipleship, and sharing the Gospel.',
      website: 'https://globalharvest.org', social: {}, notifications: { newRegistration: true, newPrayerRequest: true, newMessage: true, eventRegistration: true },
      integrations: { storageProvider: 'none' },
    }),
  ])
}

console.log('Done. Remove with: npm run db:demo -- clear')
await c.end()
