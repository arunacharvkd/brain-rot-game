export const CORPORATE_GAMES = [
  {
    id: 'inbox',
    screen: 'corp-inbox',
    path: '/corporate/inbox',
    emoji: '📥',
    name: 'Inbox triage',
    summary: 'Decide whether a message needs a reply now, a later slot, someone else, or the archive.',
  },
  {
    id: 'priority',
    screen: 'corp-priority',
    path: '/corporate/priority',
    emoji: '📌',
    name: 'Priority order',
    summary: 'Put four pieces of work in the order a careful colleague would actually do them.',
  },
  {
    id: 'figures',
    screen: 'corp-figures',
    path: '/corporate/figures',
    emoji: '🔎',
    name: 'Figure check',
    summary: 'A status line has one number that does not match the others. Tap that number.',
  },
]

export const INBOX_ACTIONS = [
  { id: 'reply', label: 'Reply now' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'delegate', label: 'Delegate' },
  { id: 'archive', label: 'Archive' },
]

export const INBOX_MAIL = [
  {
    id: 'export',
    from: 'Priya Shah, customer',
    subject: 'Can’t export today’s report',
    body: 'The board pack is due at 4pm and the export button errors. I am blocked.',
    answer: 'reply',
    why: 'A customer is blocked on something due today. That is a reply now.',
  },
  {
    id: 'vendor',
    from: 'Alex, teammate',
    subject: 'Who owns the vendor form?',
    body: 'This is for Sam’s renewal. Sam asked me to find whoever keeps the form.',
    answer: 'delegate',
    why: 'Sam owns the renewal. Pass it to the owner instead of answering as if it were yours.',
  },
  {
    id: 'digest',
    from: 'Industry Digest',
    subject: 'Weekly links',
    body: 'Five articles. There is no question and nobody is waiting.',
    answer: 'archive',
    why: 'A newsletter with no ask is archive, not a task.',
  },
  {
    id: 'hotel',
    from: 'Jordan',
    subject: 'Offsite hotel options',
    body: 'We should pick a hotel before the offsite on the 28th. Nothing happens with it today.',
    answer: 'schedule',
    why: 'The decision is real, and the date is later. Put it on the calendar instead of answering in a rush.',
  },
  {
    id: 'alarm',
    from: 'Facilities',
    subject: 'Fire alarm test at 3pm',
    body: 'No action unless you are the floor warden. You are not.',
    answer: 'archive',
    why: 'The note says you have nothing to do. Archive it.',
  },
  {
    id: 'pipeline',
    from: 'Lina, your manager',
    subject: 'Numbers for the 4pm call',
    body: 'Please send the pipeline total before the call today.',
    answer: 'reply',
    why: 'Your manager is waiting on a number for a call today.',
  },
  {
    id: 'password',
    from: 'IT',
    subject: 'Password expires in 20 days',
    body: 'You can update it any time this month. Nothing breaks today.',
    answer: 'schedule',
    why: 'It matters, and it is not due today. Schedule it.',
  },
  {
    id: 'portfolio',
    from: 'A recruiter',
    subject: 'Portfolio for the design role',
    body: 'People team owns this search. They asked that portfolios be forwarded to them.',
    answer: 'delegate',
    why: 'People team owns the search. Delegate it.',
  },
  {
    id: 'receipt',
    from: 'Billing bot',
    subject: 'Your receipt',
    body: 'Automatic receipt for a software seat. No question.',
    answer: 'archive',
    why: 'An automatic receipt with no question is archive.',
  },
  {
    id: 'slide',
    from: 'Lina, your manager',
    subject: 'Client is waiting on the revised slide',
    body: 'They are on the call in 20 minutes and asked for the new chart.',
    answer: 'reply',
    why: 'Someone is in a meeting now waiting on your chart.',
  },
]

export const PRIORITY_RULE = 'Do today’s blocker first, then other work due today, then later dated work, then anything with no ask.'

