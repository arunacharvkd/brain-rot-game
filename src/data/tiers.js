export const TIERS = [
  {
    id: 0,
    label: 'CLEAN SIGMA',
    emoji: '🧼',
    color: '#39ff14',
    pct: 8,
    desc: "Your focus is sharp and your habits are healthy. You're already doing great — keep it going! 💪",
    rehab: 'Play Brain Rehab to keep your focus razor-sharp',
  },
  {
    id: 1,
    label: 'MILDLY GLAZED',
    emoji: '🍩',
    color: '#fbbf24',
    pct: 35,
    desc: "You have some screen habits to work on — totally normal, and totally fixable. Brain Rehab will sharpen you right up! 🌱",
    rehab: 'A few rounds of Brain Rehab will sharpen you right up',
  },
  {
    id: 2,
    label: 'SKIBIDI SYNDROME',
    emoji: '🚿',
    color: '#f97316',
    pct: 65,
    desc: "Heavy screen habits detected, but recognising it is the first step. You've already won by being here. Let's rebuild! 🔨",
    rehab: "You're here, you're aware — now let's rebuild that focus",
  },
  {
    id: 3,
    label: 'FULL OHIO MODE',
    emoji: '🪦',
    color: '#ef4444',
    pct: 95,
    desc: 'Major screen overload detected — but this is exactly why Brain Rehab exists. Every expert was once a beginner. You got this! 🚀',
    rehab: 'This is your turning point — Brain Rehab starts now',
  },
]

export function scoreToTier(total) {
  if (total <= 7) return 0
  if (total <= 15) return 1
  if (total <= 22) return 2
  return 3
}

export function calcFinalTier(diagnosisTier, arcadeScores) {
  const total = Object.values(arcadeScores).reduce((a, b) => a + b, 0)
  const improvement = total >= 200 ? 2 : total >= 80 ? 1 : 0
  return Math.max(0, diagnosisTier - improvement)
}
