import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import { useSound } from '../hooks/useSound'
import { trackEvent } from '../lib/analytics'
import { t } from '../i18n/translations'
import { formatDuration, msToReactionRot } from '../lib/scoring'
import { usePlayClock } from '../hooks/usePlayClock'

const TOTAL_ROUNDS = 5
const DISTRACTORS = ['📱', '🤡', '📺', '💀', '🎮']

export default function ReactionTest() {
  // phase: intro | countdown | waiting | target | result | complete
  const [phase, setPhase] = useState('intro')
  const [countdown, setCountdown] = useState(3)
  const [roundIndex, setRoundIndex] = useState(0)
  const [times, setTimes] = useState([])
  const [lastMs, setLastMs] = useState(null)
  const [brainPos, setBrainPos] = useState({ x: 50, y: 50 })
  const [distractors, setDistractors] = useState([])

  const startRef = useRef(null)
  const waitTimerRef = useRef(null)
  const { play } = useSound()
  const language = useGameStore((s) => s.language)
  const setReactionScore = useGameStore((s) => s.setReactionScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const clock = usePlayClock()
  const [runAvg, setRunAvg] = useState(null)
  const [runElapsed, setRunElapsed] = useState(null)
  const [runRot, setRunRot] = useState(null)

  // Countdown 3-2-1 then switch to waiting
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      setPhase('waiting')
      return
    }
    const t = setTimeout(() => {
      play('tick')
      setCountdown((c) => c - 1)
    }, 900)
    return () => clearTimeout(t)
  }, [phase, countdown, play])

  // Waiting phase: flash distractors, then show brain after random delay
  useEffect(() => {
    if (phase !== 'waiting') return

    const flashDistractor = () => {
      const d = {
        id: Date.now(),
        emoji: DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)],
        x: 12 + Math.random() * 76,
        y: 10 + Math.random() * 76,
      }
      setDistractors([d])
      setTimeout(() => setDistractors([]), 380)
    }

    const t1 = setTimeout(flashDistractor, 250 + Math.random() * 350)
    const t2 = setTimeout(flashDistractor, 700 + Math.random() * 400)

    const delay = 1000 + Math.random() * 2200
    waitTimerRef.current = setTimeout(() => {
      // Keep the target fully inside the arena so overflow:hidden does not
      // clip the emoji or its tap target on narrow phone widths.
      setBrainPos({ x: 22 + Math.random() * 56, y: 22 + Math.random() * 56 })
      startRef.current = Date.now()
      setPhase('target')
      setDistractors([])
    }, delay)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(waitTimerRef.current)
    }
  }, [phase])

  const handleBrainClick = useCallback((e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    if (phase !== 'target') return
    const elapsed = Date.now() - startRef.current
    play('ding')
    setLastMs(elapsed)

    const newTimes = [...times, elapsed]
    setTimes(newTimes)
    setPhase('result')

    setTimeout(() => {
      if (roundIndex < TOTAL_ROUNDS - 1) {
        setRoundIndex((i) => i + 1)
        setCountdown(3)
        setPhase('countdown')
      } else {
        const avg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length
        const reactionScore = msToReactionRot(avg)
        const elapsed = clock.elapsed()
        setReactionScore(reactionScore, Math.round(avg), elapsed)
        setRunAvg(Math.round(avg))
        setRunElapsed(elapsed)
        setRunRot(reactionScore)
        trackEvent('reaction_test_completed', {
          rounds: TOTAL_ROUNDS,
          avg_reaction_ms: Math.round(avg),
          reaction_score: reactionScore,
          elapsed_ms: elapsed,
        })
        setPhase('complete')
        setTimeout(() => setScreen('diagnosis'), 1400)
      }
    }, 900)
  }, [phase, times, roundIndex, play, setReactionScore, setScreen, clock])

  return (
    <motion.div
      className="screen reaction-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard style={{ maxWidth: 560, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
          <button
            type="button"
            className="ghost-back"
            onClick={() => setScreen('quiz')}
          >
            ← {t(language, 'backToQuiz')}
          </button>
        </div>

        <div className="reaction-heading">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>
            {t(language, 'reactionTitle')}
          </h2>
          <p className="text-muted text-sm">
            {t(language, 'reactionSubtitle').replace('{count}', TOTAL_ROUNDS)}
          </p>
        </div>

        {/* Arena */}
        <div className="reaction-arena">
          <AnimatePresence>
            {phase === 'countdown' && (
              <motion.div
                key="cd"
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.25 }}
              >
                <span className="countdown-num">{countdown || 'GO!'}</span>
              </motion.div>
            )}

            {phase === 'waiting' && (
              <motion.div
                key="wait"
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', fontSize: '0.9rem',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {t(language, 'getReady')}
              </motion.div>
            )}

            {phase === 'target' && (
              <div
                className="brain-target-wrap"
                style={{ left: `${brainPos.x}%`, top: `${brainPos.y}%` }}
                onPointerDown={handleBrainClick}
              >
                <motion.button
                  key="brain"
                  type="button"
                  className="brain-target"
                  onPointerDown={handleBrainClick}
                  initial={{ scale: 0.72, opacity: 0.85 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                  aria-label="Click the brain"
                >
                  🧠
                </motion.button>
              </div>
            )}

            {phase === 'result' && lastMs && (
              <motion.div
                key="result"
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span style={{ fontSize: '2rem' }}>⚡</span>
                <span
                  className="text-mono"
                  style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--green)' }}
                >
                  {lastMs}ms
                </span>
              </motion.div>
            )}

            {phase === 'complete' && (
              <motion.div
                key="done"
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span style={{ fontSize: '2.5rem' }}>✅</span>
                <span className="text-mono" style={{ color: 'var(--green)', fontWeight: 700 }}>
                  {runRot != null ? `+${runRot}` : ''}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {runAvg != null
                    ? t(language, 'avgReaction').replace('{ms}', runAvg)
                    : t(language, 'calculatingResults')}
                  {runElapsed != null ? ` · ${formatDuration(runElapsed)}` : ''}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Distractor overlays */}
          {distractors.map((d) => (
            <span
              key={d.id}
              className="distractor-emoji"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
            >
              {d.emoji}
            </span>
          ))}
        </div>

        {/* CTA / times row */}
        <div className="reaction-cta">
          {phase === 'intro' && (
            <NeonButton onClick={() => {
              trackEvent('reaction_test_started', { rounds: TOTAL_ROUNDS })
              clock.start()
              setCountdown(3)
              setPhase('countdown')
            }} variant="purple">
              {t(language, 'startReactionTest')}
            </NeonButton>
          )}

          {times.length > 0 && phase !== 'intro' && (
            <div className="rt-times-row">
              {times.map((ms, i) => (
                <span key={i} className="rt-time-chip">
                  ⚡ {ms}ms
                </span>
              ))}
            </div>
          )}

          <p className="text-muted text-xs text-mono" style={{ marginTop: 12 }}>
            {(t(language, 'reactionRound') || t(language, 'roundLabel')).replace('{current}', Math.min(roundIndex + 1, TOTAL_ROUNDS)).replace('{total}', TOTAL_ROUNDS)}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}
