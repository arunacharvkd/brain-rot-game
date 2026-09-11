import useGameStore from '../store/gameStore'
import { t } from '../i18n/translations'

export default function ArcadeBack() {
  const exitToHub = useGameStore((s) => s.exitToHub)
  const language = useGameStore((s) => s.language)
  const dailyMode = useGameStore((s) => s.dailyMode)

  return (
    <button type="button" className="ghost-back" onClick={exitToHub}>
      ← {dailyMode ? t(language, 'back') : t(language, 'arcadeBack')}
    </button>
  )
}
