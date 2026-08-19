import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function EmojiItem({ item, onHit, onExpire }) {
  const doneRef = useRef(false)

  const finish = (hit) => {
    if (doneRef.current) return
    doneRef.current = true
    if (hit) onHit(item)
    else onExpire(item.id)
  }

  return (
    <div
      className="emoji-fall-wrapper"
      style={{ left: `${item.x}%`, animationDuration: `${item.fallDuration}s` }}
      onAnimationEnd={() => finish(false)}
    >
      <motion.span
        className={`emoji-item emoji-item--${item.type}`}
        whileTap={{ scale: 1.7, opacity: 0 }}
        transition={{ duration: 0.18 }}
        onPointerDown={(e) => {
          e.stopPropagation()
          finish(true)
        }}
        role="button"
        aria-label={item.type}
      >
        {item.emoji}
      </motion.span>
    </div>
  )
}
