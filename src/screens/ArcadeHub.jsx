import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'
import { t } from '../i18n/translations'

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
      className="screen"
      style={{ alignItems: 'flex-start', padding: '20px 20px 40px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ width: '100%', maxWidth: 740, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
        >
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800 }}>
              🧠 {t(language, 'arcadeTitle')}
            </h1>
            <p className="text-muted text-sm" style={{ marginTop: 4 }}>
              {gamesPlayed === 0
                ? t(language, 'arcadePickAnyGame')
                : t(language, 'arcadePlayed').replace('{count}', gamesPlayed).replace('{total}', GAMES.length).replace('{score}', totalScore)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {gamesPlayed === GAMES.length && (
              <NeonButton onClick={() => setScreen('results')} variant="green" size="sm">
                {t(language, 'arcadeSeeResults')}
              </NeonButton>
            )}
            <NeonButton onClick={() => setScreen('diagnosis')} variant="outline" size="sm">
              ← {t(language, 'arcadeBack')}
            </NeonButton>
          </div>
        </motion.div>

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
      </div>
    </motion.div>
  )
}
