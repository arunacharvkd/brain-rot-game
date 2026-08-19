import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import BrainRotMeter from '../components/BrainRotMeter'
import NeonButton from '../components/NeonButton'
import { TIERS, calcFinalTier } from '../data/tiers'
import { useSound } from '../hooks/useSound'

function getVerdict(before, after) {
  if (after < before) {
    const steps = before - after
    return steps >= 2
      ? `Incredible! You jumped ${steps} tiers. Your brain is on fire! 🔥`
      : `Great work! You went from ${TIERS[before].label} to ${TIERS[after].label}. Real progress! 🌟`
  }
  if (after === 0) return 'Your focus is peak — you kept it clean all the way through. Legend. 👑'
  if (after === before) return `Solid effort! Every round builds better focus. Keep playing and you\'ll get there. 💡`
  return 'Even this session is brain training! Play again — every round counts. 🧠'
}

function getShareText(before, after, totalScore, gamesPlayed) {
  return [
    '🧠 Brain Rot Test Results',
    `Diagnosis: ${TIERS[before].emoji} ${TIERS[before].label}`,
    `After Rehab: ${TIERS[after].emoji} ${TIERS[after].label}`,
    `Total Score: ${totalScore} pts across ${gamesPlayed} game${gamesPlayed !== 1 ? 's' : ''}`,
    '',
    'Are you cooked? Find out! 👆',
  ].join('\n')
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.44, delay },
})

export default function FinalResults() {
  const diagnosisTier = useGameStore((s) => s.diagnosisTier)
  const arcadeScores = useGameStore((s) => s.arcadeScores)
  const setFinalTier = useGameStore((s) => s.setFinalTier)
  const finalTier = useGameStore((s) => s.finalTier)
  const reset = useGameStore((s) => s.reset)
  const { play } = useSound()
  const [copied, setCopied] = useState(false)

  const totalScore = Object.values(arcadeScores).reduce((a, b) => a + b, 0)
  const gamesPlayed = Object.keys(arcadeScores).length

  useEffect(() => {
    const computed = calcFinalTier(diagnosisTier, arcadeScores)
    setFinalTier(computed)
    play('win')
    confetti({ particleCount: 220, spread: 110, origin: { y: 0.58 } })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const verdict = getVerdict(diagnosisTier, finalTier)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(getShareText(diagnosisTier, finalTier, totalScore, gamesPlayed))
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard glow style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
        <motion.h1
          className="results-title"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16 }}
        >
          REHAB COMPLETE 🎉
        </motion.h1>

        <motion.p className="results-verdict" {...fadeUp(0.18)}>
          {verdict}
        </motion.p>

        {/* Before / After meters */}
        <motion.div className="results-meters" {...fadeUp(0.28)}>
          <div className="results-meter-col">
            <BrainRotMeter tier={diagnosisTier} label="Before" />
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span className={`tier-chip tier-${diagnosisTier}`}>
                {TIERS[diagnosisTier].emoji} {TIERS[diagnosisTier].label}
              </span>
            </div>
          </div>
          <div className="results-arrow">→</div>
          <div className="results-meter-col">
            <BrainRotMeter tier={finalTier} label="After Rehab" />
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span className={`tier-chip tier-${finalTier}`}>
                {TIERS[finalTier].emoji} {TIERS[finalTier].label}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.p className="results-score text-mono" {...fadeUp(0.36)}>
          Total Score:{' '}
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>{totalScore} pts</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>across {gamesPlayed} game{gamesPlayed !== 1 ? 's' : ''}</span>
        </motion.p>

        <motion.div
          {...fadeUp(0.44)}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <NeonButton onClick={handleShare} variant="purple">
            {copied ? '✓ Copied!' : 'Share Result 📋'}
          </NeonButton>
          <NeonButton onClick={reset} variant="outline">
            Play Again
          </NeonButton>
        </motion.div>
      </GlassCard>

      {/* Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            ✓ Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
