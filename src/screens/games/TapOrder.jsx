import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'

const TOTAL = 8
const Q_TIME = 7

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function makeRound() {
  const numbers = shuffle([1, 2, 3, 4, 5, 6])
  return numbers.map((n, i) => ({ id: i, value: n }))
}

export default function TapOrder() {
  const [phase, setPhase] = useState('intro')
  const [qIndex, setQIndex] = useState(0)
  const [cells, setCells] = useState(makeRound)
  const [nextExpected, setNextExpected] = useState(1)
  const [timeLeft, setTimeLeft] = useState(Q_TIME)
  const [score, setScore] = useState(0)
  const [locked, setLocked] = useState(false)
  const [selected, setSelected] = useState([])
  const { play } = useSound()
  const language = useGameStore((s) => s.language)
  const setArcadeScore = useGameStore((s) => s.setArcadeScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const navTimerRef = useRef(null)

  const finishRound = useCallback((success) => {
    if (locked) return
    setLocked(true)
    if (success) play('ding'); else play('buzz')

    const gained = success ? 12 + timeLeft * 2 : 0
    const newScore = score + gained
    setScore(newScore)

    setTimeout(() => {
      if (qIndex + 1 >= TOTAL) {
        setPhase('done')
        setArcadeScore('order', newScore)
        navTimerRef.current = setTimeout(() => setScreen('arcade'), 2400)
      } else {
        setQIndex((i) => i + 1)
        setCells(makeRound())
        setNextExpected(1)
        setTimeLeft(Q_TIME)
        setSelected([])
        setLocked(false)
      }
    }, 500)
  }, [locked, timeLeft, score, qIndex, play, setArcadeScore, setScreen])

  useEffect(() => {
    if (phase !== 'playing' || locked) return
    if (timeLeft <= 0) {
      finishRound(false)
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, locked, timeLeft, finishRound])

  const handleTap = (cell) => {
    if (phase !== 'playing' || locked) return
    if (selected.includes(cell.id)) return

    play('click')
    if (cell.value !== nextExpected) {
      finishRound(false)
      return
    }

    const newSelected = [...selected, cell.id]
    setSelected(newSelected)

    if (nextExpected === 6) {
      finishRound(true)
    } else {
      setNextExpected((n) => n + 1)
    }
  }

  const handlePlayAgain = () => {
    clearTimeout(navTimerRef.current)
    setPhase('intro')
    setQIndex(0)
    setCells(makeRound())
    setNextExpected(1)
    setTimeLeft(Q_TIME)
    setScore(0)
    setLocked(false)
    setSelected([])
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
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔢</div>
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>{t(language, 'orderIntroTitle')}</h2>
            <p className="text-muted" style={{ marginBottom: 24, lineHeight: 1.6 }}>
              {t(language, 'orderIntroText').replace('{count}', TOTAL)}
            </p>
            <NeonButton onClick={() => setPhase('playing')} variant="purple" style={{ width: '100%' }}>
              {t(language, 'startButton')}
            </NeonButton>
          </div>
        ) : phase === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏁</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Great Sequence!</h2>
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

            <p className="text-mono text-xs" style={{ color: 'var(--text-muted)', marginBottom: 10 }}>
              Tap: {nextExpected} next
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}
              >
                {cells.map((cell) => {
                  const done = selected.includes(cell.id)
                  return (
                    <button
                      key={cell.id}
                      onPointerDown={() => handleTap(cell)}
                      disabled={locked || done}
                      style={{
                        height: 84,
                        borderRadius: 14,
                        border: done ? '1px solid rgba(57,255,20,0.4)' : '1px solid var(--border)',
                        background: done ? 'rgba(57,255,20,0.08)' : 'rgba(255,255,255,0.03)',
                        color: done ? 'var(--green)' : '#fff',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {cell.value}
                    </button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </GlassCard>
    </motion.div>
  )
}
