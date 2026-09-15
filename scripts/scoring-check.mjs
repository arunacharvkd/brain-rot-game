import { getQuestions } from '../src/data/questions.js'
import { calcFinalTier } from '../src/data/tiers.js'
import {
  arcadeScore,
  formatDuration,
  msToReactionRot,
  quizOptionScore,
  sumQuizScores,
  timeFactor,
} from '../src/lib/scoring.js'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

assert(quizOptionScore('2') === 2, 'string option stays numeric')
assert(quizOptionScore('nope') === 0, 'junk option is 0')
assert(sumQuizScores(['1', 2, '3']) === 6, 'translated-looking scores sum as numbers')
assert(sumQuizScores(['1', '2']) !== '12', 'no string concat')

const hi = getQuestions('hi')
assert(hi.length === 7, '7 questions')
assert(hi.every((q) => q.options.every((o) => typeof o.score === 'number')), 'hi scores are numbers')
assert(hi[0].options.map((o) => o.score).join(',') === '0,1,2,3', 'weights 0-3')

assert(msToReactionRot(250) === 0, 'fast taps are 0 rot')
assert(msToReactionRot(400) === 3, 'mid taps')
assert(msToReactionRot(900) === 9, 'slow taps')

assert(formatDuration(45000) === '45s', 'seconds')
assert(formatDuration(90000) === '1:30', 'mm:ss')

assert(timeFactor(20_000, 30_000) === 1, 'under par is full speed')
assert(timeFactor(30_000, 30_000) === 1, 'at par is full speed')
assert(timeFactor(90_000, 30_000) <= 0.36, 'very slow floors near 0.35')
assert(timeFactor(90_000, 30_000) >= 0.35, 'floor holds')

const fast = arcadeScore({ id: 'word', accuracy: 10, elapsedMs: 12_000 })
const slow = arcadeScore({ id: 'word', accuracy: 10, elapsedMs: 70_000 })
assert(fast.total === 100, `perfect fast is 100, got ${fast.total}`)
assert(slow.total < fast.total, 'same accuracy: slower scores less')
assert(slow.total >= 80 + 7, `slow perfect still keeps play pts, got ${slow.total}`)
assert(slow.playPts === 80, 'slow careful play keeps 80 play pts')

const zeroFast = arcadeScore({ id: 'math', accuracy: 0, elapsedMs: 5_000 })
assert(zeroFast.total === 0, 'speed does not reward a 0-accuracy rush')

const half = arcadeScore({ id: 'colour', accuracy: 8, elapsedMs: 20_000 })
assert(half.total > 40 && half.total < 80, `mid colour run in range, got ${half.total}`)

assert(calcFinalTier(3, { math: 20, word: 20, colour: 20 }) === 3, 'low mean no upgrade')
assert(calcFinalTier(3, { math: 50, word: 50, colour: 50 }) === 2, 'mean 50 is +1 tier')
assert(calcFinalTier(3, { a: 70, b: 70, c: 70, d: 70, e: 70, f: 70 }) === 1, '6 games mean 70 is +2')
assert(calcFinalTier(2, { math: 90 }) === 2, 'one game cannot unlock results')

const simonMax = arcadeScore({ id: 'simon', accuracy: 10, elapsedMs: 60_000 })
assert(simonMax.total <= 100, 'simon capped at 100')
assert(simonMax.total >= 90, 'complete simon near cap')

console.log('scoring-check ok', { fast: fast.total, slow: slow.total, half: half.total })
