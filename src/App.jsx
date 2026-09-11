import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useEffect, useRef } from 'react'
import useGameStore from './store/gameStore'
import Landing from './screens/Landing'
import Quiz from './screens/Quiz'
import ReactionTest from './screens/ReactionTest'
import Diagnosis from './screens/Diagnosis'
import ArcadeHub from './screens/ArcadeHub'
import FinalResults from './screens/FinalResults'
import PrivacyPolicy from './screens/PrivacyPolicy'
import Footer from './components/Footer'
import BrandMark from './components/BrandMark'
import { trackEvent, trackScreenView } from './lib/analytics'
import { LANGUAGES } from './i18n/translations'
import { getPathFromScreen, getScreenFromPath } from './lib/routes'
import { ensureAdSenseScript, isAdSenseReady } from './data/ads'
import { decodePayload } from './lib/codec'
import ShareView from './screens/ShareView'
import ChallengeBanner from './components/ChallengeBanner'

const Game = lazy(() => import('./screens/Game'))
const MemoryMatch = lazy(() => import('./screens/games/MemoryMatch'))
const PatternSimon = lazy(() => import('./screens/games/PatternSimon'))
const SpeedMath = lazy(() => import('./screens/games/SpeedMath'))
const BreathFocus = lazy(() => import('./screens/games/BreathFocus'))
const WordScramble = lazy(() => import('./screens/games/WordScramble'))
const ColourWord = lazy(() => import('./screens/games/ColourWord'))
const OddOneOut = lazy(() => import('./screens/games/OddOneOut'))
const TapOrder = lazy(() => import('./screens/games/TapOrder'))

const SCREENS = {
  landing:        Landing,
  quiz:           Quiz,
  reaction:       ReactionTest,
  diagnosis:      Diagnosis,
  arcade:         ArcadeHub,
  game:           Game,
  'game-memory':  MemoryMatch,
  'game-simon':   PatternSimon,
  'game-math':    SpeedMath,
  'game-breath':  BreathFocus,
  'game-word':    WordScramble,
  'game-colour':  ColourWord,
  'game-odd':     OddOneOut,
  'game-order':   TapOrder,
  results:        FinalResults,
  privacy:        PrivacyPolicy,
  shared:         ShareView,
}

export default function App() {
  const setScreen = useGameStore((s) => s.setScreen)
  const screen = useGameStore((s) => s.screen)
  const muted = useGameStore((s) => s.muted)
  const quizScore = useGameStore((s) => s.quizScore)
  const reactionScore = useGameStore((s) => s.reactionScore)
  const diagnosisTier = useGameStore((s) => s.diagnosisTier)
  const arcadeScores = useGameStore((s) => s.arcadeScores)
  const toggleMute = useGameStore((s) => s.toggleMute)
  const language = useGameStore((s) => s.language)
  const setLanguage = useGameStore((s) => s.setLanguage)
  const setSharedCard = useGameStore((s) => s.setSharedCard)
  const acceptChallenge = useGameStore((s) => s.acceptChallenge)
  const challenge = useGameStore((s) => s.challenge)
  const Screen = SCREENS[screen] ?? Landing
  const isGameScreen = screen === 'game' || screen.startsWith('game-')
  const isLandingScreen = screen === 'landing'
  const hasTrackedSessionRef = useRef(false)
  const incomingLinkRef = useRef(false)

  useEffect(() => {
    if (hasTrackedSessionRef.current) return
    const hasHistory =
      quizScore > 0 ||
      reactionScore > 0 ||
      diagnosisTier > 0 ||
      Object.keys(arcadeScores).length > 0

    trackEvent('app_session_started', {
      user_type: hasHistory ? 'returning' : 'new',
    })
    hasTrackedSessionRef.current = true
  }, [quizScore, reactionScore, diagnosisTier, arcadeScores])

  useEffect(() => {
    trackScreenView(screen)
  }, [screen])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (isAdSenseReady()) ensureAdSenseScript()
  }, [])

  useEffect(() => {
    const applyIncoming = () => {
      if (incomingLinkRef.current) return
      const params = new URLSearchParams(window.location.search)
      const payload = decodePayload(params.get('p'))
      incomingLinkRef.current = true
      if (!payload) return
      setSharedCard(payload)
      if (payload.k === 'c') acceptChallenge(payload)
      else setScreen('shared')
    }
    const unsub = useGameStore.persist.onFinishHydration(applyIncoming)
    if (useGameStore.persist.hasHydrated()) applyIncoming()
    return unsub
  }, [acceptChallenge, setScreen, setSharedCard])

  // Keep the URL in sync with the active screen so each screen is a distinct, crawlable page.
  useEffect(() => {
    if (screen === 'shared') return
    const path = getPathFromScreen(screen)
    if (window.location.pathname !== path) {
      window.history.pushState({ screen }, '', path)
    }
  }, [screen])

  useEffect(() => {
    const handlePopState = () => {
      setScreen(getScreenFromPath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [setScreen])

  // AdSense's responsive-ad script forces height:auto/!important onto ancestor elements
  // to measure itself, which breaks our fixed-viewport app shell — strip it back off.
  useEffect(() => {
    const guarded = [document.getElementById('root'), document.querySelector('.app')].filter(Boolean)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'style' && mutation.target.getAttribute('style')) {
          mutation.target.removeAttribute('style')
        }
      }
    })
    guarded.forEach((el) => observer.observe(el, { attributes: true, attributeFilter: ['style'] }))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="app">
      {!isGameScreen && (
        <>
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </>
      )}
      {!isLandingScreen && (
        <>
          {!isGameScreen && (
            <button
              type="button"
              className="app-brand"
              onClick={() => setScreen('landing')}
              aria-label="BRC home"
              title="BRC home"
            >
              <BrandMark size={40} />
            </button>
          )}
          <div className="app-controls">
            <label className="language-picker">
              <span className="sr-only">Language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                {LANGUAGES.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
              </select>
            </label>
            <button
              onClick={toggleMute}
              title={muted ? 'Unmute' : 'Mute'}
              className="sound-toggle"
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        </>
      )}
      {challenge && !isLandingScreen && !isGameScreen && screen !== 'reaction' && (
        <ChallengeBanner />
      )}
      <Suspense fallback={<div className="screen screen-loading">Loading…</div>}>
        <AnimatePresence mode="wait">
          <Screen key={screen} />
        </AnimatePresence>
      </Suspense>
      {!isGameScreen && !isLandingScreen && <Footer />}
    </div>
  )
}
