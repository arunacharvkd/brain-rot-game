import { decodePayload } from '../src/lib/codec.js'

const TIERS = [
  { label: 'CLEAN SIGMA', emoji: '🧼', color: '#2ECC96' },
  { label: 'MILDLY GLAZED', emoji: '🍩', color: '#FCD34D' },
  { label: 'SKIBIDI SYNDROME', emoji: '🚿', color: '#FB923C' },
  { label: 'FULL OHIO MODE', emoji: '🪦', color: '#F87171' },
]

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default function handler(req, res) {
  const payload = decodePayload(String(req.query?.p || ''))
  const d = payload ? TIERS[payload.d] : TIERS[0]
  const f = payload ? TIERS[payload.f] : TIERS[1]
  const score = payload ? payload.s : 0
  const games = payload ? payload.g : 0
  const name = payload?.n && payload.n !== 'Friend' ? `${esc(payload.n)} · ` : ''

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B1224"/>
      <stop offset="100%" stop-color="#1a1040"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="160" cy="0" r="260" fill="#3B82F6" fill-opacity="0.22"/>
  <circle cx="1080" cy="680" r="300" fill="#7C3AED" fill-opacity="0.2"/>
  <rect x="48" y="40" width="1104" height="550" rx="28" fill="#ffffff" fill-opacity="0.06" stroke="#4F7CFF" stroke-opacity="0.35"/>
  <text x="80" y="110" fill="#F4F1FF" font-size="36" font-family="Arial, sans-serif" font-weight="700">BrainRotChecker</text>
  <text x="80" y="148" fill="#9AA3C7" font-size="22" font-family="Arial, sans-serif">Test. Train. Transform.</text>
  <text x="80" y="250" fill="#F4F1FF" font-size="52" font-family="Arial, sans-serif" font-weight="700">${esc(f.emoji)}  ${esc(name)}${esc(f.label)}</text>
  <text x="80" y="310" fill="#9AA3C7" font-size="26" font-family="Arial, sans-serif">Was ${esc(d.emoji)} ${esc(d.label)}</text>
  <text x="80" y="400" fill="#2ECC96" font-size="48" font-family="Arial, sans-serif" font-weight="700">${esc(score)} pts</text>
  <text x="80" y="450" fill="#9AA3C7" font-size="24" font-family="Arial, sans-serif">across ${esc(games)} rehab games</text>
  <text x="80" y="530" fill="#A78BFA" font-size="22" font-family="Arial, sans-serif">Are you more NPC? · brainrotchecker.com</text>
</svg>`

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  res.statusCode = 200
  res.end(svg)
}
