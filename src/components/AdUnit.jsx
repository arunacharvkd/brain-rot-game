import { useEffect, useRef } from 'react'

const AD_CLIENT = 'ca-pub-2337245858816005'

export default function AdUnit({ slot, width = 320, height = 100, className = '' }) {
  const pushed = useRef(false)
  // Real AdSense slot IDs are numeric; anything else is a placeholder awaiting approval.
  const isRealSlot = /^\d+$/.test(String(slot))

  useEffect(() => {
    if (!isRealSlot || pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [isRealSlot])

  if (!isRealSlot) {
    return <div className={`ad-unit ad-unit--placeholder ${className}`} aria-hidden="true" />
  }

  return (
    <div className={`ad-unit ${className}`}>
      {/* Fixed size (not data-ad-format="auto"): responsive ads make Google's script force ancestors to height:auto, breaking our fixed-viewport app shell. */}
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: `${width}px`, height: `${height}px` }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
      />
    </div>
  )
}
