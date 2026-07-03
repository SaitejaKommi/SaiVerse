import { useGameStore } from '@/stores/gameStore'
import { GlassPanel } from '@/components/ui/GlassPanel'

const weatherIcons: Record<string, string> = {
  clear: '☀',
  cloudy: '☁',
  rainy: '🌧',
  foggy: '🌫',
  stormy: '🌩',
}

export function TimeWeather() {
  const timeOfDay = useGameStore((s) => s.world.timeOfDay)
  const weather = useGameStore((s) => s.world.weather)
  const currentDistrict = useGameStore((s) => s.world.currentDistrict)

  const hours = Math.floor(timeOfDay)
  const minutes = Math.floor((timeOfDay % 1) * 60)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 || 12
  const timeStr = `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`

  return (
    <GlassPanel padding="sm" rounded="lg" className="flex items-center gap-2">
      {weather && (
        <span className="text-sm" title={weather}>
          {weatherIcons[weather] ?? '☀'}
        </span>
      )}
      <span className="text-[11px] text-white/60 font-mono">{timeStr}</span>
      {currentDistrict && (
        <span className="text-[11px] text-white/40 font-mono">· {currentDistrict}</span>
      )}
    </GlassPanel>
  )
}
