import { motion } from 'framer-motion'
import { TIERS } from '../data/tiers'

export default function BrainRotMeter({ tier, label = '' }) {
  const t = TIERS[Math.max(0, Math.min(3, tier))]

  return (
    <div className="meter-wrap">
      {label && <div className="meter-label">{label}</div>}
      <div className="meter-track">
        <motion.div
          className="meter-fill"
          initial={{ width: 0 }}
          animate={{ width: `${t.pct}%` }}
          transition={{ duration: 1.3, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            background: `linear-gradient(90deg, #39ff14, ${t.color})`,
            boxShadow: `0 0 14px ${t.color}`,
          }}
        />
      </div>
      <div className="meter-pct" style={{ color: t.color }}>
        {t.pct}% cooked
      </div>
    </div>
  )
}
