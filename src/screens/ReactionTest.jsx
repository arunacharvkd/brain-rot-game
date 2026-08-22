import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import { useSound } from '../hooks/useSound'

const TOTAL_ROUNDS = 5
const DISTRACTORS = ['📱', '🤡', '📺', '💀', '🎮']

function msToScore(avg) {
  if (avg < 300) return 0
  if (avg < 500) return 3
  if (avg < 700) return 6
  return 9
}

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
  const setReactionScore = useGameStore((s) => s.setReactionScore)
  const setScreen = useGameStore((s) => s.setScreen)

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
      setBrainPos({ x: 14 + Math.random() * 72, y: 12 + Math.random() * 72 })
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

  const handleBrainClick = useCallback(() => {
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
        setReactionScore(msToScore(avg))
        setPhase('complete')
        setTimeout(() => setScreen('diagnosis'), 1600)
      }
    }, 900)
  }, [phase, times, roundIndex, play, setReactionScore, setScreen])

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard style={{ maxWidth: 560, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
          <button
            onClick={() => setScreen('quiz')}
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
            ← Back to Quiz
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>
            Part 2: Prove You're Not an NPC
          </h2>
          <p className="text-muted text-sm">
            Click 🧠 the moment it appears — {TOTAL_ROUNDS} rounds
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
                Get ready...
              </motion.div>
            )}

            {phase === 'target' && (
              <motion.button
                key="brain"
                className="brain-target"
                style={{ left: `${brainPos.x}%`, top: `${brainPos.y}%` }}
                onClick={handleBrainClick}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                aria-label="Click the brain"
              >
                🧠
              </motion.button>
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
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Calculating results...
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
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {phase === 'intro' && (
            <NeonButton onClick={() => { setCountdown(3); setPhase('countdown') }} variant="purple">
              Start Reaction Test →
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
            Round {Math.min(roundIndex + 1, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}
