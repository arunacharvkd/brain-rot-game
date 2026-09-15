import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import GameDone from '../../components/GameDone'
import ArcadeBack from '../../components/ArcadeBack'
import { useSound } from '../../hooks/useSound'
import { t } from '../../i18n/translations'
import { arcadeScore, runSummaryCopy } from '../../lib/scoring'
import { usePlayClock } from '../../hooks/usePlayClock'

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
  const clock = usePlayClock()
  const correctRef = useRef(0)
  const [run, setRun] = useState(null)

  const finishRound = useCallback((success) => {
    if (locked) return
    setLocked(true)
    if (success) play('ding'); else play('buzz')

    const nextCorrect = correctRef.current + (success ? 1 : 0)
    correctRef.current = nextCorrect
    setScore(arcadeScore({ id: 'order', accuracy: nextCorrect, elapsedMs: clock.elapsed() }).total)

    setTimeout(() => {
      if (qIndex + 1 >= TOTAL) {
        const elapsed = clock.elapsed()
        const result = arcadeScore({ id: 'order', accuracy: nextCorrect, elapsedMs: elapsed })
        setRun(result)
        setScore(result.total)
        setPhase('done')
        setArcadeScore('order', result.total, elapsed)
      } else {
        setQIndex((i) => i + 1)
        setCells(makeRound())
        setNextExpected(1)
        setTimeLeft(Q_TIME)
        setSelected([])
        setLocked(false)
      }
    }, 500)
  }, [locked, qIndex, play, setArcadeScore, clock])

  useEffect(() => {
    if (phase !== 'playing' || locked) return
    if (timeLeft <= 0) {
      finishRound(false)
      return
    }
    const tid = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(tid)
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
    correctRef.current = 0
    setRun(null)
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
            <div className="game-intro-top"><ArcadeBack /></div>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔢</div>
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>{t(language, 'orderIntroTitle')}</h2>
            <p className="text-muted" style={{ marginBottom: 24, lineHeight: 1.6 }}>
              {t(language, 'orderIntroText').replace('{count}', TOTAL)}
            </p>
            <NeonButton onClick={() => { clock.start(); setPhase('playing') }} variant="purple" style={{ width: '100%' }}>
              {t(language, 'startButton')}
            </NeonButton>
          </div>
        ) : phase === 'done' ? (
          <GameDone
            emoji="🏁"
            title="Great Sequence!"
            scoreLabel={run ? runSummaryCopy(t, language, run).scoreLabel : `${score} pts`}
            timeLabel={run ? runSummaryCopy(t, language, run).timeLabel : undefined}
            breakdown={run ? runSummaryCopy(t, language, run).breakdown : undefined}
            onContinue={() => useGameStore.getState().exitToHub()}
            onPlayAgain={handlePlayAgain}
          />
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
                onClick={() => useGameStore.getState().exitToHub()}
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
