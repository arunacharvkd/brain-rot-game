import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'

const WORD_LIST = [
  'FOCUS', 'BRAIN', 'LEARN', 'SLEEP', 'WATER',
  'THINK', 'RELAX', 'CLEAR', 'QUIET', 'PEACE',
  'BOOKS', 'SMART', 'FRESH', 'AWARE', 'STUDY',
]
const TOTAL = 10
const Q_TIME = 5

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function scramble(word) {
  let result
  do {
    result = word.split('').sort(() => Math.random() - 0.5).join('')
  } while (result === word)
  return result
}

function makeRound(wordList, usedWords) {
  const available = wordList.filter((w) => !usedWords.has(w))
  const word = available[Math.floor(Math.random() * available.length)]
  const distractors = shuffle(wordList.filter((w) => w !== word)).slice(0, 3)
  return { word, scrambled: scramble(word), options: shuffle([word, ...distractors]) }
}

export default function WordScramble() {
  const [phase, setPhase] = useState('intro')
  const [usedWords] = useState(() => new Set())
  const [round, setRound] = useState(makeRound.bind(null, WORD_LIST, new Set()))
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(Q_TIME)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
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
        setArcadeScore('word', newScore)
        setTimeout(() => setScreen('arcade'), 2400)
      } else {
        usedWords.add(round.word)
        setRound(makeRound(WORD_LIST, usedWords))
        setQIndex((i) => i + 1)
        setTimeLeft(Q_TIME)
        setFeedback(null)
        setLocked(false)
      }
    }, 550)
  }, [locked, score, qIndex, round, usedWords, play, setArcadeScore, setScreen])

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
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Word Scramble</h2>
            <p className="text-muted" style={{ marginBottom: 28, lineHeight: 1.6 }}>
              Unscramble the word and pick the correct answer.
              10 words, {Q_TIME} seconds each. Go!
            </p>
            <NeonButton onClick={() => setPhase('playing')} variant="purple" style={{ width: '100%' }}>
              Start →
            </NeonButton>
          </div>
        ) : phase === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📖</div>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Word Master!</h2>
            <p className="text-mono" style={{ fontSize: '1.5rem', color: 'var(--green)', fontWeight: 700 }}>
              {score} / {TOTAL * 10} pts
            </p>
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
