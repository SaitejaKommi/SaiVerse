import { useEffect, useState } from 'react'
import { useQuestStore } from '@/stores/questStore'
import { useGameStore } from '@/stores/gameStore'
import { GlassPanel } from '@/components/ui/GlassPanel'
import type { QuestDef } from '@/systems/quest/quest.types'
import { CAMPUS_ENTRANCE_POSITION } from '@/data/bengaluru/hub-layout'

const TARGET_POSITIONS: Record<string, [number, number, number]> = {
  'campus-entrance': CAMPUS_ENTRANCE_POSITION,
  'professor-npc': [22.5, 0.5, -145.2],
  'professor': [22.5, 0.5, -145.2],
  'data-terminal': [-30, 0, -360],
  'training-console': [30, 0, -360],
  'prompt-lab': [0, 0, -395],
  'neural-core': [0, 0, -370],
  'garden-plot': [-25, 0, -515],
  'pr-bridge': [25, 0, -515],
  'knowledge-archive': [0, 0, -555],
  'code-station': [-15, 0, -635],
  'presentation-stage': [0, 0, -638],
  'interview-pod': [90, 0, -8],
  'offer-stage': [95, 0, -8],
}

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

  const primaryQuestId = activeQuestIds?.[0]
  const quest: QuestDef | undefined = primaryQuestId ? quests[primaryQuestId] : undefined
  const incomplete = quest ? quest.objectives.filter((o) => o.current < o.count) : []
  const targetPos = incomplete[0] ? TARGET_POSITIONS[incomplete[0].targetId] : undefined

  useEffect(() => {
    const interval = setInterval(() => {
      if (targetPos) {
        setDistance(getDistanceToTarget(targetPos))
      } else {
        setDistance(null)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [targetPos])

  if (!activeQuestIds || activeQuestIds.length === 0) return null

  return (
    <GlassPanel padding="md" rounded="lg" className="max-w-[280px]">
      <div className="text-[10px] text-neon-blue uppercase tracking-wider mb-1">Objective</div>
      <div className="text-xs text-white/90 font-medium mb-1">{quest?.title}</div>
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
