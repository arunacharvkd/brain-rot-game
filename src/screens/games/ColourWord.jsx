import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'

const COLOURS = [
  { name: 'RED',    value: '#ef4444' },
  { name: 'BLUE',   value: '#3b82f6' },
  { name: 'GREEN',  value: '#22c55e' },
  { name: 'YELLOW', value: '#eab308' },
]
const TOTAL = 15
const Q_TIME = 3

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function makeRound() {
  const wordColour = COLOURS[Math.floor(Math.random() * COLOURS.length)]
  let inkColour
  do { inkColour = COLOURS[Math.floor(Math.random() * COLOURS.length)] }
  while (inkColour === wordColour)
  return { wordText: wordColour.name, inkColour }
}

export default function ColourWord() {
  const [phase, setPhase] = useState('intro')
  const [round, setRound] = useState(makeRound)
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(Q_TIME)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null) // null | colourName
  const [locked, setLocked] = useState(false)
  const { play } = useSound()
  const setArcadeScore = useGameStore((s) => s.setArcadeScore)
  const setScreen = useGameStore((s) => s.setScreen)

  const advance = useCallback((chosen) => {
    if (locked) return
    setLocked(true)
    const correct = chosen === round.inkColour.name
    const newScore = score + (correct ? 10 : 0)
    if (correct) play('ding'); else play('buzz')
    setFeedback(chosen)
    setScore(newScore)

    setTimeout(() => {
      if (qIndex + 1 >= TOTAL) {
        setPhase('done')
        setArcadeScore('colour', newScore)
        setTimeout(() => setScreen('arcade'), 2400)
      } else {
        setRound(makeRound())
        setQIndex((i) => i + 1)
        setTimeLeft(Q_TIME)
        setFeedback(null)
        setLocked(false)
      }
    }, 480)
  }, [locked, score, qIndex, round, play, setArcadeScore, setScreen])

  // Per-question timer
  useEffect(() => {
    if (phase !== 'playing' || locked) return
    if (timeLeft <= 0) { advance(null); return }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, phase, locked])

  const timerPct = (timeLeft / Q_TIME) * 100
  const chipOptions = shuffle([...COLOURS])

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
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎨</div>
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Colour vs Word</h2>
            <p className="text-muted" style={{ marginBottom: 16, lineHeight: 1.6 }}>
              A colour word is shown in a <em>different</em> ink colour.
              Click the <strong style={{ color: '#fff' }}>ink colour</strong> — not what the word says!
            </p>
            {/* Example */}
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>RED</span>
              <p className="text-xs text-muted" style={{ marginTop: 4 }}>→ Click BLUE (the ink)</p>
            </div>
            <NeonButton onClick={() => setPhase('playing')} variant="purple" style={{ width: '100%' }}>
              Start →
            </NeonButton>
          </div>
        ) : phase === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎨</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Colour Expert!</h2>
            <p className="text-mono" style={{ fontSize: '1.5rem', color: 'var(--green)', fontWeight: 700 }}>
              {score} / {TOTAL * 10} pts
            </p>
          </div>
        ) : (
          <>
            {/* HUD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  padding: '2px 9px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                ✕ Quit
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                style={{ textAlign: 'center' }}
              >
                {/* The Stroop word */}
                <div className="stroop-word" style={{ color: round.inkColour.value }}>
                  {round.wordText}
                </div>

                {/* Colour chips */}
                <div className="colour-options">
                  {chipOptions.map((c) => {
                    const isCorrect = c.name === round.inkColour.name
                    const isChosen = feedback === c.name
                    return (
                      <motion.button
                        key={c.name}
                        className={`colour-chip ${isChosen && isCorrect ? 'correct' : ''} ${isChosen && !isCorrect ? 'wrong' : ''}`}
                        style={{ background: c.value }}
                        onPointerDown={() => advance(c.name)}
                        disabled={locked}
                        whileTap={{ scale: 0.95 }}
                      >
                        {c.name}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </GlassCard>
    </motion.div>
  )
}
