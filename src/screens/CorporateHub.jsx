import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import BrandMark from '../components/BrandMark'
import { CORPORATE_GAMES } from '../data/corporate'

export default function CorporateHub() {
  const setScreen = useGameStore((s) => s.setScreen)
  const corporateScores = useGameStore((s) => s.corporateScores) || {}
  const played = Object.keys(corporateScores).length

  return (
    <motion.div
      className="screen arcade-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="arcade-shell">
        <div className="arcade-header">
          <div className="arcade-header-copy">
            <div className="arcade-kicker">
              <BrandMark size={36} />
              <span>Workplace drills</span>
            </div>
            <h1 className="arcade-title">Corporate drills</h1>
            <p className="text-muted text-sm arcade-subtitle">
              Three short games for inbox decisions, task order, and numbers in a status line.
              {played > 0 ? ` ${played} of ${CORPORATE_GAMES.length} played on this device.` : ' Nothing here is sent to an account.'}
            </p>
          </div>
          <div className="arcade-header-actions">
            <NeonButton onClick={() => setScreen('landing')} variant="outline" size="sm">
              ← Home
            </NeonButton>
          </div>
        </div>

        <div className="corp-intro">
          <p>
            These drills use ordinary office situations: a customer blocked today, a newsletter, a chart that does not add up. They are practice. They are not a hiring test, a performance review, or a measure of intelligence.
          </p>
          <p>
            Scores stay in this browser and do not move the habit-check tier from the quiz and reaction task. The habit check is still the main product. This section is the workplace set inside the same site.
          </p>
        </div>

        <div className="arcade-grid">
          {CORPORATE_GAMES.map((game) => {
            const score = corporateScores[game.id]
            return (
              <GlassCard key={game.id} sm className={score !== undefined ? 'arcade-card arcade-card--played' : 'arcade-card'} style={{ height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>{game.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 5 }}>{game.name}</div>
                    <div className="text-muted text-sm">{game.summary}</div>
                    {score !== undefined && (
                      <div className="text-mono" style={{ marginTop: 8, color: 'var(--green)', fontSize: '0.85rem' }}>
                        Best {score} pts
                      </div>
                    )}
                  </div>
                  <NeonButton onClick={() => setScreen(game.screen)} variant={score !== undefined ? 'outline' : 'purple'} size="sm" style={{ width: '100%' }}>
                    {score !== undefined ? 'Play again' : 'Play →'}
                  </NeonButton>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
