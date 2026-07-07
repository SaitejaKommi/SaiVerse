'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { GlassPanel } from '@/components/ui/GlassPanel'

const weatherIcons: Record<string, string> = {
  clear: '☀',
  cloudy: '☁',
  rainy: '🌧',
  foggy: '🌫',
  stormy: '🌩',
}

const weatherLabels: Record<string, string> = {
  clear: 'Clear',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
  foggy: 'Foggy',
  stormy: 'Stormy',
}

export function TimeWeather() {
  const timeOfDay = useGameStore((s) => s.world.timeOfDay)
  const weather = useGameStore((s) => s.world.weather)
  const currentDistrict = useGameStore((s) => s.world.currentDistrict)
  const [pulse, setPulse] = useState(false)

  const hours = Math.floor(timeOfDay)
  const minutes = Math.floor((timeOfDay % 1) * 60)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 || 12
  const timeStr = `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`

  const isNight = hours < 6 || hours >= 18

  useEffect(() => {
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 600)
    return () => clearTimeout(t)
  }, [weather])

  return (
    <GlassPanel padding="md" rounded="lg" glow="cyan" className="min-w-[100px]">
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          {weather && (
            <span
              className={`text-base transition-transform duration-500 ${pulse ? 'scale-125' : 'scale-100'}`}
              title={`${weatherLabels[weather] ?? weather}${isNight ? ' · Night' : ' · Day'}`}
            >
              {weatherIcons[weather] ?? '☀'}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-white/70 font-mono leading-tight">{timeStr}</span>
          {weather && (
            <span className="text-[8px] text-white/30 font-mono leading-tight tracking-wider uppercase">
              {weatherLabels[weather] ?? weather}
            </span>
          )}
        </div>
      </div>
      <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${(timeOfDay / 24) * 100}%`,
            background: isNight
              ? 'linear-gradient(90deg, #6366f1, #a78bfa)'
              : 'linear-gradient(90deg, #f59e0b, #10b981)',
          }}
        />
      </div>
      {currentDistrict && (
        <div className="mt-1 text-[9px] text-white/30 font-mono truncate">{currentDistrict}</div>
      )}
    </GlassPanel>
  )
}
