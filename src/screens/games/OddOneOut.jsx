import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'

const TOTAL = 12
const Q_TIME = 4
const THEMES = [
  ['🧠', '🫀'],
  ['📚', '📖'],
  ['🍎', '🍏'],
  ['💧', '🌊'],
  ['😴', '🥱'],
  ['⚡', '✨'],
  ['🎯', '🎪'],
  ['🎨', '🖌️'],
  ['🔤', '🔡'],
  ['🌟', '⭐'],
]

function makeRound(prevOddIndex = -1) {
  const [base, odd] = THEMES[Math.floor(Math.random() * THEMES.length)]
  const useLargeGrid = Math.random() > 0.45
  const cellCount = useLargeGrid ? 12 : 9
  const columns = useLargeGrid ? 4 : 3
  let oddIndex = Math.floor(Math.random() * cellCount)
  while (oddIndex === prevOddIndex) {
    oddIndex = Math.floor(Math.random() * cellCount)
  }

  const cells = Array.from({ length: cellCount }, (_, i) => ({
    id: i,
    emoji: i === oddIndex ? odd : base,
    odd: i === oddIndex,
  }))

  return { cells, columns, oddIndex }
}

export default function OddOneOut() {
  const [phase, setPhase] = useState('intro')
  const [qIndex, setQIndex] = useState(0)
  const [round, setRound] = useState(() => makeRound())
  const [timeLeft, setTimeLeft] = useState(Q_TIME)
  const [score, setScore] = useState(0)
  const [locked, setLocked] = useState(false)
  const [flashId, setFlashId] = useState(null)
  const { play } = useSound()
  const setArcadeScore = useGameStore((s) => s.setArcadeScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const navTimerRef = useRef(null)
  const lastOddIndexRef = useRef(-1)

  const advance = useCallback((correct) => {
    if (locked) return
    setLocked(true)
    if (correct) play('ding'); else play('buzz')

    const gained = correct ? 8 + timeLeft * 2 : 0
    const newScore = score + gained
    setScore(newScore)

    setTimeout(() => {
      if (qIndex + 1 >= TOTAL) {
        setPhase('done')
        setArcadeScore('odd', newScore)
        navTimerRef.current = setTimeout(() => setScreen('arcade'), 2400)
      } else {
        lastOddIndexRef.current = round.oddIndex
        setQIndex((i) => i + 1)
        setRound(makeRound(lastOddIndexRef.current))
        setTimeLeft(Q_TIME)
        setLocked(false)
        setFlashId(null)
      }
    }, 420)
  }, [locked, timeLeft, score, qIndex, play, setArcadeScore, setScreen, round.oddIndex])

  useEffect(() => {
    if (phase !== 'playing' || locked) return
    if (timeLeft <= 0) {
      advance(false)
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, locked, timeLeft, advance])

  const handleCell = (cell) => {
    if (phase !== 'playing' || locked) return
    play('click')
    setFlashId(cell.id)
    advance(cell.odd)
  }

  const handlePlayAgain = () => {
    clearTimeout(navTimerRef.current)
    setPhase('intro')
    setQIndex(0)
    lastOddIndexRef.current = -1
    setRound(makeRound())
    setTimeLeft(Q_TIME)
    setScore(0)
    setLocked(false)
    setFlashId(null)
  }

  const timerPct = (timeLeft / Q_TIME) * 100

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard style={{ maxWidth: 500, width: '100%' }}>
        {phase === 'intro' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🕵️</div>
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Odd One Out</h2>
            <p className="text-muted" style={{ marginBottom: 24, lineHeight: 1.6 }}>
              Find the different emoji as fast as you can.
              12 dynamic rounds, {Q_TIME} seconds each.
            </p>
            <NeonButton onClick={() => setPhase('playing')} variant="purple" style={{ width: '100%' }}>
              Start →
            </NeonButton>
          </div>
        ) : phase === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Sharp Eyes!</h2>
            <p className="text-mono" style={{ fontSize: '1.5rem', color: 'var(--green)', fontWeight: 700 }}>
              {score} pts
            </p>
            <button
              onClick={handlePlayAgain}
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
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span className="text-mono text-xs text-muted">{qIndex + 1}/{TOTAL}</span>
              <div className="hud-timer-track" style={{ flex: 1 }}>
                <div
                  className="hud-timer-fill"
                  style={{
                    width: `${timerPct}%`,
                    backgroundColor: timerPct > 60 ? 'var(--green)' : timerPct > 30 ? 'var(--yellow)' : 'var(--red)',
                    transition: 'width 1s linear',
                  }}
                />
              </div>
              <span className="text-mono text-xs" style={{ color: 'var(--green)' }}>{score} pts</span>
              <button
                onClick={() => setScreen('arcade')}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6,
                  color: 'var(--text-muted)', fontSize: '0.72rem', padding: '2px 9px', cursor: 'pointer',
                }}
              >
                ✕ Quit
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${round.columns}, 1fr)`,
                  gap: 10,
                }}
              >
                {round.cells.map((cell) => (
                  <button
                    key={cell.id}
                    onPointerDown={() => handleCell(cell)}
                    disabled={locked}
                    style={{
                      height: 88,
                      borderRadius: 14,
                      border: flashId === cell.id ? '1px solid rgba(57,255,20,0.45)' : '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.03)',
                      fontSize: '2rem',
                      cursor: 'pointer',
                    }}
                  >
                    {cell.emoji}
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </GlassCard>
    </motion.div>
  )
}
