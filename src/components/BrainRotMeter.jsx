import { motion } from 'framer-motion'
import { TIERS } from '../data/tiers'
import useGameStore from '../store/gameStore'
import { t } from '../i18n/translations'

export default function BrainRotMeter({ tier, label = '' }) {
  const activeTier = TIERS[Math.max(0, Math.min(3, tier))]
  const language = useGameStore((s) => s.language)

  return (
    <div className="meter-wrap">
      {label && <div className="meter-label">{label}</div>}
      <div className="meter-track">
        <motion.div
          className="meter-fill"
          initial={{ width: 0 }}
          animate={{ width: `${activeTier.pct}%` }}
          transition={{ duration: 1.3, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            background: `linear-gradient(90deg, #39ff14, ${activeTier.color})`,
            boxShadow: `0 0 14px ${activeTier.color}`,
          }}
        />
      </div>
      <div className="meter-pct" style={{ color: activeTier.color }}>
        {activeTier.pct}% {t(language, 'cooked')}
      </div>
    </div>
  )
}
