import useGameStore from '../store/gameStore'
import { t } from '../i18n/translations'

export default function ArcadeBack() {
  const setScreen = useGameStore((s) => s.setScreen)
  const language = useGameStore((s) => s.language)

  return (
    <button type="button" className="ghost-back" onClick={() => setScreen('arcade')}>
      ← {t(language, 'arcadeBack')}
    </button>
  )
}
