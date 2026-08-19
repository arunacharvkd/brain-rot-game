import useGameStore from '../store/gameStore'

export default function Footer() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <footer className="global-footer">
      <span>© 2026 Brain Rot Checker · For entertainment purposes only · Not a medical tool</span>
      <div className="global-footer-links">
        <button onClick={() => setScreen('privacy')}>Privacy Policy</button>
        <a href="mailto:hello@brainrotchecker.com">Contact</a>
      </div>
    </footer>
  )
}
