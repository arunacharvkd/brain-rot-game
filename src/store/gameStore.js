import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { trackEvent, trackGameStart, trackGameComplete } from '../lib/analytics'
import { getScreenFromPath } from '../lib/routes'
import { applyDailyComplete } from '../lib/daily'

const useGameStore = create(
  persist(
    (set, get) => ({
      screen: typeof window !== 'undefined' ? getScreenFromPath(window.location.pathname) : 'landing',
      quizScore: 0,
      reactionScore: 0,
      diagnosisTier: 0,
      arcadeScores: {},
      finalTier: 0,
      muted: false,
      language: 'en',
      dailyMode: false,
      daily: { streak: 0, lastPlayedOn: '', lastScore: 0, lastGameId: '' },
      visit: null,
      challenge: null,
      sharedCard: null,

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
          const next = {
            arcadeScores: { ...s.arcadeScores, [id]: nextBest },
          }
          if (s.dailyMode) {
            next.daily = applyDailyComplete(s.daily, id, score)
          }
          return next
        }),
      setFinalTier: (finalTier) => set({ finalTier }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setLanguage: (language) => set({ language }),
      startDaily: (screen) => set({ dailyMode: true, screen }),
      clearDailyMode: () => set({ dailyMode: false }),
      exitToHub: () =>
        set((s) => ({
          screen: s.dailyMode ? 'landing' : 'arcade',
          dailyMode: false,
        })),
      setChallenge: (challenge) => set({ challenge }),
      setSharedCard: (sharedCard) => set({ sharedCard }),
      recordVisit: (current) => {
        const prev = get().visit
        if (
          prev?.current &&
          prev.current.totalScore === current.totalScore &&
          prev.current.diagnosisTier === current.diagnosisTier &&
          prev.current.finalTier === current.finalTier
        ) {
          return prev
        }
        const next = { previous: prev?.current ?? null, current }
        set({ visit: next })
        return next
      },
      acceptChallenge: (challenge) =>
        set({
          challenge,
          quizScore: 0,
          reactionScore: 0,
          diagnosisTier: 0,
          arcadeScores: {},
          finalTier: 0,
          dailyMode: false,
          screen: 'quiz',
        }),
      clearChallenge: () => set({ challenge: null }),

      reset: () =>
        set({
          screen: 'landing',
          quizScore: 0,
          reactionScore: 0,
          diagnosisTier: 0,
          arcadeScores: {},
          finalTier: 0,
          dailyMode: false,
          challenge: null,
        }),
      resetProgress: () =>
        set({
          screen: 'landing',
          quizScore: 0,
          reactionScore: 0,
          diagnosisTier: 0,
          arcadeScores: {},
          finalTier: 0,
          dailyMode: false,
          challenge: null,
          visit: null,
          daily: { streak: 0, lastPlayedOn: '', lastScore: 0, lastGameId: '' },
        }),
    }),
    {
      name: 'brain-rot-save',
      partialize: (s) => ({
        quizScore: s.quizScore,
        reactionScore: s.reactionScore,
        diagnosisTier: s.diagnosisTier,
        arcadeScores: s.arcadeScores,
        finalTier: s.finalTier,
        muted: s.muted,
        language: s.language,
        daily: s.daily,
        visit: s.visit,
        challenge: s.challenge,
      }),
    }
  )
)

export default useGameStore
