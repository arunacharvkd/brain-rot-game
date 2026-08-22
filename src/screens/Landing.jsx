import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import NeonButton from '../components/NeonButton'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.48, delay },
})

export default function Landing() {
  const setScreen = useGameStore((s) => s.setScreen)
  const hasPriorScore = useGameStore((s) => s.quizScore > 0)
  const diagnosisDone = useGameStore((s) => s.diagnosisTier > 0 || s.quizScore > 0)
  const gameDone = useGameStore((s) => Object.keys(s.arcadeScores).length > 0)
  const reset = useGameStore((s) => s.reset)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.div
      className="screen"
      style={{ alignItems: 'flex-start', padding: '14px 18px 36px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.32 }}
    >
      <div className="landing-shell">
        <motion.div className="landing-topbar" {...fadeUp(0.06)}>
          <div className="landing-brand-wrap">
            <div className="landing-brand-dot" />
            <div>
              <div className="landing-brand">BrainRotChecker</div>
              <div className="landing-brand-sub">focus diagnostics + rehab arcade</div>
            </div>
          </div>
          <div className="landing-nav-actions">
            <div className="landing-links">
              <button onClick={() => scrollTo('home')}>Home</button>
              <button onClick={() => scrollTo('about')}>About</button>
              <button onClick={() => scrollTo('contact')}>Contact</button>
            </div>
            <button className="landing-topbar-cta" onClick={() => setScreen('quiz')}>
              Start Test
            </button>
          </div>
        </motion.div>

        <section id="home" className="landing-section">
          <div className="landing-hero">
            <div className="landing-hero-grid">
              <div className="landing-hero-content">
                <p className="landing-eyebrow">Built for short-attention generation</p>
                <h1 className="landing-title">Train your focus before your feed trains you.</h1>
                <p className="landing-subtitle">
                  BrainRotChecker combines one quick diagnosis with arcade-style rehab games,
                  turning digital fatigue into a measurable recovery score.
                </p>

                <div className="landing-chip-row">
                  <span>3 minute onboarding</span>
                  <span>7 cognitive mini games</span>
                  <span>No account needed</span>
                </div>

                <div className="landing-cta-row">
                  <NeonButton onClick={() => setScreen('quiz')} variant="green">
                    {diagnosisDone ? 'Retake Diagnosis' : 'Start Diagnosis'}
                  </NeonButton>

                  {diagnosisDone && (
                    <NeonButton onClick={() => setScreen('arcade')} variant="purple">
                      Jump Into Rehab
                    </NeonButton>
                  )}
                </div>

                <div className="landing-subcta-row">
                  {diagnosisDone && !gameDone && (
                    <button onClick={() => setScreen('diagnosis')}>View your last diagnosis</button>
                  )}

                  {gameDone && (
                    <button onClick={() => setScreen('results')}>See your latest results</button>
                  )}

                  {hasPriorScore && (
                    <button className="landing-reset" onClick={reset}>
                      Reset progress
                    </button>
                  )}
                </div>
              </div>

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
                    <strong>7</strong>
                    <span>mini games</span>
                  </div>
                  <div>
                    <strong>30+</strong>
                    <span>challenge rounds</span>
                  </div>
                  <div>
                    <strong>1</strong>
                    <span>personal focus score</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="landing-footer">For entertainment and habit reflection, not medical diagnosis.</p>
          </div>
        </section>

        <section id="about" className="landing-section">
          <div className="landing-block">
            <h2>About The Product BrainRotChecker</h2>
            <p className="landing-block-intro">
              BrainRotChecker is a playful productivity mirror. It combines a short behavior quiz,
              reaction-time challenge, and a focus arcade to help users notice digital fatigue and
              rebuild attention in a fun way.
            </p>
            <div className="landing-feature-grid">
              <div className="landing-feature-item">
                <h3>01 Diagnose Habits</h3>
                <p>Get a clear focus snapshot based on scrolling patterns and reaction speed.</p>
              </div>
              <div className="landing-feature-item">
                <h3>02 Rehab Through Play</h3>
                <p>Use short game loops to practice timing, inhibition, and attention control.</p>
              </div>
              <div className="landing-feature-item">
                <h3>03 Track Progress</h3>
                <p>Compare your before/after tier and return anytime to build momentum.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback section temporarily disabled */}

        <section id="contact" className="landing-section">
          <div className="landing-block landing-block-contact">
            <h2>Contact Us</h2>
            <p className="landing-block-intro">Want partnerships, sponsorships, or product feedback rounds? Reach out.</p>
            <div className="landing-contact-grid">
              <a href="mailto:vkdarunacharya@gmail.com" className="landing-contact-card">
                <strong>General Contact</strong>
                <span>vkdarunacharya@gmail.com</span>
              </a>
              <button className="landing-contact-card" onClick={() => setScreen('privacy')}>
                <strong>Privacy Policy</strong>
                <span>Read how scoring and data are handled</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  )
}
