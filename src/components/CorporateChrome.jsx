import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from './GlassCard'

export function CorporateBack() {
  const setScreen = useGameStore((s) => s.setScreen)
  return (
    <button type="button" className="ghost-back" onClick={() => setScreen('corporate')}>
      ← Corporate
    </button>
  )
}

export function CorporateShell({ children }) {
  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard style={{ maxWidth: 520, width: '100%' }}>
        {children}
      </GlassCard>
    </motion.div>
  )
}

export function RoundMeta({ round, total, timeLeft, totalTime, score }) {
  return (
    <div className="corp-meta">
      <CorporateBack />
      <span>Round {round} / {total}</span>
      <span className="text-mono">{score} pts</span>
      <span className="text-mono">{timeLeft}s</span>
      <div className="corp-timer" aria-hidden="true">
        <div style={{ width: `${Math.max(0, (timeLeft / totalTime) * 100)}%` }} />
      </div>
    </div>
  )
}
