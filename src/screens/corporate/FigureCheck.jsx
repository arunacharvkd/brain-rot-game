import { useCallback, useEffect, useState } from 'react'
import useGameStore from '../../store/gameStore'
import NeonButton from '../../components/NeonButton'
import GameDone from '../../components/GameDone'
import { CorporateBack, CorporateShell, RoundMeta } from '../../components/CorporateChrome'
import { useSound } from '../../hooks/useSound'
import { FIGURE_ROUNDS, shuffle } from '../../data/corporate'

const Q_TIME = 14

export default function FigureCheck() {
  const [phase, setPhase] = useState('intro')
  const [rounds, setRounds] = useState(() => shuffle(FIGURE_ROUNDS))
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(Q_TIME)
  const [score, setScore] = useState(0)
  const [locked, setLocked] = useState(false)
  const [picked, setPicked] = useState(null)
  const { play } = useSound()
  const setCorporateScore = useGameStore((s) => s.setCorporateScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const round = rounds[qIndex]

  const finishRound = useCallback((id) => {
    if (locked || !round) return
    setLocked(true)
    setPicked(id)
    const correct = id === round.wrongId
    if (correct) play('ding')
    else play('buzz')
    const gained = correct ? 10 + timeLeft : 0
    const newScore = score + gained
    setScore(newScore)
    window.setTimeout(() => {
      if (qIndex + 1 >= rounds.length) {
        setPhase('done')
        setCorporateScore('figures', newScore)
      } else {
        setQIndex((i) => i + 1)
        setTimeLeft(Q_TIME)
        setPicked(null)
        setLocked(false)
      }
    }, 1100)
  }, [locked, round, play, score, timeLeft, qIndex, rounds.length, setCorporateScore])

  useEffect(() => {
    if (phase !== 'playing' || locked) return undefined
    if (timeLeft <= 0) {
      finishRound(null)
      return undefined
    }
    const tid = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(tid)
  }, [phase, locked, timeLeft, finishRound])

  const playAgain = () => {
    setRounds(shuffle(FIGURE_ROUNDS))
    setPhase('intro')
    setQIndex(0)
    setTimeLeft(Q_TIME)
    setScore(0)
    setLocked(false)
    setPicked(null)
  }

  return (
    <CorporateShell>
      {phase === 'intro' && (
        <div style={{ textAlign: 'center' }}>
          <div className="game-intro-top"><CorporateBack /></div>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔎</div>
          <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Figure check</h2>
          <p className="text-muted" style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Each status line contains one number that disagrees with the others. Tap that number. The line is the kind of sentence that slips into a deck or a chat update.
          </p>
          <NeonButton onClick={() => { setPhase('playing'); play('click') }}>Start →</NeonButton>
        </div>
      )}

      {phase === 'playing' && round && (
        <div>
          <RoundMeta round={qIndex + 1} total={rounds.length} timeLeft={timeLeft} totalTime={Q_TIME} score={score} />
          <p className="corp-sentence">
            {round.parts.map((part, index) => {
              if (!part.pick) return <span key={`${round.id}-${index}`}>{part.label}</span>
              let mark = ''
              if (locked) {
                if (part.id === round.wrongId) mark = ' is-good'
                else if (part.id === picked) mark = ' is-bad'
              }
              return (
                <button
                  key={part.id}
                  type="button"
                  className={`corp-chip${mark}`}
                  disabled={locked}
                  onClick={() => finishRound(part.id)}
                >
                  {part.label}
                </button>
              )
            })}
          </p>
          {locked && <p className="corp-note">{round.note}</p>}
        </div>
      )}

      {phase === 'done' && (
        <GameDone
          emoji="🔎"
          title="Figures checked"
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
