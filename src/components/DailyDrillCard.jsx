import { getDailyGame, dailyPlayedToday } from '../lib/daily'
import useGameStore from '../store/gameStore'
import NeonButton from './NeonButton'
import { t } from '../i18n/translations'
import { trackEvent } from '../lib/analytics'

export default function DailyDrillCard({ compact = false }) {
  const language = useGameStore((s) => s.language)
  const daily = useGameStore((s) => s.daily)
  const startDaily = useGameStore((s) => s.startDaily)
  const game = getDailyGame()
  const done = dailyPlayedToday(daily)
  const name = t(language, game.nameKey)

  const play = () => {
    trackEvent('daily_drill_start', { game_id: game.id, streak: daily.streak || 0, replay: done ? 1 : 0 })
    startDaily(game.screen)
  }

  return (
    <div className={`daily-drill ${compact ? 'daily-drill--compact' : ''}`}>
      <div className="daily-drill-copy">
        <p className="daily-drill-kicker">{t(language, 'dailyKicker')}</p>
        <h3>
          <span aria-hidden="true">{game.emoji}</span> {name}
        </h3>
        <p className="text-muted text-sm">
          {t(language, 'dailyBlurb').replace('{seconds}', game.seconds)}
          {daily.streak > 0 ? ` · ${t(language, 'dailyStreak').replace('{count}', daily.streak)}` : ''}
        </p>
        {done ? (
          <p className="daily-drill-done text-sm">
            {t(language, 'dailyDoneToday').replace('{score}', daily.lastScore ?? 0)}
          </p>
        ) : null}
      </div>
      <NeonButton onClick={play} variant={done ? 'outline' : 'green'} size="sm">
        {done ? t(language, 'dailyReplay') : t(language, 'dailyPlay')}
      </NeonButton>
    </div>
  )
}
