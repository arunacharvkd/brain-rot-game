import useGameStore from '../store/gameStore'
import { t } from '../i18n/translations'

export default function Footer() {
  const setScreen = useGameStore((s) => s.setScreen)
  const language = useGameStore((s) => s.language)

  return (
    <footer className="global-footer">
      <span>© 2026 Brain Rot Checker · {t(language, 'footerNote')}</span>
      <div className="global-footer-links">
        <button onClick={() => setScreen('privacy')}>{t(language, 'privacyPolicy')}</button>
        <a href="mailto:vkdarunacharya@gmail.com">{t(language, 'contact')}</a>
      </div>
    </footer>
  )
}
