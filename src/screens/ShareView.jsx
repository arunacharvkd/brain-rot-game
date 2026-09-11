import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import BrandMark from '../components/BrandMark'
import { TIERS } from '../data/tiers'
import { decodePayload } from '../lib/codec'
import { t } from '../i18n/translations'
import { trackEvent } from '../lib/analytics'

export default function ShareView() {
  const sharedFromStore = useGameStore((s) => s.sharedCard)
  const setScreen = useGameStore((s) => s.setScreen)
  const acceptChallenge = useGameStore((s) => s.acceptChallenge)
  const language = useGameStore((s) => s.language)
  const [ready, setReady] = useState(false)
  const shared = sharedFromStore || (typeof window !== 'undefined'
    ? decodePayload(new URLSearchParams(window.location.search).get('p'))
    : null)

  useEffect(() => {
    setReady(true)
    if (shared) {
      trackEvent('shared_card_opened', { kind: shared.k, score: shared.s, tier: shared.f })
    }
  }, [shared])

  if (!ready || !shared) {
    return (
      <motion.div className="screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlassCard style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <p className="text-muted">{t(language, 'shareMissing')}</p>
          <NeonButton onClick={() => setScreen('landing')} variant="green" style={{ marginTop: 16 }}>
            {t(language, 'home')}
          </NeonButton>
        </GlassCard>
      </motion.div>
    )
  }

  const before = TIERS[shared.d] || TIERS[0]
  const after = TIERS[shared.f] || TIERS[0]
  const isChallenge = shared.k === 'c'

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
    >
      <GlassCard glow className="results-card" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <BrandMark size={44} />
        <p className="share-view-kicker">{isChallenge ? t(language, 'challengeIncoming') : t(language, 'sharedCardKicker')}</p>
        <h1 className="results-title" style={{ fontSize: '1.6rem' }}>
          {after.emoji} {after.label}
        </h1>
        <p className="text-muted">
          {shared.n !== 'Friend' ? `${shared.n} · ` : ''}
          {before.emoji} {before.label} → {after.label}
        </p>
        <p className="results-score text-mono" style={{ marginTop: 12 }}>
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>{shared.s} pts</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 10 }}>
            {t(language, 'across')} {shared.g} {shared.g === 1 ? t(language, 'game') : t(language, 'games')}
          </span>
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          {isChallenge ? (
            <NeonButton
              variant="purple"
              onClick={() => {
                trackEvent('challenge_accepted', { from: shared.n })
                acceptChallenge(shared)
              }}
            >
              {t(language, 'challengeAccept')}
            </NeonButton>
          ) : (
            <NeonButton variant="green" onClick={() => setScreen('quiz')}>
              {t(language, 'startDiagnosis')}
            </NeonButton>
          )}
          <NeonButton variant="outline" onClick={() => setScreen('landing')}>
            {t(language, 'home')}
          </NeonButton>
        </div>
      </GlassCard>
    </motion.div>
  )
}
