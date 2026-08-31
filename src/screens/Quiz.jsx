import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import { getQuestions } from '../data/questions'
import { useSound } from '../hooks/useSound'
import { trackEvent } from '../lib/analytics'
import { t } from '../i18n/translations'

export default function Quiz() {
  const [qIndex, setQIndex] = useState(0)
  const [runningTotal, setRunningTotal] = useState(0)
  const [selected, setSelected] = useState(null)
  const { play } = useSound()
  const setQuizScore = useGameStore((s) => s.setQuizScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const language = useGameStore((s) => s.language)
  const questions = getQuestions(language)

  const question = questions[qIndex]
  const progressPct = (qIndex / questions.length) * 100

  useEffect(() => {
    trackEvent('quiz_started', { question_count: questions.length, language })
  }, [])

  const handleSelect = (score, optionIndex) => {
    if (selected !== null) return
    play('select')
    setSelected(optionIndex)

    setTimeout(() => {
      const next = runningTotal + score
      if (qIndex < questions.length - 1) {
        setRunningTotal(next)
        setQIndex((i) => i + 1)
        setSelected(null)
      } else {
        setQuizScore(next)
        trackEvent('quiz_completed', {
          quiz_score: next,
          question_count: questions.length,
        })
        setScreen('reaction')
      }
    }, 360)
  }

  // keyboard: 1-4 selects the nth option
  useEffect(() => {
    const handler = (e) => {
      if (selected !== null) return
      const idx = parseInt(e.key, 10) - 1
      if (idx >= 0 && idx < question.options.length) handleSelect(question.options[idx].score, idx)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, selected])

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
            onClick={() => setScreen('landing')}
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
            ← {t(language, 'back')}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
            className="text-mono"
          >
            <span>{t(language, 'question')} {qIndex + 1} / {questions.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{t(language, 'quizTitle')}</span>
              <button
                onClick={() => setScreen('landing')}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  cursor: 'pointer',
                }}
              >
                ✕ {t(language, 'exit')}
              </button>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Question card with slide animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.26 }}
          >
            <p
              style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                marginBottom: 24,
                lineHeight: 1.5,
              }}
            >
              {question.text}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {question.options.map((opt, i) => (
                <motion.button
                  key={i}
                  className={`quiz-option ${selected === i && selected !== null ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.score, i)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={selected !== null}
                >
                  {opt.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}
