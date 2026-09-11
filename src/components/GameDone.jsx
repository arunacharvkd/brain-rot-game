import NeonButton from './NeonButton'
import { t } from '../i18n/translations'
import useGameStore from '../store/gameStore'

export default function GameDone({
  emoji,
  title,
  scoreLabel,
  note,
  onContinue,
  onPlayAgain,
}) {
  const language = useGameStore((s) => s.language)

  return (
    <div className="game-done">
      {emoji ? <div className="game-done-emoji">{emoji}</div> : null}
      <h2 className="game-done-title">{title}</h2>
      {scoreLabel ? <p className="game-done-score text-mono">{scoreLabel}</p> : null}
      {note ? <p className="game-done-note text-muted">{note}</p> : null}
      <div className="game-done-actions">
        <NeonButton onClick={onContinue} variant="green">
          {t(language, 'continueArcade')}
        </NeonButton>
        <NeonButton onClick={onPlayAgain} variant="outline" size="sm">
          {t(language, 'playAgainButton')}
        </NeonButton>
      </div>
    </div>
  )
}
