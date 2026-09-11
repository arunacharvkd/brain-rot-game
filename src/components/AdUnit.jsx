import { useEffect, useRef } from 'react'
import { ADSENSE_CLIENT, ensureAdSenseScript, isAdSenseReady, isRealAdSlot } from '../data/ads'

export default function AdUnit({ slot, width = 320, height = 100, className = '' }) {
  const pushed = useRef(false)
  const ready = isAdSenseReady() && isRealAdSlot(slot)

  useEffect(() => {
    if (!ready) return
    let cancelled = false

    ensureAdSenseScript()?.then(() => {
      if (cancelled || pushed.current) return
      pushed.current = true
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch {
        /* AdSense may throw if the slot is already filled */
      }
    })

    return () => {
      cancelled = true
    }
  }, [ready, slot])

  if (!ready) return null

  return (
    <aside className={`ad-break ${className}`.trim()} aria-label="Advertisement">
      <p className="ad-break-label">Advertisement</p>
      <div className="ad-unit">
        {/* Fixed size (not data-ad-format="auto"): responsive ads make Google's script force ancestors to height:auto. */}
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: `${width}px`, height: `${height}px` }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
        />
      </div>
    </aside>
  )
}
