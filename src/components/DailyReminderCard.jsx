import { useEffect, useState } from 'react'
import NeonButton from './NeonButton'
import { t } from '../i18n/translations'
import { trackEvent } from '../lib/analytics'
import useGameStore from '../store/gameStore'
import {
  clampHour,
  formatHourLabel,
  guessPlatform,
  isStandaloneMode,
  loadReminderPrefs,
  pushLikelyUnavailable,
  saveReminderPrefs,
  showLocalReminder,
  urlBase64ToUint8Array,
} from '../lib/reminder'

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

async function fetchPushConfig() {
  const res = await fetch('/api/push', { headers: { Accept: 'application/json' } })
  if (!res.ok) return { vapidPublicKey: null, pushConfigured: false, durableStore: false }
  return res.json()
}

export default function DailyReminderCard({ compact = false }) {
  const language = useGameStore((s) => s.language)
  const [prefs, setPrefs] = useState(() => loadReminderPrefs())
  const [hourDraft, setHourDraft] = useState(() => loadReminderPrefs().hour)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [pushMeta, setPushMeta] = useState(null)

  useEffect(() => {
    fetchPushConfig()
      .then(setPushMeta)
      .catch(() => setPushMeta({ vapidPublicKey: null, pushConfigured: false }))
  }, [])

  const persist = (next) => {
    const saved = saveReminderPrefs(next)
    setPrefs(saved)
    return saved
  }

  const iosNeedsInstall = guessPlatform() === 'ios' && !isStandaloneMode()
  const pushBlocked = pushLikelyUnavailable() || !pushMeta?.pushConfigured

  const turnOn = async () => {
    setBusy(true)
    setStatus('')
    const hour = clampHour(hourDraft)
    trackEvent('daily_reminder_opt_in_clicked', { hour })

    if (pushBlocked || iosNeedsInstall) {
      persist({ enabled: true, hour, channel: 'in-app', lastNudgeOn: prefs.lastNudgeOn })
      setStatus(iosNeedsInstall ? t(language, 'reminderIosHint') : t(language, 'reminderInAppOnly'))
      setBusy(false)
      return
    }

    try {
      if (Notification.permission === 'denied') {
        persist({ enabled: true, hour, channel: 'in-app', lastNudgeOn: prefs.lastNudgeOn })
        setStatus(t(language, 'reminderDenied'))
        setBusy(false)
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        persist({ enabled: true, hour, channel: 'in-app', lastNudgeOn: prefs.lastNudgeOn })
        setStatus(t(language, 'reminderDenied'))
        setBusy(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pushMeta.vapidPublicKey),
      })

      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          subscription: subscription.toJSON(),
          hour,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        }),
      })

      if (!res.ok) {
        persist({ enabled: true, hour, channel: 'in-app', lastNudgeOn: prefs.lastNudgeOn })
        setStatus(t(language, 'reminderInAppOnly'))
        setBusy(false)
        return
      }

      persist({ enabled: true, hour, channel: 'push', lastNudgeOn: prefs.lastNudgeOn })
      setStatus(t(language, 'reminderOnPush'))
      trackEvent('daily_reminder_enabled', { channel: 'push', hour })
    } catch {
      persist({ enabled: true, hour, channel: 'in-app', lastNudgeOn: prefs.lastNudgeOn })
      setStatus(t(language, 'reminderInAppOnly'))
    }
    setBusy(false)
  }

  const turnOff = async () => {
    setBusy(true)
    trackEvent('daily_reminder_opt_out')
    try {
      const registration = await navigator.serviceWorker?.ready
      const subscription = await registration?.pushManager?.getSubscription()
      if (subscription) {
        await fetch('/api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'unsubscribe', endpoint: subscription.endpoint }),
        })
        await subscription.unsubscribe()
      }
    } catch {
      /* still disable locally */
    }
    persist({ enabled: false, hour: hourDraft, channel: 'off', lastNudgeOn: '' })
    setStatus(t(language, 'reminderOff'))
    setBusy(false)
  }

  const saveHour = async () => {
    const hour = clampHour(hourDraft)
    if (!prefs.enabled) {
      persist({ ...prefs, hour })
      return
    }
    persist({ ...prefs, hour })
    if (prefs.channel !== 'push') return
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) return
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          subscription: subscription.toJSON(),
          hour,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        }),
      })
    } catch {
      /* hour still saved on device */
    }
  }

  const testPing = async () => {
    try {
      await showLocalReminder()
      setStatus(t(language, 'reminderTestSent'))
    } catch {
      setStatus(t(language, 'reminderInAppOnly'))
    }
  }

  return (
    <div className={`daily-reminder ${compact ? 'daily-reminder--compact' : ''}`}>
      <p className="daily-drill-kicker">{t(language, 'reminderKicker')}</p>
      <h3>{t(language, 'reminderTitle')}</h3>
      <p className="text-muted text-sm">{t(language, 'reminderBlurb')}</p>

      <label className="daily-reminder-hour">
        <span>{t(language, 'reminderHourLabel')}</span>
        <select
          value={hourDraft}
          onChange={(event) => setHourDraft(Number(event.target.value))}
          onBlur={saveHour}
        >
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {formatHourLabel(hour)}
            </option>
          ))}
        </select>
      </label>
      <p className="daily-reminder-privacy text-sm">{t(language, 'reminderPrivacyNote')}</p>

      <div className="daily-reminder-actions">
        {!prefs.enabled ? (
          <>
            <NeonButton onClick={turnOn} variant="green" size="sm" disabled={busy}>
              {t(language, 'reminderTurnOn')}
            </NeonButton>
            <button
              type="button"
              className="daily-reminder-skip"
              onClick={() => setStatus(t(language, 'reminderSkipped'))}
            >
              {t(language, 'reminderNotNow')}
            </button>
          </>
        ) : (
          <>
            <NeonButton onClick={turnOff} variant="outline" size="sm" disabled={busy}>
              {t(language, 'reminderTurnOff')}
            </NeonButton>
            <button type="button" className="daily-reminder-skip" onClick={saveHour}>
              {t(language, 'reminderSaveHour')}
            </button>
            <button type="button" className="daily-reminder-skip" onClick={testPing}>
              {t(language, 'reminderTest')}
            </button>
          </>
        )}
      </div>

      {prefs.enabled && (
        <p className="daily-reminder-state text-sm">
          {t(language, 'reminderActive')
            .replace('{hour}', formatHourLabel(prefs.hour))
            .replace('{channel}', prefs.channel === 'push' ? t(language, 'reminderChannelPush') : t(language, 'reminderChannelInApp'))}
        </p>
      )}
      {status ? <p className="daily-reminder-status text-sm">{status}</p> : null}
    </div>
  )
}
