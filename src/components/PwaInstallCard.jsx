import { useEffect, useMemo, useState } from 'react'
import NeonButton from './NeonButton'
import { trackEvent } from '../lib/analytics'

const INSTALL_GUIDES = {
  desktop: [
    'Open this website in Chrome or Edge.',
    'Click the install icon in the address bar, or open browser menu.',
    'Select "Install BrainRotChecker" and confirm.',
  ],
  android: [
    'Open this website in Chrome on Android.',
    'Tap the browser menu (three dots).',
    'Tap "Add to Home screen" or "Install app".',
  ],
  ios: [
    'Open this website in Safari on iPhone or iPad.',
    'Tap the Share icon at the bottom toolbar.',
    'Choose "Add to Home Screen" and confirm.',
  ],
}

function guessPlatform() {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios'
  if (ua.includes('android')) return 'android'
  return 'desktop'
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  const iosStandalone = Boolean(window.navigator.standalone)
  const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches
  return iosStandalone || displayModeStandalone
}

export default function PwaInstallCard() {
  const [activeGuide, setActiveGuide] = useState(guessPlatform)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [status, setStatus] = useState(() => (isStandaloneMode() ? 'installed' : 'idle'))
  const [showGuide, setShowGuide] = useState(() => !isStandaloneMode())
  const [toastText, setToastText] = useState('')

  const canPromptInstall = useMemo(() => Boolean(deferredPrompt), [deferredPrompt])

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      trackEvent('pwa_install_prompt_ready')
    }

    const onInstalled = () => {
      setStatus('installed')
      setDeferredPrompt(null)
      setShowGuide(false)
      setToastText('App installed successfully.')
      trackEvent('pwa_installed')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    if (!toastText) return undefined
    const timer = window.setTimeout(() => setToastText(''), 3000)
    return () => window.clearTimeout(timer)
  }, [toastText])

  const installNow = async () => {
    if (!deferredPrompt) return

    setStatus('waiting')
    trackEvent('pwa_install_clicked')
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)

    if (choice?.outcome === 'accepted') {
      setStatus('installed')
      setShowGuide(false)
      setToastText('App installed successfully.')
      trackEvent('pwa_install_choice', { outcome: 'accepted' })
      return
    }

    setStatus('dismissed')
    setToastText('Install canceled. You can try again anytime.')
    trackEvent('pwa_install_choice', { outcome: 'dismissed' })
  }

  return (
    <div className="landing-install-card">
      <div className="landing-install-head">
        <p className="landing-sponsor-eyebrow">Installable PWA</p>
        <h2>Install BrainRotChecker Like an App</h2>
        <p className="landing-block-intro">
          Save it to your device for quicker launch and a full-screen app feel.
          You can switch install instructions based on your device.
        </p>
      </div>

      <div className="landing-install-actions">
        {status !== 'installed' && (
          <>
            <NeonButton
              variant="green"
              onClick={installNow}
              disabled={!canPromptInstall || status === 'waiting'}
            >
              Install App
            </NeonButton>
            {!canPromptInstall && (
              <span className="landing-install-note">Install prompt not available on this browser yet. Use guide below.</span>
            )}
          </>
        )}
        {status === 'installed' && <span className="landing-install-ok">Installed on this device</span>}
      </div>

      {status === 'installed' && (
        <button className="landing-install-guide-toggle" onClick={() => setShowGuide((v) => !v)}>
          {showGuide ? 'Hide Setup Guides' : 'Show Setup Guides for Other Devices'}
        </button>
      )}

      {showGuide && (
        <>
          <div className="landing-install-guide-switch">
            <button
              className={activeGuide === 'desktop' ? 'is-active' : ''}
              onClick={() => {
                setActiveGuide('desktop')
                trackEvent('pwa_install_guide_selected', { platform: 'desktop' })
              }}
            >
              Desktop
            </button>
            <button
              className={activeGuide === 'android' ? 'is-active' : ''}
              onClick={() => {
                setActiveGuide('android')
                trackEvent('pwa_install_guide_selected', { platform: 'android' })
              }}
            >
              Android
            </button>
            <button
              className={activeGuide === 'ios' ? 'is-active' : ''}
              onClick={() => {
                setActiveGuide('ios')
                trackEvent('pwa_install_guide_selected', { platform: 'ios' })
              }}
            >
              iPhone/iPad
            </button>
          </div>

          <ol className="landing-install-steps">
            {INSTALL_GUIDES[activeGuide].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </>
      )}

      {toastText && <div className="landing-install-toast">{toastText}</div>}
    </div>
  )
}
