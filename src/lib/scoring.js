/** Shared scoring: numeric quiz options, 0–100 arcade runs, modest speed bonus. */

export const QUIZ_MAX = 21
export const REACTION_MAX = 9
export const DIAGNOSIS_MAX = QUIZ_MAX + REACTION_MAX
export const ARCADE_MAX = 100
export const PLAY_PTS = 80
export const SPEED_PTS = 20

export const ARCADE = {
  focus: { parMs: 90_000, maxAccuracy: 300 },
  memory: { parMs: 50_000, maxAccuracy: 8 },
  simon: { parMs: 75_000, maxAccuracy: 10 },
  math: { parMs: 35_000, maxAccuracy: 20 },
  breath: { parMs: 32_000, maxAccuracy: 80 },
  word: { parMs: 28_000, maxAccuracy: 10 },
  colour: { parMs: 28_000, maxAccuracy: 15 },
  odd: { parMs: 24_000, maxAccuracy: 12 },
  order: { parMs: 32_000, maxAccuracy: 8 },
}

export function clampInt(n, min, max) {
  const v = Number(n)
  if (!Number.isFinite(v)) return min
  return Math.max(min, Math.min(max, Math.round(v)))
}

export function quizOptionScore(score) {
  return clampInt(score, 0, 3)
}

export function sumQuizScores(scores) {
  return scores.reduce((total, score) => total + quizOptionScore(score), 0)
}

export function msToReactionRot(avgMs) {
  const avg = Number(avgMs)
  if (!Number.isFinite(avg)) return REACTION_MAX
  if (avg < 300) return 0
  if (avg < 500) return 3
  if (avg < 700) return 6
  return REACTION_MAX
}

export function formatDuration(ms) {
  const totalSec = Math.max(0, Math.round((Number(ms) || 0) / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m <= 0) return `${s}s`
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * 1 at/under par. Floors at minFactor so a slow but complete run still keeps
 * most of its play points; speed is a bonus, not a gate.
 */
export function timeFactor(elapsedMs, parMs, { minFactor = 0.35, slowAt = 2.2 } = {}) {
  const par = Number(parMs)
  if (!Number.isFinite(par) || par <= 0) return 1
  const t = Math.max(0, Number(elapsedMs) || 0)
  if (t <= par) return 1
  const span = Math.max(1, par * slowAt - par)
  const extra = t - par
  return Math.max(minFactor, Math.min(1, 1 - (extra / span) * (1 - minFactor)))
}

export function arcadeScore({ id, accuracy, elapsedMs, maxAccuracy, parMs } = {}) {
  const cfg = (id && ARCADE[id]) || {}
  const maxA = Math.max(1, Number(maxAccuracy ?? cfg.maxAccuracy) || 1)
  const par = Number(parMs ?? cfg.parMs) || 0
  const acc = Math.max(0, Number(accuracy) || 0)
  const ratio = Math.min(1, acc / maxA)
  const playPts = Math.round(ratio * PLAY_PTS)
  const speedPts = Math.round(timeFactor(elapsedMs, par) * SPEED_PTS * ratio)
  return {
    playPts,
    speedPts,
    total: clampInt(playPts + speedPts, 0, ARCADE_MAX),
    elapsedMs: Math.max(0, Math.round(Number(elapsedMs) || 0)),
    ratio,
  }
}

export function sumArcadeScores(arcadeScores = {}) {
  return Object.values(arcadeScores).reduce((sum, n) => sum + (Number(n) || 0), 0)
}

export function sumArcadeTimes(arcadeTimes = {}) {
  return Object.values(arcadeTimes).reduce((sum, n) => sum + (Number(n) || 0), 0)
}

export function betterArcadeRun(prevScore, prevMs, score, elapsedMs) {
  if (prevScore === undefined || prevScore === null) return true
  if (score > prevScore) return true
  if (score === prevScore && elapsedMs < (prevMs ?? Infinity)) return true
  return false
}

export function quizPaceRot(elapsedMs, questionCount = 7) {
  const par = questionCount * 12_000
  const t = Number(elapsedMs) || 0
  if (t <= par * 2.5) return 0
  if (t <= par * 4) return 1
  return 2
}

export function runSummaryCopy(t, language, result) {
  return {
    scoreLabel: t(language, 'scoreLabel').replace('{score}', result.total),
    timeLabel: t(language, 'finishTime').replace('{time}', formatDuration(result.elapsedMs)),
    breakdown: t(language, 'scoreBreakdown')
      .replace('{play}', result.playPts)
      .replace('{speed}', result.speedPts),
  }
}
