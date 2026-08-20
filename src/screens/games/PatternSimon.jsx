import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'

const BUTTONS = [
  { color: '#ef4444', label: '🔴' },
  { color: '#3b82f6', label: '🔵' },
  { color: '#22c55e', label: '🟢' },
  { color: '#eab308', label: '🟡' },
]
const MAX_ROUNDS = 10
const SHOW_DELAY = 700 // ms per step while showing

export default function PatternSimon() {
  const [sequence, setSequence] = useState([])
  const [playerSeq, setPlayerSeq] = useState([])
  const [phase, setPhase] = useState('intro') // intro | showing | inputting | win_round | wrong | done
  const [activeBtn, setActiveBtn] = useState(-1)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const timersRef = useRef([])
  const { play } = useSound()
  const setArcadeScore = useGameStore((s) => s.setArcadeScore)
  const setScreen = useGameStore((s) => s.setScreen)

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const showSequence = useCallback((seq) => {
    setPhase('showing')
    setActiveBtn(-1)
    clearTimers()
    seq.forEach((btnIdx, i) => {
      const t1 = setTimeout(() => { play('tick'); setActiveBtn(btnIdx) }, i * SHOW_DELAY)
      const t2 = setTimeout(() => setActiveBtn(-1), i * SHOW_DELAY + 500)
      timersRef.current.push(t1, t2)
    })
    const t3 = setTimeout(() => {
      setPhase('inputting')
      setPlayerSeq([])
    }, seq.length * SHOW_DELAY + 600)
    timersRef.current.push(t3)
  }, [play])

  const startRound = useCallback((currentSeq) => {
    const next = [...currentSeq, Math.floor(Math.random() * 4)]
    setSequence(next)
    setRound(next.length - 2) // round 1 = length 3 → round display = 1
    setTimeout(() => showSequence(next), 600)
  }, [showSequence])

  const handleStart = () => {
    const first = [
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
    ]
    setSequence(first)
    setRound(1)
    setTimeout(() => showSequence(first), 400)
  }

  const handleButtonClick = (idx) => {
    if (phase !== 'inputting') return
    play('click')
    const newPlayer = [...playerSeq, idx]
    setPlayerSeq(newPlayer)
    const pos = newPlayer.length - 1

    if (newPlayer[pos] !== sequence[pos]) {
      // Wrong
      play('buzz')
      setPhase('wrong')
      setArcadeScore('simon', score)
      setTimeout(() => setScreen('arcade'), 2400)
      return
    }

    if (newPlayer.length === sequence.length) {
      // Correct round complete
      play('ding')
      const newScore = score + sequence.length * 10
      setScore(newScore)
      if (sequence.length >= MAX_ROUNDS + 2) {
        // Game complete
        setPhase('done')
        setArcadeScore('simon', newScore)
        setTimeout(() => setScreen('arcade'), 2400)
      } else {
        setPhase('win_round')
        setTimeout(() => startRound(sequence), 900)
      }
    }
  }

  const displayRound = round

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard style={{ maxWidth: 460, width: '100%' }}>
        {phase === 'intro' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🟥</div>
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Pattern Simon</h2>
            <p className="text-muted" style={{ marginBottom: 28, lineHeight: 1.6 }}>
              Watch the colour sequence light up, then repeat it in order.
              The sequence grows longer each round. How far can you go?
            </p>
            <NeonButton onClick={handleStart} variant="purple" style={{ width: '100%' }}>
              Start →
            </NeonButton>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              <span className="text-mono text-sm text-muted">Round {displayRound}</span>
              <span className="text-mono text-sm" style={{ color: 'var(--green)' }}>
                {score} pts
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

            <div className="simon-grid">
              {BUTTONS.map((btn, i) => (
                <motion.button
                  key={i}
                  className={`simon-btn ${activeBtn === i ? 'active' : ''}`}
                  style={{ background: btn.color }}
                  onPointerDown={() => handleButtonClick(i)}
                  disabled={phase !== 'inputting'}
                  whileTap={{ scale: phase === 'inputting' ? 0.93 : 1 }}
                >
                  {btn.label}
                </motion.button>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 18, minHeight: 24 }}>
              {phase === 'showing' && (
                <span className="text-muted text-sm">Watch the sequence...</span>
              )}
              {phase === 'inputting' && (
                <span style={{ color: 'var(--purple)', fontSize: '0.9rem', fontWeight: 600 }}>
                  Your turn — {sequence.length - playerSeq.length} left
                </span>
              )}
              {phase === 'win_round' && (
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ Correct! Next round...</span>
              )}
              {(phase === 'wrong' || phase === 'done') && (
                <AnimatePresence>
                  <motion.div
                    className="game-complete-overlay"
                    style={{ borderRadius: 'var(--r-xl)', inset: -40 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div style={{ fontSize: '2rem' }}>{phase === 'done' ? '🏆' : '💡'}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: phase === 'done' ? 'var(--green)' : 'var(--yellow)' }}>
                      {phase === 'done' ? 'Sequence Master!' : `Reached Round ${displayRound}`}
                    </div>
                    <div className="text-mono text-muted text-sm">Score: {score} pts</div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </>
        )}
      </GlassCard>
    </motion.div>
  )
}
