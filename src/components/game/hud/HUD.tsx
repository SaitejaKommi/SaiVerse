'use client'

import { useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { GlassButton } from '@/components/ui/GlassButton'
import { InteractionPrompt } from './InteractionPrompt'
import { NotificationContainer } from './NotificationContainer'
import { TimeWeather } from './TimeWeather'
import { KnowledgeBar } from './KnowledgeBar'
import { ObjectiveTracker } from './ObjectiveTracker'
import { QuestTracker } from './QuestTracker'
import { PauseMenu } from '@/components/game/menu/PauseMenu'
import { InventoryUI } from '@/components/game/inventory/InventoryUI'
import { DialogueBox } from '@/components/game/dialogue/DialogueBox'

export function HUD() {
  const isPaused = useGameStore((s) => s.isPaused)
  const [showInventory, setShowInventory] = useState(false)

  return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div className="pointer-events-auto absolute top-4 left-4 flex flex-col gap-2">
          <KnowledgeBar />
          <ObjectiveTracker />
        </div>

        <div className="pointer-events-auto absolute top-4 right-4 flex flex-col gap-2 items-end">
          <TimeWeather />
          <QuestTracker />
        </div>

        <div className="pointer-events-auto absolute bottom-4 left-4 flex gap-2">
          <GlassButton
            size="sm"
            variant="default"
            onClick={() => useGameStore.getState().setPaused(true)}
          >
            ⏸ Pause
          </GlassButton>
          <GlassButton
            size="sm"
            variant="default"
            onClick={() => setShowInventory((v) => !v)}
          >
            🎒 Inventory
          </GlassButton>
        </div>

        <div className="pointer-events-auto absolute bottom-4 right-4">
          <GlassButton
            size="sm"
            variant="default"
            onClick={() => {
              if (typeof window !== 'undefined') {
                ;(window as any).__toggleDebug?.()
              }
            }}
          >
            🛠 Debug
          </GlassButton>
        </div>

        <InteractionPrompt />
      </div>

      <NotificationContainer />
      <DialogueBox />

      {showInventory && <InventoryUI onClose={() => setShowInventory(false)} />}
      {isPaused && <PauseMenu />}
    </>
  )
}

export function HUDWrapper() {
  const isInitialized = useGameStore((s) => s.isInitialized)
  if (!isInitialized) return null

  return <HUD />
}
