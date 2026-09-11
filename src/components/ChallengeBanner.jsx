import useGameStore from '../store/gameStore'
import { TIERS } from '../data/tiers'
import { t } from '../i18n/translations'

export default function ChallengeBanner() {
  const challenge = useGameStore((s) => s.challenge)
  const language = useGameStore((s) => s.language)
  if (!challenge) return null
  const tier = TIERS[challenge.d] || TIERS[0]
  return (
    <div className="challenge-banner" role="status">
      {t(language, 'challengeBanner')
        .replace('{name}', challenge.n)
        .replace('{tier}', `${tier.emoji} ${tier.label}`)}
    </div>
  )
}
