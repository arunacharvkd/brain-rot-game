import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useGameStore = create(
  persist(
    (set) => ({
      screen: 'landing',
      quizScore: 0,
      reactionScore: 0,
      diagnosisTier: 0,
      arcadeScores: {}, // { gameId: score }
      finalTier: 0,

      setScreen: (screen) => set({ screen }),
      setQuizScore: (quizScore) => set({ quizScore }),
      setReactionScore: (reactionScore) => set({ reactionScore }),
      setDiagnosisTier: (diagnosisTier) => set({ diagnosisTier }),
      setArcadeScore: (id, score) =>
        set((s) => ({ arcadeScores: { ...s.arcadeScores, [id]: score } })),
      setFinalTier: (finalTier) => set({ finalTier }),

      reset: () =>
        set({
          screen: 'landing',
          quizScore: 0,
          reactionScore: 0,
          diagnosisTier: 0,
          arcadeScores: {},
          finalTier: 0,
        }),
    }),
    {
      name: 'brain-rot-save',
      // only persist scores, not the active screen
      partialize: (s) => ({
        quizScore: s.quizScore,
        reactionScore: s.reactionScore,
        diagnosisTier: s.diagnosisTier,
        arcadeScores: s.arcadeScores,
        finalTier: s.finalTier,
      }),
    }
  )
)

export default useGameStore
