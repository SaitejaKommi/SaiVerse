'use client'

import dynamic from 'next/dynamic'

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-blue border-t-transparent" />
        <span className="text-sm text-surface-400/60">Loading SaiVerse...</span>
      </div>
    </div>
  ),
})

export default function GamePage() {
  return <GameCanvas />
}
