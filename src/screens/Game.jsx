import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import useGameStore from '../store/gameStore'
import EmojiItem from '../components/EmojiItem'
import { useSound } from '../hooks/useSound'

const GOOD = ['🧠', '📚', '💧', '🍎', '😴']
const BAD  = ['📱', '💀', '📺', '🤡']
// Fall duration per round (seconds) — gets faster each round
const FALL_SPEED = [4.2, 3.0, 2.1]
// Spawn interval per round (ms)
const SPAWN_MS = [1100, 850, 600]
const ROUND_TIME = 30

function makeItem(round) {
  const isGood = Math.random() > 0.38
  const pool = isGood ? GOOD : BAD
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    emoji: pool[Math.floor(Math.random() * pool.length)],
    type: isGood ? 'good' : 'bad',
    x: 4 + Math.random() * 84,
    fallDuration: FALL_SPEED[round - 1],
  }
}

export default function Game() {
  const [items, setItems] = useState([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [round, setRound] = useState(1)
  // roundPhase: playing | summary | done
  const [roundPhase, setRoundPhase] = useState('playing')
  // Score pops: { id, value, x, y }
  const [pops, setPops] = useState([])
  const scoreRef = useRef(0)
  const { play } = useSound()
  const setArcadeScore = useGameStore((s) => s.setArcadeScore)
  const setScreen = useGameStore((s) => s.setScreen)

  // Sync score ref so callbacks always read fresh value
  useEffect(() => { scoreRef.current = score }, [score])

  // Spawn items
  useEffect(() => {
    if (roundPhase !== 'playing') return
    const interval = setInterval(
      () => setItems((prev) => [...prev.slice(-22), makeItem(round)]),
      SPAWN_MS[round - 1]
    )
    return () => clearInterval(interval)
  }, [round, roundPhase])

  // Countdown timer
  useEffect(() => {
    if (roundPhase !== 'playing') return
    if (timeLeft <= 0) {
      setRoundPhase(round < 3 ? 'summary' : 'done')
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, roundPhase, round])

  // Round summary → start next round after 2s
  useEffect(() => {
    if (roundPhase !== 'summary') return
    const t = setTimeout(() => {
      setRound((r) => r + 1)
      setTimeLeft(ROUND_TIME)
      setItems([])
      setRoundPhase('playing')
    }, 2100)
    return () => clearTimeout(t)
  }, [roundPhase])

  // Game done
  useEffect(() => {
    if (roundPhase !== 'done') return
    const final = scoreRef.current
    play('win')
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.55 } })
    setArcadeScore('focus', final)
    const t = setTimeout(() => setScreen('arcade'), 2600)
    return () => clearTimeout(t)
  }, [roundPhase]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleHit = useCallback(
    (item) => {
      const delta = item.type === 'good' ? 10 : -5
      play(item.type === 'good' ? 'ding' : 'buzz')
      setScore((s) => s + delta)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      // Floating score pop
      setPops((prev) => [
        ...prev.slice(-8),
        {
          id: item.id,
          value: delta > 0 ? `+${delta}` : `${delta}`,
          x: item.x,
          color: delta > 0 ? 'var(--green)' : 'var(--red)',
        },
      ])
    },
    [play]
  )

  const handleExpire = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const handlePlayAgain = () => {
    setItems([])
    setScore(0)
    scoreRef.current = 0
    setTimeLeft(ROUND_TIME)
    setRound(1)
    setPops([])
    setRoundPhase('playing') // triggers done-effect cleanup, cancelling auto-nav
  }

  const timerPct = (timeLeft / ROUND_TIME) * 100
  const timerColor =
    timerPct > 50 ? 'var(--green)' : timerPct > 25 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div className="game-arena">
      {/* HUD */}
      <div className="game-hud">
        <div className="hud-score">{score} pts</div>
        <div className="hud-timer-track">
          <div
            className="hud-timer-fill"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
          />
        </div>
        <div className="hud-round text-mono">
          Round {round}/3
        </div>
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
            marginLeft: 4,
          }}
        >
          ✕ Quit
        </button>
      </div>

      {/* Falling items (spawned below HUD) */}
      <div style={{ position: 'absolute', inset: 0, top: 56, overflow: 'hidden' }}>
        {items.map((item) => (
          <EmojiItem key={item.id} item={item} onHit={handleHit} onExpire={handleExpire} />
        ))}
      </div>

      {/* Floating score pops */}
      {pops.map((pop) => (
        <div
          key={pop.id}
          className="score-pop text-mono"
          style={{ left: `${pop.x}%`, top: '60%', color: pop.color }}
          onAnimationEnd={() => setPops((prev) => prev.filter((p) => p.id !== pop.id))}
        >
          {pop.value}
        </div>
      ))}

      {/* Legend strip */}
      {roundPhase === 'playing' && (
        <div
          style={{
            position: 'absolute',
            bottom: 16, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 20,
            fontSize: '0.8rem', color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        >
          <span>🧠📚💧🍎😴 +10</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>📱💀📺🤡 −5</span>
        </div>
      )}

      {/* Round summary overlay */}
      <AnimatePresence>
        {(roundPhase === 'summary' || roundPhase === 'done') && (
          <motion.div
            className="round-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="round-overlay-title"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            >
              {roundPhase === 'done' ? '🎉 REHAB COMPLETE' : `Round ${round} Done!`}
            </motion.div>
            <div className="round-overlay-score text-mono">
              Score: {score} pts
            </div>
            {roundPhase === 'summary' && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
                Next round starting...
              </div>
            )}
            {roundPhase === 'done' && (
              <button
                onClick={handlePlayAgain}
                style={{
                  marginTop: 14, background: 'none',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 8, color: '#fff', fontSize: '0.9rem',
                  padding: '6px 18px', cursor: 'pointer',
                }}
              >
                ↩ Play Again
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
