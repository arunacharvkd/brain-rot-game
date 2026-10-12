import { useCallback, useEffect, useState } from 'react'
import useGameStore from '../../store/gameStore'
import NeonButton from '../../components/NeonButton'
import GameDone from '../../components/GameDone'
import { CorporateBack, CorporateShell, RoundMeta } from '../../components/CorporateChrome'
import { useSound } from '../../hooks/useSound'
import { PRIORITY_ROUNDS, PRIORITY_RULE, shuffle } from '../../data/corporate'

const Q_TIME = 22

function deal() {
  return shuffle(PRIORITY_ROUNDS).map((round) => ({ ...round, cards: shuffle(round.cards) }))
}

export default function PriorityOrder() {
  const [phase, setPhase] = useState('intro')
  const [rounds, setRounds] = useState(deal)
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(Q_TIME)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState([])
  const [locked, setLocked] = useState(false)
  const [missed, setMissed] = useState(false)
  const { play } = useSound()
  const setCorporateScore = useGameStore((s) => s.setCorporateScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const round = rounds[qIndex]

  const advance = useCallback((success, nextScore) => {
    window.setTimeout(() => {
      if (qIndex + 1 >= rounds.length) {
        setPhase('done')
        setCorporateScore('priority', nextScore)
      } else {
        setQIndex((i) => i + 1)
        setPicked([])
        setMissed(false)
        setLocked(false)
        setTimeLeft(Q_TIME)
      }
    }, success ? 400 : 700)
  }, [qIndex, rounds.length, setCorporateScore])

  const finishWrong = useCallback(() => {
    if (locked) return
    setLocked(true)
    setMissed(true)
    play('buzz')
    advance(false, score)
  }, [locked, play, advance, score])

  useEffect(() => {
    if (phase !== 'playing' || locked) return undefined
    if (timeLeft <= 0) {
      finishWrong()
      return undefined
    }
    const tid = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(tid)
  }, [phase, locked, timeLeft, finishWrong])

  const tap = (id) => {
    if (phase !== 'playing' || locked || picked.includes(id) || !round) return
    const expected = round.order[picked.length]
    if (id !== expected) {
      setPicked((list) => [...list, id])
      finishWrong()
      return
    }
    play('click')
    const next = [...picked, id]
    setPicked(next)
    if (next.length === round.order.length) {
      setLocked(true)
      play('ding')
      const gained = 16 + timeLeft
      const newScore = score + gained
      setScore(newScore)
      advance(true, newScore)
    }
  }

  const playAgain = () => {
    setRounds(deal())
    setPhase('intro')
    setQIndex(0)
    setTimeLeft(Q_TIME)
    setScore(0)
    setPicked([])
    setLocked(false)
    setMissed(false)
  }

  return (
    <CorporateShell>
      {phase === 'intro' && (
        <div style={{ textAlign: 'center' }}>
          <div className="game-intro-top"><CorporateBack /></div>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📌</div>
          <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Priority order</h2>
          <p className="text-muted" style={{ marginBottom: 16, lineHeight: 1.6 }}>
            {PRIORITY_RULE} Tap the four cards in that order. One wrong tap ends the round.
          </p>
          <NeonButton onClick={() => { setPhase('playing'); play('click') }}>Start →</NeonButton>
        </div>
      )}

      {phase === 'playing' && round && (
        <div>
          <RoundMeta round={qIndex + 1} total={rounds.length} timeLeft={timeLeft} totalTime={Q_TIME} score={score} />
          <p className="corp-rule">{PRIORITY_RULE}</p>
          <div className="corp-stack">
            {round.cards.map((card) => {
              const index = picked.indexOf(card.id)
              const correct = round.order[index] === card.id
              let mark = ''
              if (index >= 0 && correct) mark = ' is-good'
              if (index >= 0 && !correct) mark = ' is-bad'
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`corp-task${mark}`}
                  disabled={locked || index >= 0}
                  onClick={() => tap(card.id)}
                >
                  <strong>{index >= 0 && correct ? `${index + 1}. ` : ''}{card.title}</strong>
                  <span>{card.detail}</span>
                </button>
              )
            })}
          </div>
          {missed && <p className="corp-note">That was out of order. The round ends so the sequence stays honest.</p>}
        </div>
      )}

      {phase === 'done' && (
        <GameDone
          emoji="📌"
          title="Order filed"
          scoreLabel={`${score} pts`}
          note="Best score is saved in this browser. It does not change your habit-check tier."
          continueLabel="Back to corporate drills"
          onContinue={() => setScreen('corporate')}
          onPlayAgain={playAgain}
        />
      )}
    </CorporateShell>
  )
}
