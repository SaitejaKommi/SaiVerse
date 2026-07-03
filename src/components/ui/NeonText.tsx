import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface NeonTextProps {
  children: ReactNode
  color?: 'blue' | 'purple' | 'pink' | 'green' | 'cyan'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
}

const sizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
}

const colorStyles: Record<string, string> = {
  blue: 'text-neon-blue',
  purple: 'text-neon-purple',
  pink: 'text-neon-pink',
  green: 'text-neon-green',
  cyan: 'text-neon-cyan',
}

export function NeonText({
  children,
  color = 'blue',
  size = 'base',
  as: Tag = 'span',
  className,
}: NeonTextProps) {
  return (
    <Tag className={clsx(colorStyles[color], sizes[size], 'neon-text', className)}>
      {children}
    </Tag>
  )
}
