import { TIERS } from '../data/tiers'

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function renderResultCardBlob({
  diagnosisTier = 0,
  finalTier = 0,
  totalScore = 0,
  gamesPlayed = 0,
  name = '',
}) {
  const w = 1200
  const h = 630
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#0B1224')
  bg.addColorStop(0.55, '#121A33')
  bg.addColorStop(1, '#1a1040')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(59,130,246,0.22)'
  ctx.beginPath()
  ctx.arc(180, -40, 280, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(124,58,237,0.2)'
  ctx.beginPath()
  ctx.arc(1080, 700, 340, 0, Math.PI * 2)
  ctx.fill()

  roundRect(ctx, 48, 40, w - 96, h - 80, 28)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(79,124,255,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()

  try {
    const logo = await loadImage('/brc-logo-sm.jpg')
    ctx.save()
    roundRect(ctx, 80, 68, 72, 72, 14)
    ctx.clip()
    ctx.drawImage(logo, 80, 68, 72, 72)
    ctx.restore()
  } catch {
    /* logo optional */
  }

  ctx.fillStyle = '#F4F1FF'
  ctx.font = '800 36px Plus Jakarta Sans, system-ui, sans-serif'
  ctx.fillText('BrainRotChecker', 172, 100)
  ctx.fillStyle = '#9AA3C7'
  ctx.font = '600 20px Plus Jakarta Sans, system-ui, sans-serif'
  ctx.fillText('Test. Train. Transform.', 172, 130)

  if (name) {
    ctx.fillStyle = '#A78BFA'
    ctx.font = '600 22px Plus Jakarta Sans, system-ui, sans-serif'
    ctx.fillText(`${name}'s rehab card`, 80, 180)
  }

  const before = TIERS[diagnosisTier] || TIERS[0]
  const after = TIERS[finalTier] || TIERS[0]

  ctx.font = '800 58px Plus Jakarta Sans, system-ui, sans-serif'
  ctx.fillStyle = '#F4F1FF'
  ctx.fillText(`${after.emoji}  ${after.label}`, 80, 280)

  ctx.font = '600 26px Plus Jakarta Sans, system-ui, sans-serif'
  ctx.fillStyle = '#9AA3C7'
  ctx.fillText(`Was ${before.emoji} ${before.label}  →  now ${after.label}`, 80, 330)

  ctx.font = '800 48px JetBrains Mono, ui-monospace, monospace'
  ctx.fillStyle = '#2ECC96'
  ctx.fillText(`${totalScore} pts`, 80, 430)

  ctx.font = '600 24px Plus Jakarta Sans, system-ui, sans-serif'
  ctx.fillStyle = '#9AA3C7'
  ctx.fillText(`across ${gamesPlayed} rehab game${gamesPlayed === 1 ? '' : 's'}`, 80, 472)

  ctx.font = '600 20px Plus Jakarta Sans, system-ui, sans-serif'
  ctx.fillStyle = '#A78BFA'
  ctx.fillText('Are you more NPC? brainrotchecker.com', 80, 540)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('card_blob_failed'))
    }, 'image/png')
  })
}

export function resultShareText({ diagnosisTier, finalTier, totalScore, gamesPlayed, url }) {
  const before = TIERS[diagnosisTier] || TIERS[0]
  const after = TIERS[finalTier] || TIERS[0]
  return [
    '🧠 Brain Rot Test Results',
    `Diagnosis: ${before.emoji} ${before.label}`,
    `After Rehab: ${after.emoji} ${after.label}`,
    `Total Score: ${totalScore} pts across ${gamesPlayed} game${gamesPlayed !== 1 ? 's' : ''}`,
    '',
    'Are you cooked? Find out:',
    url,
  ].join('\n')
}

export async function shareResult({ title, text, url, blob }) {
  const file = blob ? new File([blob], 'brc-result.png', { type: 'image/png' }) : null
  if (file && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, text, url, files: [file] })
    return 'native_file'
  }
  if (navigator.share) {
    await navigator.share({ title, text, url })
    return 'native_share'
  }
  const clip = [text, url].filter(Boolean).join('\n')
  await navigator.clipboard.writeText(clip)
  return 'clipboard'
}