export const PRIORITY_ROUNDS = [
  {
    id: 'release',
    cards: [
      { id: 'bug', title: 'Fix the login bug', detail: 'Release is today. Engineering is blocked on you.' },
      { id: 'recap', title: 'Send the Q3 recap', detail: 'You promised it today. Nobody is stuck.' },
      { id: 'agenda', title: 'Draft the offsite agenda', detail: 'The offsite is next Thursday.' },
      { id: 'news', title: 'Read the industry newsletter', detail: 'No deadline and no question.' },
    ],
    order: ['bug', 'recap', 'agenda', 'news'],
  },
  {
    id: 'hiring',
    cards: [
      { id: 'offer', title: 'Answer the candidate', detail: 'The offer expires at 6pm today. They are waiting.' },
      { id: 'notes', title: 'File yesterday’s interview notes', detail: 'Due today. Hiring can continue without them for now.' },
      { id: 'jd', title: 'Update the role description', detail: 'The req opens next month.' },
      { id: 'swag', title: 'Look at the swag catalog', detail: 'FYI from the office chat.' },
    ],
    order: ['offer', 'notes', 'jd', 'swag'],
  },
  {
    id: 'client',
    cards: [
      { id: 'outage', title: 'Confirm the incident update', detail: 'The client channel is blocked until you post it. Today.' },
      { id: 'invoice', title: 'Approve the invoice', detail: 'Finance asked for it by end of day. Work is not stopped.' },
      { id: 'qbr', title: 'Outline the QBR', detail: 'The review is in two weeks.' },
      { id: 'podcast', title: 'A podcast recommendation', detail: 'A teammate shared a link. No ask.' },
    ],
    order: ['outage', 'invoice', 'qbr', 'podcast'],
  },
  {
    id: 'launch',
    cards: [
      { id: 'copy', title: 'Correct the pricing page', detail: 'Launch is today and sales cannot send the link until you fix the figure.' },
      { id: 'list', title: 'Send the invite list', detail: 'You said you would send it today. The event still happens if it arrives this evening.' },
      { id: 'retro', title: 'Write retro notes', detail: 'Retro is Friday.' },
      { id: 'meme', title: 'A meme in the social channel', detail: 'No request.' },
    ],
    order: ['copy', 'list', 'retro', 'meme'],
  },
  {
    id: 'board',
    cards: [
      { id: 'slide', title: 'Replace the wrong chart', detail: 'The board meets today. The deck is wrong until you swap it.' },
      { id: 'bio', title: 'Send your bio line', detail: 'Comms needs it today for a post that is not blocking the meeting.' },
      { id: 'travel', title: 'Book the train', detail: 'The trip is next Wednesday.' },
      { id: 'tips', title: 'A thread of productivity tips', detail: 'No one asked you to reply.' },
    ],
    order: ['slide', 'bio', 'travel', 'tips'],
  },
]

