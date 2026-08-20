import { useCallback } from 'react'
import useGameStore from '../store/gameStore'

// Lazily created singleton so it's only made after a user gesture
let _ctx = null
function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {}
  }
  return _ctx
}

function tone(ctx, type, freq, duration, vol = 0.22, offset = 0) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.value = freq
  const t = ctx.currentTime + offset
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.start(t)
  osc.stop(t + duration)
}

export function useSound() {
  const muted = useGameStore((s) => s.muted)
  const play = useCallback((sound) => {
    if (muted) return
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    switch (sound) {
      case 'click':
        tone(ctx, 'sine', 600, 0.09, 0.18)
        break
      case 'select':
        tone(ctx, 'sine', 500, 0.1, 0.2)
        tone(ctx, 'sine', 660, 0.08, 0.09, 0.07)
        break
      case 'ding':
        tone(ctx, 'sine', 880, 0.15, 0.28)
        tone(ctx, 'sine', 1100, 0.1, 0.15, 0.1)
        break
      case 'buzz':
        tone(ctx, 'sawtooth', 110, 0.18, 0.32)
        break
      case 'tick':
        tone(ctx, 'square', 420, 0.045, 0.14)
        break
      case 'win':
        ;[440, 550, 660, 880].forEach((freq, i) =>
          tone(ctx, 'sine', freq, 0.28, 0.28, i * 0.11)
        )
        break
      default:
        break
    }
  }, [muted])

  return { play }
}
