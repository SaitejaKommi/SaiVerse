'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'

const PHASES = {
  LOGO: 0,
  FADE_IN: 1,
  COMPLETE: 2,
}

const LOGO_DURATION = 2000
const FADE_DURATION = 1500

export function IntroOverlay() {
  const [phase, setPhase] = useState(PHASES.LOGO)
  const [logoVisible, setLogoVisible] = useState(false)
  const setInitialized = useGameStore((s) => s.setInitialized)

  useEffect(() => {
    setLogoVisible(true)
    const logoTimeout = setTimeout(() => {
      setPhase(PHASES.FADE_IN)
    }, LOGO_DURATION)

    const fadeTimeout = setTimeout(() => {
      setPhase(PHASES.COMPLETE)
      setInitialized(true)
    }, LOGO_DURATION + FADE_DURATION)

    return () => {
      clearTimeout(logoTimeout)
      clearTimeout(fadeTimeout)
    }
  }, [setInitialized])

  if (phase === PHASES.COMPLETE) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617]">
      <div
        className={`transition-all duration-1000 flex flex-col items-center gap-4 ${
          logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
            SaiVerse
          </span>
        </div>
        <div className="text-sm text-white/40 tracking-[0.2em] uppercase">
          An Engineering Journey
        </div>
        <div className="mt-8 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-neon-blue/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
