import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'

const TOTAL = 20
const Q_TIME = 3 // seconds per question

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function makeQuestion() {
  const ops = ['+', '-', '×']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a, b, answer
  if (op === '+') { a = 3 + Math.floor(Math.random() * 20); b = 3 + Math.floor(Math.random() * 20); answer = a + b }
  if (op === '-') { a = 10 + Math.floor(Math.random() * 20); b = 1 + Math.floor(Math.random() * a); answer = a - b }
  if (op === '×') { a = 2 + Math.floor(Math.random() * 9);  b = 2 + Math.floor(Math.random() * 9);  answer = a * b }

  const wrong = new Set()
  while (wrong.size < 3) {
    const w = answer + (Math.floor(Math.random() * 10) - 5)
    if (w !== answer && w > 0) wrong.add(w)
  }
  return { text: `${a} ${op} ${b}`, answer, options: shuffle([answer, ...wrong]) }
}

export default function SpeedMath() {
  const [phase, setPhase] = useState('intro')
  const [qIndex, setQIndex] = useState(0)
  const [question, setQuestion] = useState(makeQuestion)
  const [timeLeft, setTimeLeft] = useState(Q_TIME)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong'
  const [locked, setLocked] = useState(false)
  const { play } = useSound()
  const setArcadeScore = useGameStore((s) => s.setArcadeScore)
  const setScreen = useGameStore((s) => s.setScreen)

  const advance = useCallback((correct) => {
    if (locked) return
    setLocked(true)
    const newScore = score + (correct ? 10 : 0)
    if (correct) play('ding'); else play('buzz')
    setFeedback(correct ? 'correct' : 'wrong')
    setScore(newScore)

    setTimeout(() => {
      if (qIndex + 1 >= TOTAL) {
        setPhase('done')
        setArcadeScore('math', newScore)
        setTimeout(() => setScreen('arcade'), 2400)
      } else {
        setQIndex((i) => i + 1)
        setQuestion(makeQuestion())
        setTimeLeft(Q_TIME)
        setFeedback(null)
        setLocked(false)
      }
    }, 500)
  }, [locked, score, qIndex, play, setArcadeScore, setScreen])

  // Per-question timer
  useEffect(() => {
    if (phase !== 'playing' || locked) return
    if (timeLeft <= 0) { advance(false); return }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, phase, locked])

  const timerPct = (timeLeft / Q_TIME) * 100

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard style={{ maxWidth: 480, width: '100%' }}>
        {phase === 'intro' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚡</div>
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Speed Math</h2>
            <p className="text-muted" style={{ marginBottom: 28, lineHeight: 1.6 }}>
              20 quick arithmetic questions — {Q_TIME} seconds each.
              Tap the correct answer before time runs out!
            </p>
            <NeonButton
              onClick={() => { setPhase('playing'); setTimeLeft(Q_TIME) }}
              variant="purple"
              style={{ width: '100%' }}
            >
              Start →
            </NeonButton>
          </div>
        ) : phase === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🧮</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Done!</h2>
            <p className="text-mono" style={{ fontSize: '1.5rem', color: 'var(--green)', fontWeight: 700 }}>
              {score} / {TOTAL * 10} pts
            </p>
          </div>
        ) : (
          <>
            {/* Progress HUD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span className="text-mono text-xs text-muted">{qIndex + 1}/{TOTAL}</span>
              <div className="hud-timer-track" style={{ flex: 1 }}>
                <motion.div
                  className="hud-timer-fill"
                  animate={{ width: `${timerPct}%` }}
                  transition={{ duration: 0.9, ease: 'linear' }}
                  style={{
                    backgroundColor: timerPct > 60 ? 'var(--green)' : timerPct > 30 ? 'var(--yellow)' : 'var(--red)',
                  }}
                />
              </div>
              <span className="text-mono text-xs" style={{ color: 'var(--green)' }}>{score} pts</span>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <div className="math-question">{question.text} = ?</div>
                <div className="math-options">
                  {question.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      className={`math-option ${feedback && opt === question.answer ? 'correct' : ''} ${feedback === 'wrong' && opt !== question.answer ? '' : ''}`}
                      onPointerDown={() => advance(opt === question.answer)}
                      disabled={locked}
                      whileTap={{ scale: 0.96 }}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </GlassCard>
    </motion.div>
  )
}
