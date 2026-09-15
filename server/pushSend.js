import webpush from 'web-push'
import { listSubscriptions, saveSubscription, removeSubscription, hasDurableStore } from './pushStore.js'

export const REMINDER_TITLE = 'Your 60s drill is up'
export const REMINDER_BODY = 'Test. Train. Transform.'

const TZ_RE = /^[A-Za-z0-9_+\-\/]{1,64}$/

export function vapidPublicKey() {
  return String(process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || '').trim()
}

function vapidPrivateKey() {
  return String(process.env.VAPID_PRIVATE_KEY || '').trim()
}

export function pushConfigured() {
  return Boolean(vapidPublicKey() && vapidPrivateKey())
}

export function configureWebPush() {
  if (!pushConfigured()) return false
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'https://brainrotchecker.com',
    vapidPublicKey(),
    vapidPrivateKey(),
  )
  return true
}

export function localHourInTz(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: timeZone || 'UTC',
    }).formatToParts(date)
    const hour = Number(parts.find((part) => part.type === 'hour')?.value)
    return Number.isFinite(hour) ? hour : date.getUTCHours()
  } catch {
    return date.getUTCHours()
  }
}

export function localDateKeyInTz(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: timeZone || 'UTC',
    }).formatToParts(date)
    const pick = (type) => parts.find((part) => part.type === type)?.value
    return `${pick('year')}-${pick('month')}-${pick('day')}`
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

export function sanitizeSubscribeInput(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid body' }
  const subscription = body.subscription
  const endpoint = typeof subscription?.endpoint === 'string' ? subscription.endpoint.trim() : ''
  const p256dh = typeof subscription?.keys?.p256dh === 'string' ? subscription.keys.p256dh.trim() : ''
  const auth = typeof subscription?.keys?.auth === 'string' ? subscription.keys.auth.trim() : ''
  const hour = Number(body.hour)
  const tz = typeof body.tz === 'string' ? body.tz.trim() : ''

  if (!endpoint.startsWith('https://') || endpoint.length > 2048) return { error: 'Invalid endpoint' }
  if (!p256dh || !auth || p256dh.length > 256 || auth.length > 256) return { error: 'Invalid keys' }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return { error: 'Invalid hour' }
  if (!TZ_RE.test(tz)) return { error: 'Invalid timezone' }

  return {
    record: {
      endpoint,
      keys: { p256dh, auth },
      hour,
      tz,
    },
  }
}

export async function sendDailyTick(now = new Date()) {
  if (!configureWebPush()) {
    return { ok: false, error: 'push_not_configured', sent: 0 }
  }
  const subs = await listSubscriptions()
  let sent = 0
  let skipped = 0
  let removed = 0
  const payload = JSON.stringify({
    title: REMINDER_TITLE,
    body: REMINDER_BODY,
    url: '/',
  })

  for (const sub of subs) {
    if (localHourInTz(now, sub.tz) !== sub.hour) {
      skipped += 1
      continue
    }
    const dayKey = localDateKeyInTz(now, sub.tz)
    if (sub.lastSentOn === dayKey) {
      skipped += 1
      continue
    }
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload,
        { TTL: 60 * 60 },
      )
      sent += 1
      await saveSubscription({ ...sub, lastSentOn: dayKey })
    } catch (error) {
      const status = error?.statusCode
      if (status === 404 || status === 410) {
        await removeSubscription(sub.endpoint)
        removed += 1
      }
    }
  }

  return { ok: true, sent, skipped, removed, store: hasDurableStore() ? 'kv' : 'ephemeral' }
}

export { hasDurableStore }
