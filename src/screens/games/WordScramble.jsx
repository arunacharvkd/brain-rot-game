import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'

const WORD_LIST = [
  'FOCUS', 'BRAIN', 'LEARN', 'SLEEP', 'WATER', 'THINK', 'RELAX', 'CLEAR', 'QUIET', 'PEACE',
  'BOOKS', 'SMART', 'FRESH', 'AWARE', 'STUDY', 'MIND', 'CALM', 'POWER', 'LOGIC', 'NOTES',
  'MUSIC', 'BREAK', 'CLARITY', 'ENERGY', 'VISION', 'MEMORY', 'ATTENTION', 'BALANCE', 'DISCIPLINE', 'HABIT',
  'GROWTH', 'SUCCESS', 'PRACTICE', 'CONSISTENCY', 'CREATIVE', 'CURIOUS', 'STRATEGY', 'PROGRESS', 'INSIGHT', 'WELLNESS',
]
const TOTAL = 10
const Q_TIME = 5

function randInt(max) {
  if (window.crypto?.getRandomValues) {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0] % max
  }
  return Math.floor(Math.random() * max)
}

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function scramble(word) {
  if (word.length < 2) return word
  let result = word
  let tries = 0
  while (result === word && tries < 8) {
    result = shuffle(word.split('')).join('')
    tries += 1
  }
  if (result !== word) return result

  const chars = word.split('')
  const swapAt = randInt(chars.length - 1)
  ;[chars[swapAt], chars[swapAt + 1]] = [chars[swapAt + 1], chars[swapAt]]
  return chars.join('')
}

function makeRound(wordList, usedWords) {
  const available = wordList.filter((w) => !usedWords.has(w))
  const pool = available.length > 0 ? available : wordList
  const word = pool[randInt(pool.length)]
  const distractors = shuffle(wordList.filter((w) => w !== word)).slice(0, 3)
  return { word, scrambled: scramble(word), options: shuffle([word, ...distractors]) }
}

export default function WordScramble() {
  const [phase, setPhase] = useState('intro')
  const usedWordsRef = useRef(new Set())
  const [round, setRound] = useState(() => makeRound(WORD_LIST, usedWordsRef.current))
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(Q_TIME)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
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
        setArcadeScore('word', newScore)
        navTimerRef.current = setTimeout(() => setScreen('arcade'), 2400)
      } else {
        usedWordsRef.current.add(round.word)
        setRound(makeRound(WORD_LIST, usedWordsRef.current))
        setQIndex((i) => i + 1)
        setTimeLeft(Q_TIME)
        setFeedback(null)
        setLocked(false)
      }
    }, 550)
  }, [locked, score, qIndex, round, play, setArcadeScore, setScreen])

  const handlePlayAgain = () => {
    clearTimeout(navTimerRef.current)
    usedWordsRef.current.clear()
    setRound(makeRound(WORD_LIST, usedWordsRef.current))
    setQIndex(0)
    setTimeLeft(Q_TIME)
    setScore(0)
    setFeedback(null)
    setLocked(false)
    setPhase('intro')
  }

  // keyboard: 1-4 selects the nth word option
  useEffect(() => {
    if (phase !== 'playing') return
    const handler = (e) => {
      const idx = parseInt(e.key, 10) - 1
      if (idx >= 0 && idx < round.options.length) advance(round.options[idx] === round.word)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round])

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
      <GlassCard style={{ maxWidth: 460, width: '100%' }}>
        {phase === 'intro' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔤</div>
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>{t(language, 'wordIntroTitle')}</h2>
            <p className="text-muted" style={{ marginBottom: 28, lineHeight: 1.6 }}>
              {t(language, 'wordIntroText').replace('{count}', TOTAL).replace('{seconds}', Q_TIME)}
            </p>
            <NeonButton onClick={() => setPhase('playing')} variant="purple" style={{ width: '100%' }}>
              {t(language, 'startButton')}
            </NeonButton>
          </div>
        ) : phase === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📖</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Word Master!</h2>
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
            {/* HUD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
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

            {/* Scrambled word + options */}
            <AnimatePresence mode="wait">
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.22 }}
              >
                <div className="scramble-word">{round.scrambled}</div>
                <div className="word-options">
                  {round.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      className={`quiz-option ${feedback && opt === round.word ? 'selected' : ''}`}
                      style={{ textAlign: 'center', fontWeight: 700, letterSpacing: '0.1em' }}
                      onPointerDown={() => advance(opt === round.word)}
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
