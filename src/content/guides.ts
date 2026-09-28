import type { StudyGuide } from '../types'

/**
 * SAMPLE STUDY GUIDES — original content written to demonstrate the booklet
 * format. Scripture quotations are from the World English Bible (public domain).
 * They are flagged `isPlaceholder` (labelled "Sample") and are hidden
 * automatically once real guides are published from the admin portal.
 */
export const sampleGuides: StudyGuide[] = [
  {
    isPlaceholder: true,
    slug: 'sample-gospel-of-mark',
    title: 'The Gospel of Mark',
    kind: 'bible-study',
    series: 'Global Harvest Bible Study',
    subtitle: 'Following the One who sends',
    summary: 'A sample session showing the study-guide format: background, then Observation, Interpretation and Application.',
    coverImage: 'bible-golden-light',
    pages: [
      {
        id: 'p1',
        blocks: [
          { id: 'b1', type: 'eyebrow', text: 'Background' },
          { id: 'b2', type: 'title', text: 'Mark & the Good News' },
          { id: 'b3', type: 'heading', text: 'Who wrote the Gospel of Mark?' },
          {
            id: 'b4',
            type: 'paragraph',
            text:
              'The Gospel itself does not name its author, but the earliest church writers consistently connected it with John Mark — a companion of Paul and Barnabas (Acts 12:25) who is later described as close to the apostle Peter (1 Peter 5:13). Many readers have noticed how Mark’s account moves with the vivid detail of an eyewitness memory, which fits the early tradition that Mark recorded Peter’s preaching about Jesus.',
          },
          { id: 'b5', type: 'heading', text: 'Date and audience:' },
          {
            id: 'b6',
            type: 'paragraph',
            text:
              'Most scholars date Mark to the 50s or 60s AD, which would make it one of the earliest written accounts of Jesus’ life. Mark explains Jewish customs and translates Aramaic phrases for his readers (Mark 7:3–4; 5:41), suggesting he was writing for believers outside Judea — very possibly Gentile Christians in Rome who were facing pressure for their faith.',
          },
          { id: 'b7', type: 'heading', text: 'Purpose:' },
          {
            id: 'b8',
            type: 'paragraph',
            text:
              'Mark opens by announcing “the beginning of the Good News of Jesus Christ, the Son of God” (1:1) and then moves quickly — the word “immediately” appears again and again. His purpose is to show who Jesus is through what He does, to call readers to follow Him even when it is costly, and, by the final chapter, to send them out with the same good news.',
          },
        ],
      },
      {
        id: 'p2',
        blocks: [
          { id: 'c1', type: 'exercise', text: 'Exercise One' },
          { id: 'c2', type: 'label', text: 'Desperation' },
          {
            id: 'c3',
            type: 'paragraph',
            text: 'Begin your study in humility, remembering that you are not here merely to study, but to worship. Pray slowly through the passages below.',
          },
          { id: 'c4', type: 'scripture', text: 'Your word is a lamp to my feet, and a light for my path.', reference: 'Psalm 119:105' },
          { id: 'c5', type: 'scripture', text: 'The time is fulfilled, and God’s Kingdom is at hand! Repent, and believe in the Good News.', reference: 'Mark 1:15' },
          { id: 'c6', type: 'note', text: 'Come back to this prayer each time you return to your study this week.' },
          { id: 'c7', type: 'label', text: 'Observation: What does it say?' },
          {
            id: 'c8',
            type: 'paragraph',
            text:
              'Read Mark 1:1–20 in your Scripture journal. Then read verses 14–20 several more times. At this stage you are not drawing conclusions — you are noticing everything. Write down every detail you see: people, places, repeated words and actions.',
          },
          { id: 'c9', type: 'points', items: ['Are there any words you do not know?', 'Is there context you need to clarify?', 'What is the overall tone of the passage?'] },
        ],
      },
      {
        id: 'p3',
        blocks: [
          { id: 'd1', type: 'label', text: 'Interpretation: What does it mean?' },
          {
            id: 'd2',
            type: 'questions',
            lines: 3,
            start: 1,
            items: [
              'What is the first message Jesus preaches (1:14–15)? What two responses does He call for?',
              'Where are Simon and Andrew, and what are they doing when Jesus calls them (1:16)? Why might that detail matter?',
              'Jesus says, “Come after me, and I will make you into fishers for men” (1:17). What does He promise to do, and what does He ask of them?',
              'How quickly do the four fishermen respond (1:18, 20)? What do they leave behind?',
            ],
          },
          { id: 'd3', type: 'label', text: 'Application: How should it change me?' },
          {
            id: 'd4',
            type: 'questions',
            lines: 3,
            start: 5,
            items: [
              'What does this passage teach us about the nature and character of God?',
              'What does it teach us about ourselves?',
              'What “nets” might Jesus be asking you to leave in order to follow Him more closely this week?',
              'Who is one person you could share the good news with? Pray for them by name.',
            ],
          },
        ],
      },
    ],
  },
  {
    isPlaceholder: true,
    slug: 'sample-pray-for-the-harvest',
    title: 'Pray for the Harvest',
    kind: 'prayer',
    series: 'Global Harvest Prayer Guide',
    subtitle: 'A week of prayer for our community and the nations',
    summary: 'A sample prayer guide showing how prayer points, Scripture and reflection questions are laid out.',
    coverImage: 'nugget-point-sunset',
    pages: [
      {
        id: 'q1',
        blocks: [
          { id: 'e1', type: 'eyebrow', text: 'Introduction' },
          { id: 'e2', type: 'title', text: 'The Lord of the Harvest' },
          {
            id: 'e3',
            type: 'paragraph',
            text:
              'Before Jesus sent out His disciples, He asked them to pray. Prayer is not a warm-up for mission — it is where mission begins. This guide gives a simple rhythm for one week: a passage to pray, points to pray through, and a question to carry with you.',
          },
          { id: 'e4', type: 'scripture', text: 'Pray therefore that the Lord of the harvest will send out laborers into his harvest.', reference: 'Matthew 9:38' },
          { id: 'e5', type: 'heading', text: 'How to use this guide' },
          {
            id: 'e6',
            type: 'paragraph',
            text: 'Set aside ten to fifteen minutes each day. Read the Scripture slowly, pray through each point in your own words, and write down anything you sense God saying. Pray alone, with your family, or with your group.',
          },
        ],
      },
      {
        id: 'q2',
        blocks: [
          { id: 'f1', type: 'exercise', text: 'Day One' },
          { id: 'f2', type: 'label', text: 'Pray for our community' },
          { id: 'f3', type: 'scripture', text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.', reference: 'Philippians 4:6' },
          {
            id: 'f4',
            type: 'points',
            items: [
              'Give thanks for the people God has brought into Global Harvest.',
              'Pray for new believers to grow deep roots in God’s Word.',
              'Pray for those who are exploring faith to meet Jesus personally.',
              'Pray for our leaders to serve with humility, wisdom and joy.',
            ],
          },
          { id: 'f5', type: 'exercise', text: 'Day Two' },
          { id: 'f6', type: 'label', text: 'Pray for the nations' },
          { id: 'f7', type: 'scripture', text: 'That your way may be known on earth, and your salvation among all nations.', reference: 'Psalm 67:2' },
          {
            id: 'f8',
            type: 'points',
            items: [
              'Pray for people and places that have little access to the gospel.',
              'Pray for believers who follow Jesus at great personal cost.',
              'Ask the Lord of the harvest to send workers — and ask what part He has for you.',
            ],
          },
          { id: 'f9', type: 'questions', lines: 3, start: 1, items: ['What is one prayer point you sensed God placing on your heart today?'] },
        ],
      },
    ],
  },
]
