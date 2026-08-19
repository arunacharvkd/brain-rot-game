import { AnimatePresence } from 'framer-motion'
import useGameStore from './store/gameStore'
import Landing from './screens/Landing'
import Quiz from './screens/Quiz'
import ReactionTest from './screens/ReactionTest'
import Diagnosis from './screens/Diagnosis'
import ArcadeHub from './screens/ArcadeHub'
import Game from './screens/Game'
import FinalResults from './screens/FinalResults'
import MemoryMatch from './screens/games/MemoryMatch'
import PatternSimon from './screens/games/PatternSimon'
import SpeedMath from './screens/games/SpeedMath'
import BreathFocus from './screens/games/BreathFocus'
import WordScramble from './screens/games/WordScramble'
import ColourWord from './screens/games/ColourWord'

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
  results:        FinalResults,
}

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const Screen = SCREENS[screen] ?? Landing

  return (
    <div className="app">
      {/* Animated background only for non-game screens */}
      {screen !== 'game' && (
        <>
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
        </>
      )}
      <AnimatePresence mode="wait">
        <Screen key={screen} />
      </AnimatePresence>
    </div>
  )
}
