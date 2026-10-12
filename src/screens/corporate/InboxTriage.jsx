import { useCallback, useEffect, useState } from 'react'
import useGameStore from '../../store/gameStore'
import NeonButton from '../../components/NeonButton'
import GameDone from '../../components/GameDone'
import { CorporateBack, CorporateShell, RoundMeta } from '../../components/CorporateChrome'
import { useSound } from '../../hooks/useSound'
import { INBOX_ACTIONS, INBOX_MAIL, shuffle } from '../../data/corporate'

const TOTAL = 8
const Q_TIME = 12

function makeDeck() {
  return shuffle(INBOX_MAIL).slice(0, TOTAL)
}

export default function InboxTriage() {
  const [phase, setPhase] = useState('intro')
  const [deck, setDeck] = useState(makeDeck)
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(Q_TIME)
  const [score, setScore] = useState(0)
  const [locked, setLocked] = useState(false)
  const [picked, setPicked] = useState(null)
  const { play } = useSound()
  const setCorporateScore = useGameStore((s) => s.setCorporateScore)
  const setScreen = useGameStore((s) => s.setScreen)
  const mail = deck[qIndex]

  const finishRound = useCallback((actionId) => {
    if (locked || !mail) return
    setLocked(true)
    setPicked(actionId)
    const correct = actionId === mail.answer
    if (correct) play('ding')
    else play('buzz')
    const gained = correct ? 10 + timeLeft : 0
    const newScore = score + gained
    setScore(newScore)
    window.setTimeout(() => {
      if (qIndex + 1 >= deck.length) {
        setPhase('done')
        setCorporateScore('inbox', newScore)
      } else {
        setQIndex((i) => i + 1)
        setTimeLeft(Q_TIME)
        setPicked(null)
        setLocked(false)
      }
    }, 900)
  }, [locked, mail, play, timeLeft, score, qIndex, deck.length, setCorporateScore])

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
    setDeck(makeDeck())
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
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📥</div>
          <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Inbox triage</h2>
          <p className="text-muted" style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Eight messages. For each one, choose the next action. Reply now only when someone is blocked today. Schedule real work that can wait. Delegate when a named owner is not you. Archive noise and notes that ask for nothing.
          </p>
          <NeonButton onClick={() => { setPhase('playing'); play('click') }}>Start →</NeonButton>
        </div>
      )}

      {phase === 'playing' && mail && (
        <div>
          <RoundMeta round={qIndex + 1} total={deck.length} timeLeft={timeLeft} totalTime={Q_TIME} score={score} />
          <article className="corp-mail">
            <p className="corp-kicker">{mail.from}</p>
            <h2 className="corp-subject">{mail.subject}</h2>
            <p>{mail.body}</p>
          </article>
          <div className="corp-choices">
            {INBOX_ACTIONS.map((action) => {
              let mark = ''
              if (picked !== null || (locked && picked === null)) {
                if (action.id === mail.answer) mark = ' is-good'
                else if (action.id === picked) mark = ' is-bad'
              }
              return (
                <button
                  key={action.id}
                  type="button"
                  className={`corp-choice${mark}`}
                  disabled={locked}
                  onClick={() => finishRound(action.id)}
                >
                  {action.label}
                </button>
              )
            })}
          </div>
          {locked && <p className="corp-note">{mail.why}</p>}
        </div>
      )}

      {phase === 'done' && (
        <GameDone
          emoji="📥"
          title="Inbox cleared"
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
