import {
  clampHour,
  defaultReminderPrefs,
  formatHourLabel,
  localDateKey,
  normalizeReminderPrefs,
  shouldShowNudge,
} from '../src/lib/reminder.js'
import { applyDailyComplete, dailyPlayedToday, getDailyGame } from '../src/lib/daily.js'
import { localHourInTz, sanitizeSubscribeInput } from '../server/pushSend.js'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

assert(clampHour(9) === 9, 'hour 9')
assert(clampHour(99) === 9, 'bad hour falls back')
assert(formatHourLabel(0) === '12:00 AM', 'midnight label')
assert(formatHourLabel(13) === '1:00 PM', 'afternoon label')

const cleaned = normalizeReminderPrefs({
  enabled: true,
  hour: 8,
  channel: 'in-app',
  lastNudgeOn: '',
  email: 'nope@example.com',
  name: 'Nope',
})
assert(cleaned.enabled === true, 'enabled')
assert(!('email' in cleaned) && !('name' in cleaned), 'prefs drop profile fields')

const now = new Date('2026-09-15T16:10:00')
assert(
  shouldShowNudge({ enabled: true, hour: 9, channel: 'in-app' }, { playedToday: false, now }),
  'nudge after hour',
)
assert(
  !shouldShowNudge({ enabled: true, hour: 21, channel: 'in-app' }, { playedToday: false, now }),
  'no nudge before hour',
)
assert(
  !shouldShowNudge({ enabled: false, hour: 9, channel: 'off' }, { playedToday: false, now }),
  'default off',
)

const today = new Date('2026-09-15T12:00:00.000Z')
const game = getDailyGame(today)
const daily = applyDailyComplete(null, game.id, 11, today)
assert(dailyPlayedToday(daily, today), 'streak still logs today')
assert(
  !shouldShowNudge({ enabled: true, hour: 0, channel: 'push' }, { playedToday: true, now: today }),
  'no nudge after drill',
)

const bad = sanitizeSubscribeInput({
  name: 'Ada',
  email: 'ada@example.com',
  phone: '555',
  hour: 9,
  tz: 'America/New_York',
})
assert(bad.error === 'Invalid endpoint', 'subscribe without push endpoint fails')

const ok = sanitizeSubscribeInput({
  name: 'Ada',
  email: 'ada@example.com',
  phone: '555',
  profile: { handle: 'ada' },
  hour: 9,
  tz: 'America/New_York',
  subscription: {
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
    keys: { p256dh: 'dGVzdA', auth: 'YXV0aA' },
  },
})
assert(!ok.error, 'valid sub')
assert(ok.record.hour === 9, 'hour kept')
assert(ok.record.tz === 'America/New_York', 'tz kept')
assert(ok.record.keys.p256dh === 'dGVzdA', 'keys kept')
assert(!('name' in ok.record) && !('email' in ok.record) && !('phone' in ok.record), 'PII not stored')

assert(localHourInTz(new Date('2026-09-15T16:00:00.000Z'), 'UTC') === 16, 'utc hour')
assert(localDateKey(new Date(2026, 8, 15, 8)).endsWith('15'), 'local date key')
assert(defaultReminderPrefs().enabled === false, 'opt-in default')

console.log('reminder-lib-check ok')
