// Maps in-app "screen" keys to real URL paths so each screen is a distinct, crawlable URL.
export const SCREEN_PATHS = {
  landing: '/',
  quiz: '/quiz',
  reaction: '/reaction',
  diagnosis: '/diagnosis',
  arcade: '/arcade',
  game: '/game/focus',
  'game-memory': '/game/memory',
  'game-simon': '/game/simon',
  'game-math': '/game/math',
  'game-breath': '/game/breath',
  'game-word': '/game/word',
  'game-colour': '/game/colour',
  'game-odd': '/game/odd',
  'game-order': '/game/order',
  results: '/results',
  privacy: '/privacy',
}

const PATH_TO_SCREEN = Object.fromEntries(
  Object.entries(SCREEN_PATHS).map(([screen, path]) => [path, screen])
)

export function getPathFromScreen(screen) {
  return SCREEN_PATHS[screen] ?? '/'
}

export function getScreenFromPath(pathname) {
  return PATH_TO_SCREEN[pathname] ?? 'landing'
}
