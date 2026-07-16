'use client'

import { useEffect, useState } from 'react'
import { useHackathonStore } from './HackathonStore'

export function TeamEnergyBar() {
  const [energy, setEnergy] = useState(100)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const unsub = useHackathonStore.subscribe((state) => {
      setEnergy(state.teamEnergy)
      setVisible(state.phase !== 'waiting' && state.phase !== 'complete')
    })
    return unsub
  }, [])

  if (!visible) return null

  const color = energy > 50 ? '#00ff88' : energy > 25 ? '#ffaa00' : '#ff3333'
  const pulse = energy <= 25 ? 'animate-pulse' : ''

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/60 font-mono">TEAM</span>
      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${pulse}`}
          style={{ width: `${energy}%`, backgroundColor: color }}
        />
      </div>
      <span className={`text-[10px] font-mono ${pulse || 'text-white/50'}`} style={{ color }}>
        {Math.round(energy)}%
      </span>
    </div>
  )
}
