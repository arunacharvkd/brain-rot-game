import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { trackEvent, trackGameStart, trackGameComplete } from '../lib/analytics'

const useGameStore = create(
  persist(
    (set) => ({
      screen: 'landing',
      quizScore: 0,
      reactionScore: 0,
      diagnosisTier: 0,
      arcadeScores: {}, // { gameId: score }
      finalTier: 0,
      muted: false,
      language: 'en',

      setScreen: (screen) =>
        set((s) => {
          if (s.screen !== screen) {
            trackEvent('screen_navigate', {
              from_screen: s.screen,
              to_screen: screen,
            })
            trackGameStart(screen, s.screen)
          }
          return { screen }
        }),
      setQuizScore: (quizScore) => set({ quizScore }),
      setReactionScore: (reactionScore) => set({ reactionScore }),
      setDiagnosisTier: (diagnosisTier) => set({ diagnosisTier }),
      setArcadeScore: (id, score) =>
        set((s) => {
          const previousBest = s.arcadeScores[id]
          const nextBest = Math.max(score, previousBest ?? 0)
          trackGameComplete(id, score, previousBest)
          return { arcadeScores: { ...s.arcadeScores, [id]: nextBest } }
        }),
      setFinalTier: (finalTier) => set({ finalTier }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setLanguage: (language) => set({ language }),

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
        muted: s.muted,
        language: s.language,
      }),
    }
  )
)

export default useGameStore
