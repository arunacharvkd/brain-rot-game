import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import BrainRotMeter from '../components/BrainRotMeter'
import NeonButton from '../components/NeonButton'
import BrandMark from '../components/BrandMark'
import AdUnit from '../components/AdUnit'
import { TIERS, calcFinalTier, SPONSOR } from '../data/tiers'
import { AD_SLOTS } from '../data/ads'
import { useSound } from '../hooks/useSound'
import { trackEvent } from '../lib/analytics'
import { t } from '../i18n/translations'
import { buildRunPayload, shareAbsoluteUrl, whoMoreNpc } from '../lib/codec'
import { renderResultCardBlob, resultShareText, shareResult } from '../lib/shareCard'

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

function visitDelta(previous, current) {
  if (!previous) return null
  const scoreDiff = current.totalScore - previous.totalScore
  const tierDiff = previous.finalTier - current.finalTier
  if (scoreDiff > 0 || tierDiff > 0) return 'better'
  if (scoreDiff < 0 || tierDiff < 0) return 'worse'
  return 'same'
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.44, delay },
})

export default function FinalResults() {
  const diagnosisTier = useGameStore((s) => s.diagnosisTier)
  const arcadeScores = useGameStore((s) => s.arcadeScores)
  const quizScore = useGameStore((s) => s.quizScore)
  const reactionScore = useGameStore((s) => s.reactionScore)
  const setFinalTier = useGameStore((s) => s.setFinalTier)
  const setScreen = useGameStore((s) => s.setScreen)
  const finalTier = useGameStore((s) => s.finalTier)
  const reset = useGameStore((s) => s.reset)
  const language = useGameStore((s) => s.language)
  const recordVisit = useGameStore((s) => s.recordVisit)
  const challenge = useGameStore((s) => s.challenge)
  const { play } = useSound()
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')
  const [cardUrl, setCardUrl] = useState('')
  const [cardBlobUrl, setCardBlobUrl] = useState('')
  const [friendName, setFriendName] = useState('Friend')
  const [progress, setProgress] = useState(null)

  const totalScore = Object.values(arcadeScores).reduce((a, b) => a + b, 0)
  const gamesPlayed = Object.keys(arcadeScores).length

  useEffect(() => {
    const computed = calcFinalTier(diagnosisTier, arcadeScores)
    setFinalTier(computed)
    const visit = recordVisit({
      totalScore,
      diagnosisTier,
      finalTier: computed,
    })
    setProgress(visitDelta(visit.previous, visit.current))
    trackEvent('rehab_completed', {
      diagnosis_tier: diagnosisTier,
      final_tier: computed,
      total_score: totalScore,
      games_played: gamesPlayed,
      tier_improvement: Math.max(0, diagnosisTier - computed),
    })
    play('win')
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const mobile = window.innerWidth < 640
    if (!reduceMotion) {
      confetti({
        particleCount: mobile ? 70 : 180,
        spread: 100,
        origin: { y: 0.35 },
        disableForReducedMotion: true,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const verdict = getVerdict(diagnosisTier, finalTier)
  const runState = { quizScore, reactionScore, diagnosisTier, arcadeScores, finalTier }

  const handleShare = async () => {
    const payload = buildRunPayload('r', runState, friendName)
    const url = shareAbsoluteUrl(payload)
    setCardUrl(url)
    const text = resultShareText({
      diagnosisTier,
      finalTier,
      totalScore,
      gamesPlayed,
      url,
    })
    try {
      const blob = await renderResultCardBlob({
        diagnosisTier,
        finalTier,
        totalScore,
        gamesPlayed,
        name: friendName !== 'Friend' ? friendName : '',
      })
      const objectUrl = URL.createObjectURL(blob)
      setCardBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return objectUrl
      })
      const method = await shareResult({
        title: 'Brain Rot Test Results',
        text,
        url,
        blob,
      })
      trackEvent('result_shared', { method })
      if (method === 'clipboard') {
        setCopied(true)
        setToast(t(language, 'copiedClipboard'))
        setTimeout(() => setCopied(false), 2400)
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setCopied(true)
        setToast(t(language, 'copiedClipboard'))
        setTimeout(() => setCopied(false), 2400)
        trackEvent('result_shared', { method: 'clipboard_fallback' })
      } catch {
        setCardUrl(url)
      }
    }
  }

  const handleChallenge = async () => {
    const payload = buildRunPayload('c', runState, friendName)
    const url = shareAbsoluteUrl(payload)
    setCardUrl(url)
    const text = t(language, 'challengeShareText').replace('{name}', friendName).replace('{url}', url)
    try {
      if (navigator.share) {
        await navigator.share({ title: t(language, 'challengeTitle'), text, url })
        trackEvent('challenge_created', { method: 'native_share' })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setToast(t(language, 'challengeCopied'))
        setTimeout(() => setCopied(false), 2400)
        trackEvent('challenge_created', { method: 'clipboard' })
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setToast(t(language, 'challengeCopied'))
        setTimeout(() => setCopied(false), 2400)
      } catch {
        /* ignore */
      }
    }
  }

  const npc = challenge
    ? whoMoreNpc(challenge, {
        d: diagnosisTier,
        f: finalTier,
        q: quizScore,
        r: reactionScore,
        s: totalScore,
      })
    : null

  return (
    <motion.div
      className="screen results-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard glow className="results-card" style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
        <div className="results-toprow">
          <BrandMark size={40} />
          <button
            type="button"
            className="ghost-back"
            onClick={() => setScreen('arcade')}
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

        {progress && (
          <motion.p
            className={`visit-delta visit-delta--${progress}`}
            {...fadeUp(0.22)}
          >
            {progress === 'better' && t(language, 'visitBetter')}
            {progress === 'worse' && t(language, 'visitWorse')}
            {progress === 'same' && t(language, 'visitSame')}
          </motion.p>
        )}

        {npc && (
          <motion.div className="npc-compare" {...fadeUp(0.24)}>
            <p className="npc-compare-kicker">{t(language, 'npcCompareTitle')}</p>
            <div className="npc-compare-row">
              <div>
                <strong>{challenge.n}</strong>
                <span>{TIERS[challenge.d].emoji} {TIERS[challenge.d].label}</span>
                <span className="text-mono">{challenge.s} pts</span>
              </div>
              <div>
                <strong>{t(language, 'npcYou')}</strong>
                <span>{TIERS[diagnosisTier].emoji} {TIERS[diagnosisTier].label}</span>
                <span className="text-mono">{totalScore} pts</span>
              </div>
            </div>
            <p className="npc-compare-verdict">
              {npc === 'tie'
                ? t(language, 'npcTie')
                : npc === 'a'
                  ? t(language, 'npcTheyWin').replace('{name}', challenge.n)
                  : t(language, 'npcYouWin')}
            </p>
          </motion.div>
        )}

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

        {cardBlobUrl && (
          <motion.img
            className="share-card-preview"
            src={cardBlobUrl}
            alt="Shareable result card"
            {...fadeUp(0.4)}
          />
        )}

        <label className="challenge-name-field">
          <span className="sr-only">{t(language, 'challengeNameLabel')}</span>
          <input
            value={friendName}
            maxLength={18}
            onChange={(e) => setFriendName(e.target.value)}
            placeholder={t(language, 'challengeNameLabel')}
          />
        </label>

        <motion.div
          {...fadeUp(0.44)}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <NeonButton onClick={handleShare} variant="purple">
            {copied ? t(language, 'copied') : t(language, 'share')}
          </NeonButton>
          <NeonButton onClick={handleChallenge} variant="green">
            {t(language, 'challengeCta')}
          </NeonButton>
          <NeonButton onClick={reset} variant="outline">
            {t(language, 'playAgain')}
          </NeonButton>
        </motion.div>

        {cardUrl && (
          <p className="share-link-preview text-sm text-muted">
            {cardUrl}
          </p>
        )}

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

      <AnimatePresence>
        {(copied || toast) && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast || t(language, 'copiedClipboard')}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
