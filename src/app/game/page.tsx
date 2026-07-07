'use client'

import React, { useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useDialogueStore } from '@/stores/dialogueStore'
import GameCanvas from '@/components/game/GameCanvas'

export default function GamePage() {
  const setPaused = useGameStore((s) => s.setPaused)
  const [showInventory, setShowInventory] = React.useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const isDialogueOpen = useDialogueStore.getState().isOpen

      if (e.code === 'Escape') {
        if (isDialogueOpen) return
        e.preventDefault()
        setPaused(!useGameStore.getState().isPaused)
        return
      }

      if (e.code === 'KeyI') {
        if (isDialogueOpen) return
        e.preventDefault()
        setShowInventory((v) => !v)
        return
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setPaused])

  return <GameCanvas showInventory={showInventory} onToggleInventory={() => setShowInventory((v) => !v)} />
}
