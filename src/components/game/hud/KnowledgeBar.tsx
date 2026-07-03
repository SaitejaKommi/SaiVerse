import { usePlayerStore } from '@/stores/playerStore'
import { NeonText } from '@/components/ui/NeonText'
import { GlassPanel } from '@/components/ui/GlassPanel'

export function KnowledgeBar() {
  const knowledge = usePlayerStore((s) => s.knowledge)

  const level = Math.floor(knowledge / 100) + 1
  const progress = (knowledge % 100) / 100

  return (
    <GlassPanel padding="sm" rounded="lg" glow="blue" className="flex items-center gap-2 min-w-[120px]">
      <NeonText color="blue" size="xs">
        KN
      </NeonText>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-white/60 font-mono">
        Lv.{level}
      </span>
    </GlassPanel>
  )
}
