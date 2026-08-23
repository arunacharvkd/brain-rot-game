import { AnimatePresence } from 'framer-motion'
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
  const screen = useGameStore((s) => s.screen)
  const muted = useGameStore((s) => s.muted)
  const toggleMute = useGameStore((s) => s.toggleMute)
  const Screen = SCREENS[screen] ?? Landing
  const isGameScreen = screen === 'game' || screen.startsWith('game-')

  return (
    <div className="app">
      {!isGameScreen && (
        <>
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
        </>
      )}
      <button
        onClick={toggleMute}
        title={muted ? 'Unmute' : 'Mute'}
        style={{
          position: 'fixed', top: 14, right: 16, zIndex: 1000,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8, color: muted ? 'var(--text-muted)' : '#fff',
          fontSize: '1.1rem', padding: '5px 10px', cursor: 'pointer',
          backdropFilter: 'blur(4px)',
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <AnimatePresence mode="wait">
        <Screen key={screen} />
      </AnimatePresence>
      {!isGameScreen && <Footer />}
    </div>
  )
}
