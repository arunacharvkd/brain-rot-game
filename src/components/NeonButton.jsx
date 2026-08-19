import { motion } from 'framer-motion'
import { useSound } from '../hooks/useSound'

export default function NeonButton({
  children,
  onClick,
  variant = 'green',
  size = 'md',
  disabled = false,
  className = '',
  style,
}) {
  const { play } = useSound()

  const handleClick = (e) => {
    if (disabled) return
    play('click')
    onClick?.(e)
  }

  return (
    <motion.button
      className={`neon-btn neon-btn--${variant} ${size === 'sm' ? 'neon-btn--sm' : ''} ${className}`}
      style={style}
      onClick={handleClick}
      whileHover={{ scale: disabled ? 1 : 1.04 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}
