import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import { hapticImpact } from '../../services/telegram'

interface ButtonProps extends MotionProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
  onClick?: () => void
  className?: string
}

const variants = {
  primary: 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-neon-blue',
  secondary: 'bg-bg-tertiary text-text-primary border border-white/10 hover:border-neon-blue/30',
  ghost: 'bg-transparent text-text-primary hover:bg-bg-tertiary',
  danger: 'bg-neon-red/20 text-neon-red border border-neon-red/30 hover:bg-neon-red/30',
  gold: 'bg-gradient-to-r from-gold to-yellow-500 text-white shadow-gold',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  ...motionProps
}: ButtonProps) {
  return (
    <motion.button
      className={`
        rounded-xl font-semibold transition-all btn-press
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      disabled={disabled}
      onClick={() => {
        hapticImpact('light')
        onClick?.()
      }}
      {...motionProps}
    >
      {children}
    </motion.button>
  )
}
