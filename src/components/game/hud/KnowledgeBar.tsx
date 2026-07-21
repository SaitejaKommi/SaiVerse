import { useMemo } from 'react'
import { usePlayerStore } from '@/stores/playerStore'
import { GlassPanel } from '@/components/ui/GlassPanel'

export function KnowledgeBar() {
  const knowledge = usePlayerStore((s) => s.knowledge)

  const level = Math.floor(knowledge / 100) + 1
  const progress = (knowledge % 100) / 100

  const iconDataUrl = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 24
    canvas.height = 24
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const cx = 12, cy = 12, r = 10
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      if (i === 0) { ctx.moveTo(x, y) } else { ctx.lineTo(x, y) }
    }
    ctx.closePath()
    ctx.stroke()

    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(cx - 4, cy - 2)
    ctx.lineTo(cx, cy + 4)
    ctx.lineTo(cx + 4, cy - 2)
    ctx.stroke()

    return canvas.toDataURL()
  }, [])

  return (
    <GlassPanel padding="sm" rounded="lg" glow="blue" className="flex items-center gap-2 min-w-[120px]">
      {iconDataUrl ? (
        <img src={iconDataUrl} alt="KN" className="w-5 h-5" />
      ) : (
        <span className="text-xs text-neon-blue font-bold">KN</span>
      )}
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="text-[13px] text-white/60 font-mono">
        Lv.{level}
      </span>
    </GlassPanel>
  )
}
