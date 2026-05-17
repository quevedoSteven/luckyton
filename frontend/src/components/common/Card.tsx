import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: 'blue' | 'purple' | 'pink' | 'green' | 'gold' | 'none'
  onClick?: () => void
  hover?: boolean
}

const glowClasses = {
  blue: 'glow-blue',
  purple: 'glow-purple',
  pink: 'glow-pink',
  green: 'glow-green',
  gold: 'glow-gold',
  none: '',
}

export default function Card({
  children,
  className = '',
  glow = 'none',
  onClick,
  hover = true,
}: CardProps) {
  return (
    <motion.div
      className={`
        bg-bg-secondary rounded-2xl border border-white/5 p-4
        ${glowClasses[glow]}
        ${hover ? 'card-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