export const FIGURE_ROUNDS = [
  {
    id: 'revenue',
    parts: [
      { label: 'Closed revenue moved from ' },
      { id: 'from', label: '$40k', pick: true },
      { label: ' to ' },
      { id: 'to', label: '$46k', pick: true },
      { label: ', a gain of ' },
      { id: 'gain', label: '$8k', pick: true },
      { label: '.' },
    ],
    wrongId: 'gain',
    note: '$46k minus $40k is $6k, not $8k.',
  },
  {
    id: 'churn',
    parts: [
      { label: 'Of ' },
      { id: 'base', label: '100', pick: true },
      { label: ' customers, churn was ' },
      { id: 'rate', label: '2%', pick: true },
      { label: ', so ' },
      { id: 'lost', label: '5', pick: true },
      { label: ' left.' },
    ],
    wrongId: 'lost',
    note: '2% of 100 is 2 customers, not 5.',
  },
  {
    id: 'meeting',
    parts: [
      { label: 'The ' },
      { id: 'mins', label: '30-minute', pick: true },
      { label: ' review runs from ' },
      { id: 'start', label: '10:00', pick: true },
      { label: ' to ' },
      { id: 'end', label: '10:45', pick: true },
      { label: '.' },
    ],
    wrongId: 'end',
    note: '10:00 plus 30 minutes is 10:30.',
  },
  {
    id: 'invoice',
    parts: [
      { label: 'The invoice is ' },
      { id: 'base', label: '$200', pick: true },
      { label: ' plus 10% tax (' },
      { id: 'tax', label: '$20', pick: true },
      { label: '), total ' },
      { id: 'total', label: '$240', pick: true },
      { label: '.' },
    ],
    wrongId: 'total',
    note: '$200 plus $20 is $220.',
  },
  {
    id: 'tickets',
    parts: [
      { id: 'all', label: '12', pick: true },
      { label: ' tickets: ' },
      { id: 'closed', label: '9', pick: true },
      { label: ' closed and ' },
      { id: 'open', label: '4', pick: true },
      { label: ' still open.' },
    ],
    wrongId: 'open',
    note: '12 minus 9 leaves 3 open, not 4.',
  },
  {
    id: 'room',
    parts: [
      { label: 'Headcount is ' },
      { id: 'all', label: '8', pick: true },
      { label: '. ' },
      { id: 'here', label: '3', pick: true },
      { label: ' are in the room and ' },
      { id: 'remote', label: '6', pick: true },
      { label: ' are remote.' },
    ],
    wrongId: 'remote',
    note: '8 minus 3 leaves 5 remote, not 6.',
  },
  {
    id: 'sprint',
    parts: [
      { label: 'The sprint is ' },
      { id: 'all', label: '20', pick: true },
      { label: ' points. ' },
      { id: 'done', label: '12', pick: true },
      { label: ' are done, so ' },
      { id: 'left', label: '10', pick: true },
      { label: ' remain.' },
    ],
    wrongId: 'left',
    note: '20 minus 12 leaves 8, not 10.',
  },
  {
    id: 'slides',
    parts: [
      { label: 'The deck has ' },
      { id: 'all', label: '18', pick: true },
      { label: ' slides. You cut ' },
      { id: 'cut', label: '5', pick: true },
      { label: ', leaving ' },
      { id: 'left', label: '11', pick: true },
      { label: '.' },
    ],
    wrongId: 'left',
    note: '18 minus 5 leaves 13, not 11.',
  },
]

export function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = copy[i]
    copy[i] = copy[j]
    copy[j] = swap
  }
  return copy
}

export const CORPORATE_PRERENDER = {
  path: '/corporate',
  title: 'Corporate drills — BrainRotChecker',
  description: 'Three short workplace drills inside BrainRotChecker: inbox triage, priority order, and a figure check. Practice only, not an assessment of job performance.',
  kicker: 'Corporate',
  heading: 'Corporate drills',
  updated: '12 October 2026',
  sections: [
    {
      paragraphs: [
        'BrainRotChecker includes a separate set of workplace drills. They sit beside the habit quiz and the arcade. They do not change the brain-rot score, and they are not a test of whether someone should be hired, promoted, or managed.',
        'Inbox triage shows a message and asks you to reply now, schedule it, delegate it, or archive it. Priority order asks you to sequence four pieces of work: today’s blocker, other work due today, later dated work, then anything with no ask. Figure check gives a status line in which one number does not match the others.',
        'Each drill keeps a best score in this browser only. The copy is in English. There is no team account, no manager view, and no ranking of employees.',
      ],
    },
  ],
  links: [
    { path: '/corporate/inbox', label: 'Inbox triage' },
    { path: '/corporate/priority', label: 'Priority order' },
    { path: '/corporate/figures', label: 'Figure check' },
    { path: '/', label: 'Home' },
    { path: '/how-it-works', label: 'How the habit check works' },
  ],
}
