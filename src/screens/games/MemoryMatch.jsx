import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import { useSound } from '../../hooks/useSound'
import { t } from '../../i18n/translations'

const EMOJIS = ['🧠', '📚', '💧', '🍎', '😴', '🌟', '⚡', '🎯']
const TIME = 90

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function initCards() {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }))
}

export default function MemoryMatch() {
  const [cards, setCards] = useState(initCards)
  const [flipped, setFlipped] = useState([]) // ids of currently face-up unmatched cards
  const [matchedCount, setMatchedCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME)
  const [phase, setPhase] = useState('intro') // intro | playing | done
  const [locked, setLocked] = useState(false)
  const [score, setScore] = useState(0)
  const { play } = useSound()
  const language = useGameStore((s) => s.language)
  const setArcadeScore = useGameStore((s) => s.setArcadeScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const navTimerRef = useRef(null)

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) { finish(matchedCount); return }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, phase])

  // Check win
  useEffect(() => {
    if (matchedCount === EMOJIS.length) finish(EMOJIS.length)
  }, [matchedCount])

  const finish = useCallback((pairs) => {
    if (phase === 'done') return
    const s = pairs * 10 + Math.round(timeLeft * 0.5)
    setScore(s)
    setPhase('done')
    play('win')
    setArcadeScore('memory', s)
    navTimerRef.current = setTimeout(() => setScreen('arcade'), 2600)
  }, [phase, timeLeft, play, setArcadeScore, setScreen])

  const handlePlayAgain = () => {
    clearTimeout(navTimerRef.current)
    setCards(initCards())
    setFlipped([])
    setMatchedCount(0)
    setTimeLeft(TIME)
    setScore(0)
    setLocked(false)
    setPhase('intro')
  }

  const handleCardClick = (card) => {
    if (phase !== 'playing' || locked || card.flipped || card.matched) return

    const newFlipped = [...flipped, card.id]
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c)))
    play('click')

    if (newFlipped.length === 2) {
      setLocked(true)
      const [a, b] = newFlipped.map((id) => cards.find((c) => c.id === id))
      if (a.emoji === b.emoji) {
        // Match
        play('ding')
        setCards((prev) => prev.map((c) => newFlipped.includes(c.id) ? { ...c, matched: true } : c))
        setMatchedCount((n) => n + 1)
        setFlipped([])
        setLocked(false)
      } else {
        // No match — flip back after delay
        setTimeout(() => {
          setCards((prev) => prev.map((c) => newFlipped.includes(c.id) && !c.matched ? { ...c, flipped: false } : c))
          setFlipped([])
          setLocked(false)
        }, 900)
      }
    } else {
      setFlipped(newFlipped)
    }
  }

  const timerPct = (timeLeft / TIME) * 100
  const timerColor = timerPct > 50 ? 'var(--green)' : timerPct > 25 ? 'var(--yellow)' : 'var(--red)'

  return (
    <motion.div
      className="screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <GlassCard style={{ maxWidth: 520, width: '100%' }}>
        {phase === 'intro' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🃏</div>
            <h2 style={{ fontWeight: 800, marginBottom: 10 }}>{t(language, 'memoryIntroTitle')}</h2>
            <p className="text-muted" style={{ marginBottom: 28, lineHeight: 1.6 }}>
              {t(language, 'memoryIntroText').replace('{seconds}', TIME)}
            </p>
            <NeonButton onClick={() => setPhase('playing')} variant="purple" style={{ width: '100%' }}>
              {t(language, 'startButton')}
            </NeonButton>
          </div>
        ) : (
          <>
            {/* HUD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span className="text-mono text-sm" style={{ color: 'var(--green)', minWidth: 60 }}>
                {matchedCount}/{EMOJIS.length} pairs
              </span>
              <div className="hud-timer-track" style={{ flex: 1 }}>
                <div className="hud-timer-fill" style={{ width: `${timerPct}%`, backgroundColor: timerColor }} />
              </div>
              <span className="text-mono text-sm" style={{ color: timerColor, minWidth: 32, textAlign: 'right' }}>
                {timeLeft}s
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
                  flexShrink: 0,
                }}
              >
                ✕ Quit
              </button>
            </div>

            {/* Card grid */}
            <div className="memory-grid" style={{ position: 'relative' }}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`memory-card ${card.flipped || card.matched ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  <div className="memory-card-inner">
                    <div className="memory-card-front">?</div>
                    <div className="memory-card-back">{card.emoji}</div>
                  </div>
                </div>
              ))}

              {/* Completion overlay */}
              <AnimatePresence>
                {phase === 'done' && (
                  <motion.div
                    className="game-complete-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div style={{ fontSize: '2.5rem' }}>🎉</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)' }}>
                      {matchedCount === EMOJIS.length ? 'All Pairs Found!' : `${matchedCount} Pairs Found`}
                    </div>
                    <div className="text-mono" style={{ color: 'var(--text-muted)' }}>
                      Score: {score} pts
                    </div>
                    <button
                      onClick={handlePlayAgain}
                      style={{
                        marginTop: 12, background: 'none',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 8, color: '#fff', fontSize: '0.85rem',
                        padding: '5px 16px', cursor: 'pointer',
                      }}
                    >
                      ↩ Play Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </GlassCard>
    </motion.div>
  )
}
