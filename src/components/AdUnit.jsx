import { useEffect, useRef } from 'react'

const AD_CLIENT = 'ca-pub-2337245858816005'

export default function AdUnit({ slot, format = 'auto', className = '' }) {
  const pushed = useRef(false)
  // Real AdSense slot IDs are numeric; anything else is a placeholder awaiting approval.
  // Only render live ads in production — an unfilled/unapproved ad's iframe can trap mouse-wheel scroll during local dev.
  const isRealSlot = import.meta.env.PROD && /^\d+$/.test(String(slot))

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
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
