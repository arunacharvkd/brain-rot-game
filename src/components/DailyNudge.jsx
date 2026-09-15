import { useEffect, useState } from 'react'
import { dailyPlayedToday, getDailyGame } from '../lib/daily'
import { loadReminderPrefs, saveReminderPrefs, shouldShowNudge, localDateKey } from '../lib/reminder'
import { t } from '../i18n/translations'
import useGameStore from '../store/gameStore'
import NeonButton from './NeonButton'

let markedNudgeDay = ''

export default function DailyNudge() {
  const language = useGameStore((s) => s.language)
  const daily = useGameStore((s) => s.daily)
  const startDaily = useGameStore((s) => s.startDaily)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const prefs = loadReminderPrefs()
    const today = localDateKey()
    const show = shouldShowNudge(prefs, { playedToday: dailyPlayedToday(daily) })
    setVisible(show)
    if (show && markedNudgeDay !== today) {
      markedNudgeDay = today
      saveReminderPrefs({ ...prefs, lastNudgeOn: today })
    }
  }, [daily])

  if (!visible) return null

  return (
    <div className="daily-nudge" role="status">
      <div>
        <p className="daily-nudge-title">{t(language, 'reminderNudgeTitle')}</p>
        <p className="text-muted text-sm">{t(language, 'reminderNudgeBody')}</p>
      </div>
      <div className="daily-nudge-actions">
        <NeonButton
          onClick={() => startDaily(getDailyGame().screen)}
          variant="green"
          size="sm"
        >
          {t(language, 'dailyPlay')}
        </NeonButton>
        <button type="button" className="daily-reminder-skip" onClick={() => setVisible(false)}>
          {t(language, 'reminderNudgeDismiss')}
        </button>
      </div>
    </div>
  )
}
