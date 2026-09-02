import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import BrainRotMeter from '../components/BrainRotMeter'
import NeonButton from '../components/NeonButton'
import AdUnit from '../components/AdUnit'
import { TIERS, calcFinalTier, SPONSOR } from '../data/tiers'
import { AD_SLOTS } from '../data/ads'
import { useSound } from '../hooks/useSound'
import { trackEvent } from '../lib/analytics'
import { t } from '../i18n/translations'

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
  const setScreen = useGameStore((s) => s.setScreen)
  const finalTier = useGameStore((s) => s.finalTier)
  const reset = useGameStore((s) => s.reset)
  const language = useGameStore((s) => s.language)
  const { play } = useSound()
  const [copied, setCopied] = useState(false)

  const totalScore = Object.values(arcadeScores).reduce((a, b) => a + b, 0)
  const gamesPlayed = Object.keys(arcadeScores).length

  useEffect(() => {
    const computed = calcFinalTier(diagnosisTier, arcadeScores)
    setFinalTier(computed)
    trackEvent('rehab_completed', {
      diagnosis_tier: diagnosisTier,
      final_tier: computed,
      total_score: totalScore,
      games_played: gamesPlayed,
      tier_improvement: Math.max(0, diagnosisTier - computed),
    })
    play('win')
    confetti({ particleCount: 220, spread: 110, origin: { y: 0.58 } })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const verdict = getVerdict(diagnosisTier, finalTier)

  const handleShare = async () => {
    const text = getShareText(diagnosisTier, finalTier, totalScore, gamesPlayed)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Brain Rot Test Results', text })
        trackEvent('result_shared', { method: 'native_share' })
        return
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text)
      trackEvent('result_shared', { method: 'clipboard' })
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
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
          <button
            onClick={() => setScreen('arcade')}
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
            {t(language, 'backToArcade')}
          </button>
        </div>

        <motion.h1
          className="results-title"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16 }}
        >
          {t(language, 'rehabComplete')}
        </motion.h1>

        <motion.p className="results-verdict" {...fadeUp(0.18)}>
          {verdict}
        </motion.p>

        {/* Before / After meters */}
        <motion.div className="results-meters" {...fadeUp(0.28)}>
          <div className="results-meter-col">
            <BrainRotMeter tier={diagnosisTier} label={t(language, 'before')} />
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span className={`tier-chip tier-${diagnosisTier}`}>
                {TIERS[diagnosisTier].emoji} {TIERS[diagnosisTier].label}
              </span>
            </div>
          </div>
          <div className="results-arrow">→</div>
          <div className="results-meter-col">
            <BrainRotMeter tier={finalTier} label={t(language, 'afterRehab')} />
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span className={`tier-chip tier-${finalTier}`}>
                {TIERS[finalTier].emoji} {TIERS[finalTier].label}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.p className="results-score text-mono" {...fadeUp(0.36)}>
          {t(language, 'totalScore')}{' '}
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>{totalScore} pts</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>{t(language, 'across')} {gamesPlayed} {gamesPlayed === 1 ? t(language, 'game') : t(language, 'games')}</span>
        </motion.p>

        <motion.div
          {...fadeUp(0.44)}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <NeonButton onClick={handleShare} variant="purple">
            {copied ? t(language, 'copied') : t(language, 'share')}
          </NeonButton>
          <NeonButton onClick={reset} variant="outline">
            {t(language, 'playAgain')}
          </NeonButton>
        </motion.div>

        {/* AdSense: below Share/Play Again buttons */}
        <AdUnit slot={AD_SLOTS.results} className="results-ad" />

        {SPONSOR.active && (
          <motion.div
            {...fadeUp(0.54)}
            style={{
              marginTop: 24,
              padding: '16px 20px',
              borderRadius: 'var(--r-lg)',
              border: '1px solid rgba(168,85,247,0.25)',
              background: 'rgba(168,85,247,0.06)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Sponsored
            </p>
            {SPONSOR.logo && (
              <img src={SPONSOR.logo} alt={SPONSOR.name} style={{ height: 28, marginBottom: 8 }} />
            )}
            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{SPONSOR.name}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>{SPONSOR.tagline}</p>
            <a
              href={SPONSOR.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'var(--purple)',
                color: '#fff',
                borderRadius: 8,
                padding: '7px 20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {SPONSOR.ctaText}
            </a>
          </motion.div>
        )}
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
            {t(language, 'copiedClipboard')}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
