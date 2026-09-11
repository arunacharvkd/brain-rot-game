export const DAILY_GAMES = [
  { id: 'math', screen: 'game-math', emoji: '⚡', nameKey: 'gameMath', seconds: 60 },
  { id: 'colour', screen: 'game-colour', emoji: '🎨', nameKey: 'gameColour', seconds: 60 },
  { id: 'word', screen: 'game-word', emoji: '🔤', nameKey: 'gameWord', seconds: 50 },
  { id: 'odd', screen: 'game-odd', emoji: '🕵️', nameKey: 'gameOdd', seconds: 48 },
  { id: 'order', screen: 'game-order', emoji: '🔢', nameKey: 'gameOrder', seconds: 56 },
]

export function utcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function utcYesterdayKey(date = new Date()) {
  return utcDateKey(new Date(date.getTime() - 86400000))
}

export function dailyIndex(dateKey = utcDateKey()) {
  let hash = 0
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 33 + dateKey.charCodeAt(i)) >>> 0
  }
  return hash % DAILY_GAMES.length
}

export function getDailyGame(date = new Date()) {
  const dateKey = utcDateKey(date)
  return { ...DAILY_GAMES[dailyIndex(dateKey)], dateKey }
}

export function applyDailyComplete(daily, gameId, score, date = new Date()) {
  const today = utcDateKey(date)
  const yesterday = utcYesterdayKey(date)
  const prev = daily || { streak: 0, lastPlayedOn: '', lastScore: 0, lastGameId: '' }
  if (prev.lastPlayedOn === today) {
    return { ...prev, lastScore: score, lastGameId: gameId }
  }
  const streak = prev.lastPlayedOn === yesterday ? (prev.streak || 0) + 1 : 1
  return {
    streak,
    lastPlayedOn: today,
    lastScore: score,
    lastGameId: gameId,
  }
}

export function dailyPlayedToday(daily, date = new Date()) {
  return Boolean(daily?.lastPlayedOn && daily.lastPlayedOn === utcDateKey(date))
}
