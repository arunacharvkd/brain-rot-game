import { useCallback, useRef } from 'react'

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

/** Wall-clock from start() until elapsed() — intro screens are not counted. */
export function usePlayClock() {
  const startRef = useRef(0)

  const start = useCallback(() => {
    startRef.current = nowMs()
  }, [])

  const elapsed = useCallback(() => {
    if (!startRef.current) return 0
    return Math.max(0, Math.round(nowMs() - startRef.current))
  }, [])

  const reset = useCallback(() => {
    startRef.current = 0
  }, [])

  return { start, elapsed, reset }
}
