import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'
import NeonButton from '../components/NeonButton'
import { getGuideCards, getPageByScreen, getRelatedLinks } from '../data/pages.js'

function PageLink({ page, children, className }) {
  const setScreen = useGameStore((s) => s.setScreen)
  return (
    <a
      className={className}
      href={page.path}
      onClick={(event) => {
        event.preventDefault()
        setScreen(page.screen)
      }}
    >
      {children}
    </a>
  )
}

export default function ContentPage() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const page = getPageByScreen(screen)

  if (!page) return null

  const related = getRelatedLinks(page.id)
  const cards = page.id === 'guides' ? getGuideCards() : []

  return (
    <motion.div
      className="screen privacy-screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <article className="privacy-container">
        <div className="content-toolbar">
          <p className="privacy-meta content-kicker">{page.kicker}</p>
          <NeonButton onClick={() => setScreen('landing')} variant="outline" size="sm">
            ← Home
          </NeonButton>
        </div>
        <h1 className="content-title">{page.heading}</h1>
        <p className="privacy-meta">Updated {page.updated}</p>

        {page.sections.map((section) => (
          <section className="privacy-section" key={section.heading || section.paragraphs[0]}>
            {section.heading ? <h2>{section.heading}</h2> : null}
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.list ? (
              <ul className="content-list">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {cards.length > 0 && (
          <div className="content-cards">
            {cards.map((card) => (
              <PageLink key={card.id} page={card} className="content-card">
                <strong>{card.nav}</strong>
                <span>{card.summary}</span>
              </PageLink>
            ))}
          </div>
        )}

        <nav className="content-related" aria-label="Related pages">
          {related.map((link) => (
            <PageLink key={link.path} page={link}>
              {link.label}
            </PageLink>
          ))}
          <a href="/privacy" onClick={(event) => { event.preventDefault(); setScreen('privacy') }}>
            Privacy
          </a>
          <a href="/quiz" onClick={(event) => { event.preventDefault(); setScreen('quiz') }}>
            Start the check
          </a>
        </nav>
      </article>
    </motion.div>
  )
}
