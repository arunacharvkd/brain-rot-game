import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore'
import NeonButton from '../components/NeonButton'
import PwaInstallCard from '../components/PwaInstallCard'
import { SPONSOR, SUPPORTING_SPONSORS } from '../data/tiers'
import { trackEvent } from '../lib/analytics'
import { t, LANGUAGES } from '../i18n/translations'

function getSponsorMeta(item) {
  const url = (item.url || '').toLowerCase()
  const platform = item.platform || (url.includes('instagram.com') ? 'instagram' : 'web')
  const handle = item.handle || deriveHandle(item.url)
  const cta = platform === 'instagram' ? 'Visit on Instagram' : 'Visit Sponsor'
  const platformLabel = platform === 'instagram' ? 'Instagram' : 'Partner'
  return { platform, handle, cta, platformLabel }
}

function deriveHandle(url) {
  if (!url) return ''
  try {
    const pathname = new URL(url).pathname
    const segment = pathname.split('/').filter(Boolean)[0]
    if (!segment) return ''
    return `@${segment}`
  } catch {
    return ''
  }
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.48, delay },
})

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const setScreen = useGameStore((s) => s.setScreen)
  const hasPriorScore = useGameStore((s) => s.quizScore > 0)
  const diagnosisDone = useGameStore((s) => s.diagnosisTier > 0 || s.quizScore > 0)
  const gameDone = useGameStore((s) => Object.keys(s.arcadeScores).length > 0)
  const reset = useGameStore((s) => s.reset)
  const language = useGameStore((s) => s.language)
  const setLanguage = useGameStore((s) => s.setLanguage)
  const muted = useGameStore((s) => s.muted)
  const toggleMute = useGameStore((s) => s.toggleMute)
  const activeSupportingSponsors = SUPPORTING_SPONSORS.filter((item) => item.active)

  const scrollTo = (id) => {
    setMenuOpen(false)
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, menuOpen ? 280 : 0)
  }

  return (
    <motion.div
      className="screen landing-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <div className="landing-shell">

        {/* ── Topbar ── */}
        <motion.div className="landing-topbar" {...fadeUp(0.06)}>
          <div className="landing-brand-wrap">
            <img src="/ta-logo.svg" alt="TA logo" className="landing-brand-logo" />
            <div>
              <div className="landing-brand">BrainRotChecker</div>
              <div className="landing-brand-sub">focus diagnostics + rehab arcade</div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="landing-nav-desktop">
            <div className="landing-links">
              <button onClick={() => scrollTo('home')}>{t(language, 'home')}</button>
              {/* <button onClick={() => scrollTo('install')}>{t(language, 'installApp')}</button> */}
              <button onClick={() => scrollTo('about')}>{t(language, 'about')}</button>
              {(SPONSOR.active || activeSupportingSponsors.length > 0) && (
                <button onClick={() => scrollTo('sponsor')}>Sponsor</button>
              )}
              <button onClick={() => scrollTo('contact')}>{t(language, 'contact')}</button>
            </div>
            <label className="landing-lang-picker">
              <span className="sr-only">Language</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map(({ code, label }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </label>
            <button className="landing-topbar-cta" onClick={() => {
              trackEvent('landing_cta_clicked', { cta: 'start_test_topbar' })
              setScreen('quiz')
            }}>
              {t(language, 'startTest')}
            </button>
          </div>

          {/* Mobile controls */}
          <div className="landing-nav-mobile">
            <button
              className="landing-mob-icon-btn"
              onClick={toggleMute}
              title={muted ? 'Unmute' : 'Mute'}
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button
              className={`landing-hamburger${menuOpen ? ' is-open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </motion.div>

        {/* ── Mobile slide-down menu ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="landing-mobile-menu"
              className="landing-mobile-menu"
              initial={{ opacity: 0, y: -12, scaleY: 0.92 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{ originY: 0 }}
            >
              <nav className="landing-mobile-nav">
                {[
                  ['home', t(language, 'home')],
                  ['install', t(language, 'installApp')],
                  ['about', t(language, 'about')],
                  ...(SPONSOR.active || activeSupportingSponsors.length > 0 ? [['sponsor', 'Sponsor']] : []),
                  ['contact', t(language, 'contact')],
                ].map(([id, label]) => (
                  <button key={id} onClick={() => scrollTo(id)}>
                    <span>{label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                ))}
              </nav>
              <div className="landing-mobile-menu-footer">
                <label className="landing-lang-picker">
                  <span className="sr-only">Language</span>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {LANGUAGES.map(({ code, label }) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="landing-topbar-cta landing-mob-start-btn"
                  onClick={() => {
                    trackEvent('landing_cta_clicked', { cta: 'start_test_mobile_menu' })
                    setScreen('quiz')
                    setMenuOpen(false)
                  }}
                >
                  {t(language, 'startTest')} →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero ── */}
        <section id="home" className="landing-section">
          <div className="landing-hero">
            <div className="landing-hero-grid">
              <div className="landing-hero-content">
                <p className="landing-eyebrow">{t(language, 'builtFor')}</p>
                <h1 className="landing-title">{t(language, 'heroTitle')}</h1>

                <div className="landing-chip-row">
                  <span>{t(language, 'onboarding')}</span>
                  <span>{t(language, 'gamesCount')}</span>
                  <span>{t(language, 'noAccount')}</span>
                </div>

                <div className="landing-cta-row">
                  <NeonButton onClick={() => {
                    trackEvent('landing_cta_clicked', { cta: 'start_diagnosis' })
                    setScreen('quiz')
                  }} variant="green">
                    {diagnosisDone ? t(language, 'retakeDiagnosis') : t(language, 'startDiagnosis')}
                  </NeonButton>

                  {diagnosisDone && (
                    <NeonButton onClick={() => {
                      trackEvent('landing_cta_clicked', { cta: 'jump_into_rehab' })
                      setScreen('arcade')
                    }} variant="outline">
                      {t(language, 'jumpIntoRehab')}
                    </NeonButton>
                  )}
                </div>

                <div className="landing-subcta-row">
                  {diagnosisDone && !gameDone && (
                    <button onClick={() => setScreen('diagnosis')}>{t(language, 'viewDiagnosis')}</button>
                  )}
                  {gameDone && (
                    <button onClick={() => {
                      trackEvent('landing_cta_clicked', { cta: 'see_latest_results' })
                      setScreen('results')
                    }}>{t(language, 'seeLatestResults')}</button>
                  )}
                  {hasPriorScore && (
                    <button className="landing-reset" onClick={() => {
                      trackEvent('progress_reset_clicked')
                      reset()
                    }}>{t(language, 'resetProgress')}</button>
                  )}
                </div>
              </div>

              {/* Desktop image stack — hidden on mobile */}
              <div className="landing-visual-stack">
                <img
                  src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80"
                  alt="Desk setup with notebook and planning"
                  className="landing-visual-main"
                />
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80"
                  alt="Focused workspace and productivity planning"
                  className="landing-visual-float"
                />
                <div className="landing-metric-panel">
                  <div>
                    <strong>9</strong>
                    <span>{t(language, 'miniGames')}</span>
                  </div>
                  <div>
                    <strong>30+</strong>
                    <span>{t(language, 'challengeRounds')}</span>
                  </div>
                  <div>
                    <strong>1</strong>
                    <span>{t(language, 'personalFocusScore')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile stats strip — shown only on mobile, below CTAs */}
            <div className="landing-stats-strip">
              <div className="landing-stat-card">
                <strong>9</strong>
                <span>{t(language, 'miniGames')}</span>
              </div>
              <div className="landing-stat-divider" />
              <div className="landing-stat-card">
                <strong>30+</strong>
                <span>{t(language, 'challengeRounds')}</span>
              </div>
              <div className="landing-stat-divider" />
              <div className="landing-stat-card">
                <strong>1</strong>
                <span>{t(language, 'personalFocusScore')}</span>
              </div>
            </div>

            {SPONSOR.active && (
              <div className="landing-sponsor-inline">
                <span>{SPONSOR.badgeText}</span>
                <a href={SPONSOR.ctaUrl} target="_blank" rel="noopener noreferrer">
                  {SPONSOR.name}
                </a>
              </div>
            )}
          </div>
        </section>

        {/* <section id="install" className="landing-section">
          <div className="landing-block">
            <PwaInstallCard />
          </div>
        </section> */}

        <section id="about" className="landing-section">
          <div className="landing-block">
            <h2>{t(language, 'productHeading')}</h2>
            <div className="landing-feature-grid">
              <div className="landing-feature-item">
                <h3>01 {t(language, 'diagnoseHabits')}</h3>
              </div>
              <div className="landing-feature-item">
                <h3>02 {t(language, 'rehabThroughPlay')}</h3>
              </div>
              <div className="landing-feature-item">
                <h3>03 {t(language, 'trackProgress')}</h3>
              </div>
            </div>
          </div>
        </section>

        {(SPONSOR.active || activeSupportingSponsors.length > 0) && (
          <section id="sponsor" className="landing-section">
            <div className="landing-block landing-sponsor-block">
              {SPONSOR.active && (
                <div className="landing-sponsor-grid">
                  <div>
                    <p className="landing-sponsor-eyebrow">Official Sponsor</p>
                    <h2>Built In Partnership With {SPONSOR.name}</h2>
                    <p className="landing-block-intro">{SPONSOR.tagline}</p>
                    <a
                      className="landing-sponsor-cta"
                      href={SPONSOR.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {SPONSOR.ctaText}
                    </a>
                  </div>
                  <div className="landing-sponsor-logo-wrap">
                    {SPONSOR.logo ? (
                      <img src={SPONSOR.logo} alt={`${SPONSOR.name} logo`} className="landing-sponsor-logo" />
                    ) : (
                      <div className="landing-sponsor-logo-fallback">{SPONSOR.name}</div>
                    )}
                  </div>
                </div>
              )}
              {activeSupportingSponsors.length > 0 && (
                <div className="landing-supporting-wrap">
                  <p className="landing-sponsor-eyebrow">Supporting Sponsors</p>
                  <div className="landing-supporting-grid">
                    {activeSupportingSponsors.map((item) => {
                      const meta = getSponsorMeta(item)
                      return (
                        <a
                          key={item.name}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="landing-supporting-card"
                        >
                          {item.logo ? (
                            <img src={item.logo} alt={`${item.name} logo`} className="landing-supporting-logo" />
                          ) : (
                            <div className="landing-supporting-logo-fallback">{item.name}</div>
                          )}
                          <div className="landing-supporting-card-meta">
                            <span className="landing-supporting-badge">{meta.platformLabel}</span>
                            {meta.handle && <span className="landing-supporting-handle">{meta.handle}</span>}
                          </div>
                          <strong>{item.name}</strong>
                          <span>{item.tagline}</span>
                          <em>{meta.cta}</em>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section id="contact" className="landing-section">
          <div className="landing-block landing-block-contact">
            <h2>{t(language, 'contactUs')}</h2>
            <div className="landing-contact-grid">
              <a
                href="mailto:vkdarunacharya@gmail.com"
                className="landing-contact-card"
                aria-label={`${t(language, 'generalContact')}: opens your email app`}
              >
                <span className="landing-contact-icon" aria-hidden="true">✉️</span>
                <strong>{t(language, 'generalContact')}</strong>
                <span>vkdarunacharya@gmail.com</span>
              </a>
              <button
                className="landing-contact-card"
                onClick={() => setScreen('privacy')}
                aria-label={`${t(language, 'privacyPolicy')}: opens page within this app`}
              >
                <span className="landing-contact-icon" aria-hidden="true">📄</span>
                <strong>{t(language, 'privacyPolicy')}</strong>
                <span>{t(language, 'privacyPolicyDesc')}</span>
              </button>
            </div>
          </div>
        </section>

        <footer className="landing-page-footer">
          <span>© 2026 Brain Rot Checker · {t(language, 'footerNote')}</span>
          <div className="landing-page-footer-links">
            <button onClick={() => setScreen('privacy')}>{t(language, 'privacyPolicy')}</button>
            <a href="mailto:vkdarunacharya@gmail.com">{t(language, 'contact')}</a>
          </div>
        </footer>

      </div>
    </motion.div>
  )
}
