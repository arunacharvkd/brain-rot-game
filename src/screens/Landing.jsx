import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import GlitchText from '../components/GlitchText'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.48, delay },
})

export default function Landing() {
  const setScreen = useGameStore((s) => s.setScreen)
  const hasPriorScore = useGameStore((s) => s.quizScore > 0)
  const diagnosisDone = useGameStore((s) => s.diagnosisTier > 0 || s.quizScore > 0)
  const gameDone = useGameStore((s) => Object.keys(s.arcadeScores).length > 0)
  const reset = useGameStore((s) => s.reset)

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard
        glow
        style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <GlitchText text="ARE YOU COOKED?" className="landing-title" />

        <motion.p className="landing-subtitle" {...fadeUp(0.18)}>
          Take the <strong style={{ color: '#fff' }}>Brain Rot Diagnosis Test</strong> — find out
          your rot level, then cure it with <strong style={{ color: '#fff' }}>Brain Rehab</strong>.
        </motion.p>

        <motion.div
          {...fadeUp(0.32)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <NeonButton
            onClick={() => setScreen('quiz')}
            variant="green"
            style={{ width: '100%', maxWidth: 320 }}
          >
            Diagnose Me 🧠
          </NeonButton>

          {diagnosisDone && !gameDone && (
            <NeonButton
              onClick={() => setScreen('diagnosis')}
              variant="purple"
              size="sm"
            >
              Skip to Rehab →
            </NeonButton>
          )}

          {gameDone && (
            <NeonButton onClick={() => setScreen('results')} variant="purple" size="sm">
              See My Results →
            </NeonButton>
          )}

          {hasPriorScore && (
            <button
              onClick={reset}
              style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}
            >
              ↩ Reset progress
            </button>
          )}
        </motion.div>

        <motion.p className="landing-footer text-mono text-xs" {...fadeUp(0.48)}>
          ~3 min · 7 questions + reaction test
          <br />
          <span style={{ opacity: 0.35 }}>*not actually a medical test lol</span>
        </motion.p>
      </GlassCard>
    </motion.div>
  )
}
