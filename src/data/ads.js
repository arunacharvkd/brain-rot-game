function envValue(key) {
  const value = import.meta.env[key]
  return value === undefined ? undefined : String(value).trim()
}

function envOr(key, fallback) {
  const value = envValue(key)
  return value === undefined ? fallback : value
}

/** Publisher id from .env (`VITE_ADSENSE_CLIENT`). Empty string disables ads. */
export const ADSENSE_CLIENT = envOr('VITE_ADSENSE_CLIENT', 'ca-pub-2337245858816005')

/**
 * Slot ids from AdSense → Ads → By ad unit.
 * Override with VITE_ADSENSE_SLOT_* in `.env`. An empty override disables that placement.
 */
export const AD_SLOTS = {
  landing: envOr('VITE_ADSENSE_SLOT_LANDING', '6464500794'),
  diagnosis: envOr('VITE_ADSENSE_SLOT_DIAGNOSIS', '6464500794'),
  arcade: envOr('VITE_ADSENSE_SLOT_ARCADE', '6464500794'),
  results: envOr('VITE_ADSENSE_SLOT_RESULTS', '6464500794'),
}

export function isAdSenseReady() {
  return /^ca-pub-\d+$/.test(ADSENSE_CLIENT)
}

export function isRealAdSlot(slot) {
  return /^\d+$/.test(String(slot || ''))
}

let adsenseLoader = null

export function ensureAdSenseScript() {
  if (!isAdSenseReady() || typeof document === 'undefined') return
  if (document.querySelector('script[data-adsense="1"]')) return
  if (adsenseLoader) return adsenseLoader

  adsenseLoader = new Promise((resolve) => {
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.dataset.adsense = '1'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })

  return adsenseLoader
}
