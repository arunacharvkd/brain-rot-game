import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const GlassCard = forwardRef(function GlassCard(
  { children, className = '', glow = false, sm = false, style, ...props },
  ref
) {
  const cls = ['glass-card', sm && 'glass-card--sm', glow && 'glass-card--glow', className]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.div ref={ref} className={cls} style={style} {...props}>
      {children}
    </motion.div>
  )
})

export default GlassCard
