import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import NeonButton from '../components/NeonButton'
import { t } from '../i18n/translations'

const LAST_UPDATED = 'August 19, 2026'

export default function PrivacyPolicy() {
  const setScreen = useGameStore((s) => s.setScreen)
  const language = useGameStore((s) => s.language)

  return (
    <motion.div
      className="screen privacy-screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="privacy-container">
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{t(language, 'privacyPageTitle')}</h1>
          <NeonButton onClick={() => setScreen('landing')} variant="outline" size="sm">← {t(language, 'back')}</NeonButton>
        </div>

        <p className="privacy-meta">{t(language, 'lastUpdated')}: {LAST_UPDATED}</p>

        <section className="privacy-section">
          <h2>{t(language, 'aboutThisSite')}</h2>
          <p>
            Brain Rot Checker (<strong>brainrotchecker.com</strong>) is a free, browser-based entertainment
            and brain training game. It is designed purely for fun and light-hearted self-reflection.
            It is <strong>not a medical tool</strong>, not a clinical assessment, and does not provide
            any form of medical, psychological, or professional advice. Results are for entertainment
            purposes only.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Information We Collect</h2>
          <p>
            We do <strong>not</strong> collect, store, or process any personally identifiable information
            directly. We do not require account registration, email addresses, or any personal details
            to use this site.
          </p>
          <p>
            Game progress (quiz scores, reaction times, game scores) is stored only in your own
            browser's <strong>localStorage</strong> and never transmitted to our servers.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Google Analytics</h2>
          <p>
            We use <strong>Google Analytics</strong> to understand how visitors use the site (e.g.
            page views, session duration, device type). This data is anonymous and aggregated.
            Google Analytics may set cookies on your device to track visits.
          </p>
          <p>
            You can opt out of Google Analytics tracking by installing the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>
          <p>
            Google's privacy policy:{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              policies.google.com/privacy
            </a>
          </p>
        </section>

        <section className="privacy-section">
          <h2>Google AdSense &amp; Advertising</h2>
          <p>
            We use <strong>Google AdSense</strong> to display advertisements on this site. Google and
            its partners may use cookies to serve ads based on your prior visits to this and other
            websites (interest-based advertising).
          </p>
          <p>
            You can opt out of personalised advertising by visiting{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              Google Ads Settings
            </a>{' '}
            or{' '}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
              aboutads.info
            </a>.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Cookies</h2>
          <p>
            This site uses cookies through Google Analytics and Google AdSense as described above.
            By continuing to use this site you consent to these cookies. You can disable cookies
            through your browser settings at any time, though some functionality may be affected.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Third-Party Links</h2>
          <p>
            This site may contain links to external websites. We are not responsible for the content
            or privacy practices of those sites and encourage you to review their privacy policies.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Children's Privacy</h2>
          <p>
            This site is intended for users aged 13 and over. We do not knowingly collect any
            information from children under 13. If you believe a child under 13 has used this site,
            please contact us.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page
            with an updated date. Continued use of the site after changes constitutes acceptance.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Contact</h2>
          <p>
            For any questions about this Privacy Policy, contact us at:{' '}
            <a href="mailto:vkdarunacharya@gmail.com">vkdarunacharya@gmail.com</a>
          </p>
        </section>

        <div style={{ marginTop: 32 }}>
          <NeonButton onClick={() => setScreen('landing')} variant="green">
            Back to Brain Rot Checker →
          </NeonButton>
        </div>
      </div>
    </motion.div>
  )
}
