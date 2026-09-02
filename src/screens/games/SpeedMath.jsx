import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'
import { t } from '../../i18n/translations'

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
  const language = useGameStore((s) => s.language)
  const setArcadeScore = useGameStore((s) => s.setArcadeScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const navTimerRef = useRef(null)

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
        navTimerRef.current = setTimeout(() => setScreen('arcade'), 2400)
      } else {
        setQIndex((i) => i + 1)
        setQuestion(makeQuestion())
        setTimeLeft(Q_TIME)
        setFeedback(null)
        setLocked(false)
      }
    }, 500)
  }, [locked, score, qIndex, play, setArcadeScore, setScreen])

  const handlePlayAgain = () => {
    clearTimeout(navTimerRef.current)
    setPhase('intro')
    setQIndex(0)
    setQuestion(makeQuestion())
    setTimeLeft(Q_TIME)
    setScore(0)
    setFeedback(null)
    setLocked(false)
  }

  // keyboard: 1-4 selects the nth answer option
  useEffect(() => {
    if (phase !== 'playing') return
    const handler = (e) => {
      const idx = parseInt(e.key, 10) - 1
      if (idx >= 0 && idx < question.options.length) advance(question.options[idx] === question.answer)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, question])

  // Per-question timer
  useEffect(() => {
    if (phase !== 'playing' || locked) return
    if (timeLeft <= 0) { advance(false); return }
    const tid = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(tid)
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
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>{t(language, 'speedIntroTitle')}</h2>
            <p className="text-muted" style={{ marginBottom: 28, lineHeight: 1.6 }}>
              {t(language, 'speedIntroText').replace('{count}', TOTAL).replace('{seconds}', Q_TIME)}
            </p>
            <NeonButton
              onClick={() => { setPhase('playing'); setTimeLeft(Q_TIME) }}
              variant="purple"
              style={{ width: '100%' }}
            >
              {t(language, 'startButton')}
            </NeonButton>
          </div>
        ) : phase === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🧮</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Done!</h2>
            <p className="text-mono" style={{ fontSize: '1.5rem', color: 'var(--green)', fontWeight: 700 }}>
              {score} / {TOTAL * 10} pts
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
