import { useEffect } from 'react'
import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import BrainRotMeter from '../components/BrainRotMeter'
import NeonButton from '../components/NeonButton'
import { TIERS, scoreToTier, SPONSOR } from '../data/tiers'
import { trackEvent } from '../lib/analytics'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.44, delay },
})

export default function Diagnosis() {
  const quizScore = useGameStore((s) => s.quizScore)
  const reactionScore = useGameStore((s) => s.reactionScore)
  const diagnosisTier = useGameStore((s) => s.diagnosisTier)
  const setDiagnosisTier = useGameStore((s) => s.setDiagnosisTier)
  const setScreen = useGameStore((s) => s.setScreen)

  const totalScore = quizScore + reactionScore

  useEffect(() => {
    const computedTier = scoreToTier(totalScore)
    setDiagnosisTier(computedTier)
    trackEvent('diagnosis_generated', {
      diagnosis_tier: computedTier,
      diagnosis_label: TIERS[computedTier]?.label,
      quiz_score: quizScore,
      reaction_score: reactionScore,
      total_score: totalScore,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tier = TIERS[diagnosisTier]

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard glow style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
          <button
            onClick={() => setScreen('reaction')}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 7,
              color: 'var(--text-muted)',
              fontSize: '0.74rem',
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        </div>

        <motion.span
          className="diag-emoji"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        >
          {tier.emoji}
        </motion.span>

        <motion.div {...fadeUp(0.2)}>
          <span className={`tier-chip tier-${diagnosisTier}`}>{tier.label}</span>
        </motion.div>

        <motion.p
          style={{ marginTop: 16, marginBottom: 28, color: 'var(--text-muted)', lineHeight: 1.65 }}
          {...fadeUp(0.3)}
        >
          {tier.desc}
        </motion.p>

        <motion.div {...fadeUp(0.4)}>
          <BrainRotMeter tier={diagnosisTier} label="Brain Rot Level" />
          <p className="diag-score-row">
            Quiz {quizScore}/21 &nbsp;·&nbsp; Reaction +{reactionScore} &nbsp;·&nbsp; Total {totalScore}/30
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.52)} style={{ marginTop: 28 }}>
          <NeonButton
            onClick={() => setScreen('arcade')}
            variant={diagnosisTier >= 2 ? 'purple' : 'green'}
            style={{ width: '100%' }}
          >
            Start Brain Rehab →
          </NeonButton>
          {SPONSOR.active && (
            <p style={{ marginTop: 14, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {SPONSOR.badgeText}{' '}
              <a
                href={SPONSOR.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--purple)', textDecoration: 'none', fontWeight: 600 }}
              >
                {SPONSOR.name}
              </a>
            </p>
          )}
        </motion.div>
      </GlassCard>
    </motion.div>
  )
}
