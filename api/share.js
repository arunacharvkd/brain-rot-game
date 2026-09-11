import { decodePayload } from '../src/lib/codec.js'

const TIERS = [
  { label: 'CLEAN SIGMA', emoji: '🧼' },
  { label: 'MILDLY GLAZED', emoji: '🍩' },
  { label: 'SKIBIDI SYNDROME', emoji: '🚿' },
  { label: 'FULL OHIO MODE', emoji: '🪦' },
]

const BOT_UA = /bot|crawl|facebookexternalhit|facebot|twitterbot|slackbot|whatsapp|telegrambot|discordbot|linkedinbot|pinterest|skypeuripreview|embedly|quora|redditbot|applebot|bingpreview|googlebot/i

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function originFromReq(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'brainrotchecker.com'
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

export default function handler(req, res) {
  const p = String(req.query?.p || '')
  const origin = originFromReq(req)
  const ua = String(req.headers['user-agent'] || '')
  const isBot = BOT_UA.test(ua)
  const appUrl = `${origin}/?p=${encodeURIComponent(p)}`

  if (!isBot) {
    res.statusCode = 302
    res.setHeader('Location', appUrl)
    res.end()
    return
  }

  const payload = decodePayload(p)
  const tier = payload ? TIERS[payload.k === 'c' ? payload.d : payload.f] : TIERS[0]
  const title = payload?.k === 'c'
    ? `${payload.n} challenged you — are you more NPC?`
    : `${tier.emoji} ${tier.label} · ${payload ? payload.s : 0} pts`
  const description = payload?.k === 'c'
    ? `${payload.n} is ${TIERS[payload.d].emoji} ${TIERS[payload.d].label}. Take the Brain Rot Test and compare.`
    : `After rehab: ${tier.label}. ${payload ? payload.s : 0} pts across ${payload ? payload.g : 0} games. Test. Train. Transform.`
  const image = `${origin}/api/og?p=${encodeURIComponent(p)}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(description)}"/>
  <meta property="og:image" content="${esc(image)}"/>
  <meta property="og:url" content="${esc(`${origin}/s?p=${encodeURIComponent(p)}`)}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${esc(title)}"/>
  <meta name="twitter:description" content="${esc(description)}"/>
  <meta name="twitter:image" content="${esc(image)}"/>
  <link rel="canonical" href="${esc(appUrl)}"/>
</head>
<body>
  <p>${esc(title)}</p>
  <p><a href="${esc(appUrl)}">Open BrainRotChecker</a></p>
</body>
</html>`

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.end(html)
}
