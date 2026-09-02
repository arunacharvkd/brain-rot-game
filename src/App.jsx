import { AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import useGameStore from './store/gameStore'
import Landing from './screens/Landing'
import Quiz from './screens/Quiz'
import ReactionTest from './screens/ReactionTest'
import Diagnosis from './screens/Diagnosis'
import ArcadeHub from './screens/ArcadeHub'
import Game from './screens/Game'
import FinalResults from './screens/FinalResults'
import PrivacyPolicy from './screens/PrivacyPolicy'
import MemoryMatch from './screens/games/MemoryMatch'
import PatternSimon from './screens/games/PatternSimon'
import SpeedMath from './screens/games/SpeedMath'
import BreathFocus from './screens/games/BreathFocus'
import WordScramble from './screens/games/WordScramble'
import ColourWord from './screens/games/ColourWord'
import OddOneOut from './screens/games/OddOneOut'
import TapOrder from './screens/games/TapOrder'
import Footer from './components/Footer'
import { trackEvent, trackScreenView } from './lib/analytics'
import { LANGUAGES } from './i18n/translations'
import { getPathFromScreen, getScreenFromPath } from './lib/routes'

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
  const Screen = SCREENS[screen] ?? Landing
  const isGameScreen = screen === 'game' || screen.startsWith('game-')
  const isLandingScreen = screen === 'landing'
  const hasTrackedSessionRef = useRef(false)

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

  // Keep the URL in sync with the active screen so each screen is a distinct, crawlable page.
  useEffect(() => {
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
      )}
      <AnimatePresence mode="wait">
        <Screen key={screen} />
      </AnimatePresence>
      {!isGameScreen && !isLandingScreen && <Footer />}
    </div>
  )
}
