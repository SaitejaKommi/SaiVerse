import { useQuestStore } from '@/stores/questStore'
import { GlassPanel } from '@/components/ui/GlassPanel'
import type { QuestDef } from '@/systems/quest/quest.types'

export function ObjectiveTracker() {
  const activeQuestIds = useQuestStore((s) => s.activeQuestIds)
  const quests = useQuestStore((s) => s.quests)

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
        <div className="text-[11px] text-white/60">
          {incomplete[0]!.description}
          {incomplete[0]!.count > 1 && (
            <span className="text-white/40 ml-1">
              ({incomplete[0]!.current}/{incomplete[0]!.count})
            </span>
          )}
        </div>
      )}
    </GlassPanel>
  )
}
