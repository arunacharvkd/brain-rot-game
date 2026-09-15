export const REMINDER_STORAGE_KEY = 'brc-daily-reminder'
export const DEFAULT_REMINDER_HOUR = 9
export const REMINDER_TITLE = 'Your 60s drill is up'
export const REMINDER_BODY = 'Test. Train. Transform.'

export function defaultReminderPrefs() {
  return {
    enabled: false,
    hour: DEFAULT_REMINDER_HOUR,
    channel: 'off',
    lastNudgeOn: '',
  }
}

export function clampHour(value) {
  const hour = Number(value)
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return DEFAULT_REMINDER_HOUR
  return hour
}

export function normalizeReminderPrefs(raw) {
  const base = defaultReminderPrefs()
  if (!raw || typeof raw !== 'object') return base
  const channel = raw.channel === 'push' || raw.channel === 'in-app' ? raw.channel : 'off'
  return {
    enabled: Boolean(raw.enabled) && channel !== 'off',
    hour: clampHour(raw.hour),
    channel: raw.enabled ? channel : 'off',
    lastNudgeOn: typeof raw.lastNudgeOn === 'string' ? raw.lastNudgeOn.slice(0, 10) : '',
  }
}

export function loadReminderPrefs() {
  if (typeof localStorage === 'undefined') return defaultReminderPrefs()
  try {
    return normalizeReminderPrefs(JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY) || 'null'))
  } catch {
    return defaultReminderPrefs()
  }
}

export function saveReminderPrefs(prefs) {
  const next = normalizeReminderPrefs(prefs)
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function localDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function shouldShowNudge(prefs, { playedToday, now = new Date() } = {}) {
  const state = normalizeReminderPrefs(prefs)
  if (!state.enabled) return false
  if (playedToday) return false
  if (state.lastNudgeOn === localDateKey(now)) return false
  if (now.getHours() < state.hour) return false
  return true
}

export function formatHourLabel(hour) {
  const clamped = clampHour(hour)
  const suffix = clamped >= 12 ? 'PM' : 'AM'
  const twelve = clamped % 12 === 0 ? 12 : clamped % 12
  return `${twelve}:00 ${suffix}`
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

export function guessPlatform() {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios'
  if (ua.includes('android')) return 'android'
  return 'desktop'
}

export function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  const iosStandalone = Boolean(window.navigator.standalone)
  const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches
  return iosStandalone || displayModeStandalone
}

export function pushLikelyUnavailable() {
  if (typeof window === 'undefined') return true
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return true
  if (guessPlatform() === 'ios' && !isStandaloneMode()) return true
  return false
}

export async function showLocalReminder(registration) {
  const reg = registration || (await navigator.serviceWorker?.ready)
  if (!reg?.showNotification) {
    if (typeof Notification !== 'undefined') {
      new Notification(REMINDER_TITLE, { body: REMINDER_BODY })
    }
    return
  }
  await reg.showNotification(REMINDER_TITLE, {
    body: REMINDER_BODY,
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    tag: 'daily-drill',
    renotify: true,
    data: { url: '/' },
  })
}
