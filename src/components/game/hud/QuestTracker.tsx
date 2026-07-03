import { useQuestStore } from '@/stores/questStore'
import { GlassPanel } from '@/components/ui/GlassPanel'

export function QuestTracker() {
  const activeQuestIds = useQuestStore((s) => s.activeQuestIds)
  const quests = useQuestStore((s) => s.quests)

  if (activeQuestIds.length === 0) return null

  return (
    <GlassPanel padding="md" rounded="lg" className="max-w-[240px]">
      <div className="text-[10px] text-neon-purple uppercase tracking-wider mb-2">Quests</div>
      <div className="space-y-1.5">
        {activeQuestIds.map((id) => {
          const q = quests[id]
          if (!q) return null
          const progress = q.objectives.filter((o) => o.current >= o.count).length / Math.max(q.objectives.length, 1)
          return (
            <div key={id}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-white/80 truncate">{q.title}</span>
                <span className="text-[10px] text-white/40 font-mono">{q.category}</span>
              </div>
              <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
