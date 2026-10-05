import useGameStore from '../store/gameStore'
import BrandMark from './BrandMark'
import { t } from '../i18n/translations'
import { getPageByScreen } from '../data/pages'

const FOOTER_PAGES = ['guides', 'about', 'faq'].map((screen) => getPageByScreen(screen))

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
        {FOOTER_PAGES.map((page) => (
          <a
            key={page.id}
            href={page.path}
            onClick={(event) => {
              event.preventDefault()
              setScreen(page.screen)
            }}
          >
            {page.nav}
          </a>
        ))}
        <a href="/privacy" onClick={(event) => { event.preventDefault(); setScreen('privacy') }}>
          {t(language, 'privacyPolicy')}
        </a>
        <a href="mailto:vkdarunacharya@gmail.com">{t(language, 'contact')}</a>
      </div>
    </footer>
  )
}
