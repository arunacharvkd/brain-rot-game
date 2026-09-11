const TIER_CLAMP = (n) => {
  const v = Number(n)
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(3, Math.round(v)))
}

export function encodePayload(obj) {
  const json = JSON.stringify(obj)
  const bytes = new TextEncoder().encode(json)
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function decodePayload(str) {
  if (!str || typeof str !== 'string') return null
  try {
    const pad = str.replace(/-/g, '+').replace(/_/g, '/')
    const padded = pad + '='.repeat((4 - (pad.length % 4)) % 4)
    const bin = atob(padded)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i)
    const json = new TextDecoder().decode(bytes)
    const data = JSON.parse(json)
    if (!data || (data.k !== 'r' && data.k !== 'c')) return null
    return sanitizePayload(data)
  } catch {
    return null
  }
}

function sanitizeName(name) {
  return String(name || 'Friend')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 18) || 'Friend'
}

function sanitizeArcade(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  for (const [id, score] of Object.entries(raw)) {
    const n = Number(score)
    if (!id || id.length > 16 || !Number.isFinite(n)) continue
    out[String(id).slice(0, 16)] = Math.max(0, Math.min(9999, Math.round(n)))
  }
  return out
}

export function sanitizePayload(data) {
  const arcade = sanitizeArcade(data.a)
  const totalScore = Number.isFinite(Number(data.s))
    ? Math.max(0, Math.round(Number(data.s)))
    : Object.values(arcade).reduce((sum, n) => sum + n, 0)
  return {
    k: data.k === 'c' ? 'c' : 'r',
    n: sanitizeName(data.n),
    q: Math.max(0, Math.min(21, Math.round(Number(data.q) || 0))),
    r: Math.max(0, Math.min(9, Math.round(Number(data.r) || 0))),
    d: TIER_CLAMP(data.d),
    f: TIER_CLAMP(data.f),
    s: totalScore,
    g: Math.max(0, Math.min(9, Math.round(Number(data.g) || Object.keys(arcade).length || 0))),
    a: arcade,
  }
}

export function buildRunPayload(kind, state, name) {
  const arcade = state.arcadeScores || {}
  const totalScore = Object.values(arcade).reduce((sum, n) => sum + n, 0)
  return sanitizePayload({
    k: kind,
    n: name,
    q: state.quizScore,
    r: state.reactionScore,
    d: state.diagnosisTier,
    f: state.finalTier,
    s: totalScore,
    g: Object.keys(arcade).length,
    a: arcade,
  })
}

export function sharePath(payload) {
  return `/s?p=${encodePayload(payload)}`
}

export function shareAbsoluteUrl(payload, origin = (typeof window !== 'undefined' ? window.location.origin : 'https://brainrotchecker.com')) {
  return `${origin}${sharePath(payload)}`
}

export function whoMoreNpc(a, b) {
  const key = (x) => [
    x.d ?? x.diagnosisTier ?? 0,
    x.f ?? x.finalTier ?? 0,
    (x.q ?? x.quizScore ?? 0) + (x.r ?? x.reactionScore ?? 0),
    -(x.s ?? x.totalScore ?? 0),
  ]
  const ka = key(a)
  const kb = key(b)
  for (let i = 0; i < ka.length; i += 1) {
    if (ka[i] !== kb[i]) return ka[i] > kb[i] ? 'a' : 'b'
  }
  return 'tie'
}
