import NeonButton from './NeonButton'
import { t } from '../i18n/translations'
import useGameStore from '../store/gameStore'

export default function GameDone({
  emoji,
  title,
  scoreLabel,
  timeLabel,
  breakdown,
  note,
  onContinue,
  onPlayAgain,
}) {
  const language = useGameStore((s) => s.language)
  const dailyMode = useGameStore((s) => s.dailyMode)
  const exitToHub = useGameStore((s) => s.exitToHub)

  return (
    <div className="game-done">
      {emoji ? <div className="game-done-emoji">{emoji}</div> : null}
      <h2 className="game-done-title">{title}</h2>
      {scoreLabel ? <p className="game-done-score text-mono">{scoreLabel}</p> : null}
      {timeLabel ? <p className="game-done-time text-mono">{timeLabel}</p> : null}
      {breakdown ? <p className="game-done-breakdown text-muted">{breakdown}</p> : null}
      {note ? <p className="game-done-note text-muted">{note}</p> : null}
      {dailyMode ? (
        <p className="game-done-note text-muted">{t(language, 'dailyLogged')}</p>
      ) : null}
      <div className="game-done-actions">
        <NeonButton onClick={dailyMode ? exitToHub : (onContinue || exitToHub)} variant="green">
          {dailyMode ? t(language, 'dailyBackHome') : t(language, 'continueArcade')}
        </NeonButton>
        <NeonButton onClick={onPlayAgain} variant="outline" size="sm">
          {t(language, 'playAgainButton')}
        </NeonButton>
      </div>
    </div>
  )
}
