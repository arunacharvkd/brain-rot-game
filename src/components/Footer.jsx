import useGameStore from '../store/gameStore'
import BrandMark from './BrandMark'
import { t } from '../i18n/translations'

export default function Footer() {
  const setScreen = useGameStore((s) => s.setScreen)
  const language = useGameStore((s) => s.language)

  return (
    <footer className="global-footer">
      <div className="global-footer-brand">
        <button type="button" className="global-footer-logo" onClick={() => setScreen('landing')} aria-label="BRC home">
          <BrandMark size={28} />
        </button>
        <span>© 2026 Brain Rot Checker · {t(language, 'footerNote')}</span>
      </div>
      <div className="global-footer-links">
        <button role="link" onClick={() => setScreen('privacy')}>{t(language, 'privacyPolicy')}</button>
        <a href="mailto:vkdarunacharya@gmail.com">{t(language, 'contact')}</a>
      </div>
    </footer>
  )
}
