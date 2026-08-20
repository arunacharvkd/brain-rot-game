import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'

// 8 cycles: inhale 4s → exhale 4s, "tap" prompt fires at each phase transition
const TOTAL_PHASES = 8
const PHASE_DURATION = 4000 // ms
const TAP_WINDOW = 1000 // ms after prompt appears where tapping scores

export default function BreathFocus() {
  const [phase, setPhase] = useState('intro')
  const [cyclePhase, setCyclePhase] = useState('inhale') // inhale | exhale
  const [phaseIndex, setPhaseIndex] = useState(0) // 0 – TOTAL_PHASES-1
  const [showTap, setShowTap] = useState(false)
  const [tapped, setTapped] = useState(false)
  const [score, setScore] = useState(0)
  const [progress, setProgress] = useState(0) // 0-1 within current phase (for circle scale)
  const tapStartRef = useRef(null)
  const rafRef = useRef(null)
  const phaseStartRef = useRef(null)
  const { play } = useSound()
  const setArcadeScore = useGameStore((s) => s.setArcadeScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const navTimerRef = useRef(null)

  // Animate progress 0→1 within each phase using rAF
  useEffect(() => {
    if (phase !== 'playing') return
    phaseStartRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - phaseStartRef.current
      setProgress(Math.min(1, elapsed / PHASE_DURATION))
      if (elapsed < PHASE_DURATION) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phaseIndex, phase])

  // Phase timer: show tap prompt near end, then advance
  useEffect(() => {
    if (phase !== 'playing') return

    const tapTimer = setTimeout(() => {
      setShowTap(true)
      setTapped(false)
      tapStartRef.current = Date.now()
    }, PHASE_DURATION - TAP_WINDOW)

    const nextTimer = setTimeout(() => {
      setShowTap(false)
      if (phaseIndex + 1 >= TOTAL_PHASES) {
        setPhase('done')
        setArcadeScore('breath', score)
        navTimerRef.current = setTimeout(() => setScreen('arcade'), 2600)
      } else {
        setPhaseIndex((i) => i + 1)
        setCyclePhase((p) => (p === 'inhale' ? 'exhale' : 'inhale'))
        setProgress(0)
      }
    }, PHASE_DURATION)

    return () => {
      clearTimeout(tapTimer)
      clearTimeout(nextTimer)
    }
  }, [phaseIndex, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = useCallback(() => {
    if (phase !== 'playing') return
    if (!showTap || tapped) return
    const rt = Date.now() - tapStartRef.current
    const pts = Math.max(0, Math.round((TAP_WINDOW - rt) / 100)) // 0-10 pts
    play('click')
    setScore((s) => s + pts)
    setTapped(true)
  }, [phase, showTap, tapped, play])

  // inhale: scale 0.65 → 1.55 | exhale: scale 1.55 → 0.65
  const scale = cyclePhase === 'inhale'
    ? 0.65 + progress * 0.9
    : 1.55 - progress * 0.9

  const completedPhases = phaseIndex
  const completedCycles = Math.floor(completedPhases / 2)

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard style={{ maxWidth: 440, width: '100%' }}>
        {phase === 'intro' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💨</div>
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Breath Focus</h2>
            <p className="text-muted" style={{ marginBottom: 28, lineHeight: 1.6 }}>
              Follow the breathing circle. When <strong style={{ color: 'var(--purple)' }}>TAP</strong> appears,
              tap it in sync. The closer you are to the moment, the more points you earn.
              4 breath cycles · ~32 seconds.
            </p>
            <NeonButton onClick={() => setPhase('playing')} variant="purple" style={{ width: '100%' }}>
              Begin →
            </NeonButton>
          </div>
        ) : phase === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌿</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Excellent!</h2>
            <p className="text-mono" style={{ fontSize: '1.5rem', color: 'var(--green)', fontWeight: 700 }}>
              {score} pts
            </p>
            <p className="text-muted text-sm" style={{ marginTop: 8 }}>
              You completed {completedCycles} breath cycles 🧘
            </p>
            <button
              onClick={() => {
                clearTimeout(navTimerRef.current)
                cancelAnimationFrame(rafRef.current)
                setCyclePhase('inhale')
                setPhaseIndex(0)
                setShowTap(false)
                setTapped(false)
                setScore(0)
                setProgress(0)
                setPhase('intro')
              }}
              style={{
                marginTop: 16, background: 'none',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 8, color: '#fff', fontSize: '0.9rem',
                padding: '6px 18px', cursor: 'pointer',
              }}
            >
              ↩ Play Again
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {/* Cycle counter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
              <span className="text-mono text-muted text-xs">
                Cycle {completedCycles + 1} / {TOTAL_PHASES / 2}  ·  {score} pts
              </span>
              <button
                onClick={() => setScreen('arcade')}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  padding: '2px 9px',
                  cursor: 'pointer',
                }}
              >
                ✕ Quit
              </button>
            </div>

            {/* Breathing arena */}
            <div className="breath-arena" onPointerDown={handleTap}>
              <motion.div
                className="breath-ring"
                animate={{ scale, boxShadow: `0 0 ${40 + scale * 20}px rgba(168,85,247,${0.15 + scale * 0.1})` }}
                transition={{ duration: 0 }} // driven by rAF, not Framer Motion spring
              >
                <span style={{ fontSize: '2.5rem' }}>🧠</span>
              </motion.div>

              <AnimatePresence mode="wait">
                {showTap ? (
                  <motion.div
                    key="tap"
                    className="breath-tap-prompt"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {tapped ? '✓ Synced!' : 'TAP →'}
                  </motion.div>
                ) : (
                  <motion.div
                    key={cyclePhase}
                    className="breath-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {cyclePhase === 'inhale' ? 'Inhale...' : 'Exhale...'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Phase progress bar */}
            <div className="hud-timer-track" style={{ marginTop: 8 }}>
              <div
                className="hud-timer-fill"
                style={{ width: `${progress * 100}%`, backgroundColor: 'var(--purple)' }}
              />
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
