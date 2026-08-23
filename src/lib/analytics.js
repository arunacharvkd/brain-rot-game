export const GAME_NAMES = {
  focus: 'Focus Game',
  memory: 'Memory Match',
  simon: 'Pattern Simon',
  math: 'Speed Math',
  breath: 'Breath Focus',
  word: 'Word Scramble',
  colour: 'Colour vs Word',
  odd: 'Odd One Out',
  order: 'Tap Order',
}

const SCREEN_TO_GAME_ID = {
  game: 'focus',
  'game-memory': 'memory',
  'game-simon': 'simon',
  'game-math': 'math',
  'game-breath': 'breath',
  'game-word': 'word',
  'game-colour': 'colour',
  'game-odd': 'odd',
  'game-order': 'order',
}

function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null))
}

export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', eventName, cleanParams(params))
}

export function trackScreenView(screenName) {
  trackEvent('screen_view', {
    screen_name: screenName,
  })
}

export function getGameIdFromScreen(screenName) {
  return SCREEN_TO_GAME_ID[screenName] || null
}

export function trackGameStart(screenName, fromScreen) {
  const gameId = getGameIdFromScreen(screenName)
  if (!gameId) return

  trackEvent('game_start', {
    game_id: gameId,
    game_name: GAME_NAMES[gameId],
    from_screen: fromScreen,
  })
}

export function trackGameComplete(gameId, score, previousBest) {
  const bestScore = Math.max(score, previousBest ?? 0)

  trackEvent('game_complete', {
    game_id: gameId,
    game_name: GAME_NAMES[gameId] || gameId,
    score,
    best_score: bestScore,
    is_new_best: previousBest === undefined ? 1 : score > previousBest ? 1 : 0,
    first_play: previousBest === undefined ? 1 : 0,
  })
}
