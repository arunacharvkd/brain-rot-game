import { encodePayload, decodePayload, whoMoreNpc, buildRunPayload } from '../src/lib/codec.js'
import { getDailyGame, applyDailyComplete, dailyPlayedToday, utcDateKey } from '../src/lib/daily.js'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const payload = buildRunPayload('c', {
  quizScore: 14,
  reactionScore: 6,
  diagnosisTier: 2,
  arcadeScores: { math: 40, colour: 55 },
  finalTier: 1,
}, 'Alex')

const encoded = encodePayload(payload)
const decoded = decodePayload(encoded)
assert(decoded.k === 'c', 'kind')
assert(decoded.n === 'Alex', 'name')
assert(decoded.s === 95, 'total')
assert(decoded.a.math === 40, 'arcade')
assert(decodePayload('%%%') === null, 'bad payload')

assert(whoMoreNpc({ d: 3, f: 3, q: 20, r: 9, s: 10 }, { d: 0, f: 0, q: 2, r: 0, s: 200 }) === 'a', 'npc a')
assert(whoMoreNpc({ d: 1, f: 1, q: 8, r: 3, s: 80 }, { d: 1, f: 1, q: 8, r: 3, s: 80 }) === 'tie', 'npc tie')

const today = new Date('2026-09-11T12:00:00.000Z')
const game = getDailyGame(today)
assert(game.id && game.seconds <= 60, 'daily game is ~60s')
assert(utcDateKey(today) === '2026-09-11', 'utc date')

const first = applyDailyComplete(null, game.id, 12, today)
assert(first.streak === 1, 'streak start')
const sameDay = applyDailyComplete(first, game.id, 20, today)
assert(sameDay.streak === 1, 'no double count')
assert(dailyPlayedToday(sameDay, today), 'played today')
const next = applyDailyComplete(sameDay, game.id, 9, new Date('2026-09-12T01:00:00.000Z'))
assert(next.streak === 2, 'streak continues')
const broken = applyDailyComplete(next, game.id, 4, new Date('2026-09-14T01:00:00.000Z'))
assert(broken.streak === 1, 'streak resets')

console.log('growth-lib-check ok', { encodedLength: encoded.length, daily: game.id })
