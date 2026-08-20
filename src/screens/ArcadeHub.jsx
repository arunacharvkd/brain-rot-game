import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

const GAMES = [
  { id: 'focus',  emoji: '🎯', name: 'Focus Game',      desc: 'Click good items, dodge bad ones. 3 rounds.',        screen: 'game' },
  { id: 'memory', emoji: '🃏', name: 'Memory Match',    desc: 'Find all pairs before the timer runs out.',          screen: 'game-memory' },
  { id: 'simon',  emoji: '🟥', name: 'Pattern Simon',   desc: 'Watch the sequence, then repeat it.',                screen: 'game-simon' },
  { id: 'math',   emoji: '⚡', name: 'Speed Math',      desc: 'Rapid-fire mental arithmetic. 20 questions.',        screen: 'game-math' },
  { id: 'breath', emoji: '💨', name: 'Breath Focus',    desc: 'Follow the breathing circle. Stay in sync.',         screen: 'game-breath' },
  { id: 'word',   emoji: '🔤', name: 'Word Scramble',   desc: 'Unscramble the word before time runs out.',          screen: 'game-word' },
  { id: 'colour', emoji: '🎨', name: 'Colour vs Word',  desc: 'Click the ink colour — ignore what the word says.',  screen: 'game-colour' },
]

export default function ArcadeHub() {
  const setScreen = useGameStore((s) => s.setScreen)
  const arcadeScores = useGameStore((s) => s.arcadeScores)
  const gamesPlayed = Object.keys(arcadeScores).length
  const totalScore = Object.values(arcadeScores).reduce((a, b) => a + b, 0)

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
              🧠 Brain Rehab Arcade
            </h1>
            <p className="text-muted text-sm" style={{ marginTop: 4 }}>
              {gamesPlayed === 0
                ? 'Pick any game to start your rehab'
                : `${gamesPlayed} / ${GAMES.length} played · ${totalScore} pts total`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {gamesPlayed === GAMES.length && (
              <NeonButton onClick={() => setScreen('results')} variant="green" size="sm">
                See Results →
              </NeonButton>
            )}
            <NeonButton onClick={() => setScreen('diagnosis')} variant="outline" size="sm">
              ← Back
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
                          Best: {score} pts
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
                      {played ? 'Play Again' : 'Play →'}
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
