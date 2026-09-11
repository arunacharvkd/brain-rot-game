import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import BrandMark from '../components/BrandMark'
import AdUnit from '../components/AdUnit'
import { AD_SLOTS } from '../data/ads'
import { MIN_GAMES_FOR_RESULTS } from '../data/tiers'
import { t } from '../i18n/translations'
import DailyDrillCard from '../components/DailyDrillCard'

export default function ArcadeHub() {
  const setScreen = useGameStore((s) => s.setScreen)
  const arcadeScores = useGameStore((s) => s.arcadeScores)
  const language = useGameStore((s) => s.language)
  const gamesPlayed = Object.keys(arcadeScores).length
  const totalScore = Object.values(arcadeScores).reduce((a, b) => a + b, 0)
  const GAMES = [
    { id: 'focus',  emoji: '🎯', name: t(language, 'gameFocus'), desc: t(language, 'gameFocusDesc'), screen: 'game' },
    { id: 'memory', emoji: '🃏', name: t(language, 'gameMemory'), desc: t(language, 'gameMemoryDesc'), screen: 'game-memory' },
    { id: 'simon',  emoji: '🟥', name: t(language, 'gameSimon'), desc: t(language, 'gameSimonDesc'), screen: 'game-simon' },
    { id: 'math',   emoji: '⚡', name: t(language, 'gameMath'), desc: t(language, 'gameMathDesc'), screen: 'game-math' },
    { id: 'breath', emoji: '💨', name: t(language, 'gameBreath'), desc: t(language, 'gameBreathDesc'), screen: 'game-breath' },
    { id: 'word',   emoji: '🔤', name: t(language, 'gameWord'), desc: t(language, 'gameWordDesc'), screen: 'game-word' },
    { id: 'colour', emoji: '🎨', name: t(language, 'gameColour'), desc: t(language, 'gameColourDesc'), screen: 'game-colour' },
    { id: 'odd',    emoji: '🕵️', name: t(language, 'gameOdd'), desc: t(language, 'gameOddDesc'), screen: 'game-odd' },
    { id: 'order',  emoji: '🔢', name: t(language, 'gameOrder'), desc: t(language, 'gameOrderDesc'), screen: 'game-order' },
  ]

  return (
    <motion.div
      className="screen arcade-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="arcade-shell">
        <motion.div
          className="arcade-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
        >
          <div className="arcade-header-copy">
            <div className="arcade-kicker">
              <BrandMark size={36} />
              <span>Test. Train. Transform.</span>
            </div>
            <h1 className="arcade-title">{t(language, 'arcadeTitle')}</h1>
            <p className="text-muted text-sm arcade-subtitle">
              {gamesPlayed === 0
                ? t(language, 'arcadePickAnyGame')
                : t(language, 'arcadePlayed').replace('{count}', gamesPlayed).replace('{total}', GAMES.length).replace('{score}', totalScore)}
              {gamesPlayed > 0 && gamesPlayed < MIN_GAMES_FOR_RESULTS
                ? ` · ${t(language, 'arcadeUnlockResults').replace('{count}', MIN_GAMES_FOR_RESULTS - gamesPlayed)}`
                : ''}
            </p>
          </div>
          <div className="arcade-header-actions">
            {gamesPlayed >= MIN_GAMES_FOR_RESULTS && (
              <NeonButton onClick={() => setScreen('results')} variant="green" size="sm">
                {t(language, 'arcadeSeeResults')}
              </NeonButton>
            )}
            <NeonButton onClick={() => setScreen('diagnosis')} variant="outline" size="sm">
              ← {t(language, 'arcadeBack')}
            </NeonButton>
          </div>
        </motion.div>

        <DailyDrillCard compact />

        {/* Game grid */}
        <div className="arcade-grid">
          {GAMES.map((game, i) => {
            const score = arcadeScores[game.id]
            const played = score !== undefined
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.055 }}
              >
                <GlassCard
                  sm
                  className={`arcade-card ${played ? 'arcade-card--played' : ''}`}
                  style={{ height: '100%' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '2rem', lineHeight: 1 }}>{game.emoji}</span>
                      {played && (
                        <span className="tier-chip tier-0" style={{ fontSize: '0.7rem' }}>
                          {t(language, 'bestScore').replace('{score}', score)}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 5, fontSize: '0.95rem' }}>
                        {game.name}
                      </div>
                      <div className="text-muted text-sm">{game.desc}</div>
                    </div>
                    <NeonButton
                      onClick={() => setScreen(game.screen)}
                      variant={played ? 'outline' : 'purple'}
                      size="sm"
                      style={{ width: '100%' }}
                    >
                      {played ? t(language, 'playAgainButton') : t(language, 'playButton')}
                    </NeonButton>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        <AdUnit slot={AD_SLOTS.arcade} className="arcade-hub-ad" />
        {gamesPlayed > 0 && gamesPlayed < MIN_GAMES_FOR_RESULTS && (
          <p className="arcade-unlock-hint text-muted">
            {t(language, 'arcadeUnlockResults').replace('{count}', MIN_GAMES_FOR_RESULTS - gamesPlayed)}
          </p>
        )}
      </div>
    </motion.div>
  )
}
