'use client'

import { useState, useEffect, useMemo } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useQuestStore } from '@/stores/questStore'
import { useChapterStore } from '@/systems/chapter/ChapterStore'
import { ChapterManager } from '@/systems/chapter/ChapterManager'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { NeonText } from '@/components/ui/NeonText'
import { CAMPUS_ENTRANCE_POSITION } from '@/data/bengaluru/hub-layout'
import { InteractionPrompt } from './InteractionPrompt'
import { NotificationContainer } from './NotificationContainer'
import { TimeWeather } from './TimeWeather'
import { PauseMenu } from '@/components/game/menu/PauseMenu'
import { InventoryUI } from '@/components/game/inventory/InventoryUI'
import { DialogueBox } from '@/components/game/dialogue/DialogueBox'
import { TeamEnergyBar } from '@/features/hackathon-arena/TeamEnergyBar'

interface HUDProps {
  showInventory?: boolean
  onToggleInventory?: () => void
}

function KnowledgeBar() {
  const knowledge = usePlayerStore((s) => s.knowledge)
  const level = Math.floor(knowledge / 100) + 1
  const progress = (knowledge % 100) / 100

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-neon-blue font-mono font-bold">LV.{level}</span>
      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="text-[9px] text-white/40 font-mono">XP</span>
    </div>
  )
}

function CurrentChapter() {
  const entries = useChapterStore((s) => s.entries)

  const chapterText = useMemo(() => {
    const current = ChapterManager.getCurrentChapter()
    if (current) return current.title
    const completed = ChapterManager.getCompletedIds()
    const lastId = completed.length > 0 ? completed[completed.length - 1] : undefined
    if (lastId) {
      const last = ChapterManager.getConfig(lastId)
      if (last?.nextChapterId) {
        const next = ChapterManager.getConfig(last.nextChapterId)
        if (next) return `Next: ${next.title}`
      }
      return `${last?.title ?? 'Complete'} ✓`
    }
    return ''
  }, [entries])

  if (!chapterText) return null

  return (
    <span className="text-[10px] text-white/40 font-mono">{chapterText}</span>
  )
}

function ObjectiveTracker() {
  const activeQuestIds = useQuestStore((s) => s.activeQuestIds)
  const quests = useQuestStore((s) => s.quests)
  const playerPos = useGameStore((s) => s.player.position)
  const [distance, setDistance] = useState<number | null>(null)
  const [direction, setDirection] = useState(0)

  const targetPos = useMemo(() => CAMPUS_ENTRANCE_POSITION, [])

  useEffect(() => {
    if (!playerPos) return
    const dx = playerPos[0] - targetPos[0]
    const dz = playerPos[2] - targetPos[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    setDistance(dist)
    setDirection(Math.atan2(dz, dx))
  }, [playerPos, targetPos])

  if (!activeQuestIds || activeQuestIds.length === 0) return null

  const primaryQuestId = activeQuestIds[0]
  if (!primaryQuestId) return null
  const quest = quests[primaryQuestId]
  if (!quest) return null

  const incomplete = quest.objectives.filter((o) => o.current < o.count)
  const totalObjectives = quest.objectives.length
  const completedObjectives = quest.objectives.filter((o) => o.current >= o.count).length

  return (
    <div className="text-center">
      <div className="text-[13px] text-white/90 font-medium">{quest.title}</div>
      {incomplete.length > 0 && (
        <div className="text-[11px] text-white/50 mt-0.5 flex items-center justify-center gap-2">
          <span>{incomplete[0]!.description}</span>
          {distance !== null && distance > 3 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-neon-cyan/70 font-mono">
              <span
                className="inline-block w-3 h-3"
                style={{ transform: `rotate(${direction}rad)` }}
              >
                ↑
              </span>
              {Math.round(distance)}m
            </span>
          )}
          {distance !== null && distance <= 3 && (
            <span className="text-[10px] text-neon-green/70 font-mono">● Here</span>
          )}
        </div>
      )}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full transition-all duration-500"
            style={{ width: `${(completedObjectives / totalObjectives) * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-white/30 font-mono">
          {completedObjectives}/{totalObjectives}
        </span>
      </div>
    </div>
  )
}

function ControlsHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('saiverse-controls-seen')
    if (seen === 'true') return
    setVisible(true)
    const timeout = setTimeout(() => {
      setVisible(false)
    }, 15000)
    return () => clearTimeout(timeout)
  }, [])

  if (!visible) return null

  return (
    <div className="text-[10px] text-white/20 font-mono leading-relaxed">
      WASD Move  ·  Mouse Look  ·  Space Jump  ·  Shift Sprint<br />
      E Interact  ·  I Inventory  ·  Esc Pause
    </div>
  )
}

export function HUD({ showInventory = false, onToggleInventory }: HUDProps) {
  const isPaused = useGameStore((s) => s.isPaused)

  return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-none">
        {/* Top Left — Level, XP, Chapter, Team Energy */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <GlassPanel padding="sm" rounded="lg" glow="blue" className="flex items-center gap-3 min-w-[140px]">
            <NeonText color="blue" size="xs">KNOWLEDGE</NeonText>
            <KnowledgeBar />
          </GlassPanel>
          <GlassPanel padding="sm" rounded="lg" className="text-center">
            <CurrentChapter />
          </GlassPanel>
          <GlassPanel padding="sm" rounded="lg" glow="green" className="flex items-center gap-2 min-w-[120px]">
            <TeamEnergyBar />
          </GlassPanel>
        </div>

        {/* Top Center — Objective */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <GlassPanel padding="md" rounded="lg" glow="purple" className="min-w-[200px]">
            <ObjectiveTracker />
          </GlassPanel>
        </div>

        {/* Top Right — Time & Weather */}
        <div className="absolute top-3 right-3">
          <TimeWeather />
        </div>

        {/* Bottom Left — Controls hint + Interaction */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-2">
          <ControlsHint />
          <div className="pointer-events-auto">
            <InteractionPrompt />
          </div>
        </div>
      </div>

      {/* Notifications - bottom right */}
      <div className="fixed bottom-3 right-3 z-50">
        <NotificationContainer />
      </div>

      <DialogueBox />

      {showInventory && <InventoryUI onClose={onToggleInventory ?? (() => {})} />}
      {isPaused && <PauseMenu />}
    </>
  )
}

interface HUDWrapperProps {
  showInventory?: boolean
  onToggleInventory?: () => void
}

export function HUDWrapper({ showInventory, onToggleInventory }: HUDWrapperProps) {
  const isInitialized = useGameStore((s) => s.isInitialized)

  return (
    <div className={`transition-opacity duration-1000 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
      {isInitialized && <HUD showInventory={showInventory} onToggleInventory={onToggleInventory} />}
    </div>
  )
}
