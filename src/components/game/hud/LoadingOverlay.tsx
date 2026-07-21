'use client'

import { useGameStore } from '@/stores/gameStore'

export function LoadingOverlay() {
  const isCinematic = useGameStore((s) => s.isCinematic)
  const isInitialized = useGameStore((s) => s.isInitialized)
  const show = isCinematic || !isInitialized

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        transition: 'opacity 0.3s ease',
        opacity: show ? 1 : 0,
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 border-2 border-neon-cyan/60 border-t-neon-cyan rounded-full"
          style={{
            animation: 'loading-spin 0.8s linear infinite',
          }}
        />
        <span className="text-sm text-white/40 font-mono tracking-widest">Loading...</span>
      </div>

      <style>{`
        @keyframes loading-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
