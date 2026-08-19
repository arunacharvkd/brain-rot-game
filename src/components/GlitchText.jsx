import { motion } from 'framer-motion'

export default function GlitchText({ text, className = '', style }) {
  return (
    <motion.div
      className={`glitch-text ${className}`}
      data-text={text}
      style={style}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {text}
    </motion.div>
  )
}
