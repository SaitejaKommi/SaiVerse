import { useEffect, useState } from 'react'
import { useQuestStore } from '@/stores/questStore'
import { useGameStore } from '@/stores/gameStore'
import { GlassPanel } from '@/components/ui/GlassPanel'
import type { QuestDef } from '@/systems/quest/quest.types'
import { CAMPUS_ENTRANCE_POSITION } from '@/data/bengaluru/hub-layout'

const CAMPUS_QUEST_ID = 'quest-first-step'

function getDistanceToTarget(targetPos: [number, number, number]): number | null {
  const player = useGameStore.getState().player
  if (!player) return null
  const dx = player.position[0] - targetPos[0]
  const dz = player.position[2] - targetPos[2]
  return Math.sqrt(dx * dx + dz * dz)
}

export function ObjectiveTracker() {
  const [distance, setDistance] = useState<number | null>(null)
  const activeQuestIds = useQuestStore((s) => s.activeQuestIds)
  const quests = useQuestStore((s) => s.quests)

  useEffect(() => {
    const interval = setInterval(() => {
      const quest = quests[CAMPUS_QUEST_ID]
      if (quest?.status === 'accepted') {
        setDistance(getDistanceToTarget(CAMPUS_ENTRANCE_POSITION))
      } else {
        setDistance(null)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [quests])

  if (!activeQuestIds || activeQuestIds.length === 0) return null

  const primaryQuestId = activeQuestIds[0]
  if (!primaryQuestId) return null
  const quest: QuestDef | undefined = quests[primaryQuestId]
  if (!quest) return null

  const incomplete = quest.objectives.filter((o) => o.current < o.count)

  return (
    <GlassPanel padding="md" rounded="lg" className="max-w-[280px]">
      <div className="text-[10px] text-neon-blue uppercase tracking-wider mb-1">Objective</div>
      <div className="text-xs text-white/90 font-medium mb-1">{quest.title}</div>
      {incomplete.length > 0 && (
        <>
          <div className="text-[11px] text-white/60">
            {incomplete[0]!.description}
            {incomplete[0]!.count > 1 && (
              <span className="text-white/40 ml-1">
                ({incomplete[0]!.current}/{incomplete[0]!.count})
              </span>
            )}
          </div>
          {distance !== null && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
              <span className="text-[10px] text-neon-blue/70 font-mono">
                {distance < 1 ? 'Arrived' : `${Math.round(distance)}m`}
              </span>
            </div>
          )}
        </>
      )}
    </GlassPanel>
  )
}
