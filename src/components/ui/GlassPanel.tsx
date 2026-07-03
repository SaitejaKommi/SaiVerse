import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'strong'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glow?: 'blue' | 'purple' | 'pink' | 'green' | 'cyan' | 'none'
}

const paddings = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
}

const roundings = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

const glowStyles: Record<string, string> = {
  blue: 'shadow-[0_0_15px_rgba(0,212,255,0.15)] border-neon-blue/20',
  purple: 'shadow-[0_0_15px_rgba(168,85,247,0.15)] border-neon-purple/20',
  pink: 'shadow-[0_0_15px_rgba(236,72,153,0.15)] border-neon-pink/20',
  green: 'shadow-[0_0_15px_rgba(34,197,94,0.15)] border-neon-green/20',
  cyan: 'shadow-[0_0_15px_rgba(6,182,212,0.15)] border-neon-cyan/20',
  none: '',
}

export function GlassPanel({
  children,
  className,
  variant = 'default',
  rounded = 'lg',
  padding = 'md',
  glow = 'none',
}: GlassPanelProps) {
  return (
    <div
      className={clsx(
        variant === 'default' ? 'glass' : 'glass-strong',
        paddings[padding],
        roundings[rounded],
        glowStyles[glow],
        className,
      )}
    >
      {children}
    </div>
  )
}
