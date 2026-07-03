import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'primary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function GlassButton({
  children,
  variant = 'default',
  size = 'md',
  fullWidth,
  className,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={clsx(
        'glass transition-all duration-200 font-medium cursor-pointer select-none',
        'hover:bg-white/10 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variant === 'primary' && 'border-neon-blue/40 text-neon-blue hover:border-neon-blue/60 hover:shadow-[0_0_12px_rgba(0,212,255,0.2)]',
        variant === 'danger' && 'border-red-500/40 text-red-400 hover:border-red-500/60',
        variant === 'default' && 'text-white/80 hover:text-white',
        size === 'sm' && 'px-3 py-1.5 text-xs rounded-md',
        size === 'md' && 'px-4 py-2 text-sm rounded-lg',
        size === 'lg' && 'px-6 py-3 text-base rounded-xl',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
